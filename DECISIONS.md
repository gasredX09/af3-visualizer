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
