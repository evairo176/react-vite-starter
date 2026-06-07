// Static check for the TanStack Router migration.
//
// Validates Requirement 18.8: the frontend must list no `react-router-dom`
// dependency in package.json and contain no import that references it.
//
// Fails (non-zero exit) if:
//   (a) any file under src/ references the string "react-router-dom", or
//   (b) "react-router-dom" appears in package.json dependencies/devDependencies.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const srcDir = join(projectRoot, "src");
const FORBIDDEN = "react-router-dom";

/** Recursively collect files under a directory. */
function collectFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const errors = [];

// (a) Grep src/ for forbidden references.
const sourceFiles = collectFiles(srcDir).filter((f) =>
  /\.(tsx?|jsx?|mjs|cjs)$/.test(f),
);
for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  if (content.includes(FORBIDDEN)) {
    const lines = content.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes(FORBIDDEN)) {
        errors.push(
          `Found "${FORBIDDEN}" reference in ${file}:${idx + 1}\n    ${line.trim()}`,
        );
      }
    });
  }
}

// (b) Inspect package.json dependency maps.
const pkg = JSON.parse(
  readFileSync(join(projectRoot, "package.json"), "utf8"),
);
for (const field of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
  if (pkg[field] && Object.prototype.hasOwnProperty.call(pkg[field], FORBIDDEN)) {
    errors.push(`Found "${FORBIDDEN}" in package.json ${field}`);
  }
}

if (errors.length > 0) {
  console.error("Router migration check FAILED:\n");
  for (const err of errors) {
    console.error(`  - ${err}`);
  }
  process.exit(1);
}

console.log(
  `Router migration check PASSED: no "${FORBIDDEN}" references in src/ ` +
    `(${sourceFiles.length} files scanned) and none in package.json.`,
);
