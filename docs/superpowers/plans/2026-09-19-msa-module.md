# MSA Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AF3's `MsaModule` (Algorithms 8-10) as a new module in the vendored `alphafold3` architecture, sitting between the existing `pair_state_input_projection` and `pair_state_input`, with real internals for `OuterProductMean` and `MSAPairWeightedAveraging` and its own dedicated pair-stack, all on their own child board.

**Architecture:** Hand-edit from the start (both `explainer/architectures/alphafold3-pairformer.yaml` and `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`), gated by the full verification pipeline instead of the `architecture-edit-v0.2` tool's `prepare`/`show` step — this module wires into `pair_state_input_projection`'s output (already visible on the root board) via a new `z_init` value site, the exact condition that made module 1's edit-plan attempt fail. Split into two tasks along a real content boundary: genuinely new algorithmic mechanism first (Task 1), then the structurally-copied pair-stack plus all integration wiring and the view (Task 2) — this keeps each task's review scope tight, since module 1 needed a real fix round for a mechanism error and this module has more new algorithmic surface area.

**Tech Stack:** YAML (architecture-v0.5, visualization-v0.4), Ruby 3.3 (`/opt/homebrew/opt/ruby@3.3/bin/ruby` — pinned to match CI and the committed manifests, not the bare `ruby` on this machine's PATH, which resolves to 4.0.7).

**Spec:** `SPEC.md`'s "Sub-project 1, module 2: the MSA Module" section (the content spec this plan implements) and "Sub-project 1, module 1: the Input Feature Embedder" section (the conventions and precedent this module follows and directly extends). Also read `DECISIONS.md`'s 2026-09-19 "Hand-edit the Input Feature Embedder instead of using architecture-edit-v0.2" entry — it's the standing precedent for why this plan skips the edit-plan tool; don't re-litigate it, just apply it.

## Global Constraints

- Hand-edit `explainer/architectures/alphafold3-pairformer.yaml` and `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml` directly. Do not attempt `architecture-edit-v0.2` for this module — it will hit the identical `missing_root_boundary`/`unclassified_object` blocker module 1 already proved out, since this module wires into an already-visible value site's output.
- Ground every architectural claim in `~/research/src/alphafold3.typ:293-392` (`[paper] Section 3.3, Algorithms 8-10`) — never from memory. `~/research-papers/alphafold3.pdf`, `~/research-papers/alphafold3-supplementary.pdf`, and `~/research-papers/codebases/alphafold3/` are available as primary sources if a specific claim needs grounding the note doesn't already cite.
- `OuterProductMean` and `MSAPairWeightedAveraging` get real internals (not opaque) — neither is reused elsewhere in the model, unlike `AtomAttentionEncoder`.
- The pair-stack (triangle mult x2, triangle attn x2, transition) gets its OWN facts for this module — do not extract a shared `standard_block` or touch the Pairformer's existing pair-stack facts (`triangle_multiplication_outgoing`, `triangle_multiplication_incoming`, `pair_attention_starting_node`, `pair_attention_ending_node`, `pair_transition`, currently at `architectures/alphafold3-pairformer.yaml:563-631+` — read, don't modify).
- Model one representative pass only. Do not model the outer recycling loop (Template module, the 4-cycle feedback path) — out of scope for this module.
- Every new fact needs real `evidence.status`/`evidence.refs` with a locator, matching the existing file's rigor. Every relation's `carries` field must name what ACTUALLY flows on that edge — `OuterProductMean` and `MSAPairWeightedAveraging` each have several genuinely distinct intermediate tensors (`m_si`, `a_si`/`b_si`, `o_ij`, `v_si^h`, `b_ij^h`, `g_si^h`, `w_ij^h`); don't collapse distinct tensors into one shared representation to save authoring effort. This is the exact class of mistake module 1's final review caught once already (a `carries` field naming the wrong representation).
- Follow the existing file's established field shapes exactly — read the live file for the pattern, don't invent one. `explainer/architectures/alphafold3-pairformer.yaml`'s existing pair-stack relations/value-sites are the template for this module's own pair-stack facts; module 1's `s_inputs`/`z_init`-retargeting pattern (search for `single_state_input_projection`, `pair_state_input_projection`, `pair_state_projection_produces_pair_state_input`) is the template for this module's own value-site/retargeting work; the `input_feature_embedder_detail` child board (in the view file) is the template for this module's own child board.
- The root board (`pairformer_overview`) is at its accepted 13-node `dense_board` warning. This module's own detail must NOT land there — only one collapsed `msa_module` node goes on the root board (matching how `input_feature_embedder` appears there today), with a `board_ref` to a new child board carrying everything else.
- Every Ruby command in this plan uses `/opt/homebrew/opt/ruby@3.3/bin/ruby`, not bare `ruby`.
- No worktree — this plan executes directly on `main`, matching this project's established pattern.
- Stage explicit paths, never `git add -A`. Every commit message ends with the exact trailer:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
  ```
  This has been a real, recurring mistake by implementer subagents earlier in this project — use the literal text above, verbatim, never your own model identity.

---

### Task 1: Author the MSA module's new algorithmic content (communication + MSA stack)

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`

**Interfaces:**
- Consumes: nothing from a prior task in this plan (this is the first task); reads the existing `s_inputs` value site (module 1) for one input, and will retarget `pair_state_input_projection`'s existing output relation in Task 2, not this one.
- Produces: `modules.msa_module` (top-level structure only — its pair-stack children are added in Task 2), `modules.outer_product_mean`, `modules.msa_pair_weighted_averaging`, the raw MSA input value sites (`msa_input`, `has_deletion_input`, `deletion_value_input`), and every representation/value-site/relation needed for the communication + MSA-stack halves of Algorithm 8 (lines 1-4, 6-8). Task 2 references `modules.msa_module` by this exact ref and extends it with the pair-stack.

This task requires real domain judgment — translating Algorithms 8 (lines 1-4 and 6-8 only, not the pair-stack lines 9-13) and 9-10's prose into correctly-scoped, correctly-cited facts, not transcription. Read the source material in full before drafting anything.

- [ ] **Step 1: Read the grounding material**

Read `SPEC.md`'s "Sub-project 1, module 2: the MSA Module" section in full. Then read `~/research/src/alphafold3.typ:293-392` in full (Algorithms 8, 9, 10 and their surrounding prose) — this is the complete mechanism this task and Task 2 together implement; for THIS task, focus on: Algorithm 8 lines 1-4 (MSA row setup: concat raw features, embed, add `s_inputs`), line 6 (the `OuterProductMean` call, Algorithm 9 in full), and line 7-8 (`MSAPairWeightedAveraging`, Algorithm 10 in full, plus the `Transition` call on the MSA representation — `Transition` itself is a shared utility already documented at `alphafold3.typ:381-392`, check whether it's already modeled anywhere in the existing file before deciding whether to add a new fact for it or reuse an existing one).

- [ ] **Step 2: Read the existing patterns to copy**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
grep -n "id: s_inputs$\|id: single_state_input_projection$\|id: pair_state_input_projection$" architectures/alphafold3-pairformer.yaml
```
Read those entries in full (representations, value_sites, relations, and the two projection modules) — this is your style precedent for a module that reads a shared hub value site and produces a real output via named intermediate representations. Also read `explainer/AGENTS.md`'s "Architecture Authoring Rules" section (stable snake_case IDs, one owner per fact, `parent_ref`, `decomposition.status` vocabulary, evidence rules, "do not invent architecture facts" — mark anything not directly checked against a source as `inferred`/`open_question`).

- [ ] **Step 3: Author the new facts**

Add to `explainer/architectures/alphafold3-pairformer.yaml`:
- Module `msa_module` (`parent_ref: architecture`, `decomposition.status: partial` — Task 2 adds its remaining children, so this task's version is honestly incomplete, not `complete`; Task 2 will flip it to `complete` once the pair-stack children exist).
- Module `outer_product_mean` (`parent_ref: modules.msa_module`, real internals per the scope decision — no `opaque` status; model its actual steps: LayerNorm, the two independent `LinearNoBias` projections `a_si`/`b_si`, the outer-product-mean-and-flatten step producing `o_ij`, the final `Linear` (with bias, not `LinearNoBias` — the note calls this out explicitly as the one exception) producing the `z_ij` contribution).
- Module `msa_pair_weighted_averaging` (`parent_ref: modules.msa_module`, real internals: the `LayerNorm`, the `v_si^h`/`b_ij^h`/`g_si^h` projections, the pair-derived `softmax` weighting `w_ij^h`, the gated weighted average, the output projection).
- New `boundary: input` value sites: `msa_input` (one-hot sequence identity per row), `has_deletion_input`, `deletion_value_input` — all raw MSA per-row features per Algorithm 8 line 1's `concat`.
- New representations and value sites for the genuinely distinct intermediate tensors this task's two mechanisms produce (per the Global Constraints' `carries` warning — don't collapse `m_si`, `a_si`/`b_si`, `o_ij`, the MSA-stack's own intermediate/output tensor into fewer representations than the mechanism actually has; ground each one's shape in the note's own notation, e.g. `o_ij`'s `c*c=1024`-dim flattened shape before the final compression to `c_z=128`).
- Relations connecting: raw MSA inputs → the row embedding/setup, `s_inputs` → the row setup (the `+=` in line 4), the embedded MSA activations → `outer_product_mean` → (a contribution into the pair representation — this task produces the FACT of this contribution; Task 2 wires it into the actual `z_init`/`pair_state_input` chain, since that requires the pair-stack structure this task doesn't yet have), and the embedded MSA activations + the pair representation → `msa_pair_weighted_averaging` → the updated MSA activations.
- Every new fact cites `~/research/src/alphafold3.typ`'s own locators for Algorithms 8-10, `evidence.status: confirmed_from_paper`.

- [ ] **Step 4: Regenerate the manifest and run the verification gate**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all four exit 0. Since `msa_module` isn't on any board yet (Task 2 adds the view), a `missing_root_boundary`-style failure at this stage most likely means a fact you added is `boundary`-tagged when it shouldn't be yet, or a relation crosses into an already-visible root-board object prematurely — re-check which facts genuinely need `boundary: input` right now (the raw MSA features do; nothing else in this task should) before assuming the verifier is wrong.

- [ ] **Step 5: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/architectures/alphafold3-pairformer.yaml explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
git commit -m "$(cat <<'EOF'
Add the MSA module's communication and MSA-stack mechanism (AF3 Algorithms 8-10)

Models OuterProductMean (the only place evolutionary coupling enters
the pair representation) and MSAPairWeightedAveraging (attention whose
weights come entirely from the pair representation, not row content)
with real internals -- unlike AtomAttentionEncoder in module 1,
neither is reused elsewhere in the model. This task covers the raw
MSA input setup and these two mechanisms only; the module's own
pair-stack and its wiring into the existing pair_state_input chain
land in a follow-up task, since the pair-stack needs its own
dedicated review scope.

Hand-edited, not authored via architecture-edit-v0.2, per
DECISIONS.md's 2026-09-19 hand-edit entry -- this module wires into
an already-visible value site's output, the exact condition that
blocks the edit-plan tool's prepare step.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 4's four commands all exit 0.

---

### Task 2: Author the pair-stack, wire the full chain, add the view, and verify with a render check

**Files:**
- Modify: `explainer/architectures/alphafold3-pairformer.yaml`
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`

**Interfaces:**
- Consumes: `modules.msa_module`, `modules.outer_product_mean`, `modules.msa_pair_weighted_averaging` (Task 1); the existing `modules.pair_state_input_projection` and its relation `relations.pair_state_projection_produces_pair_state_input` (module 1, currently producing `value_sites.pair_state_input` directly — read the live file at `architectures/alphafold3-pairformer.yaml` around this relation's current definition before touching it).
- Produces: the complete `msa_module` (now `decomposition.status: complete`), a real `z_init` value site, the retargeted chain `pair_state_input_projection → z_init → msa_module → pair_state_input`, and a new child board `msa_module_detail` (or your own id matching the file's naming style) reachable from the root board.

- [ ] **Step 1: Read the current wiring and the child-board precedent**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
grep -n "id: pair_state_projection_produces_pair_state_input\|id: pair_state_input$\|id: pair_state_input_projection$" architectures/alphafold3-pairformer.yaml
sed -n '/id: input_feature_embedder_detail/,/^  - id:/p' views/alphafold3-pairformer-semantic-zoom.view.yaml
```
Read the current relation and value site definitions in full, and the `input_feature_embedder_detail` board's complete structure (grid, node list, label/notation hand-additions — module 1's report noted these needed hand-adding since value sites have no canonical `label` field; expect the same here) as your exact structural template.

Also read the Pairformer's existing pair-stack facts as the mechanism template:
```bash
sed -n '560,660p' architectures/alphafold3-pairformer.yaml
```

- [ ] **Step 2: Author the pair-stack and complete `msa_module`**

Add to `explainer/architectures/alphafold3-pairformer.yaml`:
- Five leaf modules under `msa_module` (`parent_ref: modules.msa_module`, `decomposition.status: leaf`) mirroring the Pairformer's `triangle_multiplication_outgoing`/`triangle_multiplication_incoming`/`pair_attention_starting_node`/`pair_attention_ending_node`/`pair_transition` — same mechanism, own IDs (e.g. prefixed or scoped so they don't collide with the Pairformer's existing ones), evidence citing Algorithm 8 lines 9-13 specifically (not just "same as Pairformer" — ground each one in its own line/locator, noting where the dropout scheme differs if the existing Pairformer facts model dropout at all — check first).
- A real `z_init` value site (`boundary`: none, `scope_ref: architecture` — matches `s_inputs`' own pattern from module 1) representing the pair representation as it exists right after the outer-sum projection, before Template/MSA processing.
- Retarget `relations.pair_state_projection_produces_pair_state_input` so `modules.pair_state_input_projection` produces `value_sites.z_init` instead of `value_sites.pair_state_input` (rename the relation if the file's convention expects relation IDs to describe their actual endpoints — check existing naming, e.g. it may become `pair_state_projection_produces_z_init`).
- Relations completing the chain: `z_init` → `msa_module` (as an input, alongside the raw MSA features from Task 1), `outer_product_mean`'s output → into the pair-stack's first step (per Algorithm 8's actual per-block order: communication writes into `z_ij` BEFORE that block's pair-stack runs, so `z_init`'s value flows through `outer_product_mean`'s additive update before entering the pair-stack — model this as a real state-update sequence, not a bypass), the pair-stack's final step (`pair_transition`-equivalent) → `value_sites.pair_state_input` (this is the module's actual return value per Algorithm 8 line 15 — only `z_ij` is returned, the MSA representation is discarded, so nothing from the MSA-stack side should produce `pair_state_input` directly).
- Flip `msa_module`'s `decomposition.status` to `complete` now that all its children exist.

- [ ] **Step 3: Regenerate the manifest and verify the architecture in isolation**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3
```

Expected: this WILL likely fail here with a `missing_root_boundary`/`unclassified_object`-style diagnostic, since `z_init` and `msa_module` are now wired into the already-visible `pair_state_input` but have no view accounting yet — that's expected at this intermediate point (module 1 hit the identical shape of failure at the equivalent step). Do not treat this as a blocker requiring a redesign; proceed to Step 4 to add the view, which resolves it. If the diagnostic is a DIFFERENT kind of failure (a real schema/reference error unrelated to board visibility), stop and fix that first.

- [ ] **Step 4: Add the view**

In `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`:
- Add a new node for `modules.msa_module` to the root board's (`pairformer_overview`) `nodes:` list — this is the one node that DOES belong on root, positioned between `input_feature_embedder`'s output side and `pairformer_stack` in the left-to-right flow (check current `col`/`row` values on the root board and place it so the reading order stays sensible: input features → input embedder → (msa module) → pairformer). No `board_ref` yet in this same edit — add it once the child board exists, matching how `pairformer_stack`'s `board_ref: pairformer_block` works.
- Add a new child board (id following the file's convention, e.g. `msa_module_detail`) with `parent: pairformer_overview`, `subject_ref: modules.msa_module`, `expansion_depth: 1`, showing the module's real internal structure: the raw MSA inputs, `outer_product_mean`, `msa_pair_weighted_averaging`, the five pair-stack leaf modules, and `z_init`/`pair_state_input` as its boundary-crossing endpoints. Hand-add `label`/`notation` fields on every value-site-backed node (value sites have no canonical label field — confirmed by module 1's own report; module nodes render correctly from their canonical label without needing this).
- Set the root board's `msa_module` node's `board_ref` to the new child board's id.
- Update the root board's `summary` field if the module's addition changes what the board's own opening sentence should say (per module 1's Important finding: keep the board's prose in sync with what it actually shows — read the current summary first and judge honestly whether it needs a change, don't touch it if it's still accurate).

- [ ] **Step 5: Regenerate the manifest and run the full verification gate**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3 --board pairformer_overview
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all five exit 0, with the SAME single `dense_board` warning on `pairformer_overview` as before (13 nodes plus the one new `msa_module` node = 14 — confirm this is still just the one accepted warning shape, not a new or different diagnostic; if the count is meaningfully higher than 14, check whether Step 4 accidentally left extra detail on the root board instead of the child board).

- [ ] **Step 6: Confirm the pseudocode file still resolves**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
grep -n "single_state_input\|pair_state_input" pseudocode/alphafold3-pairformer.yaml
```
Confirm the same 4 `architecture_ref:` lines are still present — `pair_state_input`'s identity didn't change, only what produces it.

- [ ] **Step 7: Real render check**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer
rm -rf dist
$RUBY explainer/scripts/build_pages.rb --source-set alphafold3 --output dist
node scripts/build-pages.mjs
cd dist && python3 -m http.server 8096 &
```
Per this project's standing "verify by rendering" rule, drive a headless browser (`puppeteer-core` against a local Chrome binary, e.g. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`) and confirm: the root board shows `msa_module` as a new drillable node between the Input Feature Embedder and the Pairformer stack, with no console errors; clicking into it opens the new child board showing the raw MSA inputs, both real mechanisms, and the pair-stack, correctly labeled; the existing Pairformer board and the `input_feature_embedder_detail` board are both unaffected. Stop the server and clean up afterward: `kill %1`, `cd .. && rm -rf dist`.

- [ ] **Step 8: Reconcile SPEC.md if reality diverged**

Re-read `SPEC.md`'s "Sub-project 1, module 2" section against what actually got built. If anything diverged during authoring (an ID, a scoping call, the exact child-board name), update that section to describe what shipped — per module 1's own Important finding, a stale spec actively misleads whoever builds the next module. If everything matches, no edit needed; say so in your report rather than skipping the check.

- [ ] **Step 9: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/architectures/alphafold3-pairformer.yaml explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
# If Step 8 changed SPEC.md, include it:
git add SPEC.md 2>/dev/null || true
git commit -m "$(cat <<'EOF'
Wire the MSA module's pair-stack into the pair representation chain

Completes the MSA module: its own pair-stack (mirroring the
Pairformer's mechanism, run 4 times instead of 48, own facts per
SPEC.md's deliberate reuse deferral), a real z_init value site sitting
between the existing pair_state_input_projection and pair_state_input
(mirroring module 1's own s_inputs fix -- nothing sat between them
until now), and a new msa_module_detail child board so the module's
substantial internal detail doesn't push the already-dense root board
further over its accepted threshold.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 5's five commands all exit 0 with the expected single warning; Step 6's grep still shows 4 lines; Step 7's render check passes with no console errors and both existing boards confirmed unaffected.
