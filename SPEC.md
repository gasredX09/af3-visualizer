# AF3 Visualizer: specification

A teaching tool showing how input flows through the AlphaFold 3 architecture.
Built for students, delivered alongside an hour-long talk on the AF3 paper at
[GenAI BioMed 2026 Fall](https://genaibiomed.github.io/GenAIBioMed2026Fall/).

## Context and constraints

**Audience.** Mixed CS and biology backgrounds. Some know transformers and
diffusion models but not what an MSA is. Some know protein structure cold but
have never seen attention. Every visualization should be legible to both, which
usually means naming the same idea twice (once in ML vocabulary, once in
structural biology vocabulary) the first time it appears.

**Talk format.** One hour, taught rather than read, slides carrying figures and
flowcharts rather than text. The tool is a separate deliverable students can
open on their own afterward, not a live demo prop, though individual screens
may get screenshotted into slides.

**Source material.** The running paper note at `~/research/src/alphafold3.typ`
covers all 31 supplementary algorithms with pseudocode boxes and provenance
citations. Use it as the reference for any mechanism described here.

## Data source: real AlphaFold 3 output (decided)

Full rationale and options considered are in `DECISIONS.md` (2026-09-15 entry).

Run AF3 directly: download the official model parameters, run inference once
offline on the fixed example complex(es), dump every intermediate tensor, and
ship those as static assets. No GPU or model at runtime; the tool is a player
over real AF3 numbers.

Constraints this imposes on the build:

- Non-commercial use only.
- Never ship the model parameters file itself, only derived output (dumped
  tensors, visualizations). Redistributing the weights is still prohibited
  even though downloading them no longer requires approval.
- Every asset derived from AF3 output needs conspicuous notice that it is
  provided under AF3's Output Terms of Use, and must note any modifications
  made to it.

A shape-faithful mock (randomly initialized weights at toy scale, correct
shapes but meaningless numbers) remains the fallback if the real dump proves
impractical for a given screen, but is not the plan.

Several screens listed below need no model output at all and are unaffected by
this decision either way.

## Delivery architecture: the Architecture Explainer (2026-09-18 pivot)

Full rationale in `DECISIONS.md` (2026-09-18 entry, "Pivot to the Architecture
Explainer framework"). All future AF3 content is built with `explainer/`, a
vendored copy of `ramithuh/explainer`: a declarative YAML DSL for architecture
facts (modules, representations, relations, evidence), a Ruby compiler and
verifier, and a JS renderer with semantic zoom, a synchronized pseudocode
inspector, and shareable deep links. It replaces the one-HTML-artifact-per-
screen model in "Core screens" and "Supporting visualizations" below for
anything not already built; the three screens already built stay live as-is
at `/screens/` (see Delivery).

Authoring an AF3 module means editing YAML under `explainer/architectures/`,
`explainer/views/`, and `explainer/pseudocode/`, following
`explainer/AGENTS.md`'s rules exactly (stable snake_case IDs, one owner per
fact, every claim tagged `confirmed_from_code` / `confirmed_from_paper` /
`confirmed_from_docs` / `inferred` / `open_question`) — the same accuracy bar
this project already holds itself to, just enforced by the tool's own
verifier instead of by hand. Regenerate manifests with Ruby 3.3
(`explainer/.ruby-version` matches CI's pin) to avoid a spurious
reformatting diff from a different interpreter's json gem.

Two sequential sub-projects:

- **Sub-project 0 (infrastructure, complete and live).** Got the pipeline
  itself live on `af3-visualizer`'s GitHub Pages, publishing only the
  existing `af3_pairformer` source set (renamed `alphafold3` in sub-project 1) with no content changes, so the
  build/deploy machine was proven before new content went on top of it.
- **Sub-project 1 (content, current work).** Expand that source set (renamed
  `alphafold3`, see `DECISIONS.md` 2026-09-19 entry) into a full AF3
  architecture, module by module: input embedder, MSA module (MSA stack plus
  `OuterProductMean`), template module, the Pairformer (already authored
  upstream), the atom-to-token-to-atom diffusion module, confidence heads.
  Each module gets its own design/plan pass.

### Sub-project 1, module 1: the Input Feature Embedder

Full rationale for the rename and the boundary correction is in
`DECISIONS.md` (2026-09-19 entry). This section is the content spec for the
first new module.

**Mechanism** (`~/research/src/alphafold3.typ`, *Inside `InputFeatureEmbedder`
and `AtomAttentionEncoder`*, `[paper] Algorithm 2, 5-7`): `InputFeatureEmbedder`
is a three-line algorithm. It calls `AtomAttentionEncoder` (Algorithm 5) in
its *bare* mode — all three optional conditioning arguments (noisy atom
positions, trunk single, trunk pair) are `None` — to get a permutation-invariant
per-atom encoding of each token's isolated reference-conformer geometry
(reference position, charge, one-hot element, atom name; pairwise offsets
within the same residue/ligand instance; sequence-local `AtomTransformer`
attention restricted to each token's own atoms), mean-pooled to one vector
per token. That per-token vector is concatenated with three non-geometric
per-token features — `restype` (one-hot identity), `profile` (the MSA's
per-column amino-acid distribution, a compressed summary, not the full
alignment), `deletion_mean` (average deletion rate at that column) — to
produce `s_inputs`, which becomes this project's existing `single_state_input`
and (via the outer-sum pattern already used inside the trunk) `pair_state_input`.

**Why this matters, for the board's own takeaway**: AF2 gets away with a
20/21-way one-hot residue embedding because its vocabulary is fixed; AF3
handles arbitrary ligands and modified residues with no fixed vocabulary by
running genuine local self-attention over each token's own atoms to
discover what matters about its specific chemistry, then compressing that
to one vector. This one mechanism is what lets one architecture handle
standard residues, modified residues, and arbitrary small molecules
uniformly.

**Scope for this pass (decided in brainstorming, 2026-09-19):**
`AtomAttentionEncoder` is modeled as a single `opaque` child module — not its
internals. It is the *same* reusable routine (`"shared routine, behavior
toggled by whether optional args are provided"` — the note's own framing,
also true of `AttentionPairBias`) called again later, in *conditioned* mode,
by the Diffusion Module's own atom encoder/decoder. Modeling its internals
now would mean doing it twice, or doing it once against only half the real
requirements (bare mode) and reworking it when the Diffusion Module module
is built. Its real internals become a `standard_block` (reusable, typed,
with explicit `variant`/`conformance`) the first time a module actually
needs them modeled — likely the Diffusion Module pass.

**New facts added** (`explainer/architectures/alphafold3-pairformer.yaml`,
hand-edited — see `DECISIONS.md`'s 2026-09-19 "Hand-edit the Input Feature
Embedder instead of using architecture-edit-v0.2" entry for why the
`architecture-edit-v0.2` plan tool could not express this task):
- Module `input_feature_embedder` (`parent_ref: architecture`,
  `decomposition.status: complete`), with two children: `atom_attention_encoder_bare`
  (`decomposition.status: opaque`, the bare-mode `AtomAttentionEncoder` call)
  and `input_feature_concatenation` (`decomposition.status: leaf`, the
  per-token feature concat).
- Two further root-level modules, `single_state_input_projection` and
  `pair_state_input_projection`, modeling Algorithm 1 lines 2-3's projection
  of `s_inputs` into `single_state_input` and (via two independent
  `LinearNoBias` layers outer-summed) `pair_state_input`.
- New `boundary: input` value sites for the true raw features this module
  consumes: `atom_reference_features_input` (one value site is enough at this
  scope — the atom-level detail stays inside the opaque child),
  `restype_input`, `profile_input`, `deletion_mean_input` (each backed by a
  new representation of the same name), plus the internal (non-boundary)
  `s_inputs` value site holding the concatenated 449-channel per-token
  embedding (`pooled_atom_encoding` (384) + `restype` (32) + `profile` (32) +
  `deletion_mean` (1)).
- Relations wiring the full path: reference-conformer features into the atom
  encoder, the atom encoder's pooled per-atom output (`pooled_atom_encoding`,
  distinct from the trunk's `single_state` despite sharing a 384-channel
  count) plus `restype`/`profile`/`deletion_mean` into the concatenation
  module, the concatenation into `s_inputs`, and `s_inputs` into each of the
  two projection modules, which each produce one of the existing
  `single_state_input`/`pair_state_input` value sites.
- Every new fact cites `~/research/src/alphafold3.typ`'s own `[paper]`
  locators for Algorithm 2 and Algorithm 5, at `evidence.status:
  confirmed_from_paper` (matching the existing Pairformer entries' own
  distinction between `confirmed_from_paper` and `confirmed_from_code`).

**Corrections to existing facts** (hand-edited in place, not a new addition):
- `single_state_input` and `pair_state_input` lose `boundary: input` — they
  are no longer the architecture's task-native boundary once
  `input_feature_embedder` sits upstream of them. (`pair_state_input`'s own
  producer is the outer-sum construction of `z_init` from `s_inputs`,
  per Algorithm 1 — modeling that fold is in scope for this same module,
  since it is a direct, one-line consequence of `s_inputs` existing and
  keeps `pair_state_input` a real internal hand-off rather than an
  unexplained value site.)
- The architecture root's `decomposition.status` note ("The source set
  deliberately stops at the already-embedded single and pair
  representations") gets rewritten to describe the new, larger boundary
  (raw per-token/per-atom input features) instead.

**View changes** (`explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`):
new root-board nodes for `input_feature_embedder`'s value sites and modules
(the atom encoder, the concatenation, and the two projection modules),
positioned before the existing Pairformer nodes, using hand-picked
`col`/`row` values matching every other node in the file's own established
convention — not the `semantic_flow_v1` layout compiler the original plan
called for.

**Verification**: hand-edit the architecture and view YAML directly (per
`DECISIONS.md`'s 2026-09-19 entry), then the full verification pipeline —
`ruby scripts/lint_sources.rb`, `ruby scripts/verify_architecture.rb
--source-set alphafold3`, `ruby renderer/architecture/build-manifest.rb
--check` — plus an actual rendered check in a browser (per this project's
standing "verify by rendering" rule) that the new nodes appear, drill in
correctly, and that removing `boundary: input` from the two existing value
sites didn't silently orphan a board or a pseudocode reference.

### Sub-project 1, module 2: the MSA Module

**Mechanism** (`~/research/src/alphafold3.typ:293-392`, `[paper] Section 3.3,
Algorithms 8-10`): `MsaModule` takes raw MSA per-row features (`f*`: one-hot
sequence identity, deletion flags/values) plus `s_inputs`, embeds and
resamples MSA rows, then runs 4 blocks. Each block: **communication**
(`OuterProductMean`, Algorithm 9) — the only place evolutionary coupling
(correlated variation across the MSA at two token positions) enters the
pair representation, an empirical cross-covariance between two learned
per-row projections, averaged over MSA rows and flattened into `z_ij`;
**MSA stack** (`MSAPairWeightedAveraging`, Algorithm 10) — attention whose
weights come entirely from the pair representation (`softmax_j(LinearNoBias(
LayerNorm(z_ij)))`), never from row content, so every MSA row is pulled
through the exact same shared routing table, with a row-specific gate as the
only per-row control; **pair stack** — the same triangle-multiplication/
triangle-attention/transition mechanism already modeled for the Pairformer,
run 4 times instead of 48. Only the final `z_ij` is returned; the MSA
representation itself is discarded every call.

**Why this matters, for the board's own takeaway**: this is the only place
in the whole model where evolutionary coupling (classical coevolution-based
contact prediction, direct-coupling analysis, done end-to-end instead of
with hand-designed statistics) enters the pair representation, and MSA rows
never talk to each other directly — information only flows row-to-pair
(`OuterProductMean`) and pair-to-row (the shared, pair-derived weighting).
The pair representation is the hub, same asymmetric design principle as the
Pairformer, applied one level earlier: "MSA module = read new evidence;
Pairformer = reason from it."

**Scope for this pass (decided in brainstorming, 2026-09-19):**
- `OuterProductMean` and `MSAPairWeightedAveraging` are modeled with real
  internals (unlike `AtomAttentionEncoder` in module 1) — neither is reused
  elsewhere in the model, so there's no shared-routine reason to keep them
  opaque.
- The MSA module's own pair-stack (triangle mult x2, triangle attn x2,
  transition) is architecturally identical to 4 of the Pairformer's 5
  pair-stack steps, just run 4 times instead of 48. This pass authors its
  own facts for that pair-stack rather than extracting a shared
  `standard_block` now — extracting one and retrofitting the Pairformer's
  already-shipped relations to reference it is a real, separate future
  cleanup task, deliberately deferred to avoid touching stable, reviewed
  content in this pass.
- Only one representative pass through the module is modeled. AF3 actually
  runs the MSA module (and, once built, the Template module) inside an
  outer recycling loop feeding back into Pairformer's output — up to 4
  cycles — which isn't modeled anywhere in this architecture yet. That
  outer loop is a separate, cross-cutting future addition, not bundled into
  this content module.

**New facts to add** (`explainer/architectures/alphafold3-pairformer.yaml`,
hand-edited per `DECISIONS.md`'s 2026-09-19 hand-edit entry, not via
edit-plan — this task wires into an already-visible value site, the exact
condition that made module 1's edit-plan attempt fail `prepare`):
- Module `msa_module` (`parent_ref: architecture`), with child modules
  `outer_product_mean` and `msa_pair_weighted_averaging` (both modeled with
  real mechanism, per the scope decision above), plus the module's own
  pair-stack leaf modules.
- New `boundary: input` value sites for the raw MSA features: `msa_input`
  (one-hot sequence identity), `has_deletion_input`, `deletion_value_input`.
- A real `z_init` value site — mirroring module 1's `s_inputs` fix.
  `pair_state_input_projection`'s output currently feeds `pair_state_input`
  directly, which was only ever true because nothing sat between them yet.
  Retarget that existing relation to produce `z_init` instead of
  `pair_state_input`; `msa_module` reads `z_init` plus the raw MSA features
  and produces the (retargeted) `pair_state_input`.
- Every new fact cites `~/research/src/alphafold3.typ`'s own `[paper]`
  locators for Algorithms 8-10, matching module 1's evidence discipline.

**View**: the root board (`pairformer_overview`) is already at its accepted
13-node `dense_board` warning threshold. This module gets its own child
board from the start (following the `pairformer_block`/
`input_feature_embedder_detail` precedent), rather than adding its own
substantial internal detail to the root board and needing a follow-up
curation pass the way module 1 did.

**Verification**: same pipeline as module 1 — `lint_sources.rb`,
`verify_architecture.rb --source-set alphafold3`, `build-manifest.rb
--check`, plus an actual rendered check confirming the retargeted
`pair_state_input_projection -> z_init -> msa_module -> pair_state_input`
chain renders correctly and the existing Pairformer board is unaffected.

## Core screens

These four carry the main narrative: what AF3 takes in, how it transforms it,
and what comes out.

### 1. Input flow tracer

**Shows.** One small complex (for example a 6-residue peptide, an ATP ligand,
and a magnesium ion) walked stage by stage through the architecture:
tokenization, input embedder, trunk with the recycling loop drawn as an actual
loop, diffusion module, confidence head. Real tensor shapes at each stage, a
small heatmap of real values, and click-to-expand into what happens inside any
stage.

**Teaches.** The overall pipeline shape, what the representations actually are,
and the fact that a ligand atom, an ion, and a protein residue pass through
identical machinery. That last point is AF3's central claim and is hard to
convey in prose.

**Data needed.** Full intermediate tensors for one complex.

### 2. Diffusion sampler scrubber

**Shows.** A slider across the roughly 200 sampling steps. The atom cloud in 3D
going from pure noise to resolved structure, the current noise level, and the
random rotation applied each step visible as the cloud reorienting. Two seeds
side by side.

**Teaches.** That structure generation is iterative refinement from noise rather
than a single forward pass, what the noise schedule does, why pose is
re-randomized every step, and that the model is genuinely generative.

**Data needed.** Coordinates at every sampling step, for at least two seeds.

**Note.** Most visually compelling screen in the set. CS students recognize
diffusion from image models, bio students watch a structure appear. Good
candidate for the one live moment in the talk.

### 3. Tokenization sandbox

**Shows.** Paste a sequence plus a ligand, get back the token list colored by
type, next to the same complex rendered under AF2's residue-only view. Standard
residue becomes one token, ligand becomes one token per heavy atom, ion becomes
one token.

**Teaches.** The token abstraction, which is the most underappreciated design
choice in the paper and the reason AF3 generalizes past proteins.

**Data needed.** None. Pure logic, no model involved.

**Note.** Cheapest screen here and a good opening view for the whole tool.

### 4. Pair representation explorer

**Shows.** The N by N pair grid as a heatmap, with a slider across the 48
Pairformer blocks and the 4 recycles. Ground-truth contact map overlaid. Click a
cell to see which k values the triangle updates drew from.

**Teaches.** What the pair representation holds, why triangle updates exist, and
why the stack is 48 blocks deep.

**Data needed.** Pair tensor snapshots across blocks and recycles.

**Note.** Deepest and hardest to make legible. Treat as an advanced tab, not an
entry point.

## Supporting visualizations

Grouped by the job they do.

### Making an abstract idea physical

**Atom to token to atom hourglass.** Real counts for the example complex (for
instance 12,000 atoms collapsing to 800 tokens, full attention only at the
narrow waist, broadcast back out through skip connections), with an O(N^2) cost
bar beside each level. Makes the reason for the architecture's shape visible
rather than asserted. No model output needed beyond atom and token counts.

**Triangle inequality sandbox. Built:** https://claude.ai/artifact/7XypoWSkFxFStn9ZFhBv84
(source: `screens/triangle-inequality-sandbox.html`).

Three nodes, named after real entities from the fixed example complex (two
peptide residues and the magnesium ion) with distances at realistic
protein/ligand scale (roughly 3-20 A), not abstract `i, j, k` with unitless
numbers, per the concrete-before-abstract convention. An inline SVG diagram:
solid edges for the two slider-controlled distances `d(i,k)` and `d(j,k)`, a
dashed edge for `d(i,j)` labeled with its current valid range instead of one
number. The diagram redraws live as either slider moves, using the marker's
own current position (see below) as the live `d(i,j)` value that drives the
drawn triangle shape, so the marker means something concrete: it represents
one candidate pairwise distance, and the diagram shows the shape that value
implies. One always-visible plain-English takeaway: two distances bound,
don't fix, the third. A third interactive element, a marker draggable along
a fixed `[0, 40] A` track with the current valid range highlighted as a
sub-zone (not a track constrained to just the valid range itself, which
would leave no room to demonstrate dragging past a bound), snaps back with a
visible "not a valid triangle" flash if dragged past either bound, making
"why triangle updates exist" felt rather than stated. Thirty seconds of
interaction replaces a paragraph nobody follows. Separate from screen 4 and
far cheaper. No model needed.

Tech: single self-contained HTML artifact, inline SVG, vanilla JS, no
framework or build step, no external libraries, no runtime data (the bound
is the two-line formula `|d(i,k) - d(j,k)| <= d(i,j) <= d(i,k) + d(j,k)`).
SVG label sizing and collision-avoidance follow the rules in `DECISIONS.md`
(2026-09-18 entry), which future diagram screens should reuse rather than
rediscover.

**Sequence-local attention mask, drawn. Built:** https://claude.ai/artifact/8BjTwMd9Msg5KmqZGeewu3
(source: `screens/sequence-local-attention-mask.html`). The 32-query by
128-key block-diagonal pattern with overlapping key windows (AF3 Algorithm
7, AtomTransformer; grounded against `~/research/src/alphafold3.typ`
line 504's derivation, not an approximation). Confusing in prose, obvious
as a picture. Ten bands over an illustrative 320-atom range, shown together at rest
with their overlap visible, click a band (or its chip) to isolate exactly
which keys it sees. Note the real mechanism detail: 6 of the 10 bands
reach the full 128-atom key width, only the outer two on each end are
clipped, since there's no atom beyond either edge, a genuine,
correctly-shown edge effect rather than a simplification. Picked 320
(not a smaller range) deliberately: at 160 (5 bands), only the single
center band would be unclipped, overrepresenting the edge case as if it
were typical; at 320, most of what's shown is the actual repeating
pattern, matching what any real molecule looks like regardless of size.
No model needed.

**MSA plus OuterProductMean.** A stacked alignment with conservation coloring,
then two columns co-varying and that co-variation becoming a pair feature. This
is the strongest CS-to-bio bridge in the whole project: bio students know MSAs,
CS students often do not, and the co-evolution-to-contacts logic is what makes
the pair representation make sense at all.

### Curves that demystify formulas

**Noise schedule.** 160 A down to 4e-4 A on a log axis with step markers.
Alongside it, raw noise level plotted against log(noise / sigma_data) to show
why the Fourier time embedding takes the log: without it nearly all resolution
sits at the high-noise end, where it matters least.

**Output blending coefficients.** Two lines across the trajectory showing weight
shifting from "trust the network's prediction" at high noise to "trust the
current structure" at low noise. Turns an intimidating formula into one
sentence.

**Compute budget as N grows.** Trunk runs 4 times at cubic cost, diffusion runs
around 200 times but cheaply. Bars or a Sankey diagram, with a slider for token
count.

### Anchors students already recognize

**pLDDT coloring plus PAE matrix.** The familiar blue/yellow/orange confidence
scheme on the 3D structure, next to the PAE matrix. Anyone who has opened
AlphaFold DB has a foothold here. Point explicitly at PAE's asymmetry (error of
j given i's frame differs from error of i given j's frame), which is invisible
unless called out.

**AF2 versus AF3 side by side.** Evoformer against Pairformer, Structure Module
against Diffusion Module, MSA central against MSA demoted to a per-recycle
feeder. High value for any part of the audience that knows AF2.

### Failure modes and design tradeoffs

**The 48 random poses.** The same structure augmented into a spread of
orientations feeding the diffusion module, then the loss aligning them out.
Explains "equivariance by augmentation instead of by architecture" without
hand-waving.

**Chirality violation.** A correct molecule beside its mirror image, with the
4.4% PoseBusters violation rate. Earns the point that AF3 traded AF2's
structural guarantees for generality.

**Ensemble collapse.** Several seeds producing near-identical outputs. A
generative model that does not actually sample conformational diversity is an
interesting result and a good closing note.

## Build priority

1. Triangle inequality sandbox, sequence-local attention mask, atom-token-atom
   hourglass, MSA to pair features. All four need no precomputed model output,
   and they carry the most conceptual weight per pixel.
2. Tokenization sandbox. Also needs no model output, and works as the tool's
   entry screen.
3. Input flow tracer and diffusion sampler scrubber, once AF3 tensors are
   dumped for the example complex(es).
4. Curves (noise schedule, blending coefficients, compute budget). Cheap, add
   whenever.
5. Pair representation explorer, AF2/AF3 comparison, failure-mode screens.

## Delivery

Browser-based, shareable by link, no install for students. The link actually
given to students is GitHub Pages (https://gasredx09.github.io/af3-visualizer/),
which auto-deploys on every push to `main`, no separate publish step. Claude
Artifact links (created while building each screen) are a development
convenience, not the distribution channel; see `DECISIONS.md`
(2026-09-18 entry, "Pages is the actual delivery channel").

Site layout as of the Architecture Explainer pivot: the explainer's own
landing page and semantic-zoom boards are the site root; the three screens
built before the pivot (triangle inequality sandbox, sequence-local
attention mask, atom-token-atom hourglass) live at `/screens/`, linked from
the explainer's landing page, with a link back from `/screens/` to the
explainer root. Both are produced by the same GitHub Actions build: the
Ruby build (`explainer/scripts/build_pages.rb`) runs first since it
replaces its whole output directory, then the Node build
(`scripts/build-pages.mjs`) adds `/screens/` into the same `dist/`.

## Presentation notes (separate deliverable, kept here for context)

Approach agreed for the talk itself, since it shapes what the tool needs to
carry:

- Name every concept twice on first use, once in ML vocabulary and once in
  structural biology vocabulary, then use whichever fits afterward.
- Motivate before mechanism. Open each section with the problem the module
  solves, framed for both camps, before showing any flowchart.
- Give every dense slide a one-sentence plain-English takeaway that requires no
  notation, so anyone who loses the thread can re-enter on the next slide.
- Reuse three or four master diagrams, progressively annotated, rather than a
  new diagram per slide.
- Concrete before abstract. Show the mechanism on three specific tokens with
  real numbers before showing the general form.
- Say which lens you are using ("now the ML story here") so neither half of the
  room waits through content aimed at the other.
- Cut hard rather than compress. An hour covers the pipeline shape, two or three
  genuinely novel mechanisms (diffusion replacing IPA, dropped equivariance,
  Pairformer versus Evoformer), and results. Not all 31 algorithms.
