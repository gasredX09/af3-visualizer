# Input Feature Embedder Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AF3's `InputFeatureEmbedder` (Algorithm 2) as a new module in the vendored `alphafold3` architecture (renamed from `af3_pairformer`), upstream of the existing Pairformer, with `AtomAttentionEncoder` modeled as a single opaque child — and make it visible on the explainer's root board.

**Architecture:** Two authoring surfaces, used for what each actually covers. Architecture-level facts (the new module, its value sites and relations, and a correction to two existing value sites' `boundary` field) go through a typed `architecture-edit-v0.2` plan applied with `ruby scripts/architecture_edit.rb`. The view-level change (a new node on the existing root board) is not covered by any edit-plan operation, so it's a direct, minimal hand-edit of the view YAML followed by a `layout_board` edit-plan operation that computes the actual position via the tool's own `semantic_flow_v1` layout compiler — never hand-picked `col`/`row` values.

**Tech Stack:** YAML (architecture-v0.5, visualization-v0.4, architecture-edit-v0.2), Ruby 3.3 (`/opt/homebrew/opt/ruby@3.3/bin/ruby` — pinned to match CI and the committed manifests, not the bare `ruby` on this machine's PATH, which resolves to 4.0.7).

**Spec:** `SPEC.md`'s "Sub-project 1, module 1: the Input Feature Embedder" section and `DECISIONS.md`'s 2026-09-19 entry ("Rename af3_pairformer to alphafold3; begin expanding beyond Pairformer"). Read both in full — this plan argues from them and does not repeat their rationale.

## Global Constraints

- Ground every architectural claim in `~/research/src/alphafold3.typ`'s *Inside `InputFeatureEmbedder` and `AtomAttentionEncoder`, both call modes (deep dive)* section (`[paper] Algorithm 2, 5-7`) — never describe the mechanism from memory. `~/research-papers/alphafold3.pdf`, `~/research-papers/alphafold3-supplementary.pdf`, and `~/research-papers/codebases/alphafold3/` are available as primary sources if a specific claim needs grounding the note doesn't already cite.
- `AtomAttentionEncoder` is modeled as a single `opaque` child module in this pass — not its internals. It is reused later, in *conditioned* mode, by the Diffusion Module; modeling it now would mean doing it twice or getting it half-right against only the bare-mode requirements.
- Every new fact needs `evidence.status` (`confirmed_from_code` / `confirmed_from_paper` / `confirmed_from_docs` / `inferred` / `open_question`) and `evidence.refs` with a locator, matching the existing Pairformer entries' own rigor. Use `confirmed_from_paper` for claims the note's own `[paper]` citations establish; use `confirmed_from_code` only for claims checked directly against `~/research-papers/codebases/alphafold3/`.
- Follow the existing file's established field shapes exactly — don't invent a new shape for a `value_sites` or `relations` entry. `explainer/architectures/alphafold3-pairformer.yaml`'s `single_state_input`/`pair_state_input`/`token_mask_input`/`pair_mask_input` value sites and the `input_pair_state_initializes_block_pair_state` relation are the templates.
- Architecture-level facts go through `architecture-edit-v0.2` plans (`ruby scripts/architecture_edit.rb prepare/show/apply`) — never hand-edited canonical architecture YAML. Supported operations for this plan: `add_module`, `add_representation`, `add_value_site`, `add_relation`, `update_entity`, `layout_board`.
- View-level node addition is NOT edit-plan-covered (confirmed by reading `protocol/architecture-edit-language.md` in full: `scaffold_board` only creates new drilldown boards, `update_view_entity` only edits `summary`/`role`/`detail` prose on nodes that already exist) — hand-edit the view YAML to add the bare node reference, then use `layout_board` to position it.
- Every Ruby command in this plan uses `/opt/homebrew/opt/ruby@3.3/bin/ruby`, not bare `ruby`.
- No worktree — this plan executes directly on `main`, matching this project's established pattern.
- Stage explicit paths, never `git add -A`. Every commit message ends with the exact trailer:
  ```
  Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
  ```
  This has been a real, recurring mistake by implementer subagents earlier in this project — use the literal text above, verbatim, never your own model identity.

---

### Task 1: Rename the source set from `af3_pairformer` to `alphafold3`

**Files:**
- Modify: `explainer/architectures/index.yaml` (the registry entry's `id:` and `label:`)
- Modify: `explainer/architectures/alphafold3-pairformer.yaml:2` (the architecture's own top-level `id:` field)
- Modify: `.github/workflows/deploy-pages.yml:34` (the `--source-set` argument)
- Modify: `SPEC.md:76` (the one remaining `af3_pairformer` reference, in the "Sub-project 0" bullet)

**Interfaces:**
- Produces: the source set is now addressable as `alphafold3` everywhere — every later task in this plan uses `--source-set alphafold3`, not `--source-set af3_pairformer`.

File paths (`architectures/alphafold3-pairformer.yaml`, `views/alphafold3-pairformer-semantic-zoom.view.yaml`, `pseudocode/alphafold3-pairformer.yaml`) stay as-is — the registry's `id:` is independent of the file paths it points to, and renaming three files for cosmetic consistency isn't worth the diff risk in this task. Only the registry `id:`/`label:` and the architecture file's internal `id:` change.

- [ ] **Step 1: Read the current registry entry**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
sed -n '/id: af3_pairformer/,/^  - id:/p' explainer/architectures/index.yaml
```

Confirm it still reads exactly:
```yaml
  - id: af3_pairformer
    label: AlphaFold 3 Pairformer
    directory_role: architecture
    architecture: architectures/alphafold3-pairformer.yaml
    view: views/alphafold3-pairformer-semantic-zoom.view.yaml
    pseudocode: pseudocode/alphafold3-pairformer.yaml
    standard_blocks: []
```

If it doesn't match (someone else touched it since this plan was written), stop and report — don't proceed on a stale assumption.

- [ ] **Step 2: Rename the registry entry**

Change `id: af3_pairformer` to `id: alphafold3` and `label: AlphaFold 3 Pairformer` to `label: AlphaFold 3` (the label should describe the source set's growing scope, not just its current Pairformer content — it's about to cover more than the Pairformer). Leave `architecture:`, `view:`, `pseudocode:`, `directory_role:`, `standard_blocks:` untouched.

- [ ] **Step 3: Rename the architecture file's own id**

In `explainer/architectures/alphafold3-pairformer.yaml`, change line 2 from `id: alphafold3_pairformer` to `id: alphafold3`. Leave `name: AlphaFold 3 Pairformer` on line 3 as-is for this task — Task 2 will revisit whether the architecture's `name:` field also needs to change once it covers more than the Pairformer; don't scope-creep that decision into this rename.

- [ ] **Step 4: Update the CI build command**

In `.github/workflows/deploy-pages.yml`, change:
```yaml
        run: ruby explainer/scripts/build_pages.rb --source-set af3_pairformer --output dist
```
to:
```yaml
        run: ruby explainer/scripts/build_pages.rb --source-set alphafold3 --output dist
```

- [ ] **Step 5: Update SPEC.md's historical reference**

In `SPEC.md`, find the "Sub-project 0 (infrastructure, complete and live)" bullet and change "publishing only the existing `af3_pairformer` source set" to "publishing only the existing `af3_pairformer` source set (renamed `alphafold3` in sub-project 1)" — word it so the sentence still accurately describes what sub-project 0 actually did at the time, not silently rewritten as if the rename always existed.

- [ ] **Step 6: Verify the rename holds together**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY renderer/architecture/build-manifest.rb
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all four exit 0. The manifest builder will regenerate `renderer/architecture/manifest-alphafold3.js` and update `manifest-index.js`; the old `manifest-af3_pairformer.js` becomes orphaned generated output (not deleted by the builder automatically — check `ls renderer/architecture/manifest-*.js` after this step and remove `manifest-af3_pairformer.js` by hand if it's still present, since a stale generated file for an id that no longer exists in the registry is misleading, not just unused).

- [ ] **Step 7: Confirm no other reference to the old id remains**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
grep -rn "af3_pairformer" --include=*.yaml --include=*.yml --include=*.md . | grep -v "alphafold3-pairformer\.yaml\|alphafold3-pairformer-semantic-zoom\|/af3-visualizer/explainer/architectures/alphafold3-pairformer\.yaml:"
```

This should return nothing beyond file *path* references (which correctly stay as `alphafold3-pairformer.yaml` per Step 1's decision) — no remaining `id: af3_pairformer` or `--source-set af3_pairformer`. If it finds one, fix it before committing.

- [ ] **Step 8: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/architectures/index.yaml explainer/architectures/alphafold3-pairformer.yaml .github/workflows/deploy-pages.yml SPEC.md explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
# If Step 6 found and removed a stale manifest-af3_pairformer.js, stage that deletion too:
git add explainer/renderer/architecture/manifest-af3_pairformer.js 2>/dev/null || true
git commit -m "$(cat <<'EOF'
Rename the af3_pairformer source set to alphafold3

Renamed now, before sub-project 1 accumulates more views/pseudocode
references to the old name (DECISIONS.md 2026-09-19 entry). File paths
are unchanged -- only the registry id/label and the architecture
file's own internal id changed. File names still say
"alphafold3-pairformer" for now; that's a separate, optional cleanup,
not required for correctness since the registry's id is independent
of the paths it points to.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 6's four commands all exit 0 under the new id; Step 7's grep is clean.

---

### Task 2: Author and apply the Input Feature Embedder architecture facts

**Files:**
- Create: an edit-plan file (e.g. `/tmp/add-input-feature-embedder.yaml` — this is a draft artifact for the `architecture_edit.rb` tool, not something committed to the repo; the durable output is the architecture YAML it produces)
- Modify (via the edit-plan tool, not by hand): `explainer/architectures/alphafold3-pairformer.yaml`

**Interfaces:**
- Consumes: the renamed `alphafold3` source set (Task 1).
- Produces: a new module `modules.input_feature_embedder` with child `modules.atom_attention_encoder_bare` (`decomposition.status: opaque`); new `boundary: input` value sites for the true raw features (exact IDs decided during authoring, following the existing naming style — e.g. `atom_reference_features_input`, `restype_input`, `profile_input`, `deletion_mean_input`); new `representations` entries for whatever new tensor/stream types those value sites need (following the granularity of the existing `single_state`/`pair_state`/`token_mask`/`pair_mask` representations — one representation per genuinely distinct tensor/stream type, not one giant "raw features" blob); a `concat`-style relation from the new inputs into the **existing** `single_state_input` value site (no new value site for this output — `single_state_input` already exists as the right hand-off point); and, since `pair_state_input`'s own producer (the outer-sum construction of `z_init` from `s_inputs`, per Algorithm 1) is a direct one-line consequence of `s_inputs` existing, a relation modeling that fold into `pair_state_input` too. Later tasks (Task 3) reference `modules.input_feature_embedder` by this exact ref when adding the view node.

This task requires real domain judgment — translating the `.typ` note's prose into correctly-scoped, correctly-cited facts — not transcription. Read the spec section and the deep-dive note section in full before drafting anything.

- [ ] **Step 1: Re-read the grounding material**

Read `SPEC.md`'s "Sub-project 1, module 1" section in full (it has the mechanism summary, the scope decision, and the exact list of new/corrected facts). Then read `~/research/src/alphafold3.typ`'s *Inside `InputFeatureEmbedder` and `AtomAttentionEncoder`, both call modes (deep dive)* section in full (grep for it: `grep -n "Inside \`InputFeatureEmbedder\`" ~/research/src/alphafold3.typ` to find the line, then read the surrounding ~70 lines).

- [ ] **Step 2: Read the existing patterns to copy**

```bash
sed -n '210,340p' /Users/aryansharanreddyguda/af3-visualizer/explainer/architectures/alphafold3-pairformer.yaml
```

This shows the `representations` block (including `single_state`/`pair_state`'s exact field shape: `id`, `scale`, `semantic_role`, `shape`, `glyph`, `carries`, `evidence`) and the start of `value_sites` (including `single_state_input`/`pair_state_input`'s exact field shape: `id`, `representation_ref`, `scope_ref`, `boundary`, `role`, `evidence`). Also read one full `relations` entry (search for `id: input_pair_state_initializes_block_pair_state`) for the relation field shape: `id`, `from`, `to`, `kind`, `carries`, `operation`, `evidence`.

Also read `explainer/AGENTS.md`'s "Architecture Authoring Rules" section (already covered once this session, re-read it now since you're about to apply it) for the hard rules: stable snake_case IDs, one owner per fact, every module needs exactly one `parent_ref`, `decomposition.status` on every module (`complete`/`partial`/`leaf`/`opaque`), evidence status vocabulary, and the "do not invent architecture facts" rule — mark anything not directly checked against a source as `inferred` or `open_question` rather than asserting it as `confirmed_from_code`.

- [ ] **Step 3: Draft the edit-plan**

Write an `architecture-edit-v0.2` plan (see `protocol/architecture-edit-language.md` for the exact plan shape and each operation's field requirements) to `/tmp/add-input-feature-embedder.yaml`, targeting `alphafold3`, with operations in this order:
1. `add_module` for `input_feature_embedder` (`parent_ref: architecture`, `decomposition.status: complete` — its own two children, the atom encoder call and the concat, are both fully represented at this module's level of breadth).
2. `add_module` for `atom_attention_encoder_bare` (`parent_ref: modules.input_feature_embedder`, `decomposition.status: opaque` — per the scope decision, its internals are intentionally not modeled).
3. `add_representation` for each new tensor/stream type the new value sites need.
4. `add_value_site` for each new `boundary: input` value site (the raw per-atom reference-conformer features, `restype`, `profile`, `deletion_mean`).
5. `add_relation` connecting the new inputs, through the module, into the existing `single_state_input`.
6. `add_relation` modeling the outer-sum fold of `s_inputs` into the existing `pair_state_input`.
7. `update_entity` removing `boundary: input` from `single_state_input` and `pair_state_input` (they're internal hand-offs now, not the architecture's task-native boundary — DECISIONS.md's 2026-09-19 entry explains why).
8. `update_entity` rewriting the architecture root's `decomposition.status.evidence.note` (currently: *"The source set deliberately stops at the already-embedded single and pair representations"*) to describe the new, larger boundary — the raw per-token/per-atom input features are now the true stopping point instead.

Give the plan a real `intent` string describing the whole change in one sentence.

- [ ] **Step 4: Prepare, inspect, and apply**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/architecture_edit.rb prepare /tmp/add-input-feature-embedder.yaml --out /tmp/add-input-feature-embedder.prepared.yaml
$RUBY scripts/architecture_edit.rb show /tmp/add-input-feature-embedder.prepared.yaml
```

**Actually read the `show` output** — it's the semantic diff of what applying this plan will do. Confirm every operation appears, resolves the refs you expect, and doesn't touch anything outside this task's scope. If anything looks wrong, fix the draft plan and re-run `prepare`/`show` before applying — do not apply a plan whose `show` output you haven't actually read.

```bash
$RUBY scripts/architecture_edit.rb apply /tmp/add-input-feature-embedder.prepared.yaml
```

- [ ] **Step 5: Regenerate the manifest**

`apply` updates the canonical architecture YAML only — it does not regenerate the compiled manifest. `verify_architecture.rb`'s CLI runs `include_manifest: true` by default (confirmed this session by reading `scripts/verify_architecture.rb:42`), which checks the in-tree `manifest-alphafold3.js` for freshness against the architecture source — so Step 6 will fail on a stale-manifest diagnostic unless this runs first:

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
```

- [ ] **Step 6: Run the mandatory verifier**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/verify_architecture.rb --source-set alphafold3
```

Expected: all checks pass. If something fails, read the actual diagnostic — the verifier's whole job is to catch exactly the kind of scoping/reference mistakes this task is prone to (dangling refs, missing evidence, an orphaned `parent_ref`). Fix the underlying fact, not the symptom.

- [ ] **Step 7: Confirm the pseudocode file still resolves**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
grep -n "single_state_input\|pair_state_input" pseudocode/alphafold3-pairformer.yaml
```

`explainer/pseudocode/alphafold3-pairformer.yaml` binds to `value_sites.single_state_input`/`value_sites.pair_state_input` by ID at lines 41/47/75/81 (confirmed this session) — these bindings don't depend on the `boundary` field, so removing `boundary: input` from those two value sites should not break them, only the earlier `verify_architecture.rb` run (Step 6) would have caught it if it did. This step is a direct sanity check on top of that, not a substitute for it — confirm the four `architecture_ref:` lines are still present and unchanged.

- [ ] **Step 8: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/architectures/alphafold3-pairformer.yaml explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
git commit -m "$(cat <<'EOF'
Add the Input Feature Embedder module (AF3 Algorithm 2)

Models InputFeatureEmbedder upstream of the existing Pairformer, with
AtomAttentionEncoder as a single opaque child (SPEC.md's "Sub-project 1,
module 1" section explains why: it's the same routine reused later, in
conditioned mode, by the Diffusion Module -- modeling it now would mean
doing it twice). Corrects single_state_input/pair_state_input's
boundary:input marking, which was accurate only while the source set
stopped at the Pairformer (DECISIONS.md 2026-09-19 entry).

Authored via an architecture-edit-v0.2 plan
(ruby scripts/architecture_edit.rb prepare/show/apply), not hand-edited,
per explainer/AGENTS.md's authoring rules for an already-registered
source set.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 6's verifier passes clean; Step 7's grep still shows all four pseudocode bindings intact.

---

### Task 3: Add the module to the root board

**Files:**
- Modify: `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml` (the `pairformer_overview` board's `nodes:` list, starting around line 19)
- Create: a second small edit-plan file (e.g. `/tmp/layout-pairformer-overview.yaml`)

**Interfaces:**
- Consumes: `modules.input_feature_embedder` (Task 2).
- Produces: the root board (`pairformer_overview`) now includes a visible, correctly-positioned node for the Input Feature Embedder, upstream of the existing Pairformer node.

This is the procedural nuance this plan exists to get right: adding a node to an *existing* board has no dedicated edit-plan operation (confirmed by reading `protocol/architecture-edit-language.md` in full — `scaffold_board` only creates new boards, `update_view_entity` only edits prose on nodes that already exist). The fix is two steps: hand-add the bare node reference (no position), then use `layout_board` to compute its actual placement.

- [ ] **Step 1: Read the current root board's node list**

```bash
sed -n '1,95p' /Users/aryansharanreddyguda/af3-visualizer/explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml
```

Note the exact shape of an existing node entry under `nodes:` (each entry's `ref`, and whatever presentation fields the existing entries carry — do not invent fields the existing entries don't use).

- [ ] **Step 2: Hand-add the bare node reference**

Add one new entry to the `pairformer_overview` board's `nodes:` list for `modules.input_feature_embedder`, matching the field shape of the existing entries but WITHOUT any `col`/`row` value — per `explainer/AGENTS.md`'s "Semantic-Zoom Views" rule, layout is computed by the tool, never hand-picked. If the schema requires *some* placeholder col/row to pass basic YAML validation before `layout_board` runs, use the same value on every dimension the existing nodes use for "unplaced" (check whether the schema or an existing example shows how a freshly-scaffolded, not-yet-laid-out node is represented — do not guess a magic number).

- [ ] **Step 3: Run `layout_board` to compute its position**

Write a small `architecture-edit-v0.2` plan to `/tmp/layout-pairformer-overview.yaml` with a single `layout_board` operation targeting the `pairformer_overview` board, then:

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/architecture_edit.rb prepare /tmp/layout-pairformer-overview.yaml --out /tmp/layout-pairformer-overview.prepared.yaml
$RUBY scripts/architecture_edit.rb show /tmp/layout-pairformer-overview.prepared.yaml
```

Read the `show` output — confirm it actually repositions `input_feature_embedder` upstream (to the left, in this tool's left-to-right flow convention, per `protocol/semantic-layout.md`) of the Pairformer node, and doesn't silently reflow or relabel anything else on the board in a way that looks wrong.

```bash
$RUBY scripts/architecture_edit.rb apply /tmp/layout-pairformer-overview.prepared.yaml
```

- [ ] **Step 4: Regenerate the manifest**

Same reason as Task 2's Step 5: `apply` updates the canonical view YAML only, and the compiled manifest embeds board/layout content too, so it's now stale relative to the new node and its computed position.

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
```

- [ ] **Step 5: Verify**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/verify_architecture.rb --source-set alphafold3 --board pairformer_overview
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY scripts/lint_sources.rb
```

Expected: all three exit 0.

- [ ] **Step 6: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
git commit -m "$(cat <<'EOF'
Add the Input Feature Embedder to the root board

Adding a node to an existing board has no dedicated edit-plan
operation (protocol/architecture-edit-language.md's op list covers
new-board scaffolding and prose edits on existing nodes, not this
case), so this is a direct, minimal hand-edit adding the bare node
reference, positioned by a layout_board edit-plan operation
(semantic_flow_v1 compiler) rather than hand-picked col/row values.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 5's three commands all exit 0.

---

### Task 4: Full local verification, including an actual rendered check

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-3.

- [ ] **Step 1: Full regenerate-and-check cycle**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY renderer/architecture/build-manifest.rb
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all four exit 0.

- [ ] **Step 2: Build and serve locally**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer
rm -rf dist
$RUBY explainer/scripts/build_pages.rb --source-set alphafold3 --output dist
node scripts/build-pages.mjs
cd dist && python3 -m http.server 8096 &
```

- [ ] **Step 3: Render check in a real browser**

Per this project's standing "verify by rendering, not by tracing" rule (established across the last four screens/modules built), open `http://localhost:8096/?arch=alphafold3` (or navigate there from the landing page — confirm the landing page's own list still shows exactly one architecture, now labeled "AlphaFold 3") and confirm, with actual eyes or a headless-browser script (`puppeteer-core` pointed at a local Chrome binary, the pattern used earlier in this project — check for `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`):

- The root board renders with a new node for the Input Feature Embedder, positioned before/upstream of the Pairformer node, with no console errors.
- Clicking the new node shows correct detail (module name, evidence) in the inspector panel — even though it has no child drilldown board of its own yet (consistent with the opaque-child scope decision; it doesn't need one until `atom_attention_encoder_bare`'s internals are modeled in a future pass).
- The existing Pairformer board and its drilldowns still work exactly as before (removing `boundary: input` from two value sites should have zero visible effect on the Pairformer board itself — confirm this is actually true, not just assumed).
- No JS console errors anywhere in this click-through.

Stop the server when done: `kill %1`, then `rm -rf dist`.

- [ ] **Step 4: Record the result**

No commit for this task (verification only). If Step 3 finds a real problem, go back to the task whose commit caused it (Task 2 for architecture-level issues, Task 3 for view/layout issues), fix it there with its own re-verification, and re-run this task's checks from Step 1.

**Deliverable check:** Step 1's four commands exit 0; Step 3's render check passes with no console errors and both the new node and the existing Pairformer board confirmed working.
