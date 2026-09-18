# Decisions

Append-only log of structural decisions for this project. See the global
CLAUDE.md change-logging rules for the format and when a new entry is
required. Past entries are never rewritten; a reversal gets a new entry that
links back with `**Supersedes:**`.

## 2026-09-17 — Screen delivery architecture: one Artifact per screen

**Decision:** Each of the ~15 planned screens ships as its own
self-contained Artifact with its own URL and its own HTML file, rather than
one growing multi-screen Artifact with in-page navigation.

**Options considered:**
- One Artifact per screen (chosen).
- One growing multi-screen Artifact (tabs or a sidebar, single URL for the
  whole tool, shared styling/state in one place).

**Why:** Per-screen artifacts are simple to build and iterate on
independently, without touching other screens; easy to link or screenshot
one screen into a talk slide; no shared build system to maintain. The
accepted trade-off is some duplication of shared CSS/JS/diagram code across
screens, a larger total surface area to keep visually consistent by hand,
and a need for a lightweight index/landing artifact later to link them all
together, rather than one cohesive app shell.

Full design detail for the first screen built under this decision is in
`SPEC.md`'s triangle inequality sandbox entry.

## 2026-09-15 — Data source: real AlphaFold 3 output, run directly

**Decision:** Use real AlphaFold 3 model output, not a reimplementation and
not a mock, as the source of precomputed tensors for every screen that needs
model output. Download AF3's official model parameters, run inference once
offline on the fixed example complex(es), dump every intermediate tensor, and
ship those as static assets. No GPU or model at runtime; the tool is a player
over real AF3 numbers.

**Options considered:**
- Option A in `SPEC.md`'s original framing: run an open-weights
  reimplementation (Protenix, Boltz, or Chai) once, dump tensors, ship as
  static assets.
- Option B in `SPEC.md`'s original framing: shape-faithful mock with
  randomly initialized weights at toy scale. Correct shapes, meaningless
  numbers.
- This decision: run AF3 itself directly, using Google DeepMind's official
  model parameters, instead of either alternative.

**Why:** `SPEC.md` originally ruled AF3's own weights out because they were
believed gated (request-only, approval at Google's discretion). That was
stale. As of 2026-07-23 (commit `dd1a7bad` on `google-deepmind/alphafold3`),
DeepMind replaced the request-form process with a direct, unapproved download
(`https://storage.googleapis.com/alphafold3/af3.bin.zst`). Checked live via
`gh api` on 2026-09-15 against the current `WEIGHTS_TERMS_OF_USE.md` and
`OUTPUT_TERMS_OF_USE.md`:

- Use is non-commercial only, by non-commercial organizations or individuals
  not affiliated with a commercial organization.
- The model parameters themselves must never be published or redistributed;
  that restriction did not change when the download gate was removed.
- AF3 "Output" (defined as "the structure predictions and all ancillary and
  related information provided by AlphaFold 3 or using the Model Parameters,"
  which plausibly covers intermediate tensors, not just final coordinates)
  *can* be published, shared, and adapted, including via an open source
  release, even to indirect commercial viewers, provided conspicuous notice
  is given that the Output is provided under AF3's Output Terms of Use, and
  of any modifications made.

Going to the real model instead of a reimplementation matters specifically
for the input flow tracer screen (`SPEC.md` #1): AF3's central claim, that a
ligand atom, an ion, and a protein residue pass through identical machinery,
lands harder shown on the actual model that makes that claim, rather than an
independent reimplementation that may diverge in exact numbers or minor
architectural choices.

**Compliance requirements this decision imposes on the build:**
- Whoever runs the offline tensor dump must be doing so non-commercially (this
  project qualifies: educational, for a conference talk).
- Never commit or ship the model parameters file itself, only derived output.
  See the Git/GitHub hygiene rule in `CLAUDE.md` about checking precomputed-
  tensor directories before committing.
- Every published/distributed asset derived from AF3 output needs conspicuous
  notice that it is provided under the AF3 Output Terms of Use, plus a note of
  any modifications made to it.
- Do not use AF3 output to train or create machine learning models for
  biomolecular structure prediction. Not applicable here; the tool only
  visualizes, never trains.

## 2026-09-18 — SVG label sizing and placement rules for diagram screens

**Decision:** Two rules for any screen whose diagram is an inline SVG with a
fixed viewBox scaled to fit its column:

1. Size SVG text against the *narrowest* width the SVG ever renders at, not
   against the viewBox width, and use one size at every viewport rather than
   bumping it at a breakpoint.
2. Place labels analytically first, then run a bounded clearance pass that
   measures the drawn boxes with `getBBox()` and pushes the movable ones
   further along the direction they were already offset in until nothing
   overlaps, stopping before anything leaves the viewBox.

**Options considered:**
- Sizing text for the viewBox width and correcting with `max-width` media
  queries (what the first version of the triangle sandbox did).
- Widening `.page` or the diagram grid column so the SVG renders closer to
  1:1 with its viewBox.
- Shrinking the viewBox so user units map closer to rendered pixels.
- Special-casing each degenerate geometry in the placement maths, with no
  measurement pass.

**Why:** In a two-column layout the SVG's rendered width is capped by the
page's own `max-width`, not by the viewport, so it never approaches the
viewBox width however wide the browser gets. Media queries keyed to viewport
width cannot see that, which is how the sandbox ended up with text under the
11px legibility floor at every desktop width from 761px up while passing its
400px and 760px spot checks. Because effective size is
`font-size x renderedWidth / viewBoxWidth`, the viewBox width is arbitrary:
widening the column and shrinking the viewBox are the same adjustment
expressed differently, and neither removes the need to check the narrowest
render. Sizing for the narrowest render gives one number that holds
everywhere, keeps the diagram's proportions identical at every width, and
removes the breakpoint entirely.

The clearance pass exists because purely analytic placement cannot be checked
by reading it. Both the collapsed (`d(i,j)` at its lower bound) and collinear
(upper bound) cases produce overlaps that look correct in the source, and the
lopsided cases (one edge several times the other) produce more. Measuring what
was actually drawn turns "does this overlap" into something a headless browser
can answer across the whole parameter space; the triangle sandbox is checked
over 441 slider/marker combinations with zero overlaps and zero clipping. The
cost is ~15 `getBBox()` calls per redraw, measured at 0.12ms, against a 16.7ms
frame budget.

Applies to the triangle inequality sandbox now and to the other diagram
screens in `SPEC.md` as they are built.
