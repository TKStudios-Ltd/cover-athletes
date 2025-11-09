/* image-tabs.js — vertical images with 20px gaps, no offset drift */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id     = root.getAttribute('data-section-id');
    const tabsEl = root.querySelector('#Tabs-' + id);
    const imgsEl = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) return console.warn('[image-tabs] missing containers', { id });

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';

    // read desired gap from markup, default 20
    const GAP = parseInt(imgsEl.getAttribute('data-space') || '20', 10);

    console.log('[image-tabs] init', { id, autoplay, delay, loop, GAP });

    // Tabs list (static, no auto scroll)
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0,
      roundLengths: true
    });

    // Images (vertical, 20px gap, no drift)
    const images = new Swiper(imgsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',      // respect the slide’s intrinsic height (your 1:1 aspect)
      spaceBetween: GAP,          // <— real 20px gap via margin-top
      loop,
      speed: 600,
      roundLengths: true,         // avoid sub-pixel accumulation
      watchSlidesProgress: true,  // improves sync accuracy
      pagination: {
        el: imgsEl.querySelector('.swiper-pagination'),
        clickable: true
      },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false
    });

    // Active state pill
    const slideTabs = Array.from(tabsEl.querySelectorAll('.tab'));
    const setActive = (i) => slideTabs.forEach((s, idx) => s.classList.toggle('is-active', idx === i));

    // Drive images (and tabs) to index, without page scrolling
    const goTo = (i) => {
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      tabs.slideTo(i, 0, false);
      console.log('[image-tabs] goTo', { target: i });
    };

    // Sync from images -> tabs/active pill
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover/focus/click on a tab drives images (no scrollIntoView to avoid page jumps)
    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab'); if (!row) return;
      const idx = +row.dataset.index; if (!Number.isFinite(idx)) return;
      goTo(idx);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab'); if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const idx = +row.dataset.index; if (!Number.isFinite(idx)) return;
      goTo(idx);
    });

    // Initial
    setActive(real(images));
    tabs.slideTo(real(images), 0, false);

    // Clean up for theme editor
    root.__tabsDestroy = () => {
      try { tabs.destroy(true, true); } catch(e){}
      try { images.destroy(true, true); } catch(e){}
      root.__tabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    // Swiper loader expected to exist globally (your swiper-loader.js)
    loadSwiper(() => roots.forEach(initSection));
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__tabsDestroy) root.__tabsDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
