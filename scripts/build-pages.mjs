#!/usr/bin/env node
// Builds the static site served by GitHub Pages, into dist/.
//
// Each file under screens/ is authored as an Artifact fragment (per
// DECISIONS.md's one-Artifact-per-screen entry): no <!DOCTYPE>, <html>,
// <head>, or <body> tags of its own, since Claude's Artifact tool injects
// those at publish time. GitHub Pages has no such publish-time wrapping
// step, so this script does the same job: wrap each fragment in a real
// standalone document (charset + viewport meta, since the fragment's own
// responsive CSS depends on the viewport meta actually being present) and
// write the result into dist/, alongside a generated index page linking
// every screen.
//
// Run: node scripts/build-pages.mjs

import { readdir, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCREENS_DIR = join(ROOT, 'screens');
const DIST_DIR = join(ROOT, 'dist');

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
  await mkdir(join(DIST_DIR, 'screens'), { recursive: true });

  for (const name of htmlFiles) {
    const fragment = await readFile(join(SCREENS_DIR, name), 'utf8');
    const title = extractTitle(fragment, name.replace(/\.html$/, ''));
    await writeFile(join(DIST_DIR, 'screens', name), wrapDocument(title, fragment));
    screens.push({ name, title });
  }

  return screens;
}

function renderIndex(screens) {
  const items = screens
    .map((s) => `      <li><a href="screens/${s.name}">${s.title}</a></li>`)
    .join('\n');

  const fragment = `<title>AF3 Visualizer</title>
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
</style>
<h1>AF3 Visualizer</h1>
<p class="sub">
  An interactive teaching tool showing how input flows through the
  AlphaFold 3 architecture.
</p>
<ul>
${items}
</ul>
`;
  return wrapDocument('AF3 Visualizer', fragment);
}

async function main() {
  await rm(DIST_DIR, { recursive: true, force: true });
  const screens = await buildScreens();
  await writeFile(join(DIST_DIR, 'index.html'), renderIndex(screens));
  console.log(`Built ${screens.length} screen(s) and index.html into ${DIST_DIR}`);
  for (const s of screens) console.log(`  - screens/${s.name} (${s.title})`);
}

main();
