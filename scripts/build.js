import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { renderLandingPage } from './render-landing.js';
import { renderEventsPage } from './render-events.js';
import { renderTeamPage } from './render-team.js';
import { renderAboutPage } from './render-about.js';
import { renderWatchPage } from './render-watch.js';
import { injectStaticImages } from './lib/staticImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const STATIC_PAGES = [
  'sites/contact/contact.html',
  'sites/sponsors/sponsors.html',
];

function fmt(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

async function step(label, fn) {
  const started = Date.now();
  process.stdout.write(`▶ ${label}...\n`);
  await fn();
  const elapsed = Date.now() - started;
  process.stdout.write(`✓ ${label} (${fmt(elapsed)})\n`);
}

async function cleanDist() {
  try {
    await fs.rm(DIST_DIR, { recursive: true, force: true, maxRetries: 5, retryDelay: 80 });
    return;
  } catch (err) {
    if (err?.code === 'ENOENT') return;
    console.warn('Standard dist cleanup failed, retrying with deep delete...', err?.message || err);
  }

  // Fallback: ensure directory exists, empty it manually, then remove
  async function deepDelete(target) {
    const entries = await fs.readdir(target, { withFileTypes: true }).catch(() => []);
    for (const entry of entries) {
      const full = path.join(target, entry.name);
      if (entry.isDirectory()) {
        await deepDelete(full);
      } else {
        await fs.rm(full, { force: true }).catch(() => {});
      }
    }
    await fs.rm(target, { recursive: true, force: true }).catch(() => {});
  }

  await deepDelete(DIST_DIR);
}

async function copyStaticAssets() {
  const entries = [
    'assets',
    'partials',
    'sites',
    'styles.css',
    'app.js',
    'README.md',
    'notes.md'
  ];

  for (const entry of entries) {
    const src = path.join(ROOT_DIR, entry);
    try {
      const stats = await fs.lstat(src);
      const dest = path.join(DIST_DIR, entry);
      if (stats.isDirectory()) {
        await fs.cp(src, dest, { recursive: true });
      } else {
        await fs.mkdir(path.dirname(dest), { recursive: true });
        await fs.copyFile(src, dest);
      }
    } catch (err) {
      // optional entries may not exist (e.g., notes)
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

async function renderSimpleStaticPages() {
  for (const relPath of STATIC_PAGES) {
    const templatePath = path.join(ROOT_DIR, relPath);
    try {
      const template = await fs.readFile(templatePath, 'utf8');
      const dom = new JSDOM(template);
      await injectStaticImages(dom.window.document);

      const outputPath = path.join(DIST_DIR, relPath);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, dom.serialize(), 'utf8');
    } catch (err) {
      if (err?.code === 'ENOENT') continue;
      throw err;
    }
  }
}

async function build() {
  const overallStart = Date.now();

  await step('Cleaning dist', cleanDist);
  await step('Copying static assets', copyStaticAssets);
  await step('Rendering landing page', renderLandingPage);
  await step('Rendering events page', renderEventsPage);
  await step('Rendering about page', renderAboutPage);
  await step('Rendering team page', renderTeamPage);
  await step('Rendering watch page', renderWatchPage);
  await step('Rendering static content pages', renderSimpleStaticPages);

  const total = Date.now() - overallStart;
  console.log(`Build complete in ${fmt(total)}. Output in ./dist`);
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  build().catch(err => {
    console.error('Build failed:', err);
    process.exitCode = 1;
  });
}
