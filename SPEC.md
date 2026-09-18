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
as a picture. Five bands over an illustrative 160-atom range, shown
together at rest with their overlap visible, click a band (or its chip)
to isolate exactly which keys it sees. Note the real mechanism detail:
only the interior band reaches the full 128-atom key width, the four
others are progressively clipped near the range's ends, since there's no
atom beyond either edge, a genuine, correctly-shown edge effect rather
than a simplification. No model needed.

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
