import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

import { runContentfulQuery } from './lib/contentful.js';
import { TEAM_BY_YEAR_QUERY } from './queries/teamQueries.js';
import { injectStaticImages } from './lib/staticImages.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

export async function renderTeamPage() {
  const teamYear = process.env.TEAM_YEAR ? Number.parseInt(process.env.TEAM_YEAR, 10) : new Date().getFullYear();
  const data = await runContentfulQuery(TEAM_BY_YEAR_QUERY, { year: teamYear, limit: 400 });
  const members = data?.newTeamMemberCardCollection?.items || [];
  if (!members.length) {
    throw new Error(`No team members found for year ${teamYear}.`);
  }

  const templatePath = path.join(ROOT_DIR, 'sites/team/team.html');
  const dom = new JSDOM(await fs.readFile(templatePath, 'utf8'));
  const { document } = dom.window;

  const sectionsContainer = document.getElementById('teamSections');
  if (!sectionsContainer) {
    throw new Error('Team sections container is missing from the template.');
  }

  const grouped = groupMembers(members);
  let revealIndex = 0;
  const frag = document.createDocumentFragment();

  grouped.forEach(({ teamName, members: teamMembers }) => {
    const { section, nextIndex } = buildTeamSection(document, teamName, teamMembers, revealIndex);
    revealIndex = nextIndex;
    frag.appendChild(section);
  });

  sectionsContainer.innerHTML = '';
  sectionsContainer.appendChild(frag);

  await injectStaticImages(document);

  const outputPath = path.join(DIST_DIR, 'sites/team/team.html');
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, dom.serialize(), 'utf8');
}

const TEAM_PRIORITY = ['executive', 'finance', 'logistics', 'marketing', 'speaker'];

function groupMembers(items) {
  const teams = new Map();
  (items || []).forEach(member => {
    if (!member) return;
    const teamName = (member.team || 'Team').trim() || 'Team';
    if (!teams.has(teamName)) teams.set(teamName, []);
    teams.get(teamName).push(member);
  });

  const sortedTeams = Array.from(teams.keys()).sort((a, b) => {
    const orderA = teamOrderValue(a);
    const orderB = teamOrderValue(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });

  return sortedTeams.map(teamName => ({
    teamName,
    members: sortMembers(teams.get(teamName))
  }));
}

function teamOrderValue(name) {
  const normalized = (name || '').trim().toLowerCase();
  const stripped = normalized.replace(/\s*team\b/i, '').trim();
  const idx = TEAM_PRIORITY.findIndex(prio => stripped.startsWith(prio));
  return idx === -1 ? TEAM_PRIORITY.length : idx;
}

function sortMembers(list) {
  return [...(list || [])].sort((a, b) => {
    const leadA = !!a.isLead;
    const leadB = !!b.isLead;
    if (leadA !== leadB) return leadA ? -1 : 1;

    const roleA = (a.positionTitle || a.title || '').trim();
    const roleB = (b.positionTitle || b.title || '').trim();
    const roleCompare = roleA.localeCompare(roleB, undefined, { sensitivity: 'base' });
    if (roleCompare !== 0) return roleCompare;

    const nameA = [a.firstName, a.lastName, a.name].filter(Boolean).join(' ').trim().toLowerCase();
    const nameB = [b.firstName, b.lastName, b.name].filter(Boolean).join(' ').trim().toLowerCase();
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
  });
}

function formatTeamLabel(name) {
  const trimmed = (name || 'Team').trim();
  if (!trimmed) return 'Team';
  return /team/i.test(trimmed) ? trimmed : `${trimmed} Team`;
}

function buildTeamSection(doc, teamName, members, revealStart = 0) {
  const section = doc.createElement('section');
  section.className = 'team-section';

  const header = doc.createElement('header');
  header.className = 'team-section__header';
  const heading = doc.createElement('h2');
  heading.className = 'team-section__title';
  heading.textContent = formatTeamLabel(teamName);
  header.appendChild(heading);
  section.appendChild(header);

  const grid = doc.createElement('div');
  grid.className = 'team-grid';
  const colsWrapper = doc.createElement('div');
  colsWrapper.className = 'cols';

  const columns = [];
  for (let i = 1; i <= 4; i++) {
    const col = doc.createElement('div');
    col.className = `col col-${i}`;
    columns.push(col);
    colsWrapper.appendChild(col);
  }

  members.forEach((member, idx) => {
    const card = buildTeamCard(doc, member, revealStart + idx);
    const colIndex = idx % columns.length;
    columns[colIndex].appendChild(card);
  });

  grid.appendChild(colsWrapper);
  section.appendChild(grid);

  return { section, nextIndex: revealStart + members.length };
}

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function buildTeamCard(doc, member, index) {
  const card = doc.createElement('article');
  card.className = 'team-card';
  card.dataset.sortIndex = String(index ?? 0);

  const wrap = doc.createElement('div');
  wrap.className = 'portrait-wrap animate-once';
  wrap.dataset.anim = 'slide-up';
  wrap.dataset.revealIndex = String(index ?? 0);

  const firstName = member.firstName || member.name || '';
  const lastName = member.lastName || '';
  const displayName = [firstName, lastName].filter(Boolean).join(' ') || member.name || 'Team member';
  const role = member.positionTitle || member.title || '';
  const portraitAsset = member?.portrait?.url ? member.portrait : member?.photo;
  const portraitUrl = portraitAsset?.url;
  const portraitDesc = portraitAsset?.description || `${displayName} — ${role}`.trim();

  if (portraitUrl) {
    const img = doc.createElement('img');
    img.className = 'portrait';
    img.src = withImageParams(portraitUrl, 'fm=webp&q=80&w=900');
    img.alt = portraitDesc || 'Team portrait';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);
  } else {
    const placeholder = doc.createElement('div');
    placeholder.className = 'portrait portrait--placeholder';
    placeholder.textContent = displayName.charAt(0).toUpperCase();
    placeholder.setAttribute('aria-label', displayName);
    wrap.appendChild(placeholder);
  }

  const label = doc.createElement('div');
  label.className = 'card-label';

  const nameEl = doc.createElement('span');
  nameEl.className = 'name';
  nameEl.textContent = firstName || displayName;
  const sup = doc.createElement('span');
  sup.className = 'sup';
  sup.textContent = 'x';
  nameEl.appendChild(sup);
  label.appendChild(nameEl);

  if (role) {
    const roleEl = doc.createElement('span');
    roleEl.className = 'role';
    roleEl.textContent = role;
    label.appendChild(roleEl);
  }

  const linkedinUrl = normalizeUrl(member.linkedInUrl);
  if (linkedinUrl) {
    const anchor = doc.createElement('a');
    anchor.className = 'linkedin';
    anchor.href = linkedinUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.setAttribute('aria-label', `LinkedIn ${displayName}`);

    const icon = doc.createElement('img');
    icon.src = '/assets/logos/social/LI-In-Bug.png';
    icon.alt = 'LinkedIn';
    anchor.appendChild(icon);
    wrap.appendChild(anchor);
  }

  wrap.appendChild(label);
  card.appendChild(wrap);
  return card;
}

function withImageParams(url, params) {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params}`;
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  renderTeamPage().catch(err => {
    console.error('Failed to prerender team page:', err);
    process.exitCode = 1;
  });
}
