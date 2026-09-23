import test from "node:test";
import assert from "node:assert/strict";

import { summarizeMsaPair } from "../renderer/architecture/msa-pair-example.mjs";

const sequences = ["AGVLSK", "AAILTK", "AGVLTR", "AAILSR", "AGVLSR", "AAILTR", "AGVLTK", "AAILSK"];

test("one-hot mean outer product exposes coupled and balanced toy columns", () => {
  const coupled = summarizeMsaPair(sequences, 2, 3);
  assert.deepEqual(coupled.firstResidues, ["G", "A"]);
  assert.deepEqual(coupled.secondResidues, ["V", "I"]);
  assert.deepEqual(coupled.counts, [[4, 0], [0, 4]]);
  assert.equal(coupled.oneToOne, true);
  assert.equal(coupled.observedCombinations, 2);
  assert.equal(coupled.columns[0].conservation, 1);
  assert.equal(coupled.columns[3].conservation, 1);

  const balanced = summarizeMsaPair(sequences, 2, 5);
  assert.deepEqual(balanced.counts, [[2, 2], [2, 2]]);
  assert.equal(balanced.oneToOne, false);
  assert.equal(balanced.observedCombinations, 4);
});

test("MSA example rejects malformed rows and pair choices", () => {
  assert.throws(() => summarizeMsaPair(["AV", "A"], 1, 2), /same length/);
  assert.throws(() => summarizeMsaPair(sequences, 2, 2), /distinct/);
  assert.throws(() => summarizeMsaPair(sequences, 2, 7), /distinct/);
});
