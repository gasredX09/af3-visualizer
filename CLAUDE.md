# AF3 Visualizer

An interactive teaching tool showing how input flows through the AlphaFold 3
architecture. Built for students, delivered alongside an hour-long talk on the
AF3 paper at GenAI BioMed 2026 Fall
(https://genaibiomed.github.io/GenAIBioMed2026Fall/).

Read `SPEC.md` first. It holds the full screen-by-screen specification, the
build priority, and the open data-source decision.

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

- **No gated weights.** AF3's released weights are request-only from Google
  DeepMind, non-commercial, and not redistributable. Nothing shipped to students
  may depend on them. Use precomputed tensors from an open-weights
  reimplementation (Protenix, Boltz, Chai), or a shape-faithful mock. See the
  open decision in `SPEC.md`.
- **Browser-based, no install.** Students should open a link. Publishing as a
  web artifact is the likely delivery route.
- **Screens that need no model output come first.** Several planned screens
  (triangle inequality sandbox, attention mask picture, tokenization, the
  atom-token-atom hourglass) involve no model run at all. Build those before the
  data-source question is settled.

## Conventions

- Record architectural choices in `DECISIONS.md` as they are made. The first
  entry will be the data-source decision above.
- Keep example complexes small and fixed. One peptide plus one ligand plus one
  ion is enough to demonstrate the token abstraction, and small enough that real
  tensors stay shippable.
