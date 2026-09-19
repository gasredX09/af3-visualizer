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

function wrapDocument(fragment) {
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
    await writeFile(join(DIST_SCREENS_DIR, name), wrapDocument(fragment));
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
  return wrapDocument(fragment);
}

async function main() {
  await rm(DIST_SCREENS_DIR, { recursive: true, force: true });
  const screens = await buildScreens();
  await writeFile(join(DIST_SCREENS_DIR, 'index.html'), renderIndex(screens));
  console.log(`Built ${screens.length} screen(s) and screens/index.html into ${DIST_SCREENS_DIR}`);
  for (const s of screens) console.log(`  - screens/${s.name} (${s.title})`);
}

main();
