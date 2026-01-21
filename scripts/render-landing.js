import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { injectStaticImages } from './lib/staticImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const HERO_IMAGE_PARAMS = 'fm=webp&q=86&w=1400';

export async function renderLandingPage() {
  const templatePath = path.join(ROOT_DIR, 'index.html');
  const dom = new JSDOM(await fs.readFile(templatePath, 'utf8'));
  const { document } = dom.window;

  const heroEl = document.getElementById('hero-background');
  const heroCode = (heroEl?.dataset?.staticCode
    || heroEl?.dataset?.staticImageCode
    || heroEl?.dataset?.imageCode
    || process.env.LANDING_HERO_ASSET_CODE
    || 'hero-background'
  ).trim();
  const heroParams = heroEl?.dataset?.staticParams
    || heroEl?.dataset?.staticImageParams
    || heroEl?.dataset?.imageParams
    || HERO_IMAGE_PARAMS;
  const rawHeroAlt = heroEl?.dataset?.staticAlt
    || heroEl?.dataset?.staticImageAlt
    || heroEl?.dataset?.imageAlt
    || heroEl?.getAttribute('alt')
    || '';
  const heroAlt = rawHeroAlt.trim() || 'TEDxKI hero background';

  await injectStaticImages(document, {
    targets: [
      {
        id: 'hero-background',
        code: heroCode,
        params: heroParams,
        alt: heroAlt,
      },
    ],
    throwOnError: true,
  });

  const outputPath = path.join(DIST_DIR, 'index.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dom.serialize(), 'utf8');
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  renderLandingPage().catch(err => {
    console.error('Failed to prerender landing page:', err);
    process.exitCode = 1;
  });
}
