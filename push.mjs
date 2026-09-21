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
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'node:fs';

const args = process.argv.slice(2);
const store = args.find((a) => !a.startsWith('--'));
const wantPull = args.includes('--pull');
const wantContent = args.includes('--with-content');

/* --only takes the paths after it, so a single new template can go up without
   dragging every other template with it. This is the gap that mattered: the
   ignore rules protect the home page, and they protect a brand new template
   just as thoroughly, which means a new page would never arrive. Reaching for
   --with-content to solve that is how the images were lost. */
const onlyAt = args.indexOf('--only');
const onlyPaths =
  onlyAt === -1 ? [] : args.slice(onlyAt + 1).filter((a) => !a.startsWith('--'));

if (!store) {
  console.error(`
Usage:  node push.mjs <store>.myshopify.com [--pull | --only <paths> | --with-content]

  (no flag)        Push code only. Images, app blocks and section settings in
                   the theme editor are left exactly as they are. Use this.

  --only <paths>   Push just the files you name, and nothing else. This is how
                   a new page template goes up without touching the home page.

                     node push.mjs <store> --only templates/page.landing.json

  --pull           Pull the store's content files into this repo, so the
                   images and app blocks someone added are saved in git.

  --with-content   Push every content file. This replaces the home page and
                   every other template with whatever this repo holds. Pull
                   first, or use --only instead, which is almost always what
                   you actually want.
`);
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
  console.log(`\n$ ${cmd} ${cmdArgs.join(' ')}\n`);
  const res = spawnSync(cmd, cmdArgs, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (res.status !== 0) process.exit(res.status ?? 1);
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
    run('shopify', ['theme', 'pull', '--store', store, '--live', ...only])
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
  console.log('\nPushing only these files. Nothing else is sent:\n');
  onlyPaths.forEach((f) => console.log('    ' + f));

  const missing = onlyPaths.filter((f) => !existsSync(f));
  if (missing.length) {
    console.error(`\n✗ Not found, so nothing was pushed:\n    ${missing.join('\n    ')}\n`);
    process.exit(1);
  }

  const only = onlyPaths.flatMap((f) => ['--only', f]);
  withoutContentIgnores(() =>
    run('shopify', ['theme', 'push', '--store', store, ...only])
  );

  console.log(`
Done. Only the files listed above were sent. Every other template, and every
image and app block in the theme editor, is exactly as it was.
`);
  process.exit(0);
}

if (wantContent) {
  console.log(`
About to push content files as well as code.

This replaces the images, app blocks and section settings currently in the
theme editor with whatever this repo holds. If someone has added images since
the last pull, they will be lost.

Run this first if you are not certain:

    node push.mjs ${store} --pull
`);
  withoutContentIgnores(() => run('shopify', ['theme', 'push', '--store', store]));
  process.exit(0);
}

console.log('\nPushing code only. Nothing the theme editor owns will be touched.\n');
const ignore = CONTENT.flatMap((p) => ['--ignore', p]);
run('shopify', ['theme', 'push', '--store', store, ...ignore]);

console.log(`
Pushed. Images, app blocks and section settings are untouched.

If a change you expected is missing, it probably lives in a template rather
than in code, and templates are not sent by a normal push. Send just that one:

    node push.mjs ${store} --only templates/page.example.json

Only reach for --with-content when you genuinely mean every template at once,
and pull first if you do.
`);
