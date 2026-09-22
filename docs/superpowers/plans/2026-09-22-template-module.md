# Template Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AF3's Template module (Algorithm 16, `TemplateEmbedder`) to the
vendored AF3 architecture, retargeting `z_init` to flow through it before
reaching the MSA module (`z_init -> template_module -> msa_module`, per
Algorithm 1 lines 9-10's real ordering).

**Architecture:** Hand-edit `explainer/architectures/alphafold3-pairformer.yaml`
to add the Template module's facts (new value sites, a `template_module` with
real-internals children, and the z_init retargeting), then hand-edit
`explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml` to give the
module its own child board plus grandchild boards so its real internals stay
reachable in the UI, following the `msa_module_detail`/`msa_pair_track`/
`outer_product_mean_detail` precedent exactly.

**Tech Stack:** architecture-v0.5 / visualization-v0.4 YAML, Ruby verification
tooling (`/opt/homebrew/opt/ruby@3.3/bin/ruby`).

**Spec:** `SPEC.md`, "Sub-project 1, module 3: the Template Module" section.
Also read "Sub-project 1, module 2: the MSA Module" (same file) — this plan
follows its conventions directly and this module's z_init retargeting
supersedes its `z_init_initializes_msa_module_pair_state` relation.

## Global Constraints

- **Authoring mechanism:** hand-edit both YAML files directly, gated by the
  full verification pipeline — NOT `architecture-edit-v0.2`/`prepare`/`show`.
  This module wires into `z_init`, an already-visible value site, which is
  exactly the condition `DECISIONS.md`'s 2026-09-19 entry documents as
  making the edit-plan tool unusable. Do not attempt `architecture_edit.rb`
  for this work.
- **Ruby interpreter:** use `/opt/homebrew/opt/ruby@3.3/bin/ruby` for every
  Ruby command in this plan (matches CI and the committed manifests — bare
  `ruby` on this machine resolves to an unpinned 4.0.7).
- **No worktree.** Work directly on `main`.
- **Every commit message ends with this exact trailer, verbatim:**
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
  ```
  Getting this trailer wrong (wrong model name, missing session URL) has
  been a real, recurring mistake by implementers earlier in this project.
  Copy it exactly, do not paraphrase it.
- **Push after every commit.** Do not leave commits local — a past bounded
  task's commits were made locally but never pushed because the dispatch
  didn't say to explicitly. Every task in this plan ends with `git push`.
- **Never invent architecture facts.** Every nontrivial claim carries
  `evidence.status` + `evidence.refs`, per `explainer/CLAUDE.md`'s hard
  rules. Ground every claim in `~/research/src/alphafold3.typ:261-291`
  (Algorithm 16) — read it in full before writing any fact — falling back
  to `~/research-papers/alphafold3.pdf`/`alphafold3-supplementary.pdf` or
  `~/research-papers/codebases/alphafold3/` only for something the note
  doesn't cover. Never describe the mechanism from memory.
- **Ground every `carries` field in the actual tensor that flows on that
  edge.** Module 1's real Critical review finding was a `carries` field
  claiming a representation that wasn't what actually flowed. This module
  has several genuinely distinct intermediate tensors (the raw per-template
  feature after masking/concat, the per-template pair state before its
  pair-stack runs, the per-template pair state after its pair-stack runs,
  the cross-template-averaged and projected output) — do not collapse them
  into a shared representation to save authoring effort.
- **Whenever a board's summary changes what it shows, update its prose to
  match.** The root board (`pairformer_overview`)'s summary already
  describes the Input Feature Embedder and MSA module; it needs another
  pass describing the Template module too.
- **Stable snake_case IDs, semantic not visual**, per `explainer/CLAUDE.md`.

---

### Task 1: Architecture facts — Template module + z_init retargeting

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`

**Interfaces:**
- Consumes: the existing `value_sites.z_init` (currently produced by
  `relations.pair_state_projection_produces_z_init`, read this relation and
  `value_sites.z_init`'s own entry before editing — search the file, don't
  trust line numbers, they will have shifted) and the existing
  `value_sites.msa_module_pair_state_read` (module 2's entry point into
  `modules.msa_module`).
- Produces (later tasks and the view depend on these EXACT ids — do not
  rename once chosen, and use exactly these two connective value-site ids
  since Task 2's view work is written against them):
  - `value_sites.template_module_pair_state_read` — the pair state as
    `template_module` receives it (mirrors `msa_module_pair_state_read`'s
    role for `msa_module` exactly: the module's own entry state).
  - `value_sites.template_module_pair_output` — `template_module`'s final
    returned pair-state contribution (mirrors what `msa_module`'s own
    pair-stack output currently feeds into `pair_state_input`).
  - `modules.template_module` (top-level module, `parent_ref: architecture`).

Read `~/research/src/alphafold3.typ:261-291` in full before starting. It
covers Algorithm 16 (`TemplateEmbedder`) end to end: what raw template
features exist, how the masking/concat step builds a per-template pair
feature, how that combines with the current pair state via an outer-sum
projection, how the resulting per-template state is refined through a
**pair-only** variant of the Pairformer block (`with_single=False`,
confirmed against `alphafold3/model/network/template_modules.py:349-357`,
contrasted with `evoformer.py:319-324`'s `with_single=True` for the main
trunk — cite both), and how results are averaged across templates and
projected once more with a plain `ReLU` (not `SwiGLU`).

Also read, in the live file (search by id, not the line numbers below —
they will have moved since this plan was written):
- `modules.msa_module` and its children (`msa_row_embedding`,
  `outer_product_mean`, `msa_pair_weighted_averaging`, `msa_transition`,
  `msa_pair_update_stage` and its 5 leaves) — currently starting around
  line 1136. This is your literal structural template for how to shape a
  module with real internals, a `decomposition.status: partial` module
  with a `reason` field, and a grouping module for a duplicated pair-stack.
- `modules.pair_update_stage` and its leaves (the *original* Pairformer
  pair-stack, currently starting around line 910) — the ultimate source
  pattern both `msa_pair_update_stage` and this task's own pair-stack
  facts derive from.
- `relations.z_init_initializes_msa_module_pair_state` (currently
  `from: value_sites.z_init`, `to: value_sites.msa_module_pair_state_read`)
  and `relations.pair_state_projection_produces_z_init` (module 1's own
  retargeted relation) as your literal template for how module 2 phrased
  and scoped a retargeting relation when it inserted itself between two
  already-connected facts. Follow that phrasing style.
- The `open_questions` entry `relative_position_encoding_and_token_bonds_unmodeled`
  — do NOT touch it or the relation it names
  (`pair_state_projection_produces_z_init`, which produces `z_init`, not
  what consumes it). This task only changes what *reads* `z_init`, per the
  brainstorming decision recorded in `SPEC.md`.

**Two scope constraints, decided in brainstorming, do not deviate from
these:**
- **Model one representative template, not a literal `N_templates` loop.**
  Algorithm 16 iterates over every template and averages the results (lines
  7-12). Mirror how MSA rows are already modeled collectively rather than
  enumerated per-row: the masked/concatenated feature, pre/post-pair-stack
  states, etc. all stand for one representative template's tensors. The
  cross-template averaging step (line 12) is still a real relation/value
  site (see item 4 below) — just don't create N separate template
  instances in the graph.
- **Author this task's pair-stack as its own facts — do not extract a
  shared `standard_block`.** This will be the third near-duplicate of the
  triangle-mult/triangle-attention/transition mechanism (the Pairformer's,
  the MSA module's, now this one's pair-only variant). `SPEC.md`'s module 2
  section already flagged extracting a shared block as a deferred future
  cleanup, not something to do mid-pass — follow that precedent here too.

**What must exist when this task is done** (structure your own judgment on
exact leaf/module boundaries within these constraints — this is real
domain-authoring content, not mechanical transcription):

1. **New `boundary: input` value sites** (scope_ref: architecture, mirroring
   `msa_input`/`has_deletion_input`/`deletion_value_input`'s existing
   pattern exactly — same section of the file, same field shape): `template_backbone_frame_mask`,
   `template_pseudo_beta_mask`, `template_distogram`, `template_unit_vector`,
   `template_restype`, `asym_id`. Confirmed via `grep -n "id: asym_id"
   explainer/architectures/alphafold3-pairformer.yaml` that none of these
   six ids currently exist in the file — no collision risk.

2. **`modules.template_module`** (`parent_ref: architecture`,
   `decomposition.status: complete`, `kind: refiner`) — the top-level
   module, mirroring `modules.msa_module`'s shape (a `mechanisms` list, a
   `role` prose field describing the full Algorithm 16 flow in one
   paragraph, `scale: token_pair`, `evidence` citing Algorithm 16 lines
   1-14).

3. **A leaf module for the masking/concat step** (Algorithm 16 lines 1-5):
   builds the raw per-template pair feature from the six new raw inputs —
   the two AND-gate masks (backbone-frame, pseudo-beta), the distogram/
   unit-vector concat, the per-token restype concat, and the `asym_id`
   intra-chain gating. Mirrors `msa_row_embedding`'s `decomposition.status:
   leaf` treatment (its internals are simple enough to convey in role prose
   without their own detail board).

4. **A module for the outer-sum-and-pooling mechanism** (Algorithm 16 lines
   6, 8, 10, 12-13): combines the masked/concatenated per-template feature
   with a projection of the current pair state (the outer-sum pattern
   already used for `z_init` itself), and — after the per-template pair-
   stack runs (item 5 below) — accumulates and averages each template's
   refined state into the module's final output, then applies the plain-
   ReLU projection. This is architecturally real (not a simple pass-
   through), so mirror `modules.outer_product_mean`'s treatment:
   `decomposition.status: partial` with a `reason` field explaining that
   its real structure is modeled at value-site granularity, and real
   intermediate value sites for the masked/concatenated per-template
   feature, the pre-pair-stack per-template state, and the pooled/
   projected output — these three are genuinely different tensors, per
   this plan's Global Constraints `carries` rule above. Give this module
   whatever id you judge clearest (e.g. `template_pair_conditioning`) —
   Task 2 will look it up by searching the file, not by a hardcoded id.

5. **A pair-only pair-stack**, mirroring `msa_pair_update_stage`'s exact
   shape: a grouping module (`decomposition.status: complete`, `kind:
   refiner`, `parent_ref: modules.template_module`, `repeats: 2` per
   Algorithm 16's `N_block=2`) with 5 leaf children — triangle
   multiplication outgoing/incoming, pair attention starting/ending node,
   pair transition — each mirroring its `msa_`-prefixed counterpart's field
   shape exactly, with its own ids (recommend a `template_` prefix, e.g.
   `template_pair_update_stage`, `template_triangle_multiplication_outgoing`,
   etc., but this is your naming call). **The grouping module's `role` field
   must explicitly state this runs the pair-only (`with_single=False`)
   variant of the Pairformer block** — no single-representation step, unlike
   both the main 48-block trunk and (per Algorithm 8) how the MSA module's
   own pair-stack is invoked; this is real, citable architectural content,
   not incidental detail.

6. **Relations completing the flow**, following the file's existing
   relation shape exactly (`from`/`to`/`kind`/`carries`/`operation`/
   `evidence` fields):
   - Retarget the existing `z_init_initializes_msa_module_pair_state`
     relation (rename it to reflect its new target, e.g.
     `z_init_initializes_template_module_pair_state`) so its `to:` becomes
     `value_sites.template_module_pair_state_read` instead of
     `value_sites.msa_module_pair_state_read`.
   - Add a new relation from `value_sites.template_module_pair_output` to
     `value_sites.msa_module_pair_state_read` (`kind: state_update`),
     taking over the role the old relation used to play for `msa_module`
     directly.
   - Relations connecting the new value sites/modules from items 1-5 above
     into this flow, each with real `evidence.refs` locators into Algorithm
     16's specific lines.

**Verification (run after every meaningful batch of edits, not just once at
the end):**

```bash
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/lint_sources.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/verify_architecture.rb --source-set alphafold3
/opt/homebrew/opt/ruby@3.3/bin/ruby renderer/architecture/build-manifest.rb --check
```

Run these from `explainer/`. **Expected, named exception**: because this
task's new `boundary: input` value sites and new relations are not yet
wired into any board, `verify_architecture.rb` will very likely report
`disconnected_boundary` and/or `unmapped_boundary` errors for exactly the
six new raw inputs and the new relations added in this task — this is the
identical situation module 2's own Task 1 hit for its own new raw MSA
inputs, and it is expected here too. If you see errors of exactly this
class, naming exactly the facts this task added, that is an acceptable
stopping point for this task — do not attempt to route around it by adding
view content (that is Task 2's job) or by not tagging these value sites
`boundary: input` (they genuinely are boundary inputs per Algorithm 16; the
existing convention for `msa_input`/`has_deletion_input`/
`deletion_value_input` requires it). **Any other class of error — anything
naming a fact this task did not touch — is a real regression and must be
fixed before proceeding.** `lint_sources.rb` and `build-manifest.rb --check`
should both be clean; if they are not, that is also a real problem to fix,
not an expected exception.

Record in your report exactly which errors you saw (if any) and confirm
each one only names facts this task added.

- [ ] Read `~/research/src/alphafold3.typ:261-291` in full.
- [ ] Read the live architecture YAML's `msa_module`/`msa_pair_update_stage`
      and `pair_update_stage` sections, plus the two relations named above.
- [ ] Add the 6 new boundary-input value sites.
- [ ] Add `modules.template_module` and its children (items 2-5 above).
- [ ] Add/retarget the relations (item 6 above).
- [ ] Run the three verification commands from `explainer/`; confirm any
      errors are only the expected `disconnected_boundary`/`unmapped_boundary`
      class, naming only this task's new facts.
- [ ] Commit with the required trailer, then `git push`.

---

### Task 2: View — child board, grandchild split, and root integration

**Files:**
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`

**Interfaces:**
- Consumes: `modules.template_module` and its full child structure from
  Task 1 (search the live architecture YAML for the exact ids Task 1
  chose — do not assume the recommended names in Task 1's brief were used
  verbatim), plus `value_sites.template_module_pair_state_read` and
  `value_sites.template_module_pair_output` (these two ids are fixed by
  Task 1's Interfaces contract, safe to reference directly).
- Produces: `boards.template_module_detail` (child of `pairformer_overview`,
  `subject_ref: modules.template_module`), a pair-stack grandchild board
  (mirroring `msa_pair_track`), and — if Task 1 created a dedicated
  `decomposition.status: partial` module for the outer-sum/pooling
  mechanism (item 4 in Task 1's brief) — a detail board for it too
  (mirroring `outer_product_mean_detail`). Root board (`pairformer_overview`)
  gains one `template_module` node plus the 6 new boundary-input nodes.

Read, in the live view file (search by id, not line numbers, they will have
moved):
- `boards.msa_module_detail`, `boards.msa_pair_track`, and
  `boards.outer_product_mean_detail` — your literal structural templates
  for grid layout, node shapes (`ref`/`label`/`prominence`/`treatment`/
  `density`/`col`/`row`), `board_ref` drilldown wiring, the single `elide`
  entry pattern for a genuine pass-through value site, and `edge_overrides`
  matched by `relation_ref` (or `relation_path` for a multi-hop connection)
  with `label`/`connection.title`/`connection.role`/`connection.inside`.
- `boards.pairformer_overview` (the root board) — its current `nodes`,
  `elide`, and `summary` fields.

**Required work, in order:**

1. **Build `template_module_detail`**: a new child board, `parent:
   pairformer_overview`, `subject_ref: modules.template_module`,
   `expansion_depth: 1`. Include the 6 raw template inputs as context
   chips, the masking/feature-concat module, the outer-sum/pooling
   module (or its exposed value sites if Task 1 modeled it without a
   dedicated module), a `board_ref` into the pair-stack grandchild board
   (step 2), and `template_module_pair_state_read`/`template_module_pair_output`
   as the board's own input/output value sites — mirroring
   `msa_module_detail`'s exact shape (raw inputs in column 1, primary
   modules progressing left to right, `board_ref` nodes for anything with
   its own detail board, output value site in the final column).

2. **Build the pair-stack grandchild board** (e.g. `template_pair_track`,
   mirroring `msa_pair_track`'s title/summary/grid/node shape exactly,
   `subject_ref` pointing at Task 1's grouping module from item 5). Do this
   as part of this task, not as a deferred fix — module 2 needed this exact
   split in its final-review fix wave after its child board tripped its own
   `dense_board` warning at 20 nodes; front-load it here.

3. **If Task 1 created a dedicated partial-status module for the outer-sum/
   pooling mechanism** (item 4 in Task 1's brief), give it its own detail
   board too, mirroring `outer_product_mean_detail`'s pattern — exposing
   its real intermediate value sites (the masked/concatenated per-template
   feature, the pre-pair-stack and post-pair-stack per-template states, the
   pooled/projected output). This closes the exact gap module 2's final
   review had to fix after the fact (real internals modeled in YAML but
   unreachable in the UI) — do it now, not as a later fix round. **If Task
   1 instead modeled this mechanism via value sites scoped directly to
   `template_module`** (no dedicated module), expose those same value
   sites directly on `template_module_detail` at appropriate prominence
   instead — either is acceptable, but the real internals must be reachable
   from some board either way.

4. **Fix `msa_module_detail`'s now-stale z_init content.** This board
   currently has a node (search for `ref: value_sites.z_init` within
   `msa_module_detail`'s own `nodes` list) showing `z_init` as a direct
   context-chip input, and an `edge_overrides` entry matching
   `relation_ref: relations.z_init_initializes_msa_module_pair_state` whose
   `connection.inside` prose reads "The pair representation arrives here
   straight from the input projection, before anything else has touched
   it." **Both become false once this module lands** — the pair state
   `msa_module` receives now comes from `template_module`'s output, not
   directly from `z_init`. Replace that node with one referencing
   `value_sites.template_module_pair_output` instead (update its label/
   notation to match), and update the `edge_overrides` entry to match
   Task 1's new relation (`template_module_pair_output` ->
   `msa_module_pair_state_read`), correcting the prose to state the pair
   state now arrives after Template module processing. This is exactly the
   class of stale-claim bug module 1's final review had to catch and fix —
   catch it here instead.

5. **Root board integration** (`pairformer_overview`): add one collapsed
   `template_module` node (with a `board_ref` to `template_module_detail`)
   and the 6 new boundary-input nodes, following the existing pattern for
   `msa_module`/its own raw inputs. Do not add any of `template_module`'s
   internal detail to this board — only the one collapsed node, exactly
   like `input_feature_embedder`/`msa_module`'s own root-board presence.
   Root board reaches 23 nodes total (up from 17) — this is pre-approved
   in `SPEC.md`, not a new finding requiring a follow-up curation task.
   Update `pairformer_overview`'s `summary` field to describe what the
   board now shows, including the Template module's role (structural
   template evidence entering the pair representation before the MSA
   module's evolutionary-coupling evidence) alongside the existing Input
   Feature Embedder and MSA module descriptions.

**Verification:**

```bash
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/lint_sources.rb
/opt/homebrew/opt/ruby@3.3/bin/ruby scripts/verify_architecture.rb --source-set alphafold3
/opt/homebrew/opt/ruby@3.3/bin/ruby renderer/architecture/build-manifest.rb --check
```

All three must be clean (0 errors) once this task lands — including
resolving whatever `disconnected_boundary`/`unmapped_boundary` errors Task
1 reported as its expected exception. `dense_board`/`dense_edge_set`
warnings are acceptable (module 1 and 2 both shipped with disclosed
warnings of this class) as long as every warning is one you can name the
specific cause of — do not leave an unexplained warning.

Then do an actual rendered check, not just a schema-level one: build the
manifest, serve the static output locally, and use headless Chrome
(puppeteer-core against a local Chrome binary, the same approach used for
modules 1-2) to confirm:
- The root board renders with `template_module` and its 6 raw inputs
  visible, and the collapsed node correctly drills into
  `template_module_detail`.
- `template_module_detail` renders, its pair-stack node drills into the new
  grandchild board, and (if applicable) its outer-sum/pooling module drills
  into its own detail board.
- The `msa_module_detail` board still renders correctly with its corrected
  input (Template module's output, not raw `z_init`).
- The existing `pairformer_block`/`pair_track` boards are visually
  unaffected (this module's changes should not touch them at all).

- [ ] Build `template_module_detail`.
- [ ] Build the pair-stack grandchild board.
- [ ] Build the outer-sum/pooling detail board (or expose its value sites
      on `template_module_detail`), per whichever structure Task 1 used.
- [ ] Fix `msa_module_detail`'s stale z_init node and edge_override.
- [ ] Integrate the root board (nodes + summary).
- [ ] Run the three verification commands; confirm 0 errors, all warnings
      individually explained.
- [ ] Run the headless-Chrome render check against all boards named above.
- [ ] Commit with the required trailer, then `git push`.
