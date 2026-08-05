/**
 * Build guard: SUPABASE_SERVICE_ROLE_KEY must only be referenced from server-only
 * files. Any client component ("use client") that references it fails the build.
 * See Part 18.2 / acceptance #18.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOT = process.cwd();
const IGNORE = new Set(["node_modules", ".next", ".git", "out", "build", "scripts"]);
const EXTS = new Set([".ts", ".tsx", ".js", ".jsx"]);
const KEY = "SUPABASE_SERVICE_ROLE_KEY";

const offenders: string[] = [];

function walk(dir: string) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry)) continue;
    const full = join(dir, entry);
    const rel = full.slice(ROOT.length + 1);
    if (statSync(full).isDirectory()) {
      walk(full);
    } else if (EXTS.has(extname(full))) {
      const text = readFileSync(full, "utf8");
      const isClient = /^\s*["']use client["']/m.test(text);
      if (isClient && text.includes(KEY)) offenders.push(rel);
    }
  }
}

walk(ROOT);

if (offenders.length > 0) {
  console.error(`❌ ${KEY} referenced in client component(s):`);
  for (const f of offenders) console.error(`   - ${f}`);
  process.exit(1);
}
console.log(`✅ ${KEY} is not referenced in any client component.`);
