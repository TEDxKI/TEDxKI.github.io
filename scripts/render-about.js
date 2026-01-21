import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { injectStaticImages } from './lib/staticImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const DEFAULT_HERO_CODE = process.env.ABOUT_HERO_IMAGE_CODE || process.env.LANDING_HERO_ASSET_CODE || 'hero-background';
const DEFAULT_STORY_CODE = process.env.ABOUT_STORY_IMAGE_CODE || DEFAULT_HERO_CODE;

const HERO_IMAGE_PARAMS = 'fm=webp&q=86&w=1400';
const STORY_IMAGE_PARAMS = 'fm=webp&q=84&w=1200';

function parseCodes() {
  const listEnv = process.env.ABOUT_IMAGE_CODES;
  if (listEnv) {
    return listEnv
      .split(',')
      .map(str => str.trim())
      .filter(Boolean);
  }
  return [DEFAULT_HERO_CODE, DEFAULT_STORY_CODE].filter(Boolean);
}

export async function renderAboutPage() {
  const codes = parseCodes();

  const templatePath = path.join(ROOT_DIR, 'sites/about/about.html');
  const dom = new JSDOM(await fs.readFile(templatePath, 'utf8'));
  const { document } = dom.window;

  const heroEl = document.getElementById('aboutHeroImage');
  const storyEl = document.getElementById('aboutStoryImage');

  const heroCode = (heroEl?.dataset?.staticCode || heroEl?.dataset?.staticImageCode || heroEl?.dataset?.imageCode || codes[0] || DEFAULT_HERO_CODE || '').trim();
  const storyCode = (storyEl?.dataset?.staticCode || storyEl?.dataset?.staticImageCode || storyEl?.dataset?.imageCode || codes[1] || heroCode || '').trim();
  const heroParams = heroEl?.dataset?.staticParams
    || heroEl?.dataset?.staticImageParams
    || heroEl?.dataset?.imageParams
    || HERO_IMAGE_PARAMS;
  const storyParams = storyEl?.dataset?.staticParams
    || storyEl?.dataset?.staticImageParams
    || storyEl?.dataset?.imageParams
    || STORY_IMAGE_PARAMS;
  const rawHeroAlt = heroEl?.dataset?.staticAlt
    || heroEl?.dataset?.staticImageAlt
    || heroEl?.dataset?.imageAlt
    || heroEl?.getAttribute('alt')
    || '';
  const rawStoryAlt = storyEl?.dataset?.staticAlt
    || storyEl?.dataset?.staticImageAlt
    || storyEl?.dataset?.imageAlt
    || storyEl?.getAttribute('alt')
    || '';
  const heroAlt = rawHeroAlt.trim() || 'TEDxKI community';
  const storyAlt = rawStoryAlt.trim() || 'TED community';

  await injectStaticImages(document, {
    targets: [
      {
        id: 'aboutHeroImage',
        code: heroCode,
        params: heroParams,
        alt: heroAlt,
      },
      {
        id: 'aboutStoryImage',
        code: storyCode,
        params: storyParams,
        alt: storyAlt,
      },
    ],
  });

  const outputPath = path.join(DIST_DIR, 'sites/about/about.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dom.serialize(), 'utf8');
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  renderAboutPage().catch(err => {
    console.error('Failed to prerender about page:', err);
    process.exitCode = 1;
  });
}
