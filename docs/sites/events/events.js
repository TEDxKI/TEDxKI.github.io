import { renderEventContent, renderEventOptions, determineInitialYear } from './eventRenderer.js';

const FALLBACK_DEFAULT_YEAR = 2025;

let revealIndexSeed = 0;
let heroResizeHandle;
const pageState = {
  events: [],
  defaultYear: FALLBACK_DEFAULT_YEAR,
};
let activeYear = null;

const revealObserver = typeof window !== 'undefined' && 'IntersectionObserver' in window
  ? new IntersectionObserver((entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;

        const kickoff = () => {
          el.classList.add('animating', 'pre-reveal');

          requestAnimationFrame(() => {
            const idx = Number(el.dataset.revealIndex || 0);
            const delay = Math.min(420, 40 + idx * 22);
            setTimeout(() => {
              if (el.classList.contains('portrait-wrap')) {
                el.classList.add('revealed');
              } else {
                el.classList.add('is-visible');
              }
              el.addEventListener('transitionend', () => {
                el.classList.remove('animating', 'pre-reveal');
                el.style.willChange = 'auto';
              }, { once: true });
            }, delay);
          });

          obs.unobserve(el);
        };

        if (el.classList.contains('portrait-wrap')) {
          const img = el.querySelector('img');
          if (img && 'decode' in img) {
            img.decode().catch(() => {}).finally(kickoff);
          } else {
            kickoff();
          }
        } else {
          kickoff();
        }
      }
    }, {
      root: null,
      rootMargin: '200px 0px 140px 0px',
      threshold: 0.01
    })
  : null;

function observeForReveal(el) {
  if (!el) return;
  if (!revealObserver) {
    if (el.classList.contains('portrait-wrap')) {
      el.classList.add('revealed');
    } else {
      el.classList.add('is-visible');
    }
    return;
  }
  if (el.dataset.revealBound === '1') return;
  if (el.classList.contains('portrait-wrap') && !el.dataset.revealIndex) {
    el.dataset.revealIndex = String(revealIndexSeed++);
  }
  el.dataset.revealBound = '1';
  revealObserver.observe(el);
}

function primeStaticReveals({ resetIndices = false } = {}) {
  if (resetIndices) revealIndexSeed = 0;
  const targets = document.querySelectorAll('.animate-once');
  if (!targets.length) return;
  targets.forEach(observeForReveal);
}

function applyHeroSizing() {
  const hero = document.querySelector('.event-hero');
  const heroImg = document.getElementById('eventImage');
  if (!hero || !heroImg) return;
  const height = heroImg.getBoundingClientRect().height;
  if (!height || !Number.isFinite(height)) return;
  hero.style.setProperty('--hero-img-height', `${height}px`);
}

function queueHeroSizing() {
  clearTimeout(heroResizeHandle);
  heroResizeHandle = setTimeout(() => {
    requestAnimationFrame(applyHeroSizing);
  }, 120);
}

function readEmbeddedEvents() {
  const el = document.getElementById('event-data');
  if (!el) return { events: [] };
  try {
    return JSON.parse(el.textContent || '{}');
  } catch (err) {
    console.error('[event] Failed to parse embedded events payload', err);
    return { events: [] };
  }
}

function getSelectedYearFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('year');
    if (!raw) return null;
    const parsed = Number.parseInt(raw.trim(), 10);
    return Number.isNaN(parsed) ? null : parsed;
  } catch (err) {
    return null;
  }
}

function updateUrlYear(year) {
  if (typeof history?.replaceState !== 'function') return;
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('year', String(year));
    history.replaceState({}, '', url.toString());
  } catch (err) {
    console.warn('[event] Failed to update URL params', err);
  }
}

function setActiveEventOption(year) {
  const buttons = document.querySelectorAll('.event-switcher__option');
  buttons.forEach(btn => {
    const btnYear = Number.parseInt(btn.dataset.year, 10);
    if (btnYear === year) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });
}

function loadEvent(year) {
  const event = pageState.events.find(evt => evt.yearIdentifier === year);
  if (!event) {
    console.warn('[event] No event entry found for year', year);
    return false;
  }
  activeYear = year;
  renderEventContent(document, event, { fallbackYear: year });
  primeStaticReveals({ resetIndices: true });
  setActiveEventOption(year);
  queueHeroSizing();
  return true;
}

function bootstrap() {
  primeStaticReveals();
  const embedded = readEmbeddedEvents();
  pageState.events = Array.isArray(embedded.events) ? embedded.events : [];
  pageState.defaultYear = embedded.defaultYear || FALLBACK_DEFAULT_YEAR;

  const preferredFromUrl = getSelectedYearFromUrl();
  const initialYear = determineInitialYear(
    pageState.events,
    preferredFromUrl,
    embedded.initialYear || pageState.defaultYear
  ) || pageState.defaultYear;

  renderEventOptions(document, pageState.events, initialYear, (year) => {
    if (year === activeYear) return;
    if (loadEvent(year)) {
      updateUrlYear(year);
    }
  });

  if (!loadEvent(initialYear)) {
    const fallback = pageState.events[0]?.yearIdentifier || pageState.defaultYear;
    loadEvent(fallback);
  }

  window.addEventListener('resize', queueHeroSizing, { passive: true });
  initPersonModal();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

function ensurePersonModalOverlay() {
  let overlay = document.getElementById('person-modal-overlay');
  if (overlay) return overlay;

  overlay = document.createElement('div');
  overlay.id = 'person-modal-overlay';
  overlay.className = 'person-modal-overlay';
  overlay.innerHTML = `
    <div class="person-modal" role="dialog" aria-modal="true" aria-label="Event contributor details">
      <div class="person-modal-img"></div>
      <div class="person-modal-body">
        <button type="button" class="person-modal-close" aria-label="Close profile dialog">×</button>
        <h2 class="person-modal-title"></h2>
        <div class="person-modal-role"></div>
        <div class="person-modal-bio"></div>
      </div>
    </div>
  `;

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay || event.target.closest('.person-modal-close')) {
      closePersonModal();
    }
  });

  document.body.appendChild(overlay);
  return overlay;
}

function updateBioScrollFade(bioEl) {
  if (!bioEl) return;
  const canScroll = bioEl.scrollHeight > bioEl.clientHeight;
  bioEl.classList.toggle('scrollable', canScroll);
  const scrollTop = bioEl.scrollTop;
  bioEl.classList.toggle('has-top-fade', scrollTop > 6);
  bioEl.classList.toggle('has-bottom-fade', scrollTop + bioEl.clientHeight + 6 < bioEl.scrollHeight);
}

function openPersonModal({ name = '', role = '', bio = '', photo = '', linkedin = '' } = {}) {
  const overlay = ensurePersonModalOverlay();
  const modal = overlay.querySelector('.person-modal');
  const imageContainer = overlay.querySelector('.person-modal-img');
  const titleEl = overlay.querySelector('.person-modal-title');
  const roleEl = overlay.querySelector('.person-modal-role');
  const bioEl = overlay.querySelector('.person-modal-bio');

  titleEl.textContent = name;
  roleEl.textContent = role;

  const safeBio = String(bio || '').trim();
  bioEl.innerHTML = safeBio || '<p>No bio available.</p>';
  updateBioScrollFade(bioEl);

  bioEl.removeEventListener('scroll', bioEl.__scrollFadeHandler);
  bioEl.__scrollFadeHandler = () => updateBioScrollFade(bioEl);
  bioEl.addEventListener('scroll', bioEl.__scrollFadeHandler, { passive: true });

  imageContainer.innerHTML = '';
  if (photo) {
    const img = document.createElement('img');
    img.src = photo;
    img.alt = `${name || 'Speaker'} photo`;
    img.className = 'person-modal-img-content';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.3s ease';
    img.onload = () => {
      img.style.opacity = '1';
    };
    imageContainer.appendChild(img);
  }

  // Add LinkedIn button if available
  let linkedInBtn = overlay.querySelector('.linkedin-modal-link');
  if (linkedInBtn) linkedInBtn.remove();
  if (linkedin) {
    linkedInBtn = document.createElement('a');
    linkedInBtn.className = 'linkedin-modal-link';
    linkedInBtn.href = linkedin;
    linkedInBtn.target = '_blank';
    linkedInBtn.rel = 'noopener noreferrer';
    linkedInBtn.innerHTML = `
      <span>LinkedIn profile</span>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    `;
    overlay.querySelector('.person-modal-body').appendChild(linkedInBtn);
  }

  overlay.classList.add('active');
  if (modal) modal.focus?.();
}

function closePersonModal() {
  const overlay = document.getElementById('person-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('active');
}

function initPersonModal() {
  document.addEventListener('click', (event) => {
    // Ignore explicit clicks on LinkedIn icon links so they behave normally.
    if (event.target.closest('.event-person-card.new-era .linkedin, .event-person-card.new-era .linkedin-link')) {
      return;
    }

    const card = event.target.closest('.event-person-card.new-era');
    if (!card) return;

    const personData = {
      name: card.dataset.name || '',
      role: card.dataset.role || '',
      bio: card.dataset.bio || '',
      photo: card.dataset.photo || '',
      linkedin: card.dataset.linkedin || '',
    };

    // Prevent stale data from previous profile
    openPersonModal(personData);
  });
}