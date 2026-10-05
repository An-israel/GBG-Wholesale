#!/usr/bin/env node
/**
 * Safe theme push.
 *
 * A Shopify theme holds two different kinds of file, and they are owned by
 * two different people:
 *
 *   Code      .liquid, .js, .css, locales, settings_schema.json
 *             Written here. The store never changes them.
 *
 *   Content   templates/*.json, sections/*-group.json, settings_data.json
 *             Written by whoever uses the theme editor. Every uploaded image,
 *             every app block, every section reordering lives in these.
 *
 * A plain `shopify theme push` sends both, so it silently replaces content
 * somebody spent an afternoon adding with whatever this repo last happened to
 * hold. That is how the home page images were lost, twice.
 *
 * So this pushes code only, and content is never touched by accident. It has
 * to be asked for, and asking for it pulls the store's own version down first
 * so nothing is overwritten unseen.
 *
 * Usage:
 *   node push.mjs <store>.myshopify.com              push code, leave content alone
 *   node push.mjs <store>.myshopify.com --pull       pull content down into the repo
 *   node push.mjs <store>.myshopify.com --with-content
 *                                                    push content too, after a pull
 */

import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';

const args = process.argv.slice(2);

/* --only takes the paths after it, so a single new template can go up without
   dragging every other template with it. This is the gap that mattered: the
   ignore rules protect the home page, and they protect a brand new template
   just as thoroughly, which means a new page would never arrive. Reaching for
   --with-content to solve that is how the images were lost. */
const onlyAt = args.indexOf('--only');
const onlyPaths =
  onlyAt === -1 ? [] : args.slice(onlyAt + 1).filter((a) => !a.startsWith('--'));

/* Which theme to send to. Without it the CLI asks. A Theme Access password
   can see every theme in the store, so naming one is safer than picking from
   a list in a hurry. */
const themeAt = args.indexOf('--theme');
const themeArg = themeAt === -1 ? [] : ['--theme', args[themeAt + 1]];

/**
 * The store address is recorded in .store, so it never has to be typed or
 * remembered. It was a guessed address, not a login problem, that produced
 * "Looks like you don't have access to this dev store" and cost an afternoon:
 * every command was correct and pointed at a store that was not this one.
 *
 * Typing one is still allowed, for a second store or a test theme, but if it
 * disagrees with .store the push stops and says so rather than failing in the
 * CLI with a message about access.
 */
const RECORDED = existsSync('.store') ? readFileSync('.store', 'utf8').trim() : '';
/* A path after --only, and the id after --theme, are values belonging to
   those flags. Neither is the store, and reading one as the store is how a
   file path ends up in an error message about store addresses. */
const flagValues = new Set(onlyPaths);
if (themeAt !== -1) flagValues.add(args[themeAt + 1]);
const typed = args.find((a) => !a.startsWith('--') && !flagValues.has(a));

if (typed && RECORDED && typed !== RECORDED) {
  console.error(`
✗ That is not the store this repo belongs to, so nothing was pushed.

    you typed:   ${typed}
    this repo:   ${RECORDED}

If you meant the usual store, leave the address off entirely:

    node push.mjs

If you really do mean ${typed}, change .store first.
`);
  process.exit(1);
}

const store = typed || RECORDED;
const wantPull = args.includes('--pull');
const wantContent = args.includes('--with-content');



if (!store) {
  console.error(`
Usage:  node push.mjs [store] [--pull | --only <paths> | --with-content]

  The store address is read from .store, so you do not need to type one.

  (no flag)        Push code only. Images, app blocks and section settings in
                   the theme editor are left exactly as they are. Use this.

  --only <paths>   Push just the files you name, and nothing else. This is how
                   a new page template goes up without touching the home page.

                     node push.mjs <store> --only templates/page.landing.json

  --theme <id>     Send to a particular theme instead of being asked which.

  --pull           Pull the store's content files into this repo, so the
                   images and app blocks someone added are saved in git.

  --with-content   Push every content file. This replaces the home page and
                   every other template with whatever this repo holds. Pull
                   first, or use --only instead, which is almost always what
                   you actually want.
`);
  process.exit(1);
}

/**
 * Shopify checks richtext settings on the way in, and rejects the whole file
 * if any top level node is not a paragraph, a list or a heading. The error
 * arrives mid-push, names only the setting, and leaves the file unwritten
 * while the rest of the push claims success, which is a confusing way to
 * lose a page.
 *
 * So the same rule is applied here first, where the message can say which
 * template, which section and what to do about it.
 */
const TOP_LEVEL_OK = /^\s*(?:<(p|ul|ol|h[1-6])\b[^>]*>[\s\S]*?<\/\1>\s*)+$/i;

function schemaOf(type) {
  const file = `sections/${type}.liquid`;
  if (!existsSync(file)) return null;
  const m = readFileSync(file, 'utf8').match(/\{%\s*schema\s*%\}([\s\S]*?)\{%\s*endschema\s*%\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[1]);
  } catch {
    return null;
  }
}

function richtextIds(schema, blockType) {
  const pool = blockType
    ? (schema.blocks || []).find((b) => b.type === blockType)?.settings || []
    : schema.settings || [];
  return new Set(pool.filter((x) => x.type === 'richtext' && x.id).map((x) => x.id));
}

function checkTemplates() {
  const bad = [];

  for (const file of readdirSync('templates').filter((f) => f.endsWith('.json'))) {
    const path = `templates/${file}`;
    let data;
    try {
      data = JSON.parse(readFileSync(path, 'utf8').replace(/^\s*\/\*[\s\S]*?\*\//, ''));
    } catch {
      continue;
    }
    if (!data.sections) continue;

    for (const [sid, section] of Object.entries(data.sections)) {
      const schema = schemaOf(section.type);
      if (!schema) continue;

      const flag = (where, key, value) => {
        if (value && !TOP_LEVEL_OK.test(String(value))) {
          bad.push({ path, where: `${sid}${where}.${key}`, value: String(value).slice(0, 70) });
        }
      };

      const ids = richtextIds(schema);
      for (const [k, v] of Object.entries(section.settings || {})) if (ids.has(k)) flag('', k, v);

      for (const [bid, block] of Object.entries(section.blocks || {})) {
        const bids = richtextIds(schema, block.type);
        for (const [k, v] of Object.entries(block.settings || {})) if (bids.has(k)) flag(`.${bid}`, k, v);
      }
    }
  }

  if (!bad.length) return;

  console.error('\n✗ Shopify will reject these, so nothing was pushed.\n');
  console.error('  A richtext setting must have every top level node wrapped in');
  console.error('  <p>, <ul>, <ol> or <h1> to <h6>. Bare text is not allowed.\n');
  for (const b of bad) {
    console.error(`    ${b.path}`);
    console.error(`      ${b.where}`);
    console.error(`      currently: ${b.value}`);
    console.error(`      should be: <p>${b.value}</p>\n`);
  }
  process.exit(1);
}

/* The files the theme editor owns. Anything matching these is content. */
const CONTENT = [
  'templates/*.json',
  'templates/customers/*.json',
  'sections/*.json',
  'config/settings_data.json',
];

function run(cmd, cmdArgs) {
  if (process.env.SHOPIFY_CLI_THEME_TOKEN) {
    console.log('Using the Theme Access password from SHOPIFY_CLI_THEME_TOKEN.');
  }
  console.log(`\n$ ${cmd} ${cmdArgs.join(' ')}\n`);
  const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) {
    failureHint();
    process.exit(res.status ?? 1);
  }
}

/**
 * Anything the CLI refuses. The first thing to rule out is the store address,
 * because a wrong one fails with a message about access that reads like a
 * permissions problem and sends you off chasing logins.
 */
function failureHint() {
  console.error(`
Before anything else, check the address above is the right store:

    ${store}

A wrong store address fails with "you don't have access to this dev store",
which sounds like a login problem and is not one.

If the address is right and it still refuses, your CLI login has expired or
belongs to an account that is no longer on the store:

    shopify auth logout

then run the command again and sign in when it asks.
`);
}

/**
 * .shopifyignore lists the content files, so a bare `shopify theme push` typed
 * by hand cannot wipe them either. But it applies to pulls as well, which
 * would leave the two commands that are *meant* to touch content unable to.
 *
 * So those two lift it for the length of one command and put it straight back,
 * including when the command fails. The ignore file is the safety net for
 * everything else; these two are the deliberate exceptions.
 */
const IGNORE_FILE = '.shopifyignore';

function withoutContentIgnores(fn) {
  if (!existsSync(IGNORE_FILE)) return fn();

  const original = readFileSync(IGNORE_FILE, 'utf8');
  const trimmed = original
    .split('\n')
    .filter((line) => !CONTENT.includes(line.trim()))
    .join('\n');

  writeFileSync(IGNORE_FILE, trimmed);
  try {
    return fn();
  } finally {
    writeFileSync(IGNORE_FILE, original);
  }
}

if (wantPull) {
  console.log('\nPulling content from the store into this repo.');
  console.log('Images and app blocks added in the theme editor will be saved here.\n');
  const only = CONTENT.flatMap((p) => ['--only', p]);
  withoutContentIgnores(() =>
    run('shopify', ['theme', 'pull', '--store', store, ...themeArg, '--live', ...only])
  );
  console.log(`
Done. Check what came back before committing it:

    git diff --stat

If the images are in there, commit them so they are never lost again:

    git add templates sections config
    git commit -m "Save the content added in the theme editor"
`);
  process.exit(0);
}

if (onlyPaths.length) {
  checkTemplates();
  console.log('\nPushing only these files. Nothing else is sent:\n');
  onlyPaths.forEach((f) => console.log('    ' + f));

  const missing = onlyPaths.filter((f) => !existsSync(f));
  if (missing.length) {
    console.error(`\n✗ Not found, so nothing was pushed:\n    ${missing.join('\n    ')}\n`);
    process.exit(1);
  }

  const only = onlyPaths.flatMap((f) => ['--only', f]);
  withoutContentIgnores(() =>
    run('shopify', ['theme', 'push', '--store', store, ...themeArg, ...only])
  );

  console.log(`
Done. Only the files listed above were sent. Every other template, and every
image and app block in the theme editor, is exactly as it was.
`);
  process.exit(0);
}

if (wantContent) {
  checkTemplates();
  console.log(`
About to push content files as well as code.

This replaces the images, app blocks and section settings currently in the
theme editor with whatever this repo holds. If someone has added images since
the last pull, they will be lost.

Run this first if you are not certain:

    node push.mjs ${store} --pull
`);
  withoutContentIgnores(() => run('shopify', ['theme', 'push', '--store', store, ...themeArg]));
  process.exit(0);
}

checkTemplates();

console.log('\nPushing code only. Nothing the theme editor owns will be touched.\n');
const ignore = CONTENT.flatMap((p) => ['--ignore', p]);
run('shopify', ['theme', 'push', '--store', store, ...themeArg, ...ignore]);

console.log(`
Pushed. Images, app blocks and section settings are untouched.

If a change you expected is missing, it probably lives in a template rather
than in code, and templates are not sent by a normal push. Send just that one:

    node push.mjs ${store} --only templates/page.example.json

Only reach for --with-content when you genuinely mean every template at once,
and pull first if you do.
`);
