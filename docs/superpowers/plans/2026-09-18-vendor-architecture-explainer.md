# Vendor the Architecture Explainer (sub-project 0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vendor `ramithuh/explainer` into `af3-visualizer` at `explainer/`, get its existing `af3_pairformer` source set deployed live on GitHub Pages as the site root, and move the three already-built screens to `/screens/` in the deployed site — with no content changes to either side, proving the combined build/deploy pipeline before any new AF3 content is authored.

**Architecture:** `explainer/` is a self-contained vendored subtree (its own `scripts/`, `lib/`, `renderer/`, `architectures/`, etc.) that works unmodified when nested, because its tooling resolves its own root from the script file's own location (`__dir__`), not from the process's working directory. Two independent static-site builders write into one shared `dist/`: the vendored Ruby builder runs first because it wholesale-replaces its output directory, then the existing Node builder adds `dist/screens/` on top.

**Tech Stack:** Ruby (stdlib only, no gems) for the vendored explainer; Node.js (already in use) for the existing screens build; GitHub Actions for CI/deploy.

**Spec:** `SPEC.md` ("Delivery architecture: the Architecture Explainer (2026-09-18 pivot)" section and "Delivery" section) and `DECISIONS.md` (2026-09-18, "Pivot to the Architecture Explainer framework"). Read both before starting — this plan implements them and does not repeat their rationale.

## Global Constraints

- No content changes to the vendored `af3_pairformer` architecture in this plan — sub-project 0 is infrastructure only. Do not edit any file under `explainer/architectures/`, `explainer/views/`, `explainer/pseudocode/`, or `explainer/standard_blocks/`.
- Keep all 6 vendored source sets (`generic`, `dit`, `af2`, `af3_pairformer`, `genie2`, `genie3`) in the tree; only the **build** is filtered to `af3_pairformer` via `--source-set`.
- **This is a GitHub Pages *project* site** (`gasredx09.github.io/af3-visualizer/`), not a user/org root site. Every link added or generated in this plan must be relative (`screens/`, `../`), never absolute-rooted (`/screens/`, `/`) — an absolute-rooted link would resolve to the wrong host path once deployed.
- The Ruby build (`explainer/scripts/build_pages.rb`) always runs before the Node build (`scripts/build-pages.mjs`) in any build sequence, local or CI — the Ruby build wholesale-replaces its `--output` directory (`rm_rf` + `mv`), so running it second would delete whatever the Node build wrote.
- Never run `git add -A`/`git add .` when staging the vendored tree or any step in this plan — stage explicit paths, per `CLAUDE.md`.
- End every commit message with the `Co-Authored-By`/`Claude-Session` trailer lines from the session's system reminder.
- No worktree — this plan executes directly on `main`, matching how the three existing screens were built.

---

### Task 1: Vendor the explainer tree

**Files:**
- Create: `explainer/` (entire subtree — see file list below)

**Interfaces:**
- Produces: `explainer/scripts/build_pages.rb`, `explainer/scripts/lint_sources.rb`, `explainer/scripts/verify_architecture.rb`, `explainer/architectures/index.yaml`, `explainer/index.html`, `explainer/LICENSE` — all later tasks reference these exact paths.

A reference clone of `ramithuh/explainer` (commit `c59d0ce`, the only commit reachable from a `--depth 1` clone) already exists at `/private/tmp/claude-501/-Users-aryansharanreddyguda-af3-visualizer/84420205-5170-40b8-8ed5-1ef62d4ead96/scratchpad/explainer` from this session's research. Copy from there rather than re-cloning, unless that path no longer exists — if it doesn't, re-clone with `git clone --depth 1 https://github.com/ramithuh/explainer.git` to a scratch location first.

- [ ] **Step 1: Copy the tree, excluding VCS metadata**

```bash
SRC=/private/tmp/claude-501/-Users-aryansharanreddyguda-af3-visualizer/84420205-5170-40b8-8ed5-1ef62d4ead96/scratchpad/explainer
cd /Users/aryansharanreddyguda/af3-visualizer
mkdir -p explainer
rsync -a --exclude='.git' "$SRC/" explainer/
```

- [ ] **Step 2: Sanity-check the copy**

```bash
test -f explainer/scripts/build_pages.rb && \
test -f explainer/LICENSE && \
test -f explainer/architectures/index.yaml && \
test -f explainer/AGENTS.md && \
echo OK
```

Expected: `OK` printed, no missing-file errors. Also compare file counts:

```bash
diff <(cd "$SRC" && find . -type f -not -path './.git/*' | sort) \
     <(cd explainer && find . -type f | sort)
```

Expected: no output (identical file lists).

- [ ] **Step 3: Confirm nested `.gitignore` covers vendored build output**

`explainer/.gitignore` (now at `af3-visualizer/explainer/.gitignore`) already contains `dist/` and `.dist.explainer-pages-output`. Git honors nested `.gitignore` files automatically, so no change to the root `.gitignore` is needed. Confirm:

```bash
cat explainer/.gitignore
```

Expected: two lines, `dist/` and `.dist.explainer-pages-output`.

- [ ] **Step 4: Stage and review**

```bash
git add explainer/
git status --porcelain | head -5
git status --porcelain | wc -l
```

Expected: every line staged (`A ` prefix), roughly 150 files. Scan for anything unexpected (no `dist/`, no stray editor files).

- [ ] **Step 5: Commit**

```bash
git commit -m "$(cat <<'EOF'
Vendor ramithuh/explainer into explainer/

Brings in the Architecture Explainer tool (declarative YAML DSL, Ruby
compiler/verifier, JS renderer with semantic zoom) as a self-contained
subtree, per DECISIONS.md's 2026-09-18 pivot entry. Vendored as-is from
ramithuh/explainer commit c59d0ce, no content changes. Licensed AGPL-3.0
(explainer/LICENSE); attribution: Ramith Hettiarachchi.

No behavior changes to af3-visualizer yet -- this only adds the tree.
Wiring it into the build/deploy pipeline is later tasks in this plan.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** `git show --stat HEAD | tail -3` shows ~150 files added under `explainer/`; `ls explainer/` shows the top-level directories (`architectures/`, `lib/`, `renderer/`, `scripts/`, `test/`, etc.).

---

### Task 2: Verify the vendored test suite locally

**Files:** none expected; only touch files if a real, minimal fix is needed (see Step 5).

**Interfaces:**
- Consumes: `explainer/` from Task 1.

The vendored `AGENTS.md` lists ~60 `ruby -Ilib:test test/*.rb` invocations as its full regression suite, meant to run "when schemas, validators, projection, manifest compilation, or renderer infrastructure changes" — not as a standing CI gate. Run it once now, right after the transplant, as the one-time proof nothing broke in the move. It does not run again in CI (Task 5's CI gate is lighter — lint + the build's own internal verification).

The local system Ruby is 2.6.10 (old, past upstream EOL). Get a modern local interpreter first rather than assuming 2.6.10 can run a test suite written against current Ruby idioms.

- [ ] **Step 1: Check for an existing modern Ruby**

```bash
ruby -v
ls /opt/homebrew/opt/ruby*/bin/ruby 2>/dev/null
```

- [ ] **Step 2: Install a modern Ruby via Homebrew if none found**

```bash
brew install ruby
/opt/homebrew/opt/ruby/bin/ruby -v
```

Expected: version 3.x printed. (Homebrew's `ruby` formula does not alter the system `ruby` on `PATH` by default — this does not change the user's shell environment.)

- [ ] **Step 3: Run the full suite with the modern interpreter**

```bash
RUBY=/opt/homebrew/opt/ruby/bin/ruby
cd /Users/aryansharanreddyguda/af3-visualizer/explainer
FAILED=""
for f in $(grep -oE 'test/[a-z_]+\.rb' AGENTS.md | sort -u); do
  echo "=== $f ==="
  $RUBY -Ilib:test "$f" || FAILED="$FAILED $f"
done
echo "FAILED TESTS: $FAILED"
```

Expected: `FAILED TESTS:` is empty. This is the pass condition for this task.

- [ ] **Step 4: Also run the linter, verifier, and manifest check**

```bash
$RUBY scripts/lint_sources.rb
$RUBY scripts/verify_architecture.rb --source-set af3_pairformer
$RUBY renderer/architecture/build-manifest.rb
$RUBY renderer/architecture/build-manifest.rb --check
```

Expected: all four exit 0. (These are read-only checks against the vendored, unmodified sources — a clean pass here is expected, not aspirational; if any fails, treat it as a real defect to diagnose, not something to route around.)

- [ ] **Step 5: If anything failed, diagnose and fix minimally**

A failure here means either a genuine incompatibility introduced by the file move (unlikely — no paths changed, everything moved as a unit) or an environment gap (e.g. a missing stdlib gem under Homebrew's Ruby build). Read the actual error before changing anything. If a fix is needed, make the smallest possible change, re-run only the previously-failing command to confirm, then commit that fix on its own:

```bash
git add <the specific file(s) changed>
git commit -m "$(cat <<'EOF'
Fix <specific issue> found running the vendored test suite locally

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

If nothing failed, this task produces no commit — record in the SDD ledger that the full suite, linter, verifier, and manifest check all passed cleanly under Ruby 3.x, with the exact `ruby -v` output.

**Deliverable check:** a recorded, reproducible pass (or an explicit, understood, minimal fix) for the full vendored test suite plus linter/verifier/manifest-check, under a modern Ruby.

---

### Task 3: Make the Node screens build additive, not destructive

**Files:**
- Modify: `scripts/build-pages.mjs`

**Interfaces:**
- Consumes: nothing from earlier tasks (this task is independent of Tasks 1-2; it can be done in parallel in principle, but is sequenced here because Task 6 needs it).
- Produces: `dist/screens/*.html` and `dist/screens/index.html`, written without touching anything else already present under `dist/`. Later tasks (5, 6, 7) rely on this exact behavior.

Today `scripts/build-pages.mjs` wipes the *entire* `dist/` directory and writes its own `dist/index.html`. Once the Ruby build owns `dist/index.html` and everything else at the root, this script must only ever touch `dist/screens/`.

- [ ] **Step 1: Read the current file to confirm line numbers before editing**

```bash
cat -n /Users/aryansharanreddyguda/af3-visualizer/scripts/build-pages.mjs
```

- [ ] **Step 2: Replace the whole file with the additive version**

```javascript
#!/usr/bin/env node
// Builds the legacy screens (built before the Architecture Explainer pivot,
// DECISIONS.md 2026-09-18) into dist/screens/. Additive only: this script
// must never touch anything outside dist/screens/, because the Ruby
// explainer build (explainer/scripts/build_pages.rb) owns the rest of
// dist/ and runs first, wholesale-replacing its own output directory. If
// this script ran first, or wiped all of dist/, the Ruby build's output
// would be silently destroyed.
//
// Each file under screens/ is authored as an Artifact fragment (per
// DECISIONS.md's one-Artifact-per-screen entry, now superseded for future
// screens but still describing how these three were built): no
// <!DOCTYPE>, <html>, <head>, or <body> tags of its own. This script wraps
// each fragment in a real standalone document (charset + viewport meta)
// and writes the result into dist/screens/, alongside a generated index
// page linking every screen and back to the explainer root.
//
// Run: node scripts/build-pages.mjs

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCREENS_DIR = join(ROOT, 'screens');
const DIST_DIR = join(ROOT, 'dist');
const DIST_SCREENS_DIR = join(DIST_DIR, 'screens');

function wrapDocument(title, fragment) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
${fragment}
</body>
</html>
`;
}

function extractTitle(fragment, fallback) {
  const match = fragment.match(/<title>([^<]*)<\/title>/i);
  return match ? match[1].trim() : fallback;
}

async function buildScreens() {
  const entries = await readdir(SCREENS_DIR, { withFileTypes: true });
  const htmlFiles = entries
    .filter((e) => e.isFile() && e.name.endsWith('.html'))
    .map((e) => e.name)
    .sort();

  const screens = [];
  await mkdir(DIST_SCREENS_DIR, { recursive: true });

  for (const name of htmlFiles) {
    const fragment = await readFile(join(SCREENS_DIR, name), 'utf8');
    const title = extractTitle(fragment, name.replace(/\.html$/, ''));
    await writeFile(join(DIST_SCREENS_DIR, name), wrapDocument(title, fragment));
    screens.push({ name, title });
  }

  return screens;
}

function renderIndex(screens) {
  const items = screens
    .map((s) => `      <li><a href="${s.name}">${s.title}</a></li>`)
    .join('\n');

  const fragment = `<title>AF3 Visualizer: earlier screens</title>
<style>
  :root { color-scheme: light dark; }
  body {
    margin: 0;
    padding: clamp(24px, 5vw, 56px) clamp(16px, 4vw, 48px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #faf9f5;
    color: #141413;
    max-width: 720px;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #14150e; color: #e7ece4; }
    a { color: #6fc7b0; }
  }
  h1 { margin: 0 0 8px; }
  p.sub { color: #5b6b62; max-width: 60ch; }
  ul { padding-left: 1.2em; line-height: 1.8; font-size: 1.05rem; }
  p.back { margin-top: 2em; }
</style>
<h1>Earlier standalone screens</h1>
<p class="sub">
  Built before the AF3 Visualizer moved to the Architecture Explainer.
  Kept live; not part of the explorer's semantic-zoom boards.
</p>
<ul>
${items}
</ul>
<p class="back"><a href="../">&larr; Back to the AF3 architecture explainer</a></p>
`;
  return wrapDocument('AF3 Visualizer: earlier screens', fragment);
}

async function main() {
  await rm(DIST_SCREENS_DIR, { recursive: true, force: true });
  const screens = await buildScreens();
  await writeFile(join(DIST_SCREENS_DIR, 'index.html'), renderIndex(screens));
  console.log(`Built ${screens.length} screen(s) and screens/index.html into ${DIST_SCREENS_DIR}`);
  for (const s of screens) console.log(`  - screens/${s.name} (${s.title})`);
}

main();
```

- [ ] **Step 3: Verify it no longer touches anything outside `dist/screens/`**

```bash
grep -n "DIST_DIR" /Users/aryansharanreddyguda/af3-visualizer/scripts/build-pages.mjs
```

Expected: `DIST_DIR` appears only in its own definition and as the basis for `DIST_SCREENS_DIR` — no `rm`/`writeFile`/`mkdir` call takes `DIST_DIR` directly.

- [ ] **Step 4: Smoke-test in isolation**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
rm -rf dist
mkdir -p dist && touch dist/PLACEHOLDER-should-survive
node scripts/build-pages.mjs
ls dist/
ls dist/screens/
test -f dist/PLACEHOLDER-should-survive && echo "PASS: unrelated dist/ content survived"
```

Expected: `dist/screens/` contains 3 screen HTML files plus `index.html`; `dist/PLACEHOLDER-should-survive` still exists, proving the script no longer wipes all of `dist/`. Clean up:

```bash
rm -rf dist
```

- [ ] **Step 5: Commit**

```bash
git add scripts/build-pages.mjs
git commit -m "$(cat <<'EOF'
Make the Node screens build write only dist/screens/

The Ruby explainer build now owns the rest of dist/ (site root, once
wired in the next task) and wholesale-replaces its own output directory,
so this script must never touch anything outside dist/screens/ or it
will race with, and can destroy, the explainer's output depending on
run order. Also points the screens index page back at the explainer
root instead of generating its own site-root index.html.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 4's isolated smoke test passes (unrelated `dist/` content survives a run of this script).

---

### Task 4: Cross-link the explainer landing page and drop third-party analytics

**Files:**
- Modify: `explainer/index.html`

**Interfaces:**
- Consumes: `explainer/index.html` from Task 1.

Two changes to this one file:

1. `explainer/index.html` ships a hardcoded Microsoft Clarity analytics snippet pointed at the upstream author's own Clarity project (`xrj736g7b7`). Shipping this unmodified would silently send this project's own visitor traffic to a third party's analytics account that has nothing to do with `af3-visualizer`. Remove it. (If analytics are wanted later, that's a separate, explicit decision with the user's own tracking ID — out of scope here.)
2. Add a relative link to the legacy screens, matching Task 3's back-link.

- [ ] **Step 1: Read the current file to confirm exact text to remove/replace**

```bash
cat -n /Users/aryansharanreddyguda/af3-visualizer/explainer/index.html
```

- [ ] **Step 2: Remove the Clarity script block**

Delete these lines (currently lines 7-13):

```html
    <script type="text/javascript">
      (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "xrj736g7b7");
    </script>
```

- [ ] **Step 3: Add the legacy-screens link**

Find this block:

```html
        <div>
          <p class="eyebrow">Interactive model maps</p>
          <h1>Architecture explainers</h1>
          <p>Select a model to explore its architecture.</p>
        </div>
```

Replace it with:

```html
        <div>
          <p class="eyebrow">Interactive model maps</p>
          <h1>Architecture explainers</h1>
          <p>Select a model to explore its architecture.</p>
          <p>Looking for the earlier standalone screens? <a href="screens/">View them here.</a></p>
        </div>
```

- [ ] **Step 4: Confirm the file is still well-formed**

```bash
python3 -c "
import re
with open('/Users/aryansharanreddyguda/af3-visualizer/explainer/index.html') as f:
    content = f.read()
assert 'clarity' not in content.lower(), 'Clarity script still present'
assert 'screens/' in content, 'legacy-screens link missing'
assert content.count('<script') == content.count('</script>'), 'unbalanced script tags'
print('OK')
"
```

Expected: `OK`.

- [ ] **Step 5: Commit**

```bash
git add explainer/index.html
git commit -m "$(cat <<'EOF'
Link the explainer landing page to /screens/; drop third-party analytics

The vendored index.html shipped a hardcoded Microsoft Clarity snippet
pointed at the upstream author's own analytics project -- not something
this project's traffic should be sent to. Removed. Added a relative
link to the legacy screens (Task 3) from the landing page header.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 4's assertions pass.

---

### Task 5: Wire both builds into GitHub Actions

**Files:**
- Modify: `.github/workflows/deploy-pages.yml`

**Interfaces:**
- Consumes: `explainer/scripts/lint_sources.rb` and `explainer/scripts/build_pages.rb` (Task 1), `scripts/build-pages.mjs` (Task 3).

- [ ] **Step 1: Read the current workflow file**

```bash
cat -n /Users/aryansharanreddyguda/af3-visualizer/.github/workflows/deploy-pages.yml
```

- [ ] **Step 2: Replace the `build` job's steps**

Replace the entire file with:

```yaml
name: Deploy Pages

on:
  push:
    branches: [main]
  workflow_dispatch: {}

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: '3.3'
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - name: Lint explainer sources
        run: ruby explainer/scripts/lint_sources.rb
      - name: Build architecture explainer (site root)
        run: ruby explainer/scripts/build_pages.rb --source-set af3_pairformer --output dist
      - name: Build legacy screens (dist/screens/)
        run: node scripts/build-pages.mjs
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Note the invocation: `ruby explainer/scripts/build_pages.rb ... --output dist` is run from the **repo root** (the workflow's default working directory, no `working-directory:` override). `build_pages.rb` resolves its own source tree relative to its script file's location (`explainer/`), independent of the process's working directory — but it resolves the `--output` argument relative to the working directory, so `--output dist` from repo root correctly means `<repo root>/dist`, matching where `scripts/build-pages.mjs` (run immediately after, also from repo root) expects to find it.

- [ ] **Step 3: Validate the YAML syntax**

```bash
ruby -ryaml -e "YAML.load_file('/Users/aryansharanreddyguda/af3-visualizer/.github/workflows/deploy-pages.yml'); puts 'valid YAML'"
```

Expected: `valid YAML`.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy-pages.yml
git commit -m "$(cat <<'EOF'
Deploy the explainer and the legacy screens from one workflow

Adds a pinned Ruby 3.3 setup step alongside the existing Node step.
Build order matters: the explainer build runs first since it wholesale-
replaces its --output directory, then the Node build adds dist/screens/
on top. A lint_sources.rb step gates the explainer build; build_pages.rb
runs its own internal verify_sources!/manifest-freshness checks.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01YDVVkAFhvjX9RQvwMiDhBu
EOF
)"
```

**Deliverable check:** Step 3's YAML validation passes. (Full end-to-end validation of this workflow happens in Task 7, once it actually runs in CI.)

---

### Task 6: Local end-to-end build and click-through verification

**Files:** none (verification only).

**Interfaces:**
- Consumes: everything from Tasks 1-5.

- [ ] **Step 1: Clean build from repo root, both builders, in the CI order**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
rm -rf dist
RUBY=/opt/homebrew/opt/ruby/bin/ruby
$RUBY explainer/scripts/lint_sources.rb
$RUBY explainer/scripts/build_pages.rb --source-set af3_pairformer --output dist
node scripts/build-pages.mjs
```

Expected: both commands exit 0. `explainer/scripts/build_pages.rb`'s own output line reports the file count and `source sets: af3_pairformer`.

- [ ] **Step 2: Confirm the combined output shape**

```bash
test -f dist/index.html && echo "root index: OK"
test -f dist/screens/index.html && echo "screens index: OK"
ls dist/screens/*.html
test -f dist/renderer/architecture/manifest-af3_pairformer.js && echo "af3 manifest: OK"
test -f dist/renderer/architecture/manifest-dit.js && echo "FAIL: dit manifest should not be published" || echo "dit correctly excluded: OK"
```

Expected: all four `OK` lines print (dit's manifest correctly absent, since the build filtered to `af3_pairformer` only — `dit` stays in the vendored *source* tree per the Global Constraints, but is not part of the *published* build).

- [ ] **Step 3: Serve locally and click through in a real browser**

```bash
cd dist && python3 -m http.server 8096 &
```

Open `http://localhost:8096/` in a browser. Confirm:
- The explainer landing page loads, lists exactly one architecture (AlphaFold 3 Pairformer), no Clarity network request fires (check the browser's network tab for any request to `clarity.ms`).
- The "Looking for the earlier standalone screens?" link navigates to `http://localhost:8096/screens/` and that page lists all three screens.
- Each screen link opens and renders correctly (reuse the same visual check used when these screens were first built).
- The "Back to the AF3 architecture explainer" link on the screens page returns to `http://localhost:8096/`.
- Click into the AlphaFold 3 Pairformer explainer itself; confirm a board renders (semantic-zoom boxes, not a blank page or a JS error in the console).

Stop the server when done:

```bash
kill %1
```

- [ ] **Step 4: Record the result**

No commit for this task (verification only). Note in the SDD ledger: local build succeeded, combined output shape confirmed, and the manual click-through in Step 3 passed with no console errors and no Clarity network requests.

**Deliverable check:** Step 2's assertions all pass, and the manual click-through in Step 3 confirms working navigation both directions and a rendering explainer board.

---

### Task 7: Push and verify the live deploy

**Files:** none (verification only).

**Interfaces:**
- Consumes: all prior tasks' commits.

- [ ] **Step 1: Review what's about to be pushed**

```bash
cd /Users/aryansharanreddyguda/af3-visualizer
git log --oneline origin/main..HEAD
git status --porcelain
```

Expected: the commits from Tasks 1, 3, 4, 5 (and Task 2's fix commit, if any) listed in order; working tree clean.

- [ ] **Step 2: Push**

```bash
git push
```

- [ ] **Step 3: Watch the Actions run**

```bash
gh run list --branch main --limit 1
gh run watch
```

Expected: the `Deploy Pages` workflow completes successfully (both `build` and `deploy` jobs green). If it fails, read the failing step's log before making any change — do not guess.

- [ ] **Step 4: Verify the live URLs**

```bash
curl -sI https://gasredx09.github.io/af3-visualizer/ | head -1
curl -sI https://gasredx09.github.io/af3-visualizer/screens/ | head -1
curl -s https://gasredx09.github.io/af3-visualizer/ | grep -o '<title>[^<]*</title>'
curl -s https://gasredx09.github.io/af3-visualizer/screens/ | grep -o '<title>[^<]*</title>'
```

Expected: both return `HTTP/2 200`; the root page's title is `Architecture Explainers`; the screens page's title is `AF3 Visualizer: earlier screens`.

- [ ] **Step 5: Record the result**

No commit for this task. Note in the SDD ledger: live deploy confirmed at both URLs, workflow run link, and that this closes out sub-project 0.

**Deliverable check:** both `curl` checks in Step 4 return `200` with the expected titles.

---

## After this plan lands

Per this project's own convention (transient plan files get deleted once their durable content is folded into `SPEC.md`/`DECISIONS.md`, which already happened before this plan was written): delete this plan file and its SDD workspace once Task 7 passes and the final whole-plan review is clean. Sub-project 1 (authoring the full AF3 architecture) gets its own brainstorming pass and its own plan — do not start it under this plan.
