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
    </div>
    </header>`;
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


customElements.define('site-header', SiteHeader);
customElements.define('social-strip', SocialStrip);
customElements.define('site-footer', SiteFooter);
class FlashSaleOverlay extends HTMLElement {
  connectedCallback() {
    this.classList.add('flash-sale-overlay');
    this.setAttribute('aria-hidden', 'true');
    this.innerHTML = `
      <div class="flash-sale-backdrop"></div>
      <section class="flash-sale-popup" role="dialog" aria-modal="true" aria-label="Flash sale offer">
        <button class="flash-sale-close" type="button" aria-label="Close flash sale overlay">×</button>
        <div class="flash-sale-inner">
          <div class="flash-sale-copy">
            <span class="flash-sale-badge">Flash Sale</span>
            <h2 class="flash-sale-title">Get the sale as long as it’s available!</h2>
            <p class="flash-sale-subtitle">Extra discount on TEDxKI 2026 tickets — save now and meet the speakers and performers who are moving momentum forward.</p>

            <div class="flash-sale-hero">
              <img src="https://images.ctfassets.net/4fo2kk5ozptr/2srGQbi2kFB5PIwuc1F7NL/f05f4bda45ff6369b57e7e3d92074b6d/Sale.jpg" alt="Flash Sale Banner" loading="eager" />
            </div>

            <div class="flash-sale-timer" aria-label="Countdown to event">
              <h3>Event starts in</h3>
              <div class="countdown-frame">
                <div class="countdown-item">
                  <span id="flash-days">00</span>
                  <label>Days</label>
                </div>
                <div class="countdown-item">
                  <span id="flash-hours">00</span>
                  <label>Hours</label>
                </div>
                <div class="countdown-item">
                  <span id="flash-minutes">00</span>
                  <label>Minutes</label>
                </div>
                <div class="countdown-item">
                  <span id="flash-seconds">00</span>
                  <label>Seconds</label>
                </div>
              </div>
            </div>

            <div class="flash-sale-actions">
              <a class="flash-sale-btn" href="https://billetto.se/e/tedxki-2026-momentum-biljetter-1883169?utm_source=organiser&utm_medium=share&utm_campaign=copy_link&utm_content=1" target="_blank" rel="noopener noreferrer">Claim Tickets — Save 20%</a>
              <p class="flash-sale-hint">Use code <strong>FLASH20</strong> at checkout while the discount lasts.</p>
            </div>
          </div>

          <div class="flash-sale-cards">
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/5vmhLgR9qwVfWNOMEjHDNe/361c28d17510619f0154bced32281d4b/1.jpg" alt="Moa Ilar" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Moa Ilar</h4>
                <p class="speaker-card__meta">National Cross-Country Skier</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/5jBSo7u40l8AA4aMejxICo/76d2c70374e4a6ed82a1700a452a27b8/2.jpg" alt="Sam Hultin" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Sam Hultin</h4>
                <p class="speaker-card__meta">Artist</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/67VrOXcWGziPwa1gumAHvM/5cc4f94e739e9d32cdb9aac6d5ed0426/3.jpg" alt="Johanna Nissén" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Johanna Nissén</h4>
                <p class="speaker-card__meta">Co-Founder & CEO</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/18KclIn0maMMmY8etF5pk2/60ee40aabad7ac2a34513cbdbce37597/4.jpg" alt="Sebastian Blomé" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Sebastian Blomé</h4>
                <p class="speaker-card__meta">Researcher</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/1tvV3tdDIIQTIbmhG7foyV/fdfd1db9ba51dd1dc4c34b836d3bdd99/6.jpg" alt="Pella Thiel" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Pella Thiel</h4>
                <p class="speaker-card__meta">Nature Advocate</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/6QEGy9TWW8WkceoyGY8OP5/f69517cb3020cc73c488841323b193c8/7.jpg" alt="Sara Hägg" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Sara Hägg</h4>
                <p class="speaker-card__meta">Associate Professor</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
            <article class="speaker-card">
              <div class="speaker-card__photo"><img src="https://images.ctfassets.net/4fo2kk5ozptr/6th0Mx03HjMHzVhqXKSofV/cdee4d52e256eedfb53cacb28c8bd6c5/6.jpg" alt="Christopher Sparshott" loading="lazy"></div>
              <div class="speaker-card__body">
                <p class="speaker-card__label">Speaker</p>
                <h4 class="speaker-card__title">Christopher Sparshott</h4>
                <p class="speaker-card__meta">Teaching & Learning Specialist</p>
                <a class="speaker-card__link" href="/sites/events/events.html">Learn more</a>
              </div>
            </article>
          </div>
        </div>
      </section>`;
    this.bindOverlayEvents();
  }

  bindOverlayEvents() {
    const closeButton = this.querySelector('.flash-sale-close');
    const backdrop = this.querySelector('.flash-sale-backdrop');
    const popup = this.querySelector('.flash-sale-popup');

    const closeOverlay = () => {
      this.classList.remove('active');
      this.setAttribute('aria-hidden', 'true');
      popup?.classList.remove('visible');
    };

    closeButton?.addEventListener('click', closeOverlay);
    backdrop?.addEventListener('click', closeOverlay);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.classList.contains('active')) {
        closeOverlay();
      }
    });
  }

  openOverlay() {
    const popup = this.querySelector('.flash-sale-popup');
    this.classList.add('active');
    this.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => popup?.classList.add('visible'));
    // Start the flash countdown when overlay opens
    updateFlashCountdown();
  }
}
customElements.define('flash-sale-overlay', FlashSaleOverlay);

class NewsletterPopupElement extends HTMLElement {
  connectedCallback() {
    this.classList.add('newsletter-popup');
  }
}
customElements.define('newsletter-popup', NewsletterPopupElement);


//<!-- Countdown
const eventDate = Date.UTC(2026, 3, 18, 10, 0, 0);

function formatCountdownValue(value) {
  return String(value).padStart(2, '0');
}

function updateCountdown(){
  const now = Date.now();
  const distance = eventDate - now;
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  if (distance <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  daysEl.textContent = formatCountdownValue(days);
  hoursEl.textContent = formatCountdownValue(hours);
  minutesEl.textContent = formatCountdownValue(minutes);
  secondsEl.textContent = formatCountdownValue(seconds);
}

setInterval(updateCountdown,1000);

const FLASH_SALE_SEEN_KEY = 'tedxkiFlashSaleSeen';
const FLASH_SALE_DELAY = 1200;

function updateFlashCountdown() {
  const now = Date.now();
  const distance = eventDate - now;
  const daysEl = document.getElementById("flash-days");
  const hoursEl = document.getElementById("flash-hours");
  const minutesEl = document.getElementById("flash-minutes");
  const secondsEl = document.getElementById("flash-seconds");

  // Only update if the flash sale overlay is currently in the DOM
  const overlay = document.querySelector('flash-sale-overlay');
  if (!overlay || !daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  if (distance <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    return;
  }

  const days = Math.floor(distance / (1000*60*60*24));
  const hours = Math.floor((distance % (1000*60*60*24)) / (1000*60*60));
  const minutes = Math.floor((distance % (1000*60*60)) / (1000*60));
  const seconds = Math.floor((distance % (1000*60)) / 1000);

  daysEl.textContent = formatCountdownValue(days);
  hoursEl.textContent = formatCountdownValue(hours);
  minutesEl.textContent = formatCountdownValue(minutes);
  secondsEl.textContent = formatCountdownValue(seconds);
}

function maybeShowFlashSale() {
  try {
    if (sessionStorage.getItem(FLASH_SALE_SEEN_KEY)) return;
  } catch (err) {
    return;
  }

  // Use the existing flash-sale-overlay element from the HTML
  const overlay = document.querySelector('flash-sale-overlay');
  if (overlay) {
    overlay.openOverlay();
  }

  try {
    sessionStorage.setItem(FLASH_SALE_SEEN_KEY, 'true');
  } catch (err) {
    // ignore storage failures
  }
}

function startFlashSaleDisplay() {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => setTimeout(maybeShowFlashSale, FLASH_SALE_DELAY));
  } else {
    setTimeout(maybeShowFlashSale, FLASH_SALE_DELAY);
  }
}

startFlashSaleDisplay();

setInterval(updateFlashCountdown,1000);
updateCountdown();


window.addEventListener("load", () => {

  const panel = document.querySelector(".ticket-panel");

  setTimeout(()=>{
    panel.classList.add("visible");
  }, 1800);

});