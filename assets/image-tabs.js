/* image-tabs.js — vertical images with 20px gap + no offset drift */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  // compute and lock slide height to a 1:1 of pane width (prevents creep)
  function lockPaneSize(pane) {
    if (!pane) return;
    const w = pane.clientWidth || 0;
    // lock a CSS var used by slides for height
    pane.style.setProperty('--pane-size', `${w}px`);
  }

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id      = root.getAttribute('data-section-id');
    const tabsEl  = root.querySelector('#Tabs-' + id);
    const imgsEl  = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) return console.warn('[image-tabs] missing containers', { id });

    // ensure Swiper is ready
    if (!window.Swiper) {
      console.warn('[image-tabs] Swiper not loaded');
      root.__tabsInit = false;
      return;
    }

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, slides: slides.length });

    // 1) TABS: static vertical list (no auto-scroll)
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    // 2) IMAGES: true vertical slider, 1.2 slides with 20px gap; no “fade”
    lockPaneSize(imgsEl);
    const images = new Swiper(imgsEl, {
      direction: 'vertical',
      slidesPerView: 1.2,
      spaceBetween: 20,              // <-- EXACT 20PX GAP
      loop,
      centeredSlides: false,
      autoHeight: false,
      watchSlidesProgress: true,
      normalizeSlideIndex: true,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      on: {
        // re-lock size when Swiper measures (prevents drift on first/toggles)
        beforeInit() { lockPaneSize(imgsEl); },
        resize()     { lockPaneSize(imgsEl); }
      }
    });

    // Active-state helper
    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);

      // keep tab list snapped without scrolling page
      tabs.slideTo(i, 0, false);
      const el = slides[i];
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });

      console.log('[image-tabs] goTo', { target: i });
    }

    // Sync from images -> tabs
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover / click tabs -> images
    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab'); if (!row) return;
      const idx = +row.dataset.index; if (Number.isNaN(idx)) return;
      goTo(idx);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab'); if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const idx = +row.dataset.index; if (Number.isNaN(idx)) return;
      goTo(idx);
    });

    // Initial state
    setActive(real(images));
    tabs.slideTo(real(images), 0, false);

    // Resize observer to keep 1:1 + gap stable across resizes
    const ro = new ResizeObserver(() => {
      lockPaneSize(imgsEl);
      images.update();         // re-measure track; keeps gaps exact
    });
    ro.observe(imgsEl);

    root.__tabsDestroy = () => {
      try { ro.disconnect(); } catch(e){}
      try { tabs.destroy(true, true); } catch(e){}
      try { images.destroy(true, true); } catch(e){}
      root.__tabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    // If you use a loader elsewhere, call it here. Otherwise, assume Swiper is global.
    roots.forEach(initSection);
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__tabsDestroy) root.__tabsDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
