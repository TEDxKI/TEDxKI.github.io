//<!-- /partials/includes.js -->

class SiteHeader extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
    <header class="site-header" id="top" role="banner">
    <nav class="nav container" role="navigation" aria-label="Main navigation">
        <a class="logo" href="/index.html" aria-label="Go to homepage">
        <img id="site-logo" src="/assets/logos/logo.png" alt="Project Logo" width="1176" height="252" loading="eager">
        </a>
        <ul class="nav-links" role="menubar">
        <li><a href="/index.html">HOME</a></li>
        <li><a href="/sites/about/about.html">ABOUT</a></li>
        <li><a href="/sites/events/events.html">EVENTS</a></li>
        <li><a href="/sites/team/team.html">TEAM</a></li>
        <li><a href="/sites/sponsors/sponsors.html">SPONSORS</a></li>
        <li><a href="/sites/watch/watch.html">WATCH</a></li>
        <li><a href="/sites/contact/contact.html">CONTACT</a></li>
        </ul>
        <div class="controls">
        <button id="theme-toggle" class="theme-toggle" aria-label="Toggle light / dark" aria-pressed="false" title="Toggle theme">
            <span class="theme-track" aria-hidden="true">
            <img src="/assets/icons/sun.png" alt="" class="theme-img theme-img-sun" />
            <img src="/assets/icons/moon.png" alt="" class="theme-img theme-img-moon" />
            <span class="theme-thumb" aria-hidden="true"></span>
            </span>
        </button>
        <button class="hamburger" id="hamburger" aria-label="Open navigation" aria-expanded="false">
            <span></span><span></span><span></span>
        </button>
        </div>
    </nav>
    </header>
    <div class="mobile-menu" id="mobileMenu" aria-hidden="true">
        <div class="mobile-top">
        <button id="mobile-theme-toggle" class="theme-toggle small" aria-label="Toggle theme (mobile)" aria-pressed="false" title="Toggle theme">
            <span class="theme-track" aria-hidden="true">
            <img src="/assets/icons/sun.png" alt="" class="theme-img theme-img-sun" />
            <img src="/assets/icons/moon.png" alt="" class="theme-img theme-img-moon" />
            <span class="theme-thumb" aria-hidden="true"></span>
            </span>
        </button>
        <button id="mobileClose" class="mobile-close" aria-label="Close menu">Close</button>
        </div>
        <a href="/index.html">HOME</a>
        <a href="/sites/about/about.html">ABOUT</a>
        <a href="/sites/events/events.html">EVENTS</a>
        <a href="/sites/team/team.html">TEAM</a>
        <a href="/sites/sponsors/sponsors.html">SPONSORS</a>
        <a href="/sites/watch/watch.html">WATCH</a>
        <a href="/sites/contact/contact.html">CONTACT</a>
    </div>`;
  }
}

class SocialStrip extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
    <aside class="social-strip" id="socialStrip" aria-label="Social Media Links">
    <a class="social" href="https://www.instagram.com/tedxki/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
        <img src="/assets/logos/social/Instagram_Glyph_Gradient.png" alt="" class="social-logo" />
        <span class="label">Instagram</span>
    </a>
    <a class="social" href="https://www.tiktok.com/@tedxki" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
        <img src="/assets/logos/social/TikTok_Icon_Black_Circle.png" alt="" class="social-logo" />
        <span class="label">TikTok</span>
    </a>
    <a class="social" href="https://www.linkedin.com/company/tedxki/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <img src="/assets/logos/social/LI-In-Bug.png" alt="" class="social-logo" />
        <span class="label">LinkedIn</span>
    </a>
    <a class="social" href="https://www.facebook.com/people/TEDx-KI/61560876282016/" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
        <img src="/assets/logos/social/Facebook_Logo_Primary.png" alt="" class="social-logo" />
        <span class="label">Facebook</span>
    </a>
    </aside>`;
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
<footer class="site-footer safe-pad">
  <div class="container footer-inner">
    <p>© <span id="year"></span> TEDxKI. All rights reserved. | x = independently organized TED event</p>
    <a class="footer-badge" href="/index.html" aria-label="Go to homepage">
      <img src="/assets/logos/TEDxWithDisclaimer_light.png" alt="TEDxKI Logo (with disclaimer: x = independently organized TED event)" width="1194" height="364" decoding="async"/>
    </a>
  </div>
</footer>`;
  }
}

class TeamApplyOverlay extends HTMLElement {
  connectedCallback(){
    this.innerHTML = `
    <style>
      /* Team application layover — built from the site's existing tokens
         (--accent, --bg, --surface, --muted, --shadow, --btn-radius, InterVar)
         so it drops in without touching styles.css. */
      .apply-backdrop{
        position:fixed; inset:0; z-index:210;
        background:rgba(8,10,14,0.72);
        backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
        opacity:0; pointer-events:none;
        transition:opacity 280ms ease;
      }
      .apply-backdrop.open{ opacity:1; pointer-events:all; }
 
      .apply-modal{
        position:fixed; inset:0; z-index:211;
        display:flex; align-items:center; justify-content:center;
        padding:1rem;
        opacity:0; pointer-events:none;
        transition:opacity 280ms ease;
      }
      .apply-modal.open{ opacity:1; pointer-events:all; }
 
      .apply-card{
        position:relative;
        width:min(92vw, 480px);
        max-height:90vh;
        overflow-y:auto;
        background:var(--bg);
        border-radius:20px;
        box-shadow:0 32px 80px rgba(0,0,0,0.45);
        padding:2rem 1.9rem 1.8rem;
        transform:scale(0.96) translateY(10px);
        transition:transform 320ms cubic-bezier(.2,.9,.2,1);
      }
      .apply-modal.open .apply-card{ transform:scale(1) translateY(0); }
 
      .apply-card::before{
        content:""; position:absolute; inset:0 0 auto 0; height:140px;
        border-radius:20px 20px 0 0;
        background:radial-gradient(120% 100% at 12% 0%, rgba(235,0,40,0.16), transparent 60%);
        pointer-events:none;
      }
 
      .apply-close{
        position:absolute; top:14px; right:14px; width:36px; height:36px;
        display:inline-flex; align-items:center; justify-content:center;
        background:var(--surface); color:var(--text); border:0; border-radius:50%;
        cursor:pointer; transition:background 180ms ease, transform 180ms ease;
      }
      .apply-close:hover, .apply-close:focus-visible{ background:rgba(235,0,40,0.12); transform:rotate(90deg); }
 
      .apply-intro{ position:relative; padding-right:2rem; }
      .apply-intro h2{
        margin:0 0 .6rem; font-size:clamp(1.35rem, 3.4vw, 1.7rem);
        font-weight:800; letter-spacing:-0.01em; line-height:1.2; color:var(--text);
      }
      .apply-intro p{ margin:0 0 1.2rem; color:var(--muted); line-height:1.55; max-width:46ch; }
 
      .apply-actions{ display:flex; align-items:center; gap:1rem; flex-wrap:wrap; margin-bottom:.6rem; }
      .apply-cta{ display:inline-flex; align-items:center; gap:.55rem; font-size:.98rem; padding:.75rem 1.3rem; }
      .apply-cta-icon{ transition:transform 260ms cubic-bezier(.34,1.56,.64,1); }
      .apply-cta:hover .apply-cta-icon,
      .apply-cta:focus-visible .apply-cta-icon{ transform:translate(3px,-3px) rotate(10deg); }
 
      /* one playful, single-shot nudge on the plane icon each time the overlay opens —
         a little "ready for takeoff" wiggle rather than a looping ambient animation */
      @keyframes applyPlaneNudge{
        0%   { transform:translate(0,0) rotate(0deg); }
        30%  { transform:translate(4px,-4px) rotate(14deg); }
        55%  { transform:translate(-1px,1px) rotate(-4deg); }
        78%  { transform:translate(2px,-2px) rotate(8deg); }
        100% { transform:translate(0,0) rotate(0deg); }
      }
      .apply-modal.open .apply-cta-icon{
        animation:applyPlaneNudge 900ms cubic-bezier(.34,1.56,.64,1) 850ms 1 both;
      }
 
      .apply-note{ margin:0 0 1.1rem; font-size:.83rem; color:var(--muted); }
 
      .apply-dismiss{
        background:none; border:0; color:var(--muted); font-weight:600; font-size:.9rem;
        cursor:pointer; padding:.6rem .2rem; transition:color 180ms ease;
      }
      .apply-dismiss:hover, .apply-dismiss:focus-visible{ color:var(--text); }
 
      .apply-reopen{
        position:fixed; left:18px; bottom:18px; z-index:120;
        display:none; align-items:center; gap:.5rem;
        padding:.65rem 1.05rem; border-radius:999px; border:0; cursor:pointer;
        font-weight:700; font-size:.85rem; color:#fff;
        background:linear-gradient(90deg,var(--accent),#ff6b3c);
        box-shadow:0 8px 22px rgba(235,0,40,0.22);
        transition:transform 180ms ease, box-shadow 180ms ease;
      }
      .apply-reopen.visible{ display:inline-flex; }
      .apply-reopen:hover, .apply-reopen:focus-visible{ transform:translateY(-3px); box-shadow:0 12px 28px rgba(235,0,40,0.26); }
      .apply-reopen::before{
        content:""; width:8px; height:8px; border-radius:50%; background:#fff;
        box-shadow:0 0 0 3px rgba(255,255,255,0.35);
      }
 
      @media (max-width:600px){
        .apply-card{ width:100%; max-height:94vh; padding:1.6rem 1.3rem 1.4rem; border-radius:16px; }
        .apply-intro{ padding-right:1.4rem; }
        .apply-actions{ flex-direction:column; align-items:stretch; }
        .apply-cta{ justify-content:center; }
        .apply-reopen{ left:12px; right:12px; bottom:12px; justify-content:center; }
      }
 
      @media (prefers-reduced-motion: reduce){
        .apply-backdrop, .apply-modal, .apply-card, .apply-close, .apply-reopen, .apply-cta-icon{ transition:none !important; animation:none !important; }
        .apply-card{ transform:none !important; }
      }
    </style>
 
    <div class="apply-backdrop" id="applyBackdrop"></div>
 
    <div class="apply-modal" id="applyModal" role="dialog" aria-modal="true" aria-labelledby="applyTitle" aria-hidden="true">
      <div class="apply-card">
        <button class="apply-close" id="applyClose" type="button" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="4" y1="4" x2="20" y2="20"/><line x1="20" y1="4" x2="4" y2="20"/></svg>
        </button>
 
        <div class="apply-intro">
          <h2 id="applyTitle">Next year's team starts with you</h2>
          <p><span class="brand-mark">TED</span><span class="sup">x</span><span class="brand-tail">KI</span> is looking for organizers for next year's event. No experience required — just curiosity and the drive to help make it happen.</p>
 
          <div class="apply-actions">
            <a class="btn primary apply-cta" id="applyCta" href="https://docs.google.com/forms/d/e/1FAIpQLSf3h_XvI9-BZS7IgYZ9npBERTgCOHUKSzf1kAggBcPGUsRPcg/viewform?usp=header" target="_blank" rel="noopener noreferrer">
              <span>Apply now</span>
              <svg class="apply-cta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <line x1="21" y1="3" x2="10" y2="14"/>
                <polygon points="21 3 14 21 10 14 3 10 21 3"/>
              </svg>
            </a>
            <button class="apply-dismiss" id="applyDismiss" type="button">Not now</button>
          </div>
 
          <p class="apply-note">Opens the application form on Google Forms, in a new tab.</p>
        </div>
      </div>
    </div>
 
    <button class="apply-reopen" id="applyReopen" type="button">
      Team applications open
    </button>`;
 
    const backdrop   = this.querySelector('#applyBackdrop');
    const modal      = this.querySelector('#applyModal');
    const closeBtn   = this.querySelector('#applyClose');
    const dismissBtn = this.querySelector('#applyDismiss');
    const reopenBtn  = this.querySelector('#applyReopen');
    const ctaLink    = this.querySelector('#applyCta');
 
    const STORAGE_KEY = 'tedxki-apply-dismissed';
    let lastFocused = null;
 
    const openModal = () => {
      lastFocused = document.activeElement;
      backdrop.classList.add('open');
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      reopenBtn.classList.remove('visible');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    };
 
    const closeModal = (remember) => {
      backdrop.classList.remove('open');
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      reopenBtn.classList.add('visible');
      if (remember) {
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* ignore */ }
      }
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };
 
    closeBtn.addEventListener('click', () => closeModal(true));
    dismissBtn.addEventListener('click', () => closeModal(true));
    backdrop.addEventListener('click', () => closeModal(true));
    ctaLink.addEventListener('click', () => closeModal(true));
    reopenBtn.addEventListener('click', openModal);
 
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && modal.classList.contains('open')) closeModal(true);
    });
 
    // Auto-open once per browser session (skips repeat pop-ups on every page).
    // If the person already closed it this session, only the reopen pill shows.
    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { /* ignore */ }
 
    if (alreadySeen) {
      reopenBtn.classList.add('visible');
    } else {
      window.setTimeout(openModal, 1200);
    }
  }
}


customElements.define('site-header', SiteHeader);
customElements.define('social-strip', SocialStrip);
customElements.define('site-footer', SiteFooter);
customElements.define('team-apply-overlay', TeamApplyOverlay);