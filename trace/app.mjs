import { manifest } from "../renderer/architecture/manifest-alphafold3.js";
import { installThemeSwitcher } from "../theme-state.mjs";
import { EXAMPLE, STAGES, snapshot } from "./model.mjs";

const $ = (selector) => document.querySelector(selector);
const representationById = new Map(manifest.architecture.representations.map((item) => [item.id, item]));
const boardIds = new Set(manifest.boards.items.map((item) => item.id));
const stageIds = new Set(STAGES.map((item) => item.id));
const params = new URLSearchParams(location.search);
const rangeValue = (name, maximum) => Math.max(1, Math.min(maximum, Number.parseInt(params.get(name), 10) || 1));
const state = {
  stage: stageIds.has(params.get("stage")) ? params.get("stage") : STAGES[0].id,
  recycle: rangeValue("recycle", EXAMPLE.recycles),
  block: rangeValue("block", EXAMPLE.pairformerBlocks),
  sample: rangeValue("sample", EXAMPLE.samplerSteps),
  seed: rangeValue("seed", EXAMPLE.seeds),
};
let playTimer = null;

for (const stage of STAGES) {
  if (!boardIds.has(stage.board)) throw new Error(`Trace stage ${stage.id} has no architecture board ${stage.board}`);
}

function formatValue(value) {
  if (!Number.isFinite(value)) return "n/a";
  if (Math.abs(value) >= 1000) return value.toFixed(0);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  return value.toFixed(3);
}

function shapeFor(preview, stageId, side) {
  if (stageId === "tokenize") return side === "input" ? "71 heavy atoms" : "38 tokens";
  if (!preview.representationId) return "selected teaching values";
  const representation = representationById.get(preview.representationId);
  if (!representation) throw new Error(`Unknown representation ${preview.representationId}`);
  return String(representation.shape)
    .replaceAll("N_token", String(EXAMPLE.tokens))
    .replaceAll("N_atom", String(EXAMPLE.atoms))
    .replaceAll("N_msa", String(EXAMPLE.toyMsaRows))
    .replaceAll("N_templates", "1")
    .replaceAll(" x ", " × ");
}

function renderValues(container, values, sharedMaximum, stageId, side) {
  container.replaceChildren();
  if (!values) {
    const missing = document.createElement("p");
    missing.className = "trace-no-values";
    missing.textContent = "Values unavailable from a synthetic trace";
    container.append(missing);
    return;
  }
  values.forEach((value, index) => {
    const item = document.createElement("div");
    item.className = "trace-value";
    const box = document.createElement("div");
    box.className = "trace-value-bar-box";
    const bar = document.createElement("span");
    bar.className = `trace-value-bar${value < 0 ? " negative" : ""}`;
    bar.style.height = `${Math.max(4, Math.abs(value) / sharedMaximum * 53)}px`;
    box.append(bar);
    const number = document.createElement("b");
    number.textContent = formatValue(value);
    number.title = String(value);
    const label = document.createElement("small");
    label.textContent = stageId === "tokenize"
      ? (side === "input" ? ["Ala", "Gly", "Val", "Leu", "Ser", "Lys"][index] : ["Peptide", "ATP", "Mg²⁺", "Total"][index])
      : (values.length === 3 ? ["x", "y", "z"][index] : `v${index + 1}`);
    item.append(box, number, label);
    container.append(item);
  });
}

function renderPreview(side, preview, stageId, sharedMaximum) {
  $(`#${side}Title`).textContent = preview.label;
  $(`#${side}Shape`).textContent = shapeFor(preview, stageId, side);
  $(`#${side}Note`).textContent = preview.note || "A small preview of a larger representation.";
  renderValues($(`#${side}Values`), preview.values, sharedMaximum, stageId, side);
}

function updateUrl(push = false) {
  const url = new URL(location.href);
  url.searchParams.set("stage", state.stage);
  url.searchParams.set("recycle", state.recycle);
  url.searchParams.set("block", state.block);
  url.searchParams.set("sample", state.sample);
  url.searchParams.set("seed", state.seed);
  history[push ? "pushState" : "replaceState"](null, "", url);
}

function render() {
  const current = snapshot(state.stage, state);
  const index = STAGES.findIndex((stage) => stage.id === state.stage);
  const maximum = Math.max(0.001, ...[...(current.input.values || []), ...(current.output.values || [])].map(Math.abs));
  $("#stagePhase").textContent = current.stage.phase;
  $("#stageTitle").textContent = current.stage.title;
  $("#stagePosition").textContent = `${index + 1} / ${STAGES.length}`;
  $("#stageTakeaway").textContent = current.takeaway;
  $("#stageOperation").textContent = current.operation;
  $("#traceProgress").style.width = `${(index + 1) / STAGES.length * 100}%`;
  renderPreview("input", current.input, state.stage, maximum);
  renderPreview("output", current.output, state.stage, maximum);
  $("#stageBoardLink").href = `../renderer/architecture/?arch=alphafold3&board=${encodeURIComponent(current.stage.board)}`;
  $("#previousStage").disabled = index === 0;
  $("#nextStage").disabled = index === STAGES.length - 1;
  for (const button of $("#stageList").querySelectorAll("button[data-stage]")) {
    if (button.dataset.stage === state.stage) button.setAttribute("aria-current", "step");
    else button.removeAttribute("aria-current");
  }
  for (const key of ["recycle", "block", "sample", "seed"]) {
    $(`#${key}Range`).value = state[key];
    $(`#${key}Value`).textContent = state[key];
  }
  updateUrl();
}

function stopPlayback() {
  if (playTimer !== null) clearInterval(playTimer);
  playTimer = null;
  $("#playStages").textContent = "Play journey";
}

function selectStage(stageId, { focus = false, push = true } = {}) {
  if (!stageIds.has(stageId)) return;
  stopPlayback();
  if (stageId !== state.stage) {
    state.stage = stageId;
    updateUrl(push);
  }
  render();
  if (focus) $("#stageTitle").focus();
}

function stepStage(offset) {
  const index = STAGES.findIndex((item) => item.id === state.stage);
  const next = STAGES[index + offset];
  if (next) selectStage(next.id, { focus: true });
}

function buildStageRail() {
  const rail = $("#stageList");
  let previousPhase = null;
  STAGES.forEach((stage, index) => {
    if (stage.phase !== previousPhase) {
      const heading = document.createElement("span");
      heading.className = "trace-phase-label";
      heading.textContent = stage.phase;
      rail.append(heading);
      previousPhase = stage.phase;
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trace-stage-link";
    button.dataset.stage = stage.id;
    const number = document.createElement("span");
    number.className = "trace-stage-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const label = document.createElement("span");
    label.textContent = stage.title;
    button.append(number, label);
    button.addEventListener("click", () => selectStage(stage.id, { focus: true }));
    rail.append(button);
  });
  $("#stageCount").textContent = `${STAGES.length} steps`;
}

buildStageRail();
installThemeSwitcher($("#traceTheme"));
$("#previousStage").addEventListener("click", () => stepStage(-1));
$("#nextStage").addEventListener("click", () => stepStage(1));
$("#playStages").addEventListener("click", () => {
  if (playTimer !== null) { stopPlayback(); return; }
  if (state.stage === STAGES.at(-1).id) selectStage(STAGES[0].id);
  $("#playStages").textContent = "Pause journey";
  playTimer = setInterval(() => {
    const index = STAGES.findIndex((item) => item.id === state.stage);
    if (index >= STAGES.length - 1) { stopPlayback(); return; }
    state.stage = STAGES[index + 1].id;
    render();
  }, 1900);
});
$("#copyTraceLink").addEventListener("click", async () => {
  const button = $("#copyTraceLink");
  try {
    await navigator.clipboard.writeText(location.href);
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = "Copy link"; }, 1800);
  } catch {
    button.textContent = "Copy from address bar";
    setTimeout(() => { button.textContent = "Copy link"; }, 2300);
  }
});
for (const [key, stage] of [["recycle", "recycle_input"], ["block", "pairformer"], ["sample", "sampler_update"], ["seed", "sampler_init"]]) {
  $(`#${key}Range`).addEventListener("input", (event) => {
    stopPlayback();
    state[key] = Number(event.target.value);
    if (key === "block" || key === "sample" || key === "seed") state.stage = stage;
    render();
  });
}
window.addEventListener("popstate", () => {
  const next = new URLSearchParams(location.search);
  if (stageIds.has(next.get("stage"))) state.stage = next.get("stage");
  for (const [key, maximum] of [["recycle", EXAMPLE.recycles], ["block", EXAMPLE.pairformerBlocks], ["sample", EXAMPLE.samplerSteps], ["seed", EXAMPLE.seeds]]) {
    state[key] = Math.max(1, Math.min(maximum, Number.parseInt(next.get(key), 10) || 1));
  }
  render();
});
render();
