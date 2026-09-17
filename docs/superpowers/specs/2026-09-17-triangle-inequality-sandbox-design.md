# Triangle inequality sandbox: design

Status: approved, ready for implementation planning.
Screen 1 of the build priority in `SPEC.md`.

## Purpose

Teach the triangle inequality constraint on pairwise distances, which is the
reason AF3's Pairformer needs triangle updates and triangle attention at all:
two distances alone don't fix the third, they only bound it, and geometry
(not the model) supplies the rest. `SPEC.md` calls for this as the cheapest,
highest conceptual-weight-per-pixel screen in the set, and needs no AF3
model output.

## Screen delivery architecture (applies beyond this screen)

Each of the ~15 planned screens ships as its own self-contained Artifact
(own URL, own HTML file), rather than one growing multi-screen Artifact.
Rationale: simple to build and iterate on one screen without touching
others, easy to link or screenshot a single screen into a talk slide, no
shared build system to maintain. Trade-off accepted: some duplication of
shared CSS/JS/diagram code across screens, and a future lightweight index
artifact will be needed to link them all together. Recorded in
`DECISIONS.md` (2026-09-17 entry) since it governs every future screen, not
just this one.

## Concrete framing

Per `CLAUDE.md`'s "concrete before abstract" convention, the three nodes are
named after real entities from the project's fixed example complex (two
peptide residues and the magnesium ion), not abstract `i, j, k`. Distances
are in realistic protein/ligand Ångström scale (roughly 3-20 Å), not
unitless. A small caption gives the abstract form (`d(i,j)`, `d(i,k)`,
`d(j,k)`) once, alongside the concrete labels, for the ML-vocabulary half of
the audience.

## Layout

- An inline SVG diagram: three labeled circles (the two residues and the
  ion), two solid edges for the slider-controlled distances (`d(i,k)`,
  `d(j,k)`), one dashed edge for `d(i,j)` labeled with its current valid
  range instead of a single number.
- The diagram redraws live as either slider moves. The triangle's rendered
  shape genuinely reflects the two chosen distances (using a fixed, valid
  `d(i,j)` value picked from mid-range purely for the drawing, since `d(i,j)`
  itself is never a free variable here) so it stays visually honest rather
  than decorative.
- Two labeled sliders below the diagram, one per free distance, range
  roughly 3-20 Å.
- One always-visible sentence, no notation: the "two distances bound, don't
  fix, the third" takeaway.

## The invalid-drag demo

A third interactive element: a marker draggable along the `d(i,j)` range
track. Dragging it past either bound triggers a visible "not a valid
triangle" flash and the marker snaps back to the nearest valid bound. Makes
the "why triangle updates exist" point interactive rather than merely
stated: the viewer can feel an attempted geometric inconsistency get
corrected, which is what triangle attention does to a pair representation
that individual pairwise updates would otherwise let drift.

## Tech approach

- Single self-contained HTML artifact: inline SVG, vanilla JS, no framework,
  no build step, no external libraries.
- Purely client-side and deterministic. The bound is
  `|d(i,k) - d(j,k)| <= d(i,j) <= d(i,k) + d(j,k)`. No runtime data fetch, no
  artifact capabilities (no database, no auth).
- Theme-aware (light/dark via the artifact convention), responsive down to
  ~400px width.
- Load the `artifact-design` and `artifact-diagramming` skills before
  writing the HTML, per the Artifact tool's own rules.

## Verification

No test framework needed for a two-line bound formula. Before publishing,
manually check in the running artifact:

- The degenerate case (`d(i,k) == d(j,k)`): lower bound hits 0.
- The invalid-drag marker snaps back correctly at both the lower and upper
  bound.
- Layout at narrow width (~400px) and in dark mode.

## Out of scope (for this screen)

- Any AF3 model output or precomputed tensors (this screen needs none).
- Shared JS/CSS across screens (accepted duplication per the delivery
  decision above).
- The index/landing page linking all screens together (separate, later
  piece of work).
