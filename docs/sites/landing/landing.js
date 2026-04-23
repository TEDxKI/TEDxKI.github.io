(function () {
    /* ---------------- SAFE TYPING with tags (returns Promise) ----------------
   Builds DOM once (with nested tags), then types into text nodes.
   Returns a Promise that resolves when finished.
*/
function typeHtmlWithTags(container, htmlLike, options = {}) {
  const charDelay = options.charDelay ?? 40;
  // Return a Promise so callers can await completion
  return new Promise((resolve) => {
    const tokens = [];
    const regex = /(<[^>]+>)|([^<]+)/g;
    let m;
    while ((m = regex.exec(htmlLike)) !== null) {
      if (m[1]) tokens.push({ type: 'tag', text: m[1] });
      else if (m[2]) tokens.push({ type: 'text', text: m[2] });
    }

    const stack = [container];
    const textNodes = [];

    tokens.forEach(tok => {
      if (tok.type === 'tag') {
        const tagText = tok.text.trim();
        const isClosing = /^<\s*\/\s*([^\s>]+)\s*>$/i.test(tagText);
        if (isClosing) {
          const tagName = tagText.match(/^<\s*\/\s*([^\s>]+)\s*>$/i)[1].toLowerCase();
          for (let i = stack.length - 1; i > 0; i--) {
            if (stack[i].nodeName && stack[i].nodeName.toLowerCase() === tagName) {
              stack.splice(i);
              break;
            }
          }
        } else {
          const openMatch = tagText.match(/^<\s*([^\s>]+)([^>]*)>$/i);
          if (openMatch) {
            const tagName = openMatch[1].toLowerCase();
            const attrText = openMatch[2] || '';
            const el = document.createElement(tagName);
            const classMatch = attrText.match(/class\s*=\s*["']([^"']+)["']/i);
            if (classMatch) el.className = classMatch[1];
            const idMatch = attrText.match(/id\s*=\s*["']([^"']+)["']/i);
            if (idMatch) el.id = idMatch[1];
            const styleMatch = attrText.match(/style\s*=\s*["']([^"']+)["']/i);
            if (styleMatch) el.setAttribute('style', styleMatch[1]);
            stack[stack.length - 1].appendChild(el);
            stack.push(el);
          }
        }
      } else {
        const text = tok.text.replace(/\r?\n/g, '');
        if (text.length === 0) return;
        const tn = document.createTextNode('');
        stack[stack.length - 1].appendChild(tn);
        textNodes.push({ node: tn, full: text });
      }
    });

    // typing loop using requestAnimationFrame and accumulator
    let nodeIndex = 0, charIndex = 0, lastTime = null, acc = 0;
    function step(ts) {
      if (!lastTime) lastTime = ts;
      const dt = ts - lastTime;
      lastTime = ts;
      acc += dt;
      while (acc >= charDelay) {
        acc -= charDelay;
        if (nodeIndex >= textNodes.length) {
          resolve();
          return;
        }
        const current = textNodes[nodeIndex];
        const nextChar = current.full.charAt(charIndex);
        current.node.data += nextChar;
        charIndex++;
        if (charIndex >= current.full.length) {
          nodeIndex++;
          charIndex = 0;
        }
      }
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

/* ---------------- RESERVE HEIGHT BEFORE TYPING ---------------- */
function reserveMaskHeight(lineMaskEl, htmlString) {
  return new Promise((resolve) => {
    if (!lineMaskEl) return resolve();
    const meas = document.createElement('div');
    meas.style.position = 'absolute';
    meas.style.left = '-9999px';
    meas.style.top = '0';
    meas.style.visibility = 'hidden';
    meas.style.pointerEvents = 'none';

    const maskRect = lineMaskEl.getBoundingClientRect();
    const widthPx = Math.max(40, Math.round(maskRect.width || lineMaskEl.offsetWidth || 600));
    meas.style.width = widthPx + 'px';

    const computed = window.getComputedStyle(lineMaskEl);
    meas.style.fontFamily = computed.fontFamily;
    meas.style.fontSize = computed.fontSize;
    meas.style.fontWeight = computed.fontWeight;
    meas.style.lineHeight = computed.lineHeight;
    meas.style.letterSpacing = computed.letterSpacing;
    meas.style.whiteSpace = 'normal';

    meas.innerHTML = htmlString;
    document.body.appendChild(meas);

    const measured = Math.ceil(meas.getBoundingClientRect().height || meas.offsetHeight || 0);
    lineMaskEl.style.height = measured + 'px';
    lineMaskEl.style.minHeight = measured + 'px';

    document.body.removeChild(meas);
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

/* ---------------- HERO: typing + reveal (works reliably) ---------------- */
(function () {
  const maskSel = '.line-mask';
  const FINAL1 = 'Ideas <span class="accent">change</span>';
  const FINAL2 = 'everything.';
  const CHAR_DELAY = 70;

  async function initHero() {
    const l1Mask = document.querySelector(`${maskSel}:nth-of-type(1)`);
    const l2Mask = document.querySelector(`${maskSel}:nth-of-type(2)`);
    const l1Inner = document.getElementById('line1');
    const l2Inner = document.getElementById('line2');

    if (!l1Mask || !l2Mask || !l1Inner || !l2Inner) {
      if (l1Inner) l1Inner.innerHTML = FINAL1;
      if (l2Inner) l2Inner.innerHTML = FINAL2;
      return;
    }

    // reduced motion: skip typing, show final text immediately and ensure revealed class present
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      l1Inner.innerHTML = FINAL1;
      l2Inner.innerHTML = FINAL2;
      l1Mask.style.height = '';
      l2Mask.style.height = '';
      l1Inner.classList.add('revealed');
      l2Inner.classList.add('revealed');
      return;
    }

    try {
      // first line: reserve height, reveal (make visible), then type
      await reserveMaskHeight(l1Mask, FINAL1);
      l1Inner.innerHTML = ''; // ensure empty
      // Add revealed -> CSS (should move it from translateX(-100%) -> 0). Add before typing to show slide.
      requestAnimationFrame(() => {
        l1Inner.classList.add('revealed');
        // slight delay so the reveal animation starts
        setTimeout(async () => {
          await typeHtmlWithTags(l1Inner, FINAL1, { charDelay: CHAR_DELAY });
          // after first finished, proceed to second
          await reserveMaskHeight(l2Mask, FINAL2);
          l2Inner.innerHTML = '';
          requestAnimationFrame(() => {
            l2Inner.classList.add('revealed');
            setTimeout(async () => {
              await typeHtmlWithTags(l2Inner, FINAL2, { charDelay: CHAR_DELAY });
            }, 80);
          });
        }, 80);
      });
    } catch (err) {
      console.error('Hero init error', err);
      l1Inner.innerHTML = FINAL1;
      l2Inner.innerHTML = FINAL2;
      l1Inner.classList.add('revealed');
      l2Inner.classList.add('revealed');
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initHero);
  else initHero();

  // recompute heights on resize (debounced)
  (function () {
    let t = null;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(async () => {
        try {
          const l1Mask = document.querySelector(`${maskSel}:nth-of-type(1)`);
          const l2Mask = document.querySelector(`${maskSel}:nth-of-type(2)`);
          if (l1Mask) await reserveMaskHeight(l1Mask, FINAL1);
          if (l2Mask) await reserveMaskHeight(l2Mask, FINAL2);
        } catch (e) { /* ignore */ }
      }, 140);
    });
  })();
})();

})();

/* =====================================================
   PHOTO GALLERY — TEDxKI 2026
   Mosaic preview with individual cycling + lightbox
   ===================================================== */
(function () {
  'use strict';

  // ---- Mosaic preview with individual cycling ----
  const preview = document.getElementById('galleryPreview');
  const mosaic  = document.getElementById('galleryMosaic');

  if (!preview || !mosaic) return;

  const tiles = Array.from(mosaic.querySelectorAll('.gallery-tile'));
  const totalImages = 35;

  // Collect all hidden images' src after build fills them
  const hiddenImages = {};
  for (let i = 1; i <= totalImages; i++) {
    const img = document.getElementById(`gallery-img-${String(i).padStart(2, '0')}`);
    if (img && img.src) {
      hiddenImages[i] = img.src;
    }
  }

  function pickStartIndices() {
    const indices = [];
    const available = Array.from({ length: totalImages }, (_, i) => i + 1);
    while (indices.length < tiles.length && available.length) {
      const random = Math.floor(Math.random() * available.length);
      indices.push(available.splice(random, 1)[0]);
    }
    return indices;
  }

  function chooseNextIndex(tileIndex) {
    const current = currentIndices[tileIndex];
    const excluded = new Set(currentIndices);
    excluded.delete(current);

    const candidates = [];
    for (let i = 1; i <= totalImages; i += 1) {
      if (i === current) continue;
      if (!excluded.has(i)) candidates.push(i);
    }

    if (candidates.length === 0) return current;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }

  function updateTile(index, instant = false) {
    const tile = tiles[index];
    const imageIndex = currentIndices[index];
    const src = hiddenImages[imageIndex];
    if (!src) return;

    const altText = `TEDxKI 2026 event photo ${imageIndex}`;
    if (instant) {
      tile.classList.remove('is-fading');
      tile.dataset.transitioning = 'false';
      tile.src = src;
      tile.alt = altText;
      return;
    }

    if (tile.dataset.transitioning === 'true') return;
    tile.dataset.transitioning = 'true';

    const preload = new Image();
    preload.onload = () => {
      const onFadeOut = (event) => {
        if (event.propertyName !== 'opacity') return;
        tile.removeEventListener('transitionend', onFadeOut);
        tile.src = src;
        tile.alt = altText;
        requestAnimationFrame(() => {
          tile.classList.remove('is-fading');
          tile.dataset.transitioning = 'false';
        });
      };

      tile.addEventListener('transitionend', onFadeOut);
      requestAnimationFrame(() => {
        tile.classList.add('is-fading');
      });
    };
    preload.src = src;
  }

  // Start each tile with a unique image
  let currentIndices = pickStartIndices();

  const intervals = [6800, 7400, 8200, 9000, 9800, 10600];

  tiles.forEach((tile, i) => {
    updateTile(i, true);

    setTimeout(() => {
      setInterval(() => {
        currentIndices[i] = chooseNextIndex(i);
        updateTile(i);
      }, intervals[i]);
    }, i * 450);
  });

  // ---- Lightbox ----
  const lightbox     = document.getElementById('galleryLightbox');
  const backdrop     = document.getElementById('galleryLbBackdrop');
  const lbClose      = document.getElementById('galleryLbClose');
  const lbGrid       = document.getElementById('galleryLbGrid');
  const viewer       = document.getElementById('galleryLbViewer');
  const viewerImg    = document.getElementById('galleryLbViewerImg');
  const viewerClose  = document.getElementById('galleryLbViewerClose');
  const prevBtn      = document.getElementById('galleryLbPrev');
  const nextBtn      = document.getElementById('galleryLbNext');

  if (!lightbox) return;

  const thumbButtons = lbGrid ? Array.from(lbGrid.querySelectorAll('.gallery-lb-thumb')) : [];
  let viewerIndex = 0;

  function openLightbox() {
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose && lbClose.focus();
  }

  function closeLightbox() {
    closeViewer();
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    preview && preview.focus();
  }

  function openViewer(index) {
    viewerIndex = (index + thumbButtons.length) % thumbButtons.length;
    const img = thumbButtons[viewerIndex] && thumbButtons[viewerIndex].querySelector('img');
    if (!img || !viewerImg) return;
    viewerImg.src = img.src;
    viewerImg.alt = img.alt;
    viewer.setAttribute('aria-hidden', 'false');
    viewerClose && viewerClose.focus();
  }

  function closeViewer() {
    viewer && viewer.setAttribute('aria-hidden', 'true');
    viewerImg && (viewerImg.src = '');
  }

  // Wire preview -> open lightbox
  preview.addEventListener('click', openLightbox);

  // Wire close buttons
  lbClose   && lbClose.addEventListener('click', closeLightbox);
  backdrop  && backdrop.addEventListener('click', closeLightbox);
  viewerClose && viewerClose.addEventListener('click', closeViewer);

  // Wire thumbnail clicks
  thumbButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => openViewer(i));
  });

  // Prev / Next
  prevBtn && prevBtn.addEventListener('click', () => openViewer(viewerIndex - 1));
  nextBtn && nextBtn.addEventListener('click', () => openViewer(viewerIndex + 1));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;

    if (e.key === 'Escape') {
      // If viewer is open, close just the viewer first; else close whole lightbox
      if (viewer && viewer.getAttribute('aria-hidden') === 'false') {
        closeViewer();
      } else {
        closeLightbox();
      }
    }

    if (viewer && viewer.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'ArrowRight') openViewer(viewerIndex + 1);
      if (e.key === 'ArrowLeft')  openViewer(viewerIndex - 1);
    }
  });

})();
