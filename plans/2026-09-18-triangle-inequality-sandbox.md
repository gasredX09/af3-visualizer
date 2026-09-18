# Triangle Inequality Sandbox Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the first AF3 visualizer screen, a self-contained interactive
diagram teaching the triangle inequality constraint on pairwise distances.

**Architecture:** One pure JS geometry module (range bound, clamp, 2D
triangle layout via law of cosines), TDD'd standalone via Node, then inlined
into a single self-contained HTML artifact with an SVG diagram, two distance
sliders, and a draggable range marker. No framework, no build step, no
runtime data.

**Tech Stack:** Vanilla JS, inline SVG, plain CSS. Node (already available,
v24.8.0) used only as a throwaway dev-time test runner for the pure
functions; nothing Node-related ships in the artifact.

**Spec:** `SPEC.md`, "Triangle inequality sandbox" entry under "Making an
abstract idea physical" (`## Supporting visualizations`). Screen delivery
model: `DECISIONS.md`, 2026-09-17 entry (one self-contained Artifact per
screen).

## Global Constraints

- Three nodes named after real entities from the fixed example complex (two
  peptide residues, the magnesium ion), not abstract `i, j, k` — label both,
  concrete name first, per `CLAUDE.md`'s concrete-before-abstract
  convention. (`SPEC.md`)
- Distances at realistic protein/ligand scale, roughly 3-20 Å, not unitless.
  (`SPEC.md`)
- Bound formula: `|d(i,k) - d(j,k)| <= d(i,j) <= d(i,k) + d(j,k)`. (`SPEC.md`)
- One always-visible plain-English takeaway, no notation required to parse
  it. (`CLAUDE.md`)
- Single self-contained HTML file: inline SVG, vanilla JS, no framework, no
  build step, no external libraries, no runtime data fetch. (`SPEC.md`)
- Theme-aware (light/dark) and responsive down to ~400px width, per the
  Artifact tool's own rules.
- No AF3 model output of any kind; this screen needs none. (`SPEC.md`)
- Git hygiene from `CLAUDE.md`: review diff before commit, explicit paths,
  real commit message, no force-push/amend.

---

## Design decision made during planning (not in SPEC.md, needed to resolve a gap)

`SPEC.md` describes the marker as draggable along the `d(i,j)` range but
doesn't say what value drives the *drawn* triangle shape, since `d(i,j)`
itself is a range, not a fixed number, until something picks a point in it.
Resolution: **the marker's own current position is the live `d(i,j)` value
used to lay out the triangle.** This is tighter than an arbitrary fixed
choice (e.g. always mid-range) because it makes the marker mean something
concrete: it represents one candidate pairwise distance, and the diagram
shows the shape that value implies. Consequences, both already implied by
the existing design and made explicit here for the implementer:

- Marker starts at the midpoint of the initial range.
- When a slider moves and the range changes, if the marker's current value
  now falls outside the new range, it is silently reclamped (no flash —
  this is an automatic reflow, not a user attempting an invalid value).
- Only an active user drag past a bound triggers the red flash + snap-back.

---

### Task 1: Pure geometry functions, TDD'd via Node

**Files:**
- Create (scratchpad, throwaway, not committed): `/private/tmp/claude-501/-Users-aryansharanreddyguda-af3-visualizer/*/scratchpad/triangle-math.js` and `/private/tmp/claude-501/-Users-aryansharanreddyguda-af3-visualizer/*/scratchpad/triangle-math.test.js` (use the actual scratchpad path from your environment's system prompt)

**Interfaces:**
- Produces: `triangleRange(dik, djk) -> [min, max]`, `clampToRange(value, min, max) -> number`, `layoutTriangle(dik, djk, dij) -> {i: {x, y}, j: {x, y}, k: {x, y}}`. Task 2 copies these three function bodies verbatim into the artifact's inline `<script>`.

- [ ] **Step 1: Write the failing tests**

```javascript
// triangle-math.test.js
const assert = require('node:assert');
const { triangleRange, clampToRange, layoutTriangle } = require('./triangle-math.js');

// triangleRange
assert.deepStrictEqual(triangleRange(5, 3), [2, 8], 'range for 5,3 should be [2,8]');
assert.deepStrictEqual(triangleRange(4, 4), [0, 8], 'degenerate case: equal distances give lower bound 0');
assert.deepStrictEqual(triangleRange(3, 20), [17, 23], 'range is order-independent of which arg is larger');

// clampToRange
assert.strictEqual(clampToRange(10, 2, 8), 8, 'clamps above max down to max');
assert.strictEqual(clampToRange(-1, 2, 8), 2, 'clamps below min up to min');
assert.strictEqual(clampToRange(5, 2, 8), 5, 'value already in range is unchanged');

// layoutTriangle: verify the returned points actually reproduce the three
// input side lengths (this is the real correctness property — the exact
// x,y values are an implementation detail, the distances are not).
function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
{
  const dik = 5, djk = 3, dij = 6; // valid triangle: 6 is in [2,8]
  const { i, j, k } = layoutTriangle(dik, djk, dij);
  assert.ok(Math.abs(dist(i, j) - dij) < 1e-9, 'i-j distance matches dij');
  assert.ok(Math.abs(dist(i, k) - dik) < 1e-9, 'i-k distance matches dik');
  assert.ok(Math.abs(dist(j, k) - djk) < 1e-9, 'j-k distance matches djk');
}
{
  // near-degenerate: dij at the very top of its valid range (a straight line)
  const dik = 5, djk = 3, dij = 8;
  const { i, j, k } = layoutTriangle(dik, djk, dij);
  assert.ok(Math.abs(dist(i, j) - dij) < 1e-6, 'degenerate i-j distance still matches');
  assert.ok(Math.abs(dist(i, k) - dik) < 1e-6, 'degenerate i-k distance still matches');
  assert.ok(Math.abs(dist(j, k) - djk) < 1e-6, 'degenerate j-k distance still matches');
}

console.log('All triangle-math tests passed.');
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node triangle-math.test.js` (from the scratchpad directory)
Expected: FAIL with a `Cannot find module './triangle-math.js'` error (the
implementation file doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```javascript
// triangle-math.js

/**
 * The triangle inequality bound on the third side, given the other two.
 * Returns [min, max] such that any d(i,j) in this closed interval forms a
 * valid (possibly degenerate, at the endpoints) triangle with dik and djk.
 */
function triangleRange(dik, djk) {
  return [Math.abs(dik - djk), dik + djk];
}

/** Clamp value into [min, max]. */
function clampToRange(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Places three 2D points with the given pairwise distances, for drawing.
 * i is placed at the origin, j on the positive x-axis at distance dij, and
 * k is solved via the law of cosines using the angle at i between edges
 * i-j and i-k. Caller is responsible for ensuring dij is within
 * triangleRange(dik, djk) (values right at or past the bound still
 * produce a point — possibly degenerate/collinear or, past the bound,
 * mathematically inconsistent — this function does not validate that).
 */
function layoutTriangle(dik, djk, dij) {
  const i = { x: 0, y: 0 };
  const j = { x: dij, y: 0 };
  const cosAngleI = (dik * dik + dij * dij - djk * djk) / (2 * dik * dij);
  const angleI = Math.acos(clampToRange(cosAngleI, -1, 1));
  const k = { x: dik * Math.cos(angleI), y: dik * Math.sin(angleI) };
  return { i, j, k };
}

module.exports = { triangleRange, clampToRange, layoutTriangle };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node triangle-math.test.js`
Expected: prints `All triangle-math tests passed.` with no assertion errors.

- [ ] **Step 5: No commit for this task**

These files are scratchpad-only (per this project's environment, temporary
files that aren't part of the shipped artifact don't belong in the repo).
The verified function bodies carry forward into Task 2's inline `<script>`
by hand-copy, not by file reference.

---

### Task 2: Build the self-contained HTML artifact

**Files:**
- Create: `screens/triangle-inequality-sandbox.html`

**Interfaces:**
- Consumes: `triangleRange(dik, djk)`, `clampToRange(value, min, max)`,
  `layoutTriangle(dik, djk, dij)` from Task 1, copied verbatim into this
  file's inline `<script>`.
- Produces: the finished artifact HTML, consumed by Task 3 (publish).

- [ ] **Step 1: Load the required skills before writing any HTML**

Invoke `Skill` with `artifact-design` (required before writing any
artifact) and `artifact-diagramming` (this screen is an SVG diagram with
interaction). Follow their guidance for the design pass and inline-SVG
mechanics — theme tokens, responsive rules, and the design pass are not
optional per those skills' own contracts.

- [ ] **Step 2: Write the HTML structure, CSS, and SVG diagram**

Build `screens/triangle-inequality-sandbox.html` with:

- A `<title>` (e.g. "Triangle Inequality") and a one-sentence `<style>`
  block defining light/dark theme tokens per the artifact rules (`:root`
  for light, `@media (prefers-color-scheme: dark)` guarded by
  `:root:not([data-theme="light"])`, and `:root[data-theme="dark"]` for an
  explicit toggle — all three, per the Artifact tool's theme contract).
- Three labeled nodes: two peptide residues (e.g. "Gly⁴", "Ser⁵" — pick
  concrete residue labels consistent with the project's fixed example
  complex once one exists; placeholder concrete labels are fine here since
  `SPEC.md` hasn't pinned exact residue numbering yet) and the magnesium
  ion ("Mg²⁺"), each also showing its abstract role (`i`, `j`, `k`) once,
  small and secondary.
- An inline `<svg>` drawing the triangle from `layoutTriangle(dik, djk,
  dij)`: solid lines for the i-k and j-k edges (labeled with their current
  slider values and units, "Å"), a dashed line for the i-j edge labeled
  with the live range (e.g. "2.0 – 8.0 Å") instead of one number.
- Two `<input type="range">` sliders, min 3, max 20, step 0.1, one for
  `d(i,k)` and one for `d(j,k)`, each with a visible numeric readout.
- A third slider or draggable handle for the `d(i,j)` marker, constrained
  visually to the current `[min, max]` track but able to receive a drag
  attempt past either end (needed for Step 4's invalid-flash behavior).
- One always-visible sentence, no notation: "Two distances don't fix the
  third, they only bound it, geometry does the rest."
- Layout that stays usable at 400px width (stack elements vertically below
  a breakpoint, per the artifact rules) and keeps a >=16px side gutter.

- [ ] **Step 3: Wire up the interaction logic**

Inline `<script>` at the end of the file:

```javascript
(function () {
  function triangleRange(dik, djk) {
    return [Math.abs(dik - djk), dik + djk];
  }
  function clampToRange(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
  function layoutTriangle(dik, djk, dij) {
    const i = { x: 0, y: 0 };
    const j = { x: dij, y: 0 };
    const cosAngleI = (dik * dik + dij * dij - djk * djk) / (2 * dik * dij);
    const angleI = Math.acos(clampToRange(cosAngleI, -1, 1));
    const k = { x: dik * Math.cos(angleI), y: dik * Math.sin(angleI) };
    return { i, j, k };
  }

  const dikSlider = document.getElementById('dik-slider');
  const djkSlider = document.getElementById('djk-slider');
  const marker = document.getElementById('dij-marker');
  const rangeLabel = document.getElementById('dij-range-label');
  const flash = document.getElementById('invalid-flash');

  // dijValue is the marker's current position in Å — the live value used
  // to draw the triangle. Starts at the midpoint of the initial range.
  let dijValue = null;

  function currentRange() {
    return triangleRange(Number(dikSlider.value), Number(djkSlider.value));
  }

  function redraw() {
    const [min, max] = currentRange();
    if (dijValue === null) {
      dijValue = (min + max) / 2;
    } else {
      // Automatic reflow on slider change: silently reclamp, no flash.
      dijValue = clampToRange(dijValue, min, max);
    }
    rangeLabel.textContent = min.toFixed(1) + ' – ' + max.toFixed(1) + ' Å';
    const { i, j, k } = layoutTriangle(Number(dikSlider.value), Number(djkSlider.value), dijValue);
    // Implementer: map i/j/k model-space coordinates to SVG viewBox
    // coordinates here (scale + center), then set the solid i-k / j-k
    // line endpoints, the dashed i-j line endpoints, and each node
    // circle's cx/cy, plus the marker's position along the range track.
    updateSvgFromPoints(i, j, k); // defined alongside the SVG markup in Step 2
    updateMarkerPosition(dijValue, min, max); // same
  }

  function attemptDijDrag(candidateValue) {
    const [min, max] = currentRange();
    if (candidateValue < min || candidateValue > max) {
      const clamped = clampToRange(candidateValue, min, max);
      dijValue = clamped;
      flash.classList.remove('flash-active');
      // Force reflow so the animation restarts on repeated out-of-range drags.
      void flash.offsetWidth;
      flash.classList.add('flash-active');
    } else {
      dijValue = candidateValue;
    }
    redraw();
  }

  dikSlider.addEventListener('input', redraw);
  djkSlider.addEventListener('input', redraw);
  // Implementer: attach pointerdown/pointermove/pointerup (or drag) handlers
  // on `marker` that compute a candidateValue in Å from pointer position
  // along the range track and call attemptDijDrag(candidateValue).

  redraw();
})();
```

Note for the implementer: `updateSvgFromPoints` and `updateMarkerPosition`
are two small DOM-update functions you write alongside the SVG markup in
Step 2 — they're intentionally left as named calls here rather than
inlined, so the coordinate-mapping code lives next to the SVG elements it
touches. The `flash-active` CSS class (a brief red pulse/border on the
`d(i,j)` label, e.g. a 400ms `@keyframes` animation removed automatically
by the animation ending) is defined in Step 2's `<style>` block.

- [ ] **Step 4: Manually verify against the spec's checklist**

No test framework for this file (per `SPEC.md`'s own verification section —
a two-line bound formula and a DOM-wiring script don't need one). Trace
through the code for each case instead of running it, since this step
happens before Task 3 publishes anything renderable:

- Degenerate case: set `dik = djk` (e.g. both 10) — confirm `triangleRange`
  returns `[0, 20]`, i.e. the lower bound genuinely reaches 0.
- Marker snap-back: confirm `attemptDijDrag` clamps and flashes for a
  candidate below `min` and one above `max`, and does neither for a
  candidate inside `[min, max]`.
- Automatic reflow: confirm that moving a slider such that the old
  `dijValue` falls outside the new range calls `clampToRange` in `redraw`
  (not `attemptDijDrag`), so no flash fires on ordinary slider movement.
- Re-read the CSS against the artifact rules' responsive checklist (side
  gutter >=16px at 400px width, no element with a `min-width` wider than
  the screen, layout stacks rather than overflows).
- Re-read the CSS theme tokens: confirm every color used by the diagram and
  text has a definition on bare `:root` (light) and is redefined in both
  the `prefers-color-scheme: dark` block and the `[data-theme="dark"]`
  block — no color defined only inside a media/attribute block.

- [ ] **Step 5: Commit**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git add screens/triangle-inequality-sandbox.html
git status   # confirm only this one file is staged
git diff --cached | head -100   # skim for anything unexpected
git commit -m "Add triangle inequality sandbox screen

Self-contained HTML artifact: three labeled nodes from the fixed
example complex, two distance sliders, a dashed d(i,j) edge showing
the live valid range, and a draggable marker that snaps back with an
invalid flash when dragged past either bound. Pure geometry functions
(triangleRange, clampToRange, layoutTriangle) TDD'd standalone via
Node before being inlined here (see plans/2026-09-18-triangle-inequality-sandbox.md
Task 1).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu"
git push
```

---

### Task 3: Publish as a Claude Artifact

**Files:**
- Read: `screens/triangle-inequality-sandbox.html` (no modification expected;
  fix forward in this same file if publishing surfaces a bug)

**Interfaces:**
- Consumes: the committed HTML file from Task 2.
- Produces: a published Artifact URL, shared back to the user.

- [ ] **Step 1: Publish**

Call `Artifact` with `file_path` set to `screens/triangle-inequality-sandbox.html`,
a `title` (e.g. "Triangle Inequality"), a one-sentence `description`, and a
`favicon` emoji (first publish only — pick one, e.g. "📐").

- [ ] **Step 2: Interactive verification**

Read the published artifact back (`action: "read"`) or ask the user to open
it, and confirm live: dragging each slider redraws the triangle and updates
the range label; dragging the marker past either end flashes and snaps
back; the layout holds at narrow width; both themes render correctly. Fix
forward in `screens/triangle-inequality-sandbox.html` and republish
(same `file_path`) if anything is off, then re-commit.

- [ ] **Step 3: Report the link to the user**

Share the published URL and a one-line summary of what to try (drag the two
sliders, then try dragging the range marker past either end).

---

## Self-Review

**Spec coverage:** concrete framing (real entities + Å units) → Task 2 Step
2. Live-updating diagram → Task 2 Steps 2-3. Range instead of a fixed
number → Task 1 `triangleRange` + Task 2 Step 2. Invalid-drag flash →
Task 2 Step 3 `attemptDijDrag`. Always-visible takeaway sentence → Task 2
Step 2. Tech constraints (self-contained, no framework, no runtime data) →
Task 2 entire. Verification checklist (degenerate case, snap-back at both
bounds, 400px width, dark mode) → Task 2 Step 4. Delivery as one Artifact →
Task 3.

**Placeholder scan:** the only intentionally-open item is the exact residue
labels/numbering for the fixed example complex, flagged inline in Task 2
Step 2 as pending a project-wide decision (`CLAUDE.md`'s "keep example
complexes small and fixed" convention implies one canonical complex will be
chosen once, reused everywhere) — not a plan gap, since concrete placeholder
labels ("Gly⁴", "Ser⁵", "Mg²⁺") are given so the task is still fully
actionable now.

**Type/name consistency:** `triangleRange`, `clampToRange`, `layoutTriangle`
signatures match verbatim between Task 1's tested implementation and Task
2's inlined copy. `dijValue`, `currentRange()`, `attemptDijDrag`,
`redraw()` are each defined once and used consistently across Task 2's
steps.
