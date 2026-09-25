import test from "node:test";
import assert from "node:assert/strict";
import { manifest } from "../explainer/renderer/architecture/manifest-alphafold3.js";
import { EXAMPLE, STAGES, buildSampler, buildTrunk, noiseLevel, snapshot } from "./model.mjs";

test("the fixed complex and source-backed stage links remain consistent", () => {
  assert.equal(EXAMPLE.peptideAtoms.reduce((sum, count) => sum + count, 0) + EXAMPLE.ligandAtoms + EXAMPLE.ionAtoms, EXAMPLE.atoms);
  assert.equal(6 + EXAMPLE.ligandAtoms + EXAMPLE.ionAtoms, EXAMPLE.tokens);
  const boards = new Set(manifest.boards.items.map((board) => board.id));
  const representations = new Set(manifest.architecture.representations.map((representation) => representation.id));
  for (const stage of STAGES) {
    assert(boards.has(stage.board), stage.id);
    const scene = snapshot(stage.id);
    for (const preview of [scene.input, scene.output]) {
      if (preview.representationId) assert(representations.has(preview.representationId), stage.id);
      if (preview.values) assert(preview.values.every(Number.isFinite), stage.id);
    }
  }
});

test("recycling reuses fixed input anchors and only passes previous state forward", () => {
  const { fixed, passes, final } = buildTrunk();
  assert.equal(passes.length, 4);
  assert.deepEqual(passes[0].previousSingle, [0, 0, 0, 0]);
  assert.deepEqual(passes[0].previousPair, [0, 0, 0, 0]);
  assert.deepEqual(passes[0].singleInput, fixed.single);
  assert.deepEqual(passes[0].pairInput, fixed.pair);
  for (let index = 1; index < passes.length; index += 1) {
    assert.deepEqual(passes[index].previousSingle, passes[index - 1].single);
    assert.deepEqual(passes[index].previousPair, passes[index - 1].pair);
    assert.equal(passes[index].blocks.length, 48);
  }
  assert.deepEqual(final, passes[3]);
});

test("the synthetic sampler is deterministic, continuous, and has the declared endpoints", () => {
  const first = buildSampler(1);
  assert.deepEqual(first, buildSampler(1));
  assert.notDeepEqual(first.initial, buildSampler(2).initial);
  assert.equal(first.steps.length, 200);
  assert(Math.abs(noiseLevel(0) - 2560) < 1e-9);
  assert(Math.abs(noiseLevel(200) - 0.0064) < 1e-9);
  for (let index = 1; index < first.steps.length; index += 1) {
    assert.deepEqual(first.steps[index].current, first.steps[index - 1].next);
    assert(first.steps[index].sigma < first.steps[index - 1].sigma);
  }
  assert.deepEqual(first.final, first.steps[199].next);
  assert.deepEqual(snapshot("token_transformer", { sample: 50 }).input.values, first.steps[49].atomFeatures);
  assert.deepEqual(snapshot("atom_decoder", { sample: 50 }).input.values, first.steps[49].tokenFeatures);
  assert.deepEqual(snapshot("sampler_update", { sample: 50 }).output.values, first.steps[49].next);
});

test("confidence preview preserves the unavailable learned result", () => {
  const scene = snapshot("confidence");
  assert.equal(scene.output.values, null);
  assert.match(scene.output.note, /no trained confidence head/i);
});
