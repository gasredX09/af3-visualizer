# Confidence Head Implementation Plan

**Goal:** Extend the AlphaFold 3 architecture through a completed diffusion
sample and its four confidence predictions. Keep the existing one-step
Diffusion Module explanation intact and correctly place it inside the sampler.

**Source of truth:** `SPEC.md`, "Sub-project 1, module 5: the Confidence Head".
Mechanism evidence is `~/research/src/alphafold3.typ`, "Confidence module",
and the AF3 supplementary paper, Section 4.3.5 and Algorithm 31. The local
AF3 reference implementation is at
`~/research-papers/codebases/alphafold3/`, revision
`b2f3d45fbfcacc5183bd5345d15df93571b8437f` when this plan was written.
Recheck its revision and exact code locators before authoring evidence.

**Durable files:**

- `explainer/architectures/alphafold3-pairformer.yaml`
- `explainer/views/alphafold3-pairformer-semantic-zoom.view.yaml`
- `explainer/references/bibliography.yaml`
- Generated `explainer/renderer/architecture/manifest-alphafold3.js` and
  index, if the builder changes the index

No AF3-specific renderer branch is needed. The current Pairformer pseudocode
source remains scoped to Pairformer; adding a confidence trace is a separate
authoring pass if the diagram needs one after review.

## Rules for every task

1. Read root `AGENTS.md` and `CLAUDE.md`, then `explainer/AGENTS.md` and
   `explainer/CLAUDE.md` before editing the vendored explainer.
2. Read the specific cited paper and code sections before writing facts.
   Every nontrivial architecture claim, value site, and relation needs
   compatible evidence and a useful locator. Add revision-pinned code sources
   to the bibliography for `confidence_head.py` and `model.py`.
3. Use stable semantic IDs, one owner per fact, and distinct sites for
   before/after states. Do not duplicate the trunk's 48-block Pairformer
   internals as if the confidence head had a different attention mechanism.
4. The current architecture-edit tool cannot perform the required existing
   board rewiring and boundary removal, as documented in `DECISIONS.md`'s
   2026-09-19 entry. Treat the coupled edit as the documented unsupported
   case and carefully edit declarative sources, followed by the full verifier.
   If the tool has gained those operations, inspect its current protocol and
   use the reviewed edit-plan path for the operations it now supports.
5. Work on the tracked `main` branch. Review status and the staged diff before
   each meaningful commit. Push completed work under the standing repository
   authorization. Do not copy the Claude session trailer from the older
   Diffusion Module plan; that trailer describes a different session.

## Task 1: Correct the sampler and structure boundary

**Why first:** `value_sites.denoised_atom_positions` is the result of one
`DiffusionModule` call. `Model.__call__` passes
`samples['atom_positions']`, produced after the full `sample()` scan, into
`ConfidenceHead`. The two coordinate values cannot be merged.

- Add `modules.sample_diffusion` as a partial parent of the existing
  `modules.diffusion_module`. The child is still the fully authored one-step
  denoiser. The parent records only the repeated call and final sample
  boundary. Keep Algorithm 18's schedule, augmentation, churn, and update
  equations out of this board for the later sampler pass.
- Add `representations.final_sampled_atom_positions` and
  `value_sites.final_sampled_atom_positions` for one completed sample of atom
  coordinates. Mark this as the structure `boundary: output` and retain a
  distinct one-step `value_sites.denoised_atom_positions` without that
  boundary marker. The released inference configuration has five samples;
  the board follows one sample and the head is applied to each sample.
- Reclassify `value_sites.noisy_atom_positions` and `value_sites.noise_level`
  as internal sampler values, since they are generated within the sampling
  loop in the full inference view. Preserve the existing step relations that
  show how the denoiser reads them. Make the sampler's production of these
  values, and its use of the one-step denoised estimate, explicit with
  canonical relations. The denoised estimate feeds a sampler update; it is
  not directly copied into the final output or into the next call.
- Add the sampler's final-output relation and evidence from Supplementary
  Algorithm 18 lines 8-13 and `diffusion_head.py:306-378`. Cross-check
  `model.py:250-270,321-339` for the call and handoff.
- Build a minimal `sample_diffusion_detail` board whose subject is the new
  sampler. It drills to the existing `diffusion_module_detail` board and
  distinguishes one-step estimates from final coordinates. Retarget root
  presentation from the one-step module to the sampler and update the root
  summary. Keep the old one-step detail boards and IDs stable.

**Done when:** the architecture has one unambiguous full-sample site and one
unambiguous denoiser-step site; no relation says that a single denoiser return
is the final sample.

## Task 2: Add the shared confidence core

**Inputs:** `value_sites.s_inputs`, `value_sites.single_state_output`,
`value_sites.pair_state_output`, and
`value_sites.final_sampled_atom_positions`.

- Add one top-level `modules.confidence_head`. Its children should cover
  representative-atom pair distances, input-feature and distance injection,
  and the four-block full Pairformer. The confidence stack is a fresh
  occurrence with four blocks. Cite Algorithm 31 lines 1-4 and
  `confidence_head.py:84-162`. Keep the existing 48-block trunk occurrence
  and its source facts untouched.
- Add a pair-distance value site with token-pair scale. It is calculated
  from the *predicted coordinates* of representative atoms, not from true
  coordinates and not from the template distogram. Use a separate site for
  pair state after input-feature injection, another after distance injection,
  and separate refined single and pair sites after the confidence stack.
- Model the `s_inputs` outer-sum injection and the binned distance injection
  as two distinct canonical relations, grounded in Algorithm 31 lines 1-3.
  The reference code calls `s_inputs`' corresponding embedding
  `target_feat`; record the paper and code vocabulary in evidence rather
  than silently treating their names as proof of identical storage.
- Record the shared four-block full Pairformer as a separate occurrence of
  the same mechanism as the trunk block. Use `repeats: 4` and an execution
  loop only if the loop contract can represent it without fabricating extra
  tensor sites. Do not author a second copy of each Pairformer suboperation
  merely to fill the board.

**Done when:** all four inputs and the geometry injection have visible,
evidence-backed routes to the refined states.

## Task 3: Add four distinct readouts

- Add four child modules or equivalent clearly owned projections for pLDDT,
  PAE, PDE, and experimentally resolved probability. The two atom-wise
  projections read the refined single state and select the appropriate atom
  channel. The two pairwise projections read the refined pair state.
- Make PAE directional. The first pair index is the frame anchor, so
  `PAE[i,j]` need not equal `PAE[j,i]`. Make PDE symmetric, matching the
  pair-logit symmetrization in `confidence_head.py:169-200` and Algorithm 31
  line 6. Never symmetrize the PAE route or present PDE as frame-anchored.
- Distinguish each internal binned probability distribution from the
  released code's expected-value readout. The user-facing value sites are
  per-atom predicted lDDT on 0-100, per-token-pair expected PAE in
  angstroms, per-token-pair expected PDE in angstroms, and per-atom
  experimental-resolvability probability. Ground these in
  `confidence_head.py:169-279` and Supplementary Algorithm 31 lines 5-9.
  Supplementary Section 4.3.1 limits the pLDDT training target's neighbor
  distances to polymer atoms; preserve that qualifier for ligand examples.
  Use the shape contract to represent one sample. No ground-truth error or
  observed atom status is available at inference.
- Show pTM and ipTM only as derived PAE summaries in explanatory prose or a
  future scoring board. They are not fifth and sixth learned readout heads.
- If adding training context, label it explicitly as training: a short
  rollout supplies coordinates, and gradients are stopped at the confidence
  head inputs. Do not draw that path as the inference sampler.

**Done when:** each output has a distinct producer, correct scale and units,
and a traceable relation from the appropriate refined state.

## Task 4: Curate the confidence boards and root

- Create `confidence_head_detail` with the four input streams, distance
  injection, the four-block stack, and the four readouts. Split into one
  focused child board for the pairwise readouts if the detail board crosses
  the 12-node density threshold. A PAE callout must state that the row token
  anchors the frame and the column token is evaluated in it; a PDE callout
  must state that pair order is interchangeable.
- On the root board, show the collapsed sampler, final sampled coordinates,
  collapsed confidence head, and four predictions. Keep sample coordinates
  visible as a structure output as well as an input to confidence. Adjust
  grid dimensions and curation using view YAML, with explicit `board_ref`
  links for every drillable module. Check every projected edge.
- Preserve existing Diffusion Module, Pairformer, MSA, and Template board
  content except for the parent navigation and root-level presentation
  required by this change. The root summary must tell the reader that
  confidence evaluates a completed sample.
- Use the existing generic renderer. Any presentation change needed for an
  asymmetric pair matrix must be expressed in the view language unless it
  is purely generic styling behavior.

**Done when:** a reader can click from root through sampler to one denoising
step and from root into the confidence inputs and all four outputs.

## Task 5: Verify and publish the completed slice

From `explainer/`, using the pinned Ruby 3.3 interpreter, regenerate the
manifest and run:

```bash
ruby scripts/lint_sources.rb
ruby scripts/verify_architecture.rb --source-set alphafold3
ruby renderer/architecture/build-manifest.rb --check
ruby -Ilib:test test/documentation_test.rb
ruby -Ilib:test test/pages_build_test.rb
```

Use `/opt/homebrew/opt/ruby@3.3/bin/ruby` in place of `ruby` if the shell
selects another version. If that installation lacks WEBrick, add the local
pure-Ruby WEBrick gem to `RUBYLIB` for the affected tests; do not alter repo
dependencies only for the host environment. Run the full source-set verifier
without `--board`, even if board-scoped checks were used during authoring.
Review and resolve each new warning that indicates a curatable board.

Build `dist/`, serve it locally, and run an actual browser click-through.
Confirm the root sampler drills into its child board, the one-step Diffusion
Module remains reachable, the full-sample output routes into the confidence
head, and all four readouts render. Check PAE direction and PDE symmetry in
their visible copy. Revisit the existing Diffusion, Pairformer, MSA, and
Template drilldowns. Check for browser errors and stale manifests.

Review `git status`, the staged diff, secrets, unexpectedly large assets,
and any generated files. Commit a coherent finished slice and push `main`
under the repository's standing authorization.
