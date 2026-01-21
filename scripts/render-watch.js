import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { runContentfulQuery } from './lib/contentful.js';
import { EMBEDDED_VIDEOS_QUERY } from './queries/watchQueries.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

const MAX_VIDEOS = (() => {
  const parsed = Number.parseInt(process.env.WATCH_VIDEO_LIMIT || '200', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 200;
})();

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  return trimmed;
}

function parseTimeToSeconds(raw) {
  if (!raw) return null;
  const value = String(raw).replace(/^t=/i, '').replace(/^#/, '').trim();
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number.parseInt(value, 10);
  const match = value.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/i);
  if (!match) return null;
  const hours = Number.parseInt(match[1] || '0', 10);
  const minutes = Number.parseInt(match[2] || '0', 10);
  const seconds = Number.parseInt(match[3] || '0', 10);
  const total = hours * 3600 + minutes * 60 + seconds;
  return total > 0 ? total : null;
}

function findUrlInRichText(richText) {
  const doc = richText?.json;
  if (!doc) return '';
  const urlRegex = /(https?:\/\/[^\s"'>]+)/i;
  let found = '';

  function walk(node) {
    if (!node || found) return;
    if (node.nodeType === 'hyperlink' && node.data?.uri) {
      found = node.data.uri;
      return;
    }
    if (typeof node.value === 'string') {
      const match = node.value.match(urlRegex);
      if (match?.[1]) {
        found = match[1];
        return;
      }
    }
    if (Array.isArray(node.content)) node.content.forEach(child => walk(child));
  }

  walk(doc);
  return normalizeUrl(found);
}

function parseYouTubeDetails(rawUrl) {
  const normalized = normalizeUrl(rawUrl);
  if (!normalized) return null;

  let url;
  try {
    url = new URL(normalized);
  } catch (err) {
    try {
      url = new URL(normalized, 'https://www.youtube.com');
    } catch {
      return null;
    }
  }

  const host = url.hostname.replace(/^www\./, '').toLowerCase();
  if (!host.includes('youtube') && !host.includes('youtu.be')) return null;

  let videoId = '';
  if (host === 'youtu.be') {
    videoId = url.pathname.split('/').filter(Boolean)[0] || '';
  } else if (url.pathname.startsWith('/embed/')) {
    videoId = url.pathname.split('/').filter(Boolean)[1] || '';
  } else if (url.searchParams.get('v')) {
    videoId = url.searchParams.get('v') || '';
  } else {
    const parts = url.pathname.split('/').filter(Boolean);
    videoId = parts.pop() || '';
  }

  videoId = videoId.replace(/[^0-9A-Za-z_-]/g, '');
  if (!videoId || videoId.length < 5) return null;

  const startParam = url.searchParams.get('start') || url.searchParams.get('t');
  const hashStart = url.hash?.includes('t=') ? url.hash.split('t=')[1] : '';
  const start = parseTimeToSeconds(startParam || hashStart);

  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
  });
  if (start) params.set('start', String(start));

  return {
    videoId,
    start,
    sourceUrl: url.toString(),
    embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  };
}

function normalizeVideoEntry(entry) {
  if (!entry) return null;
  const title = (entry.videoTitle || '').trim();
  const year = Number.isInteger(entry.eventYear) ? entry.eventYear : null;
  const url = findUrlInRichText(entry.safeEmbeddingCode);
  const yt = parseYouTubeDetails(url);
  if (!yt) return null;
  return {
    id: entry?.sys?.id || yt.videoId,
    title: title || 'TEDxKI Talk',
    year,
    videoId: yt.videoId,
    embedUrl: yt.embedUrl,
    sourceUrl: yt.sourceUrl,
    thumbnail: yt.thumbnail,
  };
}

function buildYearList(videos) {
  const set = new Set();
  videos.forEach(video => {
    if (Number.isInteger(video.year)) set.add(video.year);
  });
  return Array.from(set).sort((a, b) => b - a);
}

function setYearOptions(document, years) {
  const select = document.getElementById('year-filter');
  if (!select) return;
  select.innerHTML = '';

  const all = document.createElement('option');
  all.value = 'all';
  all.textContent = 'All years';
  select.appendChild(all);

  years.forEach(year => {
    const opt = document.createElement('option');
    opt.value = String(year);
    opt.textContent = String(year);
    select.appendChild(opt);
  });
}

function setHeroStats(document, videos, years) {
  const countEl = document.getElementById('talk-count');
  if (countEl) countEl.textContent = `${videos.length} talks`;

  const yearRangeEl = document.getElementById('year-range');
  if (yearRangeEl && years.length) {
    const max = Math.max(...years);
    const min = Math.min(...years);
    yearRangeEl.textContent = min === max ? String(max) : `${min}–${max}`;
  }
}

const BRAND_HTML = '<span class="brand-mark">TED<span class="sup">x</span></span><span class="brand-tail">KI</span>';

function createVideoCard(document, video, index) {
  const card = document.createElement('article');
  card.className = 'video-card';
  card.dataset.videoId = video.videoId;
  card.dataset.embed = video.embedUrl;
  card.dataset.year = video.year ? String(video.year) : '';
  card.dataset.title = (video.title || '').toLowerCase();
  card.dataset.source = video.sourceUrl || '';
  card.dataset.index = String(index);

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb-btn';
  button.setAttribute('aria-label', `Play: ${video.title}`);

  const badge = document.createElement('span');
  badge.className = 'year-badge';
  badge.textContent = video.year ? String(video.year) : 'TEDxKI';
  button.appendChild(badge);

  const img = document.createElement('img');
  img.className = 'thumb-img';
  img.src = video.thumbnail;
  img.alt = `${video.title} preview`;
  img.loading = 'lazy';
  img.decoding = 'async';
  button.appendChild(img);

  const overlay = document.createElement('div');
  overlay.className = 'play-overlay';
  overlay.innerHTML = `
    <span class="spark"></span>
    <span class="play-icon" aria-hidden="true">▶</span>
    <span class="play-label">Watch now</span>
  `;
  button.appendChild(overlay);

  const meta = document.createElement('div');
  meta.className = 'meta';

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = video.title;
  meta.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'meta-sub';
  sub.innerHTML = video.year ? `${BRAND_HTML} • ${video.year}` : BRAND_HTML;
  meta.appendChild(sub);

  card.appendChild(button);
  card.appendChild(meta);

  return card;
}

function renderVideoGrid(document, videos) {
  const grid = document.getElementById('video-grid');
  if (!grid) return;
  grid.innerHTML = '';

  if (!videos.length) {
    const empty = document.createElement('p');
    empty.className = 'watch-empty';
    empty.textContent = 'No talks are available yet.';
    grid.appendChild(empty);
    return;
  }

  const frag = document.createDocumentFragment();
  videos.forEach((video, idx) => frag.appendChild(createVideoCard(document, video, idx)));
  grid.appendChild(frag);
}

function embedPayload(document, payload) {
  const dataEl = document.getElementById('video-data');
  if (!dataEl) return;
  dataEl.textContent = JSON.stringify(payload);
}

export async function renderWatchPage() {
  const data = await runContentfulQuery(EMBEDDED_VIDEOS_QUERY, { limit: MAX_VIDEOS });
  const entries = data?.newEmbeddedVideoCollection?.items || [];
  const videos = entries
    .map(normalizeVideoEntry)
    .filter(Boolean)
    .sort((a, b) => (b.year || 0) - (a.year || 0) || a.title.localeCompare(b.title));

  const years = buildYearList(videos);

  const templatePath = path.join(ROOT_DIR, 'sites/watch/watch.html');
  const template = await fs.readFile(templatePath, 'utf8');
  const dom = new JSDOM(template);
  const { document } = dom.window;

  setYearOptions(document, years);
  setHeroStats(document, videos, years);
  renderVideoGrid(document, videos);
  embedPayload(document, { videos, years });

  const outputPath = path.join(DIST_DIR, 'sites/watch/watch.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dom.serialize(), 'utf8');
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  renderWatchPage().catch(err => {
    console.error('Failed to prerender watch page:', err);
    process.exitCode = 1;
  });
}
