# AF3 Visualizer

An interactive teaching tool showing how input flows through the AlphaFold 3
architecture. Built for students, delivered alongside an hour-long talk on the
AF3 paper at GenAI BioMed 2026 Fall
(https://genaibiomed.github.io/GenAIBioMed2026Fall/).

Read `SPEC.md` first. It holds the full screen-by-screen specification, the
build priority, and the data-source decision.

## What this project is and is not

This project **builds a tool**. It is not part of the paper-reading workflow in
`~/research-papers/`, and work here does not produce vault notes by itself.

The one exception: the global research-workflow trigger still applies. If a
genuine AI, biology, or math research question comes up during this work (for
example "why does AF3 drop equivariance", as opposed to "how should this slider
behave"), answer it and capture it in the vault as normal. Building a screen is
not a research question. Understanding the mechanism that screen depicts may be.

## Authoritative sources for AF3 mechanisms

Do not describe an AF3 mechanism from memory. Check one of these:

- `~/research/src/alphafold3.typ` is the running deep-dive note. It covers all
  31 supplementary algorithms with pseudocode boxes, mechanism walkthroughs, and
  `[paper]` / `[code]` provenance citations. Start here, it is usually enough.
- `~/research-papers/alphafold3.pdf` and
  `~/research-papers/alphafold3-supplementary.pdf` are the papers themselves.
  `pdftotext -layout <file>.pdf /tmp/<name>.txt` then grep is much faster than
  paging through the PDF. Read the actual PDF page as an image when an
  extraction looks garbled, since superscripts and math often do not survive.
- `~/research-papers/codebases/alphafold3/` is the reference implementation, for
  when the paper is ambiguous or an implementation detail matters.

Accuracy is the whole point of a teaching tool. A visualization that is
beautiful and subtly wrong is worse than no visualization.

## Audience

Mixed CS and biology backgrounds. Some know transformers and diffusion but have
never seen an MSA. Some know protein structure cold but have never seen
attention. Design for both at once:

- Name each concept twice on first appearance, once in ML vocabulary and once in
  structural biology vocabulary. After that use whichever term fits.
- Motivate before mechanism. Show the problem a module solves before showing how
  it solves it.
- Concrete before abstract. Three specific tokens with real numbers, then the
  general form.
- Every dense view needs a one-sentence plain-English takeaway that requires no
  notation to parse.

## Technical constraints

- **AF3 weights, used directly, never redistributed.** As of 2026-07-23, AF3's
  model parameters are a direct download from Google, no approval step, but
  still non-commercial use only and the parameters file itself is still not
  redistributable. Nothing shipped to students may include the weights file.
  Ship only derived output (tensors dumped from a real AF3 run), each carrying
  conspicuous notice under the AF3 Output Terms of Use. See `DECISIONS.md`
  (2026-09-15 entry) for the full decision and `SPEC.md` for the constraints it
  imposes.
- **Browser-based, no install.** Students should open a link. Publishing as a
  web artifact is the likely delivery route.
- **The Architecture Explainer is the delivery framework for all new content.**
  `explainer/` is a vendored copy of `ramithuh/explainer` (AGPL-3.0, see
  `explainer/LICENSE` and `THIRD_PARTY_NOTICES.md`); its own `AGENTS.md`
  and `CLAUDE.md` hold the authoring rules for architecture YAML, views,
  and pseudocode -- read those before touching anything under
  `explainer/`. The GitHub Pages build runs the Ruby explainer build
  BEFORE the Node screens build (`.github/workflows/deploy-pages.yml`) --
  the Ruby build wholesale-replaces its output directory, so reversing
  this order silently destroys the screens output. See `SPEC.md`'s
  "Delivery architecture" section for the full picture.
- **Screens that need no model output come first.** Several planned screens
  (triangle inequality sandbox, attention mask picture, tokenization, the
  atom-token-atom hourglass) involve no model run at all. Build those first,
  ahead of anything gated on the AF3 tensor dump.

## Conventions

- Record architectural choices in `DECISIONS.md` as they are made. The first
  entry is the data-source decision above (2026-09-15).
- Per-screen design detail (from the brainstorming skill or otherwise) goes
  into that screen's own entry in `SPEC.md`, not a separate design-doc
  directory. `SPEC.md` is already "the full screen-by-screen specification";
  a parallel `specs/` folder duplicates it under a confusingly similar name.
  Cross-cutting architectural decisions (delivery model, data source, and the
  like, not single-screen detail) still go in `DECISIONS.md` as their own
  dated entries.
- Keep example complexes small and fixed. One peptide plus one ligand plus one
  ion is enough to demonstrate the token abstraction, and small enough that real
  tensors stay shippable. The actual complex (Ala-Gly-Val-Leu-Ser-Lys + ATP +
  Mg2+, 71 atoms / 38 tokens) is fixed in `DECISIONS.md` (2026-09-18 entry) --
  reuse it, don't invent a different one per screen.

## Git and GitHub

Repo: https://github.com/gasredX09/af3-visualizer (public). Tracked branch: `main`.

- Review `git status` and the staged diff before every commit. Scan for secrets,
  API keys, and unexpectedly large files (precomputed tensors, model weights)
  before staging.
- Stage explicit paths when unrelated work is present rather than a blanket `git
  add -A`.
- Write a real commit message describing what changed and why, not a generic one.
- Never force-push, never amend an existing commit, always create a new commit.
- Never skip hooks or bypass signing.
- Do not discard or rewrite changes outside the requested scope.
- Do not create a new remote, a new branch, a PR, or a public release without the
  user explicitly requesting it.
- Never commit credentials, tokens, or environment files.
- The model parameters file itself must never enter Git history (see the AF3
  weights constraint above). Double-check before committing that nothing under
  a precomputed-tensor or model-output directory is the weights file itself,
  and that shipped derived-output assets carry the required AF3 Output Terms
  of Use notice.
- Standing authorization: commit and push meaningful completed work (a finished
  screen, a passing feature slice, a doc update) on the tracked branch (`main`)
  without waiting to be asked each time (2026-09-14). "Meaningful" means a
  completed, coherent unit of work, not every intermediate edit. Still follow
  every hygiene rule above first (review diff, real message, no force-push/amend,
  no new remote/branch/PR/release without being asked).
