const HERO_IMAGE_PARAMS = 'fm=webp&q=85&w=1400';
const PERSON_IMAGE_PARAMS = 'fm=webp&w=300&q=80';
const TEAM_IMAGE_PARAMS = 'fm=webp&q=80&w=900';

export function renderEventContent(doc, event, { fallbackYear } = {}) {
  if (!doc || !event) return;
  const yearText = event.yearIdentifier || fallbackYear;
  setText(doc, 'eventYear', yearText ? `TEDxKI ${yearText}` : 'TEDxKI');
  setText(doc, 'eventName', event.name || '');
  setText(doc, 'eventMeta', metaLine(event));
  setHtml(doc, 'eventDescription', event.description || '');

  const hero = getPreferredAsset(event, ['heroImage', 'image', 'teamPhoto']);
  const heroImg = doc.getElementById('eventImage');
  if (heroImg && hero?.url) {
    heroImg.src = withImageParams(hero.url, HERO_IMAGE_PARAMS);
    heroImg.alt = hero.description || event.name || 'TEDxKI event';
  }

  // Flag to conditionally render the new card layout and LinkedIn on speakers/hosts for 2026+
  const isNewEra = (event.yearIdentifier >= 2026) || (!event.yearIdentifier && fallbackYear >= 2026);
  const showLinkedIn = isNewEra;

  renderPeopleSection(doc, event?.speakersCollection, 'speakersGrid', 'speakersSection', showLinkedIn, isNewEra);
  renderPeopleSection(doc, event?.hostsCollection, 'hostsGrid', 'hostsSection', showLinkedIn, isNewEra);
  renderPeopleSection(doc, event?.performersCollection, 'performersGrid', 'performersSection', showLinkedIn, isNewEra);
  
  renderEventTeams(doc, event?.teamsCollection);
}

export function renderEventOptions(doc, events, activeYear, onSelect) {
  if (!doc) return;
  const block = doc.getElementById('eventSwitcherBlock');
  const optionsEl = doc.getElementById('eventSwitcher');
  if (!block || !optionsEl) return;

  optionsEl.innerHTML = '';
  if (!Array.isArray(events) || !events.length) {
    block.hidden = true;
    return;
  }

  block.hidden = false;
  events.forEach(evt => {
    const year = evt?.yearIdentifier;
    const label = evt?.name || (year ? `TEDxKI ${year}` : 'TEDxKI');
    const btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'event-switcher__option';
    if (typeof year === 'number') btn.dataset.year = String(year);
    btn.textContent = year ?? label;
    btn.title = label;
    if (year === activeYear) btn.classList.add('is-active');
    if (typeof onSelect === 'function' && typeof year === 'number') {
      btn.addEventListener('click', () => onSelect(year));
    }
    optionsEl.appendChild(btn);
  });
}

export function determineInitialYear(events, preferredYear, fallbackYear) {
  if (preferredYear && events.some(ev => ev.yearIdentifier === preferredYear)) {
    return preferredYear;
  }
  if (Array.isArray(events) && events.length) {
    return events[0].yearIdentifier;
  }
  return fallbackYear || null;
}

function renderPeopleSection(doc, collection, gridId, sectionId, showLinkedIn = false, isNewEra = false) {
  const section = doc.getElementById(sectionId);
  const grid = doc.getElementById(gridId);
  if (!section || !grid) return;

  const people = normalizedItems(collection);
  grid.innerHTML = '';
  
  if (!people.length) {
    section.hidden = true;
    return;
  }

  people.forEach(person => {
    grid.appendChild(createPersonCard(doc, person, showLinkedIn, isNewEra));
  });
  
  section.hidden = false;
}

function createPersonCard(doc, person, showLinkedIn, isNewEra) {
  const card = doc.createElement('article');
  const name = normalizePersonName(person);
  const roleText = normalizeRole(person);
  const bio = person?.bio || '';
  const linkedInUrl = person?.linkedInProfileLink || person?.linkedin || person?.linkedInUrl || '';

  if (isNewEra) {
    // --- NEW DESIGN (2026+) WITH 3D MODAL INSTEAD OF CARD-FLIP ---
    card.className = 'event-person-card new-era';

    // Attach the data attributes required for modal view
    card.dataset.name = name || '';
    card.dataset.role = roleText || '';
    card.dataset.bio = bio ? (typeof bio === 'string' ? bio : String(bio)) : '';
    const personPhoto = getPersonImage(person);
    if (personPhoto?.url) {
      card.dataset.photo = withImageParams(personPhoto.url, 'fm=webp&w=1080&q=85');
    }
    if (linkedInUrl) {
      card.dataset.linkedin = linkedInUrl;
    }

    
    const cardInner = doc.createElement('div');
    cardInner.className = 'card-inner';
    
    // Front side
    const cardFront = doc.createElement('div');
    cardFront.className = 'card-front';
    
    const photo = getPersonImage(person);
    if (photo?.url) {
      const img = doc.createElement('img');
      img.src = withImageParams(photo.url, 'fm=webp&w=600&q=85');
      img.alt = photo.description || name;
      img.className = 'event-person-photo';
      img.loading = 'lazy';
      img.decoding = 'async';
      cardFront.appendChild(img);
    } else {
      const placeholder = doc.createElement('div');
      placeholder.className = 'event-person-photo portrait--placeholder';
      placeholder.textContent = getNameInitial(person);
      cardFront.appendChild(placeholder);
    }

    const gradient = doc.createElement('div');
    gradient.className = 'event-person-gradient';
    cardFront.appendChild(gradient);

    const content = doc.createElement('div');
    content.className = 'event-person-content';

    const nameEl = doc.createElement('h3');
    nameEl.className = 'event-person-name';
    nameEl.textContent = name;
    content.appendChild(nameEl);

    if (roleText) {
      const roleEl = doc.createElement('div');
      roleEl.className = 'event-person-role';
      roleEl.textContent = roleText;
      content.appendChild(roleEl);
    }
    if (bio) {
      const bioShort = doc.createElement('div');
      bioShort.className = 'event-person-bio-short';
      
      // Safely convert to string and strip HTML tags
      const safeBioString = typeof bio === 'string' ? bio : String(bio);
      bioShort.innerHTML = safeBioString.replace(/<\/?[^>]+(>|$)/g, ""); 
      
      content.appendChild(bioShort);
    }

    const arrow = doc.createElement('div');
    arrow.className = 'event-person-arrow';
    arrow.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`;
    content.appendChild(arrow);
    cardFront.appendChild(content);
    
    // Back side
    const cardBack = doc.createElement('div');
    cardBack.className = 'card-back';
    
    const backName = doc.createElement('div');
    backName.className = 'person-name';
    backName.textContent = name;
    cardBack.appendChild(backName);
    
    if (roleText) {
      const backRole = doc.createElement('div');
      backRole.className = 'person-role';
      backRole.textContent = roleText;
      cardBack.appendChild(backRole);
    }
    
    const backBio = doc.createElement('div');
    backBio.className = 'person-bio';
    backBio.innerHTML = bio ? (typeof bio === 'string' ? bio : String(bio)) : '';
    cardBack.appendChild(backBio);
    
    const linkedin = person?.linkedInUrl;
    if (linkedin) {
      const linkedinLink = doc.createElement('a');
      linkedinLink.className = 'linkedin-link';
      linkedinLink.href = linkedin;
      linkedinLink.target = '_blank';
      linkedinLink.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
        LinkedIn Profile
      `;
      cardBack.appendChild(linkedinLink);
    }
    
    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    
  } else {
    // --- OLD LEGACY DESIGN (Pre-2026) ---
    card.className = 'event-person-card legacy';
    
    card.dataset.name = name || '';
    card.dataset.role = roleText || '';
    card.dataset.bio = bio ? (typeof bio === 'string' ? bio : String(bio)) : '';
    
    const photo = getPersonImage(person);
    if (photo?.url) {
      card.dataset.photo = withImageParams(photo.url, 'fm=webp&w=1080&q=85');
    }
    
    const avatar = doc.createElement('div');
    avatar.className = 'event-person-avatar';
    
    if (photo?.url) {
      const img = doc.createElement('img');
      img.src = withImageParams(photo.url, PERSON_IMAGE_PARAMS);
      img.alt = photo.description || name || 'Event contributor';
      img.loading = 'lazy';
      img.decoding = 'async';
      avatar.appendChild(img);
    } else {
      const span = doc.createElement('span');
      span.textContent = getNameInitial(person);
      avatar.appendChild(span);
    }
    card.appendChild(avatar);

    const meta = doc.createElement('div');
    meta.className = 'event-person-meta';
    
    const nameEl = doc.createElement('div');
    nameEl.className = 'event-person-name';
    nameEl.textContent = name;
    meta.appendChild(nameEl);

    if (roleText) {
      const roleEl = doc.createElement('div');
      roleEl.className = 'event-person-role';
      roleEl.textContent = roleText;
      meta.appendChild(roleEl);
    }
    card.appendChild(meta);
  }

  // ADD LINKEDIN ICON IF APPLICABLE AND AVAILABLE (Speakers & Hosts)
  if (showLinkedIn) {
    const linkedInUrl = person?.linkedInProfileLink || person?.linkedin || person?.linkedInUrl;
    if (linkedInUrl) {
      if (isNewEra) card.dataset.linkedin = linkedInUrl;
      const lnk = doc.createElement('a');
      lnk.className = 'linkedin';
      lnk.href = linkedInUrl;
      lnk.target = '_blank';
      lnk.rel = 'noopener noreferrer';
      lnk.setAttribute('aria-label', `LinkedIn profile of ${name}`);
      if (isNewEra) lnk.setAttribute('onclick', 'event.stopPropagation()');
      
      const lnkImg = doc.createElement('img');
      lnkImg.src = '/assets/logos/social/LI-In-Bug.png';
      lnkImg.alt = '';
      
      lnk.appendChild(lnkImg);
      card.appendChild(lnk);
    }
  }

  return card;
}

function renderEventTeams(doc, teamsCollection) {
  const section = doc.getElementById('eventTeamsSection');
  const container = doc.getElementById('eventTeams');
  if (!section || !container) return;

  container.innerHTML = '';
  const teams = normalizedItems(teamsCollection);
  if (!teams.length) {
    section.hidden = true;
    return;
  }

  const sections = teams
    .map(teamEntry => buildTeamSection(doc, teamEntry))
    .filter(Boolean);

  if (!sections.length) {
    section.hidden = true;
    return;
  }

  const frag = doc.createDocumentFragment();
  sections.forEach(teamSection => frag.appendChild(teamSection));
  container.appendChild(frag);
  section.hidden = false;
}

function buildTeamSection(doc, teamEntry) {
  const members = normalizedItems(teamEntry?.teamMembersCollection);
  if (!members.length) return null;

  const section = doc.createElement('section');
  section.className = 'event-team-section';

  const header = doc.createElement('header');
  header.className = 'event-team-header';
  const heading = doc.createElement('h3');
  heading.textContent = teamEntry?.name || 'Team';
  header.appendChild(heading);
  section.appendChild(header);

  const grid = doc.createElement('div');
  grid.className = 'team-grid';
  const cols = doc.createElement('div');
  cols.className = 'cols';

  for (let i = 1; i <= 4; i++) {
    const col = doc.createElement('div');
    col.className = `col col-${i}`;
    cols.appendChild(col);
  }

  distributeTeamMembers(doc, members, cols);
  grid.appendChild(cols);
  section.appendChild(grid);

  return section;
}

function distributeTeamMembers(doc, members, colsWrapper) {
  const colEls = Array.from(colsWrapper.querySelectorAll('.col'));
  if (!colEls.length) return;

  members.forEach((member, idx) => {
    const colIndex = idx % colEls.length;
    colEls[colIndex].appendChild(buildTeamCard(doc, member));
  });
}

function buildTeamCard(doc, member) {
  const derivedName = (member?.displayName || member?.name || [member?.firstName, member?.lastName].filter(Boolean).join(' ')).trim();
  const fullName = derivedName || 'Team member';
  const roleText = member?.positionTitle || member?.title || '';
  const portraitAsset = member?.portrait?.url ? member.portrait : member?.photo;

  const card = doc.createElement('article');
  card.className = 'team-card';

  const wrap = doc.createElement('div');
  wrap.className = 'portrait-wrap animate-once';
  wrap.dataset.anim = 'slide-up';

  if (portraitAsset?.url) {
    const img = doc.createElement('img');
    img.className = 'portrait';
    img.src = withImageParams(portraitAsset.url, TEAM_IMAGE_PARAMS);
    img.alt = portraitAsset.description || fullName || 'Team member';
    img.loading = 'lazy';
    img.decoding = 'async';
    wrap.appendChild(img);
  } else {
    const placeholder = doc.createElement('div');
    placeholder.className = 'portrait portrait--placeholder';
    placeholder.textContent = (fullName || '?').charAt(0).toUpperCase();
    placeholder.setAttribute('aria-label', fullName || 'Team member');
    wrap.appendChild(placeholder);
  }

  // ADD LINKEDIN ICON IF AVAILABLE
  if (member?.linkedInUrl) {
    const lnk = doc.createElement('a');
    lnk.className = 'linkedin';
    lnk.href = member.linkedInUrl;
    lnk.target = '_blank';
    lnk.rel = 'noopener noreferrer';
    lnk.setAttribute('aria-label', `LinkedIn profile of ${fullName}`);

    const lnkImg = doc.createElement('img');
    lnkImg.src = '/assets/logos/social/LI-In-Bug.png';
    lnkImg.alt = '';

    lnk.appendChild(lnkImg);
    wrap.appendChild(lnk);
  }

  const label = doc.createElement('div');
  label.className = 'card-label';

  const nameEl = doc.createElement('span');
  nameEl.className = 'name';
  nameEl.textContent = fullName;
  label.appendChild(nameEl);

  if (roleText) {
    const roleEl = doc.createElement('span');
    roleEl.className = 'role';
    roleEl.textContent = roleText;
    label.appendChild(roleEl);
  }

  wrap.appendChild(label);
  card.appendChild(wrap);

  return card;
}

function normalizedItems(collection) {
  if (!collection) return [];
  if (Array.isArray(collection)) return collection.filter(Boolean);
  if (Array.isArray(collection.items)) return collection.items.filter(Boolean);
  return [];
}

function getPreferredAsset(entry, keys) {
  if (!entry) return null;
  for (const key of keys) {
    const asset = entry[key];
    if (asset?.url) return asset;
  }
  return null;
}

function withImageParams(url, params) {
  if (!url) return '';
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${params}`;
}

function setText(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.textContent = value || '';
}

function setHtml(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.innerHTML = value || '';
}

function formatDateRange(startISO, endISO) {
  const fmt = new Intl.DateTimeFormat(undefined, { month: 'long', day: 'numeric' });
  const parse = (val) => {
    if (!val) return null;
    const date = new Date(val);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const start = parse(startISO);
  const end = parse(endISO);

  if (start && end) {
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) return fmt.format(start);
    return `${fmt.format(start)} – ${fmt.format(end)}`;
  }
  if (start) return fmt.format(start);
  if (end) return fmt.format(end);
  return '';
}

function metaLine(event) {
  const datePart = formatDateRange(event?.startTime, event?.endTime);
  const locationPart = event?.location || '';
  return [datePart, locationPart].filter(Boolean).join(' • ');
}

function normalizePersonName(person) {
  const fallback = [person?.firstName, person?.lastName].filter(Boolean).join(' ');
  return (person?.name || fallback || person?.title || '').trim();
}

function normalizeRole(person) {
  return (person?.positionTitle || person?.title || person?.jobTitle || person?.role || '').trim();
}

function getPersonImage(person) {
  if (person?.photo?.url) return person.photo;
  if (person?.portrait?.url) return person.portrait;
  return null;
}

function getNameInitial(person) {
  const name = normalizePersonName(person);
  const firstChar = name.charAt(0).toUpperCase();
  return firstChar || '?';
}