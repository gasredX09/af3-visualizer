# Input Feature Embedder Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add AF3's `InputFeatureEmbedder` (Algorithm 2) as a new module in the vendored `alphafold3` architecture (renamed from `af3_pairformer`), upstream of the existing Pairformer, with `AtomAttentionEncoder` modeled as a single opaque child — and make it visible on the explainer's root board.

**Architecture:** Originally planned as two authoring surfaces (architecture-edit-v0.2 for architecture facts, a hand-edit + `layout_board` for the view). **Revised 2026-09-19** after a BLOCKED report proved that split unworkable: `architecture-edit-v0.2`'s `prepare` step requires anything wired into an already-visible value site to also be visible on the root board, and no edit-plan operation adds a node to an existing board — so architecture and view facts for this module are authored together, by direct hand-edit of both YAML files in one pass, gated by the tool's full verification pipeline (`lint_sources.rb`, `verify_architecture.rb`, `build-manifest.rb --check`) instead of the edit-plan tool's own `prepare`/`show` step. See Task 2's header and `DECISIONS.md`'s matching 2026-09-19 entry for the full ruling.

**Tech Stack:** YAML (architecture-v0.5, visualization-v0.4, architecture-edit-v0.2), Ruby 3.3 (`/opt/homebrew/opt/ruby@3.3/bin/ruby` — pinned to match CI and the committed manifests, not the bare `ruby` on this machine's PATH, which resolves to 4.0.7).

**Spec:** `SPEC.md`'s "Sub-project 1, module 1: the Input Feature Embedder" section and `DECISIONS.md`'s 2026-09-19 entry ("Rename af3_pairformer to alphafold3; begin expanding beyond Pairformer"). Read both in full — this plan argues from them and does not repeat their rationale.

## Global Constraints

- Ground every architectural claim in `~/research/src/alphafold3.typ`'s *Inside `InputFeatureEmbedder` and `AtomAttentionEncoder`, both call modes (deep dive)* section (`[paper] Algorithm 2, 5-7`) — never describe the mechanism from memory. `~/research-papers/alphafold3.pdf`, `~/research-papers/alphafold3-supplementary.pdf`, and `~/research-papers/codebases/alphafold3/` are available as primary sources if a specific claim needs grounding the note doesn't already cite.
- `AtomAttentionEncoder` is modeled as a single `opaque` child module in this pass — not its internals. It is reused later, in *conditioned* mode, by the Diffusion Module; modeling it now would mean doing it twice or getting it half-right against only the bare-mode requirements.
- Every new fact needs `evidence.status` (`confirmed_from_code` / `confirmed_from_paper` / `confirmed_from_docs` / `inferred` / `open_question`) and `evidence.refs` with a locator, matching the existing Pairformer entries' own rigor. Use `confirmed_from_paper` for claims the note's own `[paper]` citations establish; use `confirmed_from_code` only for claims checked directly against `~/research-papers/codebases/alphafold3/`.
- Follow the existing file's established field shapes exactly — don't invent a new shape for a `value_sites` or `relations` entry. `explainer/architectures/alphafold3-pairformer.yaml`'s `single_state_input`/`pair_state_input`/`token_mask_input`/`pair_mask_input` value sites and the `input_pair_state_initializes_block_pair_state` relation are the templates.
- **Revised 2026-09-19:** `architecture-edit-v0.2` cannot express this task at all — confirmed empirically (isolated probe plans against `prepare`, not just reading the docs) that wiring a new module into an already-visible value site requires root-board visibility, which no edit-plan operation can grant to a new node, and that `update_entity` cannot target the architecture root or unset a field. Both architecture and view facts are hand-edited directly, together, in Task 2, following `explainer/AGENTS.md`'s own documented fallback for edits outside the edit-plan boundary — verified by the full verification pipeline instead of `prepare`/`show`.
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

### Task 2: Author and apply the Input Feature Embedder, architecture + view together

**Revised 2026-09-19, before dispatch, after a BLOCKED report from the first
implementer attempt (see `DECISIONS.md`'s matching entry for the full
ruling).** The original split — Task 2 authors architecture facts via
`architecture-edit-v0.2`, Task 3 separately adds the view node — cannot
work: `prepare` requires anything wired into an already-visible value site
(`single_state_input` is exactly that) to also be visible on the root
board, and no edit-plan operation adds a node to an *existing* board.
`update_entity` also cannot target the architecture root or unset a field.
All three gaps were confirmed empirically (isolated one-operation probe
plans, not just reading the docs) by the first attempt, whose content
design below is reused as-is — it was correctly researched and grounded,
the *application mechanism* was the problem, not the content.

**This task therefore hand-edits both YAML files directly**, per
`explainer/AGENTS.md`'s own documented fallback for edits outside the
edit-plan boundary ("Unsupported edits... use carefully reviewed
declarative YAML followed by the full validation workflow"), gated by the
tool's full verification pipeline instead of the edit-plan tool's own
`prepare`/`show` step.

**Files:**
- Modify (direct hand-edit): `explainer/architectures/alphafold3-pairformer.yaml`
- Modify (direct hand-edit): `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml` (the `pairformer_overview` board's `nodes:` list)

**Interfaces:**
- Consumes: the renamed `alphafold3` source set (Task 1).
- Produces: `modules.input_feature_embedder`, visible on the root board, wired into the existing `single_state_input`/`pair_state_input`. Later tasks (Task 3, was Task 4) reference `modules.input_feature_embedder` by this exact ref.

- [ ] **Step 1: Re-read the grounding material**

Read `SPEC.md`'s "Sub-project 1, module 1" section in full, then `~/research/src/alphafold3.typ`'s *Inside `InputFeatureEmbedder` and `AtomAttentionEncoder`, both call modes (deep dive)* section in full (grep to find it, read the surrounding ~70 lines). Also read `~/research-papers/alphafold3-supplementary.pdf` Table 5 (the raw feature shapes — the `.typ` note names the fields in prose but doesn't give shapes; use `pdftotext -layout` or the `Read` tool's `pages` parameter, don't invent shapes) and `explainer/AGENTS.md`'s "Architecture Authoring Rules" and "Semantic-Zoom Views" sections.

- [ ] **Step 2: Read the existing patterns to copy, and the exact schemas**

```bash
sed -n '210,340p' /Users/aryansharanreddyguda/af3-visualizer/explainer/architectures/alphafold3-pairformer.yaml
sed -n '1,95p' /Users/aryansharanreddyguda/af3-visualizer/explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml
```

Also read `explainer/schemas/architecture-v0.5.schema.json` and `explainer/schemas/visualization-v0.4.schema.json` directly for the exact required fields on `module`, `representation`/`field_groups`, `value_site`, `relation`, and a view board's `nodes` entry — since this is now a hand-edit with no `prepare` step to catch a wrong field name before it's committed, get the shape right by reading the schema, not by pattern-matching alone. Check `explainer/architectures/genie3.yaml` for its `feature_bundle`-style representation (a precedent for bundling several raw per-atom fields into one representation via `field_groups`, relevant to the atom-reference-features representation below).

- [ ] **Step 3: Author the architecture facts**

Add these facts to `explainer/architectures/alphafold3-pairformer.yaml`, matching this content design exactly (already researched and evidence-grounded by a prior attempt against the paper, the `.typ` note, and Supplementary Table 5 — verify each citation yourself against the actual sources rather than taking the IDs on faith, but don't re-derive the architecture from scratch):

**Modules (3):**
- `input_feature_embedder` (`parent_ref: architecture`, `decomposition.status: complete`) — builds `s_inputs` via bare-mode `AtomAttentionEncoder` + concat. Evidence: `confirmed_from_paper`, Algorithm 2.
- `atom_attention_encoder_bare` (`parent_ref: modules.input_feature_embedder`, `decomposition.status: opaque`, with a `reason` citing the shared-routine/Diffusion-Module-reuse argument from `SPEC.md`'s scope decision). Evidence: `confirmed_from_paper`, "Algorithm 5, called from Algorithm 2 line 1 with all three optional args None."
- `input_feature_concatenation` (`parent_ref: modules.input_feature_embedder`, `decomposition.status: leaf`) — concatenates `a_i` with `restype`/`profile`/`deletion_mean`. Evidence: `confirmed_from_paper`, "Algorithm 2 line 2." (This third module exists because `ArchitectureCoverage`'s depth/visibility accounting treats the concat as needing its own real child module, not a bare relation — confirmed empirically by the prior attempt; it also matches the existing file's own pattern of giving terminal operators like `triangle_multiplication_outgoing` their own leaf module.)

**Representations (4):**
- `atom_reference_features` (`scale: atom`, one `field_groups` entry bundling `ref_pos`, `ref_mask`, `ref_element`, `ref_charge`, `ref_atom_name_chars`, `ref_space_uid` — mirrors `genie3.yaml`'s bundled-representation pattern). Evidence: `confirmed_from_paper`, Algorithm 5 + Table 5.
- `restype` (`N_token x 32`), `profile` (`N_token x 32`), `deletion_mean` (`N_token`) — each `scale: token`. Evidence: `confirmed_from_paper`, Algorithm 2 line 2 + Table 5.

**Value sites (4, all `boundary: input`, `scope_ref: architecture`):**
- `atom_reference_features_input` (`representation_ref: representations.atom_reference_features`)
- `restype_input`, `profile_input`, `deletion_mean_input` (one each, matching representations above)

**Relations (7):**
1. `atom_reference_features_input` → `atom_attention_encoder_bare` (`data_flow`)
2. `atom_attention_encoder_bare` → `input_feature_concatenation` (`data_flow`) — module-to-module, since `AtomAttentionEncoder`'s pooled output (`a_i`) has no dedicated value site, per the scope decision that atom-level detail stays inside the opaque child
3. `restype_input` → `input_feature_concatenation` (`data_flow`)
4. `profile_input` → `input_feature_concatenation` (`data_flow`)
5. `deletion_mean_input` → `input_feature_concatenation` (`data_flow`)
6. `input_feature_concatenation` → `single_state_input` (`state_update`) — the required hand-off into the existing value site
7. `single_state_input` → `pair_state_input` (`state_update`, an `operation` naming the outer-sum fold) — Algorithm 1 line 3's outer-sum construction of `z_init` from `s_inputs`; scope the evidence note explicitly to line 3 only, not lines 4-5's `RelativePositionEncoding`/`token_bonds` contributions, which are real but out of this task's scope

**Two corrections** (hand-edit these existing fields directly — `update_entity` cannot reach either one, confirmed empirically: no `architecture` collection exists for the root note, and there is no `unset` on the field-value operation):
- Remove `boundary: input` from `single_state_input` and `pair_state_input` (they're internal hand-offs now — `DECISIONS.md`'s 2026-09-19 entry explains why).
- Rewrite the architecture root's `decomposition.status.evidence.note` (currently *"The source set deliberately stops at the already-embedded single and pair representations"*) to describe the new, larger boundary — the raw per-token/per-atom input features are now the true stopping point.

Every new fact needs its own `evidence.status`/`evidence.refs` entry, following the existing entries' exact field shape — no shared/copied evidence blocks unless the existing file already does that for genuinely identical claims.

- [ ] **Step 4: Add the root-board node**

In the SAME pass (this has to land together with Step 3 — that's the whole reason this is a hand-edit rather than two edit-plans), add one new entry to `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`'s `pairformer_overview` board `nodes:` list for `modules.input_feature_embedder`, positioned before the Pairformer node in reading order, matching the field shape of the existing entries. Per `explainer/AGENTS.md`'s "Semantic-Zoom Views" rule, don't hand-pick a `col`/`row` layout — place it using whatever position convention the existing board's own scaffolding pattern uses for a freshly-added node (check the schema/existing examples rather than guessing a magic number; if every existing node already carries explicit `col`/`row` and there's no "unplaced" convention, assign the smallest `col` value that visually precedes the existing leftmost node, shifting other `col` values right only if the schema requires strictly unique values — read the board's current values first before deciding).

- [ ] **Step 5: Regenerate the manifest**

Both files just changed by hand, so the compiled manifest is now stale relative to both:

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY renderer/architecture/build-manifest.rb
```

- [ ] **Step 6: Run the full verification gate**

```bash
RUBY=/opt/homebrew/opt/ruby@3.3/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set alphafold3 --board pairformer_overview
$RUBY scripts/verify_architecture.rb --source-set alphafold3
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all four exit 0. This verifier run is now the ONLY safety net on this hand-edit (there's no `prepare`/`show` step to catch a mistake earlier) — read every diagnostic if anything fails, and fix the underlying fact, not the symptom. If the SAME root-board-visibility errors the first attempt hit resurface here, that means the node from Step 4 isn't actually being recognized as covering the new module's frontier — re-check `subject_ref`/`parent_ref` alignment before assuming the verifier itself is wrong.

- [ ] **Step 7: Confirm the pseudocode file still resolves**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
grep -n "single_state_input\|pair_state_input" pseudocode/alphafold3-pairformer.yaml
```

Confirm the four `architecture_ref:` lines (originally at lines 41/47/75/81) are still present and unchanged — these bindings don't depend on the `boundary` field, so removing it should not break them; Step 6's verifier would have caught it if it did, this is a direct sanity check on top.

- [ ] **Step 8: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add explainer/architectures/alphafold3-pairformer.yaml explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml explainer/renderer/architecture/manifest-alphafold3.js explainer/renderer/architecture/manifest-index.js
git commit -m "$(cat <<'EOF'
Add the Input Feature Embedder module (AF3 Algorithm 2)

Models InputFeatureEmbedder upstream of the existing Pairformer, with
AtomAttentionEncoder as a single opaque child (SPEC.md's "Sub-project 1,
module 1" section explains why: it's the same routine reused later, in
conditioned mode, by the Diffusion Module -- modeling it now would mean
doing it twice). Corrects single_state_input/pair_state_input's
boundary:input marking, which was accurate only while the source set
stopped at the Pairformer (DECISIONS.md 2026-09-19 entry).

Hand-edited, not authored via architecture-edit-v0.2: prepare requires
anything wired into an already-visible value site to also be visible on
the root board, and no edit-plan operation adds a node to an existing
board, so architecture and view facts had to land together in one pass
(the original plan's separate Task 2/Task 3 split couldn't work -- see
this plan's revised Task 2 header and DECISIONS.md's matching entry).
Gated by the full verification pipeline (lint, verify_architecture,
manifest --check) instead of the edit-plan tool's own prepare/show step.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 6's four commands all exit 0; Step 7's grep still shows all four pseudocode bindings intact.

---

### Task 3: Full local verification, including an actual rendered check

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-2.

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

No commit for this task (verification only). If Step 3 finds a real problem, go back to Task 2 (the only content-authoring task now), fix it there with its own re-verification, and re-run this task's checks from Step 1.

**Deliverable check:** Step 1's four commands exit 0; Step 3's render check passes with no console errors and both the new node and the existing Pairformer board confirmed working.
