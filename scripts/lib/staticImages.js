import { runContentfulQuery } from './contentful.js';
import { STATIC_IMAGES_BY_CODE_QUERY } from '../queries/staticImageQueries.js';

const cache = new Map();

function pickDataset(el, keys = []) {
  if (!el?.dataset || !keys?.length) return '';
  for (const key of keys) {
    const val = el.dataset[key];
    if (typeof val === 'string' && val.trim() !== '') return val;
  }
  return '';
}

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
}

function withParams(url, params) {
  if (!url) return '';
  if (!params) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params}`;
}

function collectDomTargets(document, selectors, defaultParams) {
  const targets = [];
  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(el => {
      const code = pickDataset(el, ['staticCode', 'cfCode', 'staticImageCode', 'imageCode']);
      if (!code) return;
      targets.push({
        el,
        code,
        params: pickDataset(el, ['staticParams', 'staticImageParams', 'imageParams']) || defaultParams || '',
        fallbackAlt: pickDataset(el, ['staticAlt', 'staticImageAlt']) || el.alt || '',
        placeholder: pickDataset(el, ['placeholder', 'staticPlaceholder', 'staticImagePlaceholder']) || '',
      });
    });
  });
  return targets;
}

function collectConfigTargets(document, items, defaultParams) {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => {
      if (!item) return null;
      const { selector, id, element, code } = item;
      const el = element
        || (selector ? document.querySelector(selector) : null)
        || (id ? document.getElementById(id) : null);
      if (!el || !code) return null;
      return {
        el,
        code,
        params: item.params || item.imageParams || defaultParams || '',
        fallbackAlt: item.alt || item.fallbackAlt || el.alt || '',
        placeholder: item.placeholder || el.dataset?.placeholder || '',
      };
    })
    .filter(Boolean);
}

async function fetchAssets(codes) {
  const missing = codes.filter(code => !cache.has(code));
  if (missing.length) {
    const data = await runContentfulQuery(STATIC_IMAGES_BY_CODE_QUERY, {
      codes: missing,
      limit: Math.max(1, missing.length),
    });
    const items = data?.imageStaticCollection?.items || [];
    missing.forEach(code => cache.set(code, null));
    items.forEach(asset => {
      if (asset?.code) cache.set(asset.code, asset);
    });
  }

  const result = new Map();
  codes.forEach(code => result.set(code, cache.get(code) || null));
  return result;
}

function applyToElement(target, asset) {
  if (!target?.el) return;
  const { el, params, fallbackAlt, placeholder } = target;

  const url = normalizeUrl(asset?.file?.url);
  if (url) {
    el.src = withParams(url, params);
  } else if (placeholder && !el.src) {
    el.src = placeholder;
  }

  const alt = asset?.altDiscription || asset?.file?.description || fallbackAlt || el.alt;
  if (alt) el.alt = alt;
}

/**
 * Inject Contentful ImageStatic assets into DOM elements.
 *
 * - Finds elements matching selectors (default: [data-static-code])
 * - Accepts explicit targets (selector/id + code)
 * - Sets src/alt using ImageStatic (code, altDiscription, file.url/description)
 * - Leaves elements untouched when code or asset is missing
 */
export async function injectStaticImages(document, options = {}) {
  if (!document) return;
  const {
    selectors = ['[data-static-code]', '[data-static-image-code]', '[data-image-code]', '[data-cf-code]'],
    targets: targetConfigs = [],
    defaultParams = '',
    throwOnError = false,
  } = options;

  const domTargets = collectDomTargets(document, selectors, defaultParams);
  const configTargets = collectConfigTargets(document, targetConfigs, defaultParams);

  const merged = new Map();
  domTargets.forEach(target => merged.set(target.el, target));
  configTargets.forEach(target => merged.set(target.el, target)); // config overrides DOM

  const targets = Array.from(merged.values());
  const codes = Array.from(new Set(targets.map(t => t?.code).filter(Boolean)));
  if (!codes.length) return;

  let assets = new Map();
  try {
    assets = await fetchAssets(codes);
  } catch (err) {
    console.warn('Contentful static images could not be fetched.', err?.message || err);
    if (throwOnError) throw err;
    codes.forEach(code => assets.set(code, null));
  }

  targets.forEach(target => applyToElement(target, assets.get(target.code)));
}
