import test from "node:test";
import assert from "node:assert/strict";

import {
  GEOMETRY_GLYPH_KINDS,
  REPRESENTATION_GLYPH_KINDS,
  glyphKindForShape,
  shapeDimsLabel,
  tensorGlyphSvg,
} from "../renderer/architecture/representation-glyphs.mjs";
import {
  mathProseMarkup,
  notationMarkup,
  svgMathLabelParts,
  texMarkup,
} from "../renderer/architecture/math-notation.mjs";
import { manifest as alphafold3Manifest } from "../renderer/architecture/manifest-alphafold3.js";

test("board notation sends grouped TeX subscripts to MathJax", () => {
  assert.equal(notationMarkup("x_{t-10}"), "\\(x_{t-10}\\)");
  assert.equal(notationMarkup("s_{i+1}"), "\\(s_{i+1}\\)");
  assert.equal(notationMarkup("x_t"), "\\(x_{t}\\)");
  assert.equal(notationMarkup(".pdb"), ".pdb");
  assert.equal(texMarkup("\\hat{x}_0"), "\\(\\hat{x}_0\\)");
  assert.equal(notationMarkup("m_{si}^{h}"), "\\(m_{si}^{h}\\)");
  assert.equal(notationMarkup("m_{si}^{updated}"), "\\(m_{si}^{\\mathrm{updated}}\\)");
  assert.equal(notationMarkup("beta_ij"), "\\(\\beta_{ij}\\)");
  assert.equal(notationMarkup("z_ij"), "\\(z_{ij}\\)");
  assert.equal(notationMarkup("s^{trunk}"), "\\(s^{\\mathrm{trunk}}\\)");
  assert.equal(notationMarkup("<script>"), "&lt;script&gt;");
});

test("AF3 board symbols and connector labels have typeset math paths", () => {
  for (const board of alphafold3Manifest.boards.items) {
    for (const node of board.nodes || []) {
      if (!node.notation || !/[_^]/.test(node.notation)) continue;
      assert.match(notationMarkup(node.notation), /^\\\(/, `${board.id}: ${node.notation}`);
    }
    for (const edge of board.edge_overrides || []) {
      if (!edge.label || !/[_^]/.test(edge.label)) continue;
      const parts = svgMathLabelParts(edge.label);
      assert(parts.some((part) => part.kind === "sub" || part.kind === "sup"),
        `${board.id}: ${edge.label}`);
      assert(!parts.some((part) => part.text.includes("{") || part.text.includes("}")),
        `${board.id}: ${edge.label}`);
    }
  }
  assert.deepEqual(svgMathLabelParts("refined v_{ij}"), [
    { kind: "plain", text: "refined " },
    { kind: "base", text: "v" },
    { kind: "sub", text: "ij" },
  ]);
  assert.deepEqual(svgMathLabelParts("m_{si}^{h}"), [
    { kind: "base", text: "m" },
    { kind: "sub", text: "si" },
    { kind: "sup", text: "h", overlap: 2 },
  ]);
  assert.equal(
    mathProseMarkup("weights b_ij^h from z_ij <script>"),
    'weights <span class="math-inline">\\(b_{ij}^{h}\\)</span> from <span class="math-inline">\\(z_{ij}\\)</span> &lt;script&gt;',
  );
  assert.equal(mathProseMarkup("value_sites.z_ij and some_long_identifier"),
    "value_sites.z_ij and some_long_identifier");
  assert.deepEqual(svgMathLabelParts("value_sites.z_ij"), [
    { kind: "plain", text: "value_sites.z_ij" },
  ]);
});

test("shape inference remains generic when semantic geometry is unknown", () => {
  assert.equal(glyphKindForShape("B x N x 3"), "matrix");
  assert.equal(glyphKindForShape("B x N x (3 x 3 + 3)"), "matrix");
  assert.equal(glyphKindForShape("B x N x 384"), "single");
  assert.equal(glyphKindForShape("B x N x N x 128"), "pair");
  assert.equal(glyphKindForShape("B"), "scalar");
});

test("dimension labels preserve nested frame structure and omit batch", () => {
  assert.equal(shapeDimsLabel("B x N x 3"), "N × 3");
  assert.equal(shapeDimsLabel("B x N x (3 x 3 + 3)"), "N × (3 × 3 + 3)");
});

test("geometry glyph vocabulary is explicit and schema-sized", () => {
  assert.deepEqual(GEOMETRY_GLYPH_KINDS, ["coordinates", "frames"]);
  assert.deepEqual(REPRESENTATION_GLYPH_KINDS, [
    "scalar",
    "vector",
    "single",
    "matrix",
    "pair",
    "volume",
    "dictionary",
    "coordinates",
    "frames",
  ]);
});

test("coordinate glyph depicts unconnected points with labeled 3D axes", () => {
  const svg = tensorGlyphSvg("coordinates");
  assert.match(svg, /tensor-coordinate-geometry/);
  assert.equal((svg.match(/geometry-point(?: |")/g) || []).length, 6);
  assert.doesNotMatch(svg, /geometry-trace/);
  assert.match(svg, />x<\/text>/);
  assert.match(svg, />y<\/text>/);
  assert.match(svg, />z<\/text>/);
});

test("frame glyph depicts repeated local axis triads", () => {
  const svg = tensorGlyphSvg("frames");
  assert.match(svg, /tensor-frame-geometry/);
  assert.equal((svg.match(/<g class="geometry-frame/g) || []).length, 3);
  assert.ok((svg.match(/geometry-axis axis-x/g) || []).length >= 3);
  assert.match(svg, />x<\/text>/);
  assert.match(svg, />y<\/text>/);
  assert.match(svg, />z<\/text>/);
});

test("dictionary glyph depicts named tensor entries instead of one tensor grid", () => {
  const svg = tensorGlyphSvg("dictionary", ["token_mask", "gt_restype", "gt_atom_positions"]);
  assert.match(svg, /dictionary-glyph/);
  assert.match(svg, /token_mask: tensor/);
  assert.match(svg, /gt_restype: tensor/);
  assert.match(svg, /gt_atom_positions: tensor/);
  assert.doesNotMatch(svg, /class="tensor-cells"/);
});

test("generic tensor glyphs retain their cell grids", () => {
  const svg = tensorGlyphSvg("matrix");
  assert.match(svg, /class="tensor-cells"/);
  assert.equal((svg.match(/<rect /g) || []).length, 48);
});
