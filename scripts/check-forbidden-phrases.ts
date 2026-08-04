/**
 * Build guard: the phrase "guaranteed profit" (in any casing) must never appear
 * in source or content. Resale figures are always framed as examples.
 * Fails the build (exit 1) on any match. See Part 12.2 / acceptance #31.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const IGNORE = new Set(["node_modules", ".next", ".git", "out", "build"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx", ".md", ".mdx", ".json", ".sql", ".css"]);
const FORBIDDEN = /guaranteed\s+profit/i;
// Self-reference in this guard script and its docs is allowed.
const SELF = new Set(["scripts/check-forbidden-phrases.ts"]);

const offenders: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length + 1);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (EXTS.has(extname(full)) && !SELF.has(rel)) {
      const text = readFileSync(full, "utf8");
      if (FORBIDDEN.test(text)) offenders.push(rel);
    }
  }
}

walk(ROOT);

if (offenders.length > 0) {
  console.error('❌ Forbidden phrase "guaranteed profit" found in:');
  for (const f of offenders) console.error(`   - ${f}`);
  process.exit(1);
}
console.log('✅ No "guaranteed profit" phrasing found.');
