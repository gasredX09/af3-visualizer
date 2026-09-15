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

## Open decision: where the numbers come from

This choice shapes everything else, so settle it before building.

AF3's own weights are gated (request-only from Google DeepMind, non-commercial,
not redistributable), so a student-facing tool must not depend on them.

**Option A, precomputed real data (recommended).** Run an open-weights
reimplementation (Protenix, Boltz, or Chai) once on two or three fixed example
complexes, dump every intermediate tensor, ship those as static assets. The tool
becomes a player over real numbers. No GPU at runtime, no license problem, works
from a link in a browser.

**Option B, shape-faithful mock.** Implement the real operations with randomly
initialized weights at toy scale. Shapes and data flow are honest, outputs are
meaningless. Cheaper to build, but students notice that the structures are
garbage.

Recommendation is Option A for anything showing model output, with Option B
acceptable for screens that only illustrate shape and flow. Several screens
listed below need no model output at all and are unaffected either way.

When this gets decided, record it in `DECISIONS.md`.

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

**Triangle inequality sandbox.** Three nodes. Drag d(i,k) and d(j,k), watch the
allowed range for d(i,j) tighten live. Thirty seconds of interaction replaces a
paragraph nobody follows. Separate from screen 4 and far cheaper. No model
needed.

**Sequence-local attention mask, drawn.** The 32-query by 128-key block-diagonal
pattern with overlapping key windows. Confusing in prose, obvious as a picture.
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
3. Input flow tracer and diffusion sampler scrubber, once the data-source
   decision is settled and tensors are dumped.
4. Curves (noise schedule, blending coefficients, compute budget). Cheap, add
   whenever.
5. Pair representation explorer, AF2/AF3 comparison, failure-mode screens.

## Delivery

Browser-based, shareable by link, no install for students. Publishing as a web
artifact is the likely route.

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
