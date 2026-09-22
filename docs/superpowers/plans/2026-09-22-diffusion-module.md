# Diffusion Module (One Denoising Step) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AF3's Diffusion Module (one denoising step, Algorithm 20) to the
vendored AF3 architecture, including its two upstream conditioning
mechanisms (`RelativePositionEncoding`, `DiffusionConditioning`) and the one
shared attention+MLP block reused at three resolutions, authored as this
project's first real `standard-block-v0.3` content.

**Architecture:** Hand-edit `explainer/architectures/alphafold3-pairformer.yaml`,
`explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`, and two new
files under `explainer/standard_blocks/`, in five tasks ordered by real
dependency: `RelativePositionEncoding` (self-contained) -> `DiffusionConditioning`
(consumes it) -> the shared block + atom-level architecture (consumes
`DiffusionConditioning`'s output, and is the single largest, most
interdependent piece — the two new standard_blocks, their six bindings, and
the atom encoder/decoder facts that host those bindings all have to land
together) -> `DiffusionModule`'s own top-level orchestration and output
retargeting (needs every earlier task's final ids) -> the remaining view
work and root integration (needs every architecture-level id fixed).

**Tech Stack:** architecture-v0.5 / visualization-v0.4 / standard-block-v0.3
YAML, Ruby verification tooling (`/opt/homebrew/opt/ruby@3.3/bin/ruby`).

**Spec:** `SPEC.md`, "Sub-project 1, module 4: the Diffusion Module (one
denoising step)" section. Also read modules 1-3's own SPEC.md sections —
this module reuses `s_inputs`, `atom_reference_features_input`, `asym_id`
from them, and retargets `single_state_output`/`pair_state_output` the same
way `z_init` was retargeted in modules 2 and 3.

## Global Constraints

- **Authoring mechanism:** hand-edit all files directly, gated by the full
  verification pipeline — NOT `architecture-edit-v0.2`/`prepare`/`show`.
  This module wires into `single_state_output`, `pair_state_output`, and
  `s_inputs`, all already-visible value sites, the exact condition
  `DECISIONS.md`'s 2026-09-19 entry documents as making the edit-plan tool
  unusable.
- **Standard-block schema: use `standard-block-v0.3`, not v0.2.** Confirmed
  from `explainer/protocol/standard-blocks.md`: "New parameterized reusable
  internals use v0.3 and `block_instances`; do not author the same use
  through multiple mechanisms." v0.2 files exist elsewhere in this repo for
  backward compatibility only — do not copy their shape for new content.
- **Ruby interpreter:** `/opt/homebrew/opt/ruby@3.3/bin/ruby` for every
  command in this plan.
- **No worktree.** Work directly on `main`.
- **Every commit message ends with this exact trailer, verbatim:**
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
  ```
  Getting this trailer wrong has been a real, recurring mistake by
  implementers earlier in this project. Copy it exactly.
- **Push after every commit.** Do not leave commits local. A past bounded
  task's commits were once left unpushed because a dispatch didn't say to
  explicitly — every task below ends with `git push`.
- **Never invent architecture facts.** Every nontrivial claim carries
  `evidence.status` + `evidence.refs`. Ground every claim in
  `~/research/src/alphafold3.typ:421-628` (the Diffusion module section) and
  `~/research/src/alphafold3.typ:796-836` (Relative position encoding) —
  read the relevant part in full before writing any fact in that area, not
  from memory. Fall back to `~/research-papers/alphafold3.pdf`/
  `alphafold3-supplementary.pdf` or `~/research-papers/codebases/alphafold3/`
  only for something the note doesn't cover.
- **Ground every `carries` field in the actual tensor that flows on that
  edge.** This module has an unusually large number of genuinely distinct
  intermediate tensors — do not collapse or approximate any of them. Two
  specific traps, already identified, that a task must get right:
  - The atom-level encoder reads the trunk's **raw, unconditioned** single
    representation (`single_state_output`) for broadcasting onto atoms, but
    the **conditioned** pair tensor from `DiffusionConditioning` — not
    `pair_state_output` directly. Getting this backwards (or making both
    inputs conditioned, or both raw) is a real, specific, easy-to-make
    error the note calls out explicitly as "Line 3's asymmetry."
  - The encoder's three saved skip tensors (used later by the decoder) are
    genuinely different from its aggregated per-token output — don't merge
    them into one representation.
- **The Pairformer's existing `single_attention_with_pair_bias` fact is
  out of scope. Do not touch it.** It's the same algorithm (Algorithm 24)
  this module needs, called with no conditioning signal — deliberately left
  unretrofitted per the brainstorming decision in `SPEC.md`.
- **`atom_attention_encoder_bare` (module 1's existing fact) is out of
  scope. Do not modify, rename, or merge it.** This module's own
  conditioned-mode encoder is a new, separate fact.
- **Stable snake_case IDs, semantic not visual**, per `explainer/CLAUDE.md`.
- **Whenever a board's summary changes what it shows, update its prose to
  match.** The root board's summary already describes three modules; it
  needs another pass.

---

### Task 1: RelativePositionEncoding

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`

**Interfaces:**
- Consumes: the existing `value_sites.asym_id` (added by the Template
  module — search the live file for its current entry, do not assume its
  line number).
- Produces (later tasks depend on this exact id — do not rename once
  chosen): `value_sites.relative_position_encoding_output` — the final,
  projected `c_z`-channel relative-position tensor, ready to be concatenated
  with the trunk's pair output inside `DiffusionConditioning` (Task 2).

Read `~/research/src/alphafold3.typ:796-836` in full before starting. It
covers Algorithm 3 (`RelativePositionEncoding`) end to end: four bucketed/
boolean signals — a residue-index offset (only meaningful within the same
chain), a finer token-index offset (only defined when both same-chain and
same-residue — needed because a modified residue or ligand can span
several tokens sharing one `residue_index`), a same-entity boolean (raw,
not bucketed — same underlying sequence regardless of physical copy), and a
chain-copy-number offset (only defined when *not* same chain) — each
conditionally defined on the others, concatenated and linearly projected
once into `c_z=128` channels.

**A specific accuracy check to make, not assume:** the existing
`representations.asym_id` entry's evidence note (search the live file for
`id: asym_id` under `representations:`) currently states this raw feature
"also feeds RelativePositionEncoding's unmodeled `b_same_entity`/
`a_rel_chain` signals." Verify this claim against the note yourself before
relying on it — per the note's own mechanics section, `b_same_entity` is
built from `entity_id` (not `asym_id`) and `a_rel_chain` is built from
`sym_id` (not `asym_id`); `asym_id` is what the *same-chain* determination
(`b_same_chain`, gating `a_rel_pos`) is actually built from. If this
existing note is imprecise, that's a pre-existing fact outside this task's
files to touch — do not silently copy its phrasing into your own new
facts; ground your own work in the primary source directly, and flag the
discrepancy in your report so the task reviewer can judge whether it needs
a separate note.

**What must exist when this task is done** (structure your own judgment on
exact module/value-site boundaries within these constraints):

1. **New `boundary: input` value sites** (`scope_ref: architecture`,
   mirroring the existing `asym_id`/`msa_input` pattern — same section of
   the file, same field shape): `entity_id`, `residue_index`, `sym_id`.
   Confirm via `grep` that none of these three ids currently exist before
   adding them.
2. **`modules.relative_position_encoding`** (`parent_ref: architecture`,
   `decomposition.status`: your call — `leaf` if you convey the four
   signals' construction fully in role prose, `partial` with a `reason`
   field if you give each signal its own value site; either is defensible,
   but the four genuinely-different, conditionally-defined signals must be
   traceable in whichever you choose, matching the depth already given to
   comparable mechanisms like `outer_product_mean`).
3. **Relations** wiring `asym_id`/`entity_id`/`residue_index`/`sym_id` into
   the module and the module's output into `value_sites.
   relative_position_encoding_output`, each with real `evidence.refs`
   locators into Algorithm 3's specific construction of that signal.
4. **Narrow the existing open question.** Find `open_questions.
   relative_position_encoding_and_token_bonds_unmodeled` in the live file
   (its current text: "Algorithm 1 lines 4-5 add RelativePositionEncoding(f*)
   and a LinearNoBias(token_bonds) embedding into z_init... RelativePositionEncoding
   and the token_bonds embedding are real, additional contributors to
   z_init that are not yet represented..."). Once `RelativePositionEncoding`
   is modeled, this question is only half-closed — the `token_bonds`
   embedding (a separate, small contributor to `z_init`'s own construction,
   unrelated to this module) remains genuinely unmodeled. Rewrite the
   question's `question`/`resolution_criteria` text to describe only the
   remaining `token_bonds` gap (consider renaming the entry id too, since
   "relative_position_encoding_and_token_bonds_unmodeled" is no longer
   accurate once only half remains — your call, but don't leave a
   misleadingly-named or stale-text entry). Do not delete the entry or
   claim it's fully resolved.

**Verification:**

```bash
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/lint_sources.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/verify_architecture.rb --source-set alphafold3
/opt/homebrew/opt/ruby@3.3/bin/ruby renderer/architecture/build-manifest.rb --check
```

Run from `explainer/`. **Expected, named exception**: the three new raw
inputs are not yet wired into any board — expect `missing_root_boundary`
(or equivalent boundary-connection) errors naming exactly `entity_id`,
`residue_index`, `sym_id`, and possibly `relative_position_encoding_output`
if it's left dangling. This is the same situation every module's own first
task has hit (most recently the Template module's Task 1) — acceptable as
long as every error traces to a fact this task added. Any other error class
is a real regression to fix before proceeding. Record in your report
exactly which errors you saw and confirm each one only names this task's
own new facts.

- [ ] Read `~/research/src/alphafold3.typ:796-836` in full.
- [ ] Check the `asym_id` evidence note's `b_same_entity`/`a_rel_chain`
      claim against the primary source; note any discrepancy in your report.
- [ ] Add the 3 new boundary-input value sites.
- [ ] Add `modules.relative_position_encoding` and its output value site.
- [ ] Add the wiring relations.
- [ ] Narrow the existing open-questions entry.
- [ ] Run the three verification commands; confirm errors are only the
      expected boundary-connection class, naming only this task's new facts.
- [ ] Commit with the required trailer, then `git push`.

---

### Task 2: DiffusionConditioning

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`

**Interfaces:**
- Consumes: `value_sites.relative_position_encoding_output` (Task 1, fixed
  id), the existing `value_sites.single_state_output`/`pair_state_output`
  (the trunk's final outputs — read-only in this task, do NOT retarget them
  yet, that's Task 4's job), and the existing `value_sites.s_inputs` (module
  1).
- Produces (Tasks 3-4 depend on these exact ids — do not rename):
  `value_sites.noise_level` (`boundary: input`, the scalar noise level —
  this exact id is fixed by this plan, use it verbatim), plus
  `value_sites.diffusion_conditioned_single` and `value_sites.
  diffusion_conditioned_pair` — the two final `s`/`z` conditioning tensors
  `DiffusionConditioning` returns.

Read `~/research/src/alphafold3.typ:553-598` (the `Conditioning`/
`DiffusionConditioning`/`FourierEmbedding` sections, inside the larger
Diffusion module section you read the boundaries of when this plan was
written — re-read the current line numbers by searching for `Algorithm 21`
and `Algorithm 22` in the live file, since exact offsets may have moved)
before starting. Covers: pair conditioning (concatenate the trunk's pair
output with `RelativePositionEncoding`'s output, project down with
`LayerNorm`+`LinearNoBias`, then two rounds of `Transition` — Algorithm 11,
the same SwiGLU block already used throughout this architecture — as
residual refinement); single conditioning (concatenate the trunk's single
output with the *raw, unprocessed* `s_inputs`, project down the same way,
then *additively* inject a separately-projected Fourier time embedding, then
two more rounds of `Transition`); and `FourierEmbedding` itself (a bank of
frozen random cosine features — weights sampled once before training and
*never updated by gradient descent* — turning the noise-level scalar,
compressed via `1/4 * log(noise_level / sigma_data)`, into a rich vector;
`sigma_data=16` per the algorithm's own signature).

**What must exist when this task is done:**

1. **`value_sites.noise_level`** (`boundary: input`, `scope_ref:
   architecture` — use this exact id, fixed by this plan's Interfaces).
2. **`modules.diffusion_conditioning`** (`parent_ref: architecture`,
   `decomposition.status: partial` with a `reason` field — mirrors
   `outer_product_mean`'s treatment: real internal structure, no further
   child modules, internals modeled at value-site granularity) with real
   intermediate value sites for: the concatenated-and-projected pair
   conditioning (pre-`Transition`-rounds and post, if you judge both worth
   distinguishing — your call, but the *inputs* to each `Transition` round
   must be traceable), the concatenated-and-projected single conditioning,
   the Fourier time embedding itself (a genuinely distinct tensor from
   everything it gets added into), and the two final outputs.
3. **`modules.fourier_embedding`** (`parent_ref: modules.diffusion_conditioning`
   or `parent_ref: architecture` — your call on whether this small, fixed
   (no learned parameters) utility deserves its own child module or is
   folded into `diffusion_conditioning`'s own role prose; either is
   defensible, but its distinguishing property — frozen, randomly
   initialized, never trained — must be stated explicitly somewhere
   citable, since it's an easy detail to lose).
4. **Relations** wiring `pair_state_output`, `relative_position_encoding_output`,
   `single_state_output`, `s_inputs`, and `noise_level` into
   `diffusion_conditioning`, and its two outputs
   (`diffusion_conditioned_single`/`diffusion_conditioned_pair`) out —
   every `carries` field naming the actual, specific tensor (not a generic
   "pair_state"/"single_state" representation reused from the trunk, since
   these are genuinely new, differently-shaped conditioning tensors).

**Verification:** same three commands as Task 1, run from `explainer/`.
Expected exception: `value_sites.diffusion_conditioned_single`/
`diffusion_conditioned_pair` are not yet consumed by anything (dangling on
the output side) — a `disconnected_boundary`-class error or similar naming
only these two is acceptable; the same rule as Task 1 applies to anything
else.

- [ ] Read the Diffusion module section's `Conditioning`/`FourierEmbedding`
      coverage in `~/research/src/alphafold3.typ` in full.
- [ ] Add `value_sites.noise_level`.
- [ ] Add `modules.diffusion_conditioning` (and `fourier_embedding`, per
      your structural choice) with real internal value sites.
- [ ] Add the wiring relations, with precisely-grounded `carries` fields.
- [ ] Run the three verification commands; confirm errors are only the
      expected class.
- [ ] Commit with the required trailer, then `git push`.

---

### Task 3: The shared block + atom-level architecture

This is the largest, most interdependent task in this plan — the two new
`standard_block` templates, their six bindings, and the atom-level modules
that host those bindings all depend on each other and cannot be usefully
reviewed in isolation. Take the time this deserves; do not rush the
standard-block authoring just because it's new to this project.

**Files:**
- Create: `explainer/standard_blocks/attention-pair-bias.yaml`
- Create: `explainer/standard_blocks/conditioned-transition-block.yaml`
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`

**Interfaces:**
- Consumes: `value_sites.diffusion_conditioned_single`/
  `diffusion_conditioned_pair` (Task 2), `value_sites.single_state_output`
  (Task 2's note about the raw/conditioned asymmetry applies here directly
  — read it again before wiring the encoder), `value_sites.noise_level`
  (not directly — already folded into the conditioning tensors by Task 2),
  `value_sites.s_inputs`, `value_sites.atom_reference_features_input`
  (module 1), `value_sites.msa_input` and friends are NOT relevant here
  (this is the atom/diffusion path, not the MSA path) — do not
  cross-wire them.
- Produces (Task 4 depends on these exact ids — do not rename):
  `value_sites.noisy_atom_positions` (`boundary: input`, new — the raw
  noisy 3D coordinates the encoder receives), `modules.
  atom_attention_encoder_conditioned` (your id choice, but distinct from
  the existing `atom_attention_encoder_bare` — do not touch that fact),
  `modules.atom_attention_decoder`, `value_sites.
  atom_attention_encoder_token_output` (the encoder's aggregated per-token
  output, what feeds the token-level transformer), `value_sites.
  atom_attention_decoder_position_update` (the decoder's final per-atom
  position-update output).

**Step 1 — read the primary source and the worked example, in full, before
writing anything:**

- `~/research/src/alphafold3.typ` — the Diffusion module section's coverage
  of: `AtomTransformer`/`DiffusionTransformer` (search for "AtomTransformer
  is DiffusionTransformer wearing a mask"), `AttentionPairBias`'s own
  algorithm box (search for "DiffusionAttention with pair bias and mask",
  Algorithm 24, in the Pairformer block walkthrough section — this is
  where the full formula lives, even though the module title differs from
  the function name), `ConditionedTransitionBlock` (referenced alongside
  Algorithm 24, described as "built the same way" — own AdaLN pre-norm,
  own AdaLN-Zero output gate, SwiGLU transition in between; confirm its
  exact formula against `~/research-papers/codebases/alphafold3/` if the
  note doesn't spell out every line explicitly), `AdaLN`/AdaLN-Zero (Algorithm
  26, plus the AdaLN-Zero output-gate description alongside it),
  `AtomAttentionDecoder` (Algorithm 6, its own full box), and
  `AtomAttentionEncoder`'s *conditioned*-mode call (Algorithm 5 — module 1's
  own brainstorming already read this for bare mode; re-read it now
  specifically for what changes when the optional noisy-position/trunk-
  single/trunk-pair arguments are provided, not `None`).
- `explainer/protocol/standard-blocks.md` — read the ENTIRE file, not a
  paraphrase. It defines the exact three-surface contract (template file /
  `block_instances` entry / `standard_block_instance` board stub) this task
  must follow.
- `explainer/standard_blocks/invariant-point-attention.yaml` — a real,
  complete `standard-block-v0.3` template. Your literal structural template
  for ports (with `shape_contract`/`axes` referencing symbolic
  `parameters`), `variants`, `values`, `steps`, and `visual_template`.
- `explainer/architectures/genie3.yaml` — search for `block_instances:` and
  read the `structure_ipa` entry (and its siblings) in full. Your literal
  structural template for a `block_instances` entry: `id`, `block_ref`,
  `subject_ref`, `variant`, `use_scope`, `conformance` (and
  `difference_summary` when `wrapped`/`reduced`), `port_bindings` (each
  naming existing `relation_refs`, never copying endpoints or shapes), and
  `parameter_bindings`.
- `explainer/views/genie3-semantic-zoom.view.yaml` — search for `kind:
  standard_block_instance` and read `genie3_ipa_internals` (and its
  siblings) in full. Your literal structural template for a board stub:
  `id`, `kind: standard_block_instance`, `title`, `summary`, `parent`,
  `subject_ref`, `expansion_depth: 0`, `block_instance_ref`. The compiler
  fills the stub's actual node/edge content from the template — do not
  author `nodes:`/`grid:` content by hand for these boards.

**Step 2 — author the two standard_block templates.** `attention-pair-bias.yaml`
(`kind: attention`) models Algorithm 24's full formula: branch on whether a
conditioning signal is present (AdaLN vs. plain `LayerNorm`), form Q/K/V,
project the pair-bias term from the (already-conditioned, in this
architecture's usage) pair tensor plus an additive mask/bias slot (the same
slot serves both "pair bias" and "locality mask" — the note's own point:
they're not two mechanisms, one additive term repurposed by whichever
caller supplies it), softmax, aggregate, project out, then the
conditioning-gated AdaLN-Zero output gate. `conditioned-transition-block.yaml`
(`kind: feed_forward`) models Algorithm 25's analogous structure around the
SwiGLU transition. Both must expose ports for whatever varies across the
three real call sites you're about to bind (the conditioning signal, the
pair/mask input, at minimum) — design the ports against what your three
`block_instances` entries will actually need to bind, not in the abstract.

**Step 3 — author the atom-level architecture facts** that host the
bindings: `atom_attention_encoder_conditioned` (real internals: position
scaling of the noisy input per the module's own formula, broadcasting trunk
single/conditioned-pair context onto atoms, invoking the shared block at
atom resolution via `AtomTransformer`'s masking, aggregating to per-token
output, and saving the three skip tensors — `q_skip`/`c_skip`/`p_skip` in
the note's own notation — the decoder will read); `atom_attention_decoder`
(real internals: broadcast the token-level update down, add to the saved
`q_skip`, invoke the shared block again at atom resolution using the saved
`c_skip`/`p_skip` — not recomputed — project to the final position update).
Also add the token-level `DiffusionTransformer` occurrence itself (the
direct, unmasked, 24-block call from `DiffusionModule` — this doesn't need
its own new module necessarily; it may be modeled as the `block_instances`
`subject_ref` sitting directly on `diffusion_module` if you judge that
cleaner, or as its own small grouping module — your call, but it must have
*some* real `subject_ref` for its two bindings to attach to).

**Step 4 — author the six `block_instances` entries** (three per standard
block): token-level (`conformance: exact`, `N_head=16`, no masking, bound
to whatever `subject_ref` Step 3 gave the token-level occurrence);
atom-encoder (`conformance: wrapped`, `N_head=4`, `N_block=3`,
`difference_summary` naming the sequence-local masking and the smaller
head/block count, bound to `atom_attention_encoder_conditioned`);
atom-decoder (`conformance: wrapped`, same shape as the encoder's, bound to
`atom_attention_decoder`, `difference_summary` noting it's conditioned on
the decoder's own saved skip tensors, not the encoder's).

**Step 5 — author the six `standard_block_instance` board stubs** in the
view file, one per `block_instances` entry, with real `parent`/`subject_ref`
pointing at wherever each mechanism actually sits (you don't yet have the
full board structure Task 5 will build — a stub's `parent` can point at a
board id Task 5 hasn't created yet as long as you name it consistently and
flag this clearly in your report, so Task 5's implementer knows exactly
which board ids to create and where these stubs expect to live; do not
invent placeholder parent boards yourself). This step is required now, not
deferred — module 2's and module 3's final reviews both had to fix a gap
where real internals existed in YAML but were unreachable in the UI; do not
repeat that here.

**Verification:**

```bash
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/lint_sources.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/verify_architecture.rb --source-set alphafold3
/opt/homebrew/opt/ruby@3.3/bin/ruby renderer/architecture/build-manifest.rb --check
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/standard_block_contract_test.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/standard_block_compiler_test.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/renderer_standard_block_test.rb
```

Run from `explainer/`. The three standard-block-specific suites must be
run whenever standard_blocks are touched, per `explainer/CLAUDE.md`. Expect
new boundary-connection-class errors for `noisy_atom_positions` and the
encoder/decoder's own not-yet-fully-wired outputs, following the same
accepted pattern as Tasks 1-2 — confirm every error traces to a fact this
task added; anything else is a real regression.

- [ ] Read every source named in Step 1, in full, before writing anything.
- [ ] Author `attention-pair-bias.yaml`.
- [ ] Author `conditioned-transition-block.yaml`.
- [ ] Author `atom_attention_encoder_conditioned` and its real internals.
- [ ] Author `atom_attention_decoder` and its real internals.
- [ ] Author the token-level `DiffusionTransformer` occurrence.
- [ ] Author all 6 `block_instances` entries.
- [ ] Author all 6 `standard_block_instance` board stubs.
- [ ] Run all six verification commands; confirm errors are only the
      expected boundary-connection class, naming only this task's new facts.
- [ ] Commit with the required trailer, then `git push`.

---

### Task 4: DiffusionModule orchestration and output retargeting

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`
  (only for `pairformer_block`'s own board — see below; the rest of the
  view work is Task 5)

**Interfaces:**
- Consumes: everything Tasks 1-3 produced, by their fixed ids.
- Produces: `value_sites.denoised_atom_positions` (or your chosen name —
  Task 5 needs this exact id for the root board's new terminal output).

Read the `DiffusionModule` algorithm box itself (search `~/research/src/alphafold3.typ`
for Algorithm 20, "Diffusion Module") and the "Two details specific to how
they fit together" prose right after it — position scaling (line 2), the
token-bottleneck residual injection (line 4 — the fully-conditioned single
representation added once, directly, distinct from the AdaLN modulation
happening inside every transformer block), and output blending (line 8 —
the noise-level-weighted posterior-mean blend of the noisy input and the
network's prediction).

**What must exist when this task is done:**

1. **`modules.diffusion_module`** (`parent_ref: architecture`,
   `decomposition.status: complete`) as the top-level grouping module, with
   `parent_ref` wiring for the children Tasks 1-3 already authored
   (`diffusion_conditioning`, `atom_attention_encoder_conditioned`,
   `atom_attention_decoder`, the token-level transformer occurrence) —
   check whether any of those need their own `parent_ref` updated now that
   this top-level module exists, or whether `architecture`-scoped
   `parent_ref`s from earlier tasks are still correct; your call, but be
   deliberate about it, not accidental.
2. **Position scaling and output blending** modeled as real facts: a value
   site for the rescaled noisy positions (fed by `noisy_atom_positions`),
   and a relation combining the rescaled positions with Task 3's fixed
   `atom_attention_decoder_position_update` output into the new terminal
   output (item 5 below) via the noise-level-weighted blend formula — cite
   the exact formula in the relation's evidence, not just "blending."
3. **The token-bottleneck residual injection** (line 4) modeled as a real
   relation from `diffusion_conditioned_single` into
   `atom_attention_encoder_token_output` (Task 3's fixed id — this is the
   `a_i` the algorithm box adds the conditioning signal into, right before
   the 24-block transformer runs).
4. **Retarget `single_state_output`/`pair_state_output`** from terminal
   outputs to feed `diffusion_module` instead — the same pattern already
   used for `z_init` in modules 2 and 3 (read `relations.
   z_init_initializes_template_module_pair_state`'s retargeting, and the
   relation that preceded it, as your literal style precedent for how to
   phrase and scope a retargeting relation). `value_sites.
   single_state_output`/`pair_state_output` keep existing (they're real,
   correctly-named trunk outputs) but stop being `boundary: output` —
   confirm what the `boundary` field's absence/change means in this
   schema by checking how `z_init` was handled in the same situation.
5. **A new terminal `boundary: output` value site**
   (`value_sites.denoised_atom_positions`) fed by `diffusion_module`'s own
   final output.
6. **Fix `pairformer_block`'s own board** (in the view file): it currently
   shows `single_state_output`/`pair_state_output` as ITS OWN final outputs
   (search for `id: single_state_output`/`id: pair_state_output` within
   that board's `nodes:` list — currently around `col: 9`). This becomes
   misleading once they're no longer the architecture's terminal outputs —
   at minimum, correct any label/notation implying finality if this board's
   own scope (just the Pairformer stack) makes "final" still locally
   accurate for what THIS board shows; use your judgment on whether the
   labels need changing or the claim is still true at this board's own
   scope (the Pairformer block's own output, not the whole architecture's).
   Do not leave a claim that reads as architecture-final if it no longer is.

**Verification:** same six commands as Task 3 (include the standard-block
suites again since this task's retargeting may touch relations those
suites also exercise). Expect this task to CLOSE OUT most or all prior
tasks' expected exceptions (the conditioning tensors, encoder/decoder
outputs, and noisy-position input all become genuinely connected once
`diffusion_module`'s own orchestration wires them together) — but this task
still doesn't put anything new on the root board, so a `missing_root_boundary`
for `value_sites.denoised_atom_positions` (and possibly `noisy_atom_positions`/
`noise_level`/`entity_id`/`residue_index`/`sym_id` if they're still not on
any board) is still expected here; Task 5 resolves it.

- [ ] Read Algorithm 20's own box and the "how they fit together" prose.
- [ ] Add `modules.diffusion_module` and reconcile children's `parent_ref`s.
- [ ] Model position scaling and output blending as real facts.
- [ ] Model the token-bottleneck residual injection relation.
- [ ] Retarget `single_state_output`/`pair_state_output`.
- [ ] Add `value_sites.denoised_atom_positions`.
- [ ] Fix `pairformer_block`'s board.
- [ ] Run all six verification commands; confirm remaining errors are only
      the still-expected root-boundary class for this module's raw inputs
      and final output, naming only this module's facts.
- [ ] Commit with the required trailer, then `git push`.

---

### Task 5: View — remaining boards, root integration, final verification

**Files:**
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`

**Interfaces:**
- Consumes: every architecture-level id from Tasks 1-4, by searching the
  live file (do not assume ids from this plan's own suggested names if an
  earlier task's implementer chose differently — check).

**Required work, in order:**

1. **Build `diffusion_module_detail`** — the top child board, `parent:
   pairformer_overview`, `subject_ref: modules.diffusion_module`,
   `expansion_depth: 1`. Following the established child-board precedent
   (raw inputs as context chips, primary modules progressing across
   columns, `board_ref` nodes for anything with its own detail board,
   boundary value sites at the edges): show `noisy_atom_positions`/
   `noise_level` as inputs, `diffusion_conditioning` (board_ref to its own
   detail board, built next), `atom_attention_encoder_conditioned` and
   `atom_attention_decoder` (board_ref to their own detail boards), the
   token-level transformer occurrence (board_ref to wherever Task 3's
   stubs expect it — check Task 3's report for the exact parent board id
   its stubs were written against, and use that id here), and
   `denoised_atom_positions` as the output.
2. **Build `diffusion_conditioning_detail`** and `relative_position_encoding_detail`
   — mirroring the `outer_product_mean_detail` precedent (a detail board
   for a `partial`-status module with real internals). Check whether Task
   1/2's implementers gave `relative_position_encoding`/`diffusion_conditioning`
   `partial` or `leaf` status and build accordingly — a `leaf` module's
   role prose may be sufficient without a dedicated board, but if either
   carries real internal value sites, give it a board so those internals
   are reachable (the same rule Task 3 already applied to itself).
3. **Build `atom_attention_encoder_detail`** and `atom_attention_decoder_detail`
   — each showing its own module's real internals (the encoder's skip
   tensors, its own `board_ref` into its atom-level standard-block stub;
   the decoder's broadcast+skip+reconcile flow, its own `board_ref` into
   its stub) per Task 3's report on where those stubs expect their parent
   board to be.
4. **Root board integration** (`pairformer_overview`): add one collapsed
   `diffusion_module` node (`board_ref: diffusion_module_detail`) and the 5
   new raw boundary-input nodes (`noisy_atom_positions`, `noise_level`,
   `entity_id`, `residue_index`, `sym_id`). Do not add any of
   `diffusion_module`'s internal detail here — only the one collapsed
   node. `single_state_output`/`pair_state_output` are no longer terminal
   outputs (Task 4 retargeted them) — remove or update their root-board
   presence to match (they may still belong on root as intermediate hub
   value sites, similar to how `z_init` is handled, or may become elidable
   pass-throughs — check whether they're genuine pass-throughs before
   eliding; if not, keep them visible, following the precedent set by
   modules 2/3's own similar retargetings). Add `denoised_atom_positions`
   as the new terminal output node. Update `pairformer_overview`'s
   `summary` field to describe the Diffusion Module's role (structure
   generation via iterative denoising, alongside the existing Input Feature
   Embedder / MSA / Template descriptions) — one sentence is enough, this
   module's own scope (one denoising step, not the outer sampling loop)
   should be clear from the wording so a reader isn't misled into thinking
   the full generative process is shown here.

**Verification:**

```bash
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/lint_sources.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/verify_architecture.rb --source-set alphafold3
/opt/homebrew/opt/ruby@3.3/bin/ruby renderer/architecture/build-manifest.rb --check
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/standard_block_contract_test.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/standard_block_compiler_test.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby -Ilib:test test/renderer_standard_block_test.rb
```

All six must be clean (0 errors) once this task lands. `dense_board`/
`dense_edge_set` warnings are acceptable as long as every one is a warning
you can name the specific cause of, matching this project's standing
practice — do not leave an unexplained warning. Given this module's size,
expect the root board and possibly `diffusion_module_detail` to need the
same kind of grandchild-split front-loading modules 2 and 3 eventually
needed; if a board lands over the 12-node threshold, split it now rather
than shipping a warning you haven't investigated for a cheap fix.

Then do an actual rendered check, not just schema-level: build the
manifest, serve the static output locally, and use headless Chrome
(puppeteer-core against a local Chrome binary, the approach used for
modules 1-3) to confirm:
- The root board renders with `diffusion_module` and its 5 raw inputs
  visible, drilling correctly into `diffusion_module_detail`.
- Every child/grandchild board built in this task renders, and every
  `board_ref`/`standard_block_instance` stub drills correctly (click the
  actual node, don't just deep-link the URL — this project's convention).
  The 6 standard-block internals boards specifically: confirm the
  compiler-filled content (ports, steps, the attention-core visualization)
  actually renders something coherent, since this is the first time this
  mechanism has been exercised in this project.
- `pairformer_block`/`pair_track`/`msa_module_detail`/`template_module_detail`
  and their children are visually unaffected by this module's changes,
  aside from the deliberate `pairformer_block` fix from Task 4.

- [ ] Build `diffusion_module_detail`.
- [ ] Build `diffusion_conditioning_detail` and
      `relative_position_encoding_detail` (as warranted).
- [ ] Build `atom_attention_encoder_detail` and `atom_attention_decoder_detail`.
- [ ] Integrate the root board (nodes + summary), handling
      `single_state_output`/`pair_state_output`'s changed role.
- [ ] Run all six verification commands; confirm 0 errors, all warnings
      individually explained, splitting any board over threshold now.
- [ ] Run the headless-Chrome render check against every board named above.
- [ ] Commit with the required trailer, then `git push`.
