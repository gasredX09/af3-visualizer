#!/usr/bin/env node
// Copy only the source files needed by the synthetic AF3 trace. Run after
// the Ruby Pages builder, which owns and replaces the site output directory.

import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "trace");
const output = join(root, "dist", "trace");
const files = ["index.html", "trace.css", "model.mjs", "app.mjs"];

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const file of files) await copyFile(join(source, file), join(output, file));
console.log(`Built AF3 synthetic trace into ${output}`);
