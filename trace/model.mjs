// A deterministic teaching trace. Values are small illustrative previews,
// never model activations or predictions. Shape references come from the AF3
// architecture manifest when the page renders.

export const EXAMPLE = Object.freeze({
  peptide: "Ala-Gly-Val-Leu-Ser-Lys",
  peptideAtoms: [5, 4, 7, 8, 6, 9],
  ligandAtoms: 31,
  ionAtoms: 1,
  atoms: 71,
  tokens: 38,
  toyMsaRows: 8,
  recycles: 4,
  pairformerBlocks: 48,
  samplerSteps: 200,
  seeds: 5,
});

export const STAGES = Object.freeze([
  { id: "tokenize", phase: "Input", title: "Tokenize the complex", board: "pairformer_overview", kind: "fact" },
  { id: "atom_features", phase: "Input", title: "Initialize atom features", board: "input_feature_embedder_detail" },
  { id: "input_embedder", phase: "Input", title: "Pool atoms into token inputs", board: "input_feature_embedder_detail" },
  { id: "initial_projections", phase: "Input", title: "Initialize single and pair states", board: "trunk_model_detail" },
  { id: "recycle_input", phase: "Trunk", title: "Add previous pass state", board: "trunk_model_detail" },
  { id: "template", phase: "Trunk", title: "Read template geometry", board: "template_module_detail" },
  { id: "msa", phase: "Trunk", title: "Read evolutionary evidence", board: "msa_module_detail" },
  { id: "pairformer", phase: "Trunk", title: "Update pair and single tracks", board: "pairformer_block" },
  { id: "trunk_output", phase: "Trunk", title: "Hand off final trunk state", board: "trunk_model_detail" },
  { id: "sampler_init", phase: "Sampling", title: "Initialize atom coordinates", board: "sample_diffusion_detail" },
  { id: "noise_schedule", phase: "Sampling", title: "Choose the noise level", board: "sample_diffusion_detail" },
  { id: "atom_encoder", phase: "Sampling", title: "Encode the noisy atom cloud", board: "atom_attention_encoder_detail" },
  { id: "token_transformer", phase: "Sampling", title: "Reason across tokens", board: "diffusion_transformer_token_detail" },
  { id: "atom_decoder", phase: "Sampling", title: "Decode atom updates", board: "atom_attention_decoder_detail" },
  { id: "sampler_update", phase: "Sampling", title: "Advance the coordinate state", board: "sampler_update_detail" },
  { id: "confidence", phase: "Output", title: "Inspect output contracts", board: "confidence_head_detail", kind: "shape_only" },
]);

const round = (value) => Math.round(value * 1000) / 1000;
const map = (values, fn) => values.map((value, index) => round(fn(value, index)));
const add = (left, right) => map(left, (value, index) => value + right[index]);
const scale = (values, amount) => map(values, (value) => value * amount);
const normalized = (values) => {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return map(values, (value) => (value - mean) / Math.sqrt(variance + 0.1));
};

function fixedInput() {
  const atom = [-0.6, 0.2, 0.9, -0.1];
  const pooled = map(atom, (value, index) => (value + [0.1, -0.4, 0.3, 0.5][index]) / 2);
  const concatenated = [pooled[0], 1, 0.25, 0.05];
  const single = map(concatenated, (value, index) => value * [0.7, 0.5, -0.4, 0.8][index]);
  const pair = map(single, (value, index) => value + single[(index + 1) % 4]);
  return { atom, pooled, concatenated, single, pair };
}

export function buildTrunk() {
  const fixed = fixedInput();
  const templateSignal = [0.08, -0.04, 0.03, 0.07];
  const msaSignal = [0.04, 0.08, -0.05, 0.02];
  let previousSingle = [0, 0, 0, 0];
  let previousPair = [0, 0, 0, 0];
  const passes = [];

  for (let pass = 1; pass <= EXAMPLE.recycles; pass += 1) {
    const singleInput = add(fixed.single, scale(normalized(previousSingle), pass === 1 ? 0 : 0.12));
    const pairInput = add(fixed.pair, scale(normalized(previousPair), pass === 1 ? 0 : 0.12));
    const afterTemplate = add(pairInput, templateSignal);
    const afterMsa = add(afterTemplate, msaSignal);
    const blocks = [];
    let single = singleInput;
    let pair = afterMsa;

    for (let block = 1; block <= EXAMPLE.pairformerBlocks; block += 1) {
      const pairBefore = pair;
      const singleBefore = single;
      pair = map(pairBefore, (value, index) => value + 0.008 * Math.tanh(value + singleBefore[index]));
      single = map(singleBefore, (value, index) => value + 0.006 * Math.tanh(value + pair[index]));
      blocks.push({ pairBefore, pairAfter: pair, singleBefore, singleAfter: single });
    }
    passes.push({ pass, previousSingle, previousPair, singleInput, pairInput, afterTemplate, afterMsa, blocks, single, pair });
    previousSingle = single;
    previousPair = pair;
  }
  return { fixed, passes, final: passes.at(-1) };
}

// The endpoint values and power-seven schedule match the source-backed
// architecture. The coordinates and denoiser rule below are teaching values.
export function noiseLevel(index) {
  const fraction = Math.max(0, Math.min(EXAMPLE.samplerSteps, index)) / EXAMPLE.samplerSteps;
  const root = 160 ** (1 / 7) + fraction * (0.0004 ** (1 / 7) - 160 ** (1 / 7));
  return 16 * root ** 7;
}

export function buildSampler(seed = 1, trunkFinal = buildTrunk().final) {
  const chosenSeed = Math.max(1, Math.min(EXAMPLE.seeds, Math.round(seed)));
  const target = [1.2, -0.8, 0.4];
  const initialNoise = [
    Math.sin(chosenSeed * 3.1),
    Math.cos(chosenSeed * 1.7),
    Math.sin(chosenSeed * 2.3 + 0.4),
  ];
  let current = map(target, (value, axis) => value + noiseLevel(0) * initialNoise[axis]);
  const steps = [];

  for (let index = 0; index < EXAMPLE.samplerSteps; index += 1) {
    const sigma = noiseLevel(index);
    const nextSigma = noiseLevel(index + 1);
    const atomFeatures = map(current, (value) => Math.tanh(value / (sigma + 16)));
    const tokenFeatures = map(trunkFinal.single, (value, axis) => Math.tanh(value + atomFeatures[axis % 3]));
    // A fixed toy denoiser supplies the clean-coordinate estimate. No AF3
    // network is evaluated and this is not a predicted atom trajectory.
    const estimate = map(target, (value, axis) => value + 0.06 * tokenFeatures[axis] + 0.04 * Math.sin(index * 0.07 + axis + chosenSeed));
    const direction = map(current, (value, axis) => (value - estimate[axis]) / sigma);
    const next = map(current, (value, axis) => value + 1.5 * (nextSigma - sigma) * direction[axis]);
    steps.push({ index: index + 1, sigma, nextSigma, current, atomFeatures, tokenFeatures, estimate, direction, next });
    current = next;
  }
  return { seed: chosenSeed, target, initial: steps[0].current, steps, final: steps.at(-1).next };
}

function preview(label, representationId, values, note = "") {
  return { label, representationId, values, note };
}

export function snapshot(stageId, options = {}) {
  const stage = STAGES.find((candidate) => candidate.id === stageId);
  if (!stage) throw new RangeError(`Unknown trace stage: ${stageId}`);
  const recycle = Math.max(1, Math.min(EXAMPLE.recycles, Math.round(Number(options.recycle) || 1)));
  const block = Math.max(1, Math.min(EXAMPLE.pairformerBlocks, Math.round(Number(options.block) || 1)));
  const sample = Math.max(1, Math.min(EXAMPLE.samplerSteps, Math.round(Number(options.sample) || 1)));
  const seed = Math.max(1, Math.min(EXAMPLE.seeds, Math.round(Number(options.seed) || 1)));
  const trunk = buildTrunk();
  const pass = trunk.passes[recycle - 1];
  const selectedBlock = pass.blocks[block - 1];
  const sampler = buildSampler(seed, trunk.final);
  const step = sampler.steps[sample - 1];
  const context = { recycle, block, sample, seed };

  const scenes = {
    tokenize: {
      input: preview("Heavy atoms per peptide residue", null, EXAMPLE.peptideAtoms, "These counts are fixed-complex facts, not synthetic tensor values."),
      output: preview("Resulting token groups", null, [6, EXAMPLE.ligandAtoms, 1, EXAMPLE.tokens], "Peptide, ATP, magnesium, total."),
      operation: "One standard residue becomes one token. Each ATP heavy atom and the magnesium ion become their own token.",
      takeaway: "The same model can then process a protein residue, a ligand atom, and an ion as tokens.",
    },
    atom_features: {
      input: preview("Illustrative local atom fields", "atom_reference_features", trunk.fixed.atom),
      output: preview("Illustrative local atom encoding", "pooled_atom_encoding", trunk.fixed.pooled),
      operation: "A tiny teaching example averages two local feature previews after the atom-attention stage. The real stage uses learned attention and pooling.",
      takeaway: "Atom detail is compressed into a token-level vector while chemistry-specific information can still enter the model.",
    },
    input_embedder: {
      input: preview("Pooled atom preview", "pooled_atom_encoding", trunk.fixed.pooled),
      output: preview("Selected input fields", "s_inputs", trunk.fixed.concatenated, "The four displayed values stand for fields from a 449-channel token vector, not four contiguous channels."),
      operation: "Concatenate pooled atom information with residue identity, MSA profile, and mean deletion features.",
      takeaway: "Each token starts with both local chemistry and sequence context.",
    },
    initial_projections: {
      input: preview("Selected input fields", "s_inputs", trunk.fixed.concatenated),
      output: preview("Pair-state preview", "pair_state", trunk.fixed.pair, "The toy pair values are outer sums of small projected token previews."),
      operation: "Project token inputs into a single state and an initial pair state. The pair preview uses an outer-sum teaching rule.",
      takeaway: "The trunk receives one vector per token and one vector per ordered token pair.",
    },
    recycle_input: {
      input: preview("Previous pair state", "pair_state", pass.previousPair, recycle === 1 ? "Zero on the first pass." : "From the preceding pass."),
      output: preview("Pair state entering this pass", "pair_state", pass.pairInput),
      operation: `Pass ${recycle} starts again from the fixed input projection, then adds a normalized preview of the previous pass's output.`,
      takeaway: "Recycling revisits the same input with refined context instead of continuing only from the old state.",
    },
    template: {
      input: preview("Pair state before template", "pair_state", pass.pairInput),
      output: preview("Pair state after template", "pair_state", pass.afterTemplate, "One illustrative template signal is added; no actual template is supplied for this complex."),
      operation: "The teaching update adds a small template signal to the pair preview. The real module builds template pair features and conditions the pair state.",
      takeaway: "Template geometry can inform pair relationships before MSA and Pairformer refinement.",
    },
    msa: {
      input: preview("Pair state before MSA", "pair_state", pass.afterTemplate),
      output: preview("Pair state after MSA", "pair_state", pass.afterMsa, "Eight synthetic MSA rows are assumed for this teaching preview."),
      operation: "A small illustrative MSA signal updates the pair preview. In AF3, OuterProductMean and MSA-pair exchange carry evolutionary information into the pair state.",
      takeaway: "Aligned sequences contribute evidence about which token positions vary together.",
    },
    pairformer: {
      input: preview(`Pair preview before block ${block}`, "pair_state", selectedBlock.pairBefore),
      output: preview(`Pair preview after block ${block}`, "pair_state", selectedBlock.pairAfter),
      operation: `Block ${block} of 48 applies a small toy residual pair update, followed by a small single update. The real block contains triangle operations, pair attention, and pair-biased single attention.`,
      takeaway: "Repeated blocks let information from one token pair influence other pairs and the token states.",
    },
    trunk_output: {
      input: preview("Final pair state of selected pass", "pair_state", pass.pair),
      output: preview("Final trunk pair state", "pair_state", trunk.final.pair, "Only pass 4 feeds the sampler in this paper-setting walkthrough."),
      operation: "After four displayed recycling passes, the final single and pair states condition diffusion and confidence prediction.",
      takeaway: "Sampling waits for the final trunk representation.",
    },
    sampler_init: {
      input: preview("Illustrative seed noise", null, sampler.initial, "Shown for one representative atom and one synthetic seed."),
      output: preview("Initial coordinate state", "sampler_coordinate_state", sampler.initial),
      operation: `Seed ${seed} initializes a noisy coordinate cloud. The preview shows x, y, z for one representative atom.`,
      takeaway: "The sampler starts from noise, not from a finished structure.",
    },
    noise_schedule: {
      input: preview("Current noise level", "noise_level", [step.sigma]),
      output: preview("Next noise level", "noise_level", [step.nextSigma]),
      operation: `Step ${sample} of 200 follows the source-backed power-seven schedule from 2560 toward 0.0064. This teaching trace omits pose augmentation and churn noise.`,
      takeaway: "The allowed noise shrinks across repeated denoising calls.",
    },
    atom_encoder: {
      input: preview("Current noisy x, y, z", "noisy_atom_positions", step.current),
      output: preview("Illustrative atom features", "atom_single_representation", step.atomFeatures),
      operation: "Normalize the coordinate scale for the current noise level, then gather local atom context. The displayed feature rule is a toy replacement for learned atom attention.",
      takeaway: "The denoiser keeps atom-level detail while making the noisy coordinates manageable.",
    },
    token_transformer: {
      input: preview("Illustrative atom features", "atom_single_representation", step.atomFeatures),
      output: preview("Illustrative token activations", "diffusion_token_activation", step.tokenFeatures, "Mixed with the final trunk single preview through a toy rule."),
      operation: "Atom information is pooled to tokens, then token attention mixes it with final trunk conditioning. The numeric rule shown here is illustrative.",
      takeaway: "The denoiser reasons globally at token scale before returning to atoms.",
    },
    atom_decoder: {
      input: preview("Illustrative token activations", "diffusion_token_activation", step.tokenFeatures),
      output: preview("Toy clean-coordinate estimate", "denoised_atom_positions", step.estimate, "This is supplied by a fixed teaching rule, not a trained AF3 denoiser."),
      operation: "The real decoder broadcasts updated tokens back to atoms and predicts an atom update. Here the token preview feeds a fixed toy rule for the clean-coordinate estimate.",
      takeaway: "A denoiser estimate guides the sampler; it is not itself the next sampler state.",
    },
    sampler_update: {
      input: preview("Current x, y, z", "sampler_coordinate_state", step.current),
      output: preview("Updated x, y, z", "sampler_updated_positions", step.next),
      operation: "Compute (current minus toy clean estimate) divided by current noise, then take a scaled Euler step using the next noise level. Pose augmentation and churn are omitted from this teaching calculation.",
      takeaway: "The sampler uses the denoiser's estimate to update coordinates, then repeats.",
    },
    confidence: {
      input: preview("Illustrative final x, y, z", "final_sampled_atom_positions", sampler.final),
      output: preview("Confidence output contracts", "predicted_lddt_distribution", null, "No score or probability is displayed: synthetic coordinates and no trained confidence head cannot produce meaningful AF3 confidence."),
      operation: "The real confidence head consumes the final sample and trunk states, then emits distributions for local and pairwise quality estimates.",
      takeaway: "The shapes can be inspected now; meaningful confidence values require a real model run.",
    },
  };
  return { stage, context, ...scenes[stageId] };
}
