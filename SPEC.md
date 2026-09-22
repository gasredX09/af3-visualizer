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
curation pass the way module 1 did. In practice, tagging the three raw MSA
value sites `boundary: input` forces them onto the root board too (the
projector's `missing_root_boundary` check requires every `boundary`-tagged
value site to be visible specifically on the root board, the same rule that
already puts `restype_input`/`profile_input`/`deletion_mean_input` there) —
so the root board carries `msa_module` plus its three raw inputs, 17 nodes
total, still one `dense_board` warning (now 17 nodes, not 14). The child
board (`msa_module_detail`) itself also trips a `dense_board` warning (20
nodes): the projector's `mixed_flow_kinds` check refuses to elide a value
site whose producer and consumer relations differ in kind (`state_update`
in, `data_flow` out), which is true of every intermediate pair-stack delta
here, so all five pair-stack leaf modules and four of their five
intermediate pair states need real nodes, mirroring `pair_track`'s own
12-node board for the identical Pairformer mechanism. Root board edges also
land one over the `dense_edge_set` threshold (21 vs. 20). All three are
verifier warnings, not failures; the build passes with 3 warnings instead of
module 1's 1.

**Verification**: same pipeline as module 1 — `lint_sources.rb`,
`verify_architecture.rb --source-set alphafold3`, `build-manifest.rb
--check`, plus an actual rendered check confirming the retargeted
`pair_state_input_projection -> z_init -> msa_module -> pair_state_input`
chain renders correctly and the existing Pairformer board is unaffected.

### Sub-project 1, module 3: the Template Module

**Mechanism** (`~/research/src/alphafold3.typ:261-291`, `[paper] Section 3.5,
Algorithm 16`): `TemplateEmbedder` runs once per recycle, immediately before
`MsaModule` (Algorithm 1, line 9 precedes line 10), and writes only into
`z_ij` — no single-representation output, unlike the main Pairformer trunk.
For each template `t`: builds a raw per-template pair feature `a_tij` by
concatenating the template's distogram (its own binned pairwise distances),
backbone-frame and pseudo-beta masks (each an AND-gate — a pair only keeps
its template distance/direction information if both tokens have a resolved
frame/position in that specific template), a unit-vector direction feature,
and per-token `template_restype`, then zeroes out any pair whose two tokens
belong to different chain instances (`asym_id` gating — template-derived
features are restricted to intra-chain pairs only, the same multi-chain
concern already documented for `RelativePositionEncoding`). That raw feature
is outer-summed with a projection of the current `z_ij` (line 8, the same
"outer sum of two independent projections" pattern already used to build
`z_init` itself) — one term carries the trunk's current structural belief,
the other carries this specific template's raw geometric evidence — then
refined through `N_block=2` blocks of a **pair-only** Pairformer variant
(triangle multiplication outgoing/incoming, pair attention starting/ending
node, pair transition). Confirmed against the reference codebase
(`alphafold3/model/network/template_modules.py:349-357`, contrasted with
`evoformer.py:319-324`) that this variant runs with `with_single=False`: no
single-representation attention/transition step executes at all, unlike the
main 48-block trunk's identical block type run with `with_single=True`.
Results are averaged across all templates (order-invariant pooling) and
projected once more (`LinearNoBias(ReLU(...))` — notably plain `ReLU` here,
not the `SwiGLU` used in every `Transition` block elsewhere in the paper).

**Why this matters, for the board's own takeaway**: alongside the MSA
module, this is the other mechanism injecting genuinely new external
evidence into the pair representation each cycle — here, actual 3D
structural evidence from homologous templates, rather than evolutionary
coupling. It runs first (Algorithm 1 line 9, before the MSA module's line
10), so the Pairformer's 48 blocks of pure self-refinement start from a
`z_ij` that has already been informed by both real templates and MSA
coevolution signal, not from the raw `z_init` projection alone.

**Scope for this pass (decided in brainstorming, 2026-09-22):**
- `TemplateEmbedder`'s masking/feature-concat step and its pair-only
  pair-stack are modeled with real internals, not left opaque — same call
  module 2 made for `OuterProductMean`/`MSAPairWeightedAveraging`: neither
  piece is a shared routine reused elsewhere, so opacity would hide the
  actual teaching content (the AND-gate masking logic, the `with_single=False`
  pair-only variant of the Pairformer block).
- Only one representative template is modeled, not a literal `N_templates`
  loop — mirrors how MSA rows are already modeled collectively rather than
  enumerated per-row. `a_tij`/`v_ij` and related value sites stand for one
  representative template's tensors; the cross-template averaging step
  (line 12) is still modeled as its own real relation, and the board's
  summary discloses "shown for one template" rather than silently
  collapsing multiple templates into one without saying so.
- This pass authors its own pair-stack facts for the module's pair-only
  variant rather than extracting a shared `standard_block` — the third
  near-duplicate of the same triangle-mult/triangle-attention/transition
  mechanism (Pairformer's, the MSA module's, now this one's pair-only
  variant). Consistent with module 2's own precedent, which already
  flagged the first duplication as a deferred future cleanup rather than
  something to fix mid-pass.
- The z_init retargeting stays scoped to *consumption*, not production:
  this module changes what reads `z_init` (it now flows through
  `template_module` before reaching `msa_module`, not directly), not how
  `z_init` itself gets built. The `open_questions.
  relative_position_encoding_and_token_bonds_unmodeled` entry (Algorithm 1
  lines 4-5's other contributors to `z_init`'s construction) is a different
  edge and stays deferred as its own future task — decided explicitly in
  brainstorming rather than bundled in just because the module lands in
  the same neighborhood of the graph.

**New facts to add** (`explainer/architectures/alphafold3-pairformer.yaml`,
hand-edited per `DECISIONS.md`'s 2026-09-19 hand-edit entry, not via
edit-plan — this task wires into `z_init`, an already-visible value site,
the same condition that forces the hand-edit mechanism for every module
after the first):
- Module `template_module` (`parent_ref: architecture`), with child leaf
  modules for the masking/feature-concat step and the pair-only pair-stack
  (5 leaves — triangle multiplication outgoing/incoming, pair attention
  starting/ending node, pair transition — mirroring `msa_pair_update_stage`'s
  shape from module 2).
- New `boundary: input` value sites for the raw template features:
  `template_backbone_frame_mask`, `template_pseudo_beta_mask`,
  `template_distogram`, `template_unit_vector`, `template_restype`,
  `asym_id`.
- Retarget the relation that currently connects `z_init` directly to
  `msa_module`'s pair-state read (`z_init_initializes_msa_module_pair_state`)
  so that `z_init` instead feeds `template_module`, and `template_module`'s
  averaged, projected output feeds `msa_module`'s pair-state read in its
  place — the real chain per Algorithm 1 lines 9-10.
- Every new fact cites `~/research/src/alphafold3.typ`'s own `[paper]`
  locators for Algorithm 16, matching modules 1-2's evidence discipline.

**View**: the root board (`pairformer_overview`) is currently at 17 nodes
with one accepted `dense_board` warning. This module gets its own child
board from the start (`template_module_detail`), following the
`msa_module_detail` precedent, rather than adding its internal detail to
the root board. Tagging the six raw template value sites `boundary: input`
forces them onto the root board (the same `missing_root_boundary` rule
already governing every other raw input on that board), alongside the one
collapsed `template_module` node — 24 nodes total on root, up from 17. This
is expected and accepted per this session's board-curation research: AF2's
own reference example carries a comparable density of boundary inputs on
its own root board with no further restructuring, and all locally-available
elision opportunities on this root board are already exhausted (confirmed
during the 2026-09-22 curation review — every remaining node is either a
locked boundary input/output, a primary pipeline block with its own detail
board, or was deliberately kept visible for an earlier correctness fix).
The child board itself will likely need a `msa_pair_track`-style split
(a grandchild board for the pair-only pair-stack) to stay under its own
12-node `dense_board` threshold, mirroring module 2's own final-review fix
— anticipate this rather than treating it as a surprise if it recurs.

**Verification**: same pipeline as modules 1-2 — `lint_sources.rb`,
`verify_architecture.rb --source-set alphafold3`, `build-manifest.rb
--check`, plus an actual rendered check confirming the retargeted
`z_init -> template_module -> msa_module -> pair_state_input` chain renders
correctly and the existing Pairformer and MSA module boards are unaffected.

### Sub-project 1, module 4: the Diffusion Module (one denoising step)

**Mechanism** (`~/research/src/alphafold3.typ:421-628`, `[paper] Section 3.7,
Algorithms 3, 5-7, 18, 20-26`): `DiffusionModule` (Algorithm 20) is one call
of AF3's denoiser — the function `SampleDiffusion` (Algorithm 18, out of
scope for this pass, see below) invokes repeatedly with decreasing noise.
Noisy atom coordinates are rescaled to unit-variance dimensionless vectors;
`AtomAttentionEncoder` (Algorithm 5, now in its *conditioned* mode — its
internals were deliberately left opaque in module 1, deferred to "the first
module that actually needs them modeled," which is this one) encodes atoms
with sequence-local attention, broadcasts trunk single/pair context onto
them, injects the noisy positions, and aggregates to per-token activations,
saving three per-atom tensors as skip connections; the trunk's fully
conditioned single representation is injected once as a plain residual; a
24-block `DiffusionTransformer` (Algorithm 23) runs full self-attention at
token resolution; `AtomAttentionDecoder` (Algorithm 6) broadcasts the
updated token activations back to atoms, adds them to the saved skip
connections, runs local atom-resolution attention again to reconcile, and
projects to a position update; the update is blended with the noisy input
by a noise-level-weighted posterior-mean formula (high noise: trust the
network; low noise: trust the input, which is already nearly correct).

Two upstream mechanisms feed this. `DiffusionConditioning` (Algorithm 21)
builds the `s`/`z` conditioning tensors everything else reads: pair
conditioning concatenates the trunk's pair output with a fresh
`RelativePositionEncoding` and refines it through two `Transition` rounds;
single conditioning concatenates the trunk's single output with the raw,
unprocessed `s_inputs`, additively injects a Fourier embedding (Algorithm
22 — a bank of frozen random cosine features, sampled once before training
and never updated, expanding the log-compressed noise level into a rich
vector) via its own projection, and likewise refines through two
`Transition` rounds. `RelativePositionEncoding` (Algorithm 3) builds four
bucketed/boolean relative-position signals (residue offset, finer
token-index offset for same-residue multi-token groups, a same-entity
boolean, and a chain-copy-number offset), each conditionally defined on the
others, concatenated and projected once into the pair channel width.

**The one real unifying fact, and how this pass authors it**: there is
exactly one transformer block type in the entire Diffusion Module —
`AttentionPairBias` (Algorithm 24) run in parallel (not sequentially, per
the GPT-J/PaLM-style parallel block form) with `ConditionedTransitionBlock`
(Algorithm 25), both wrapped in Adaptive LayerNorm (Algorithm 26, computing
scale/shift from the conditioning vector rather than using fixed learned
parameters) and a second, separate AdaLN-Zero output gate. This one block
is reused, unmodified in mechanism, at three call sites: token-level (24
blocks, `N_head=16`, no masking — called directly from `DiffusionModule`),
and twice at atom-level (3 blocks each, `N_head=4`, sequence-local masking
via `AtomTransformer`'s thin wrapper — once inside the encoder, once inside
the decoder, differing only in which saved skip tensors condition them).
This pass models it as two new `standard-block` instances (`attention` for
`AttentionPairBias`, `feed_forward` for `ConditionedTransitionBlock`), each
with three bindings (token: `exact`; atom-encoder and atom-decoder: each
`wrapped`, disclosing the masking difference) — the first real use of this
project's standard-block authoring mechanism, chosen because the paper's
own point is that this is genuinely one mechanism at three sites, and
authoring it three separate times (the way the pair-stack mechanism was
authored three times across the Pairformer/MSA/Template modules) would
misrepresent that as three different things.

**Scope decisions (decided in brainstorming, 2026-09-22):**
- This pass models one denoising step only. The outer sampling loop
  (`SampleDiffusion`, Algorithm 18: the noise schedule, step count, why the
  partially-denoised structure is re-randomized in pose before every step)
  and `CentreRandomAugmentation` (Algorithm 19, the shared pose-augmentation
  utility that loop calls) are a separate, later pass — closer to when
  SPEC.md's "Diffusion sampler scrubber" screen (a separate, not-yet-built
  interactive visualization with real tensors, outside the explainer tool
  entirely) is built, since the two share the most context and are easiest
  to keep non-duplicative if designed together.
- Chain-permutation/symmetry resolution and weighted rigid alignment/smooth
  LDDT are training-loss mechanics, not inference architecture — excluded,
  consistent with every module shipped so far modeling inference only.
- The Pairformer's existing `single_attention_with_pair_bias` fact — the
  *same* algorithm (Algorithm 24), called with no conditioning signal, so
  AdaLN/AdaLN-Zero are inert — is left untouched rather than retrofitted as
  a fourth binding of the new standard_block. Matches this project's
  established precedent (modules 2 and 3 both declined to retrofit
  already-shipped pair-stack facts into a shared block, deferring that as
  its own future cleanup): avoid re-touching and re-verifying content this
  pass didn't author, even though the mechanism really is identical.
- `RelativePositionEncoding` is modeled now (its own module, its own 4
  signals, 3 new raw inputs), closing half of the existing
  `open_questions.relative_position_encoding_and_token_bonds_unmodeled`
  entry — needed a second, independent time by `DiffusionConditioning`,
  after being deferred twice already (modules 2 and 3's own brainstorming).
  The `token_bonds` embedding (a separate, small contributor to `z_init`'s
  own construction, not read by `DiffusionConditioning`) is not needed by
  this module and stays open under a narrower open-questions entry.

**New facts to add** (`explainer/architectures/alphafold3-pairformer.yaml`,
hand-edited per the standing precedent, plus two new files under
`explainer/standard_blocks/`): a top-level `diffusion_module`
(`parent_ref: architecture`) with children for `diffusion_conditioning`
(real internals — the two parallel concat/project/refine branches),
`relative_position_encoding` (real internals — the four bucketed/boolean
signals), a new `atom_attention_encoder` (the *conditioned*-mode call, modeled with
real internals — module 1's existing `atom_attention_encoder_bare` fact
stays untouched as its own, separate opaque fact; bare and conditioned mode
are the same routine, but this pass only grounds the conditioned-mode call
site, the one it actually needs), `atom_attention_decoder` (new), and the token-level
`diffusion_transformer` occurrence (binding both new standard_blocks 24
times, `exact`). New `boundary: input` value sites: noisy atom positions,
the scalar noise level, `entity_id`, `residue_index`, `sym_id`. Retarget
`single_state_output`/`pair_state_output` from terminal outputs to feed
`diffusion_module` (the same "boundary output turns out not to be
terminal" pattern already used for `z_init` in modules 2 and 3); a new
terminal `boundary: output` value site (the denoised atom positions) takes
over as the architecture's actual output. Every new fact cites Algorithms
3, 5-7, 20-26's locators, matching modules 1-3's evidence discipline.

**View**: given the size, this needs several child boards from the start,
not one — a top `diffusion_module_detail` (mirroring the existing
child-board precedent), plus detail boards for `atom_attention_encoder`,
`atom_attention_decoder`, `diffusion_conditioning`, and
`relative_position_encoding`. The two new standard_blocks carry their own
`visual_template` inside their own YAML files (confirmed from the existing,
already-in-use `pair-biased-attention.yaml`/`invariant-point-attention.yaml`
instances referenced by the `genie2`/`genie3` example architectures) — this
pass wires `board_ref`/occurrence content pointing at them from the module
boards that use them, rather than authoring separate view YAML for the
blocks themselves. Root board grows again: one new `diffusion_module` node
plus up to 5 new raw inputs (noisy positions, noise level, `entity_id`,
`residue_index`, `sym_id`) — expected, consistent with the standing
board-curation finding that boundary inputs can't be elided.

**Verification**: same pipeline as modules 1-3 — `lint_sources.rb`,
`verify_architecture.rb --source-set alphafold3`, `build-manifest.rb
--check`, plus the standard-block-specific regression suites
(`test/standard_block_contract_test.rb`,
`test/standard_block_compiler_test.rb`,
`test/renderer_standard_block_test.rb`, per `explainer/CLAUDE.md`'s "run
the infrastructure-specific regression suites... when changing... standard
blocks"), plus an actual rendered check confirming the retargeted
`single_state_output/pair_state_output -> diffusion_module -> [new output]`
chain renders correctly and the existing trunk boards are unaffected.

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
