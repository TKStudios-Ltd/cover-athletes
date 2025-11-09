/* image-tabs.js — stable sync, 1.2 slides on desktop, no list scrolling */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  function initSection(root) {
    if (!root || root.__imageTabsInit) return;
    root.__imageTabsInit = true;

    const id      = root.getAttribute('data-section-id');
    const tabsEl  = root.querySelector('#Tabs-' + id);
    const imgsEl  = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) {
      console.warn('[image-tabs] missing containers', { id });
      return;
    }

    // Read settings from DOM
    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const space    = parseInt(imgsEl.getAttribute('data-space') || '0', 10);

    const slides = Array.from(tabsEl.querySelectorAll('.tab'));
    console.log('[image-tabs] init', { id, autoplay, delay, loop, space, tabs: slides.length });

    // Tabs "swiper" just to keep markup consistent — do NOT scroll/move it
    let tabs;
    try {
      tabs = new Swiper(tabsEl, {
        direction: 'vertical',
        slidesPerView: 'auto',
        allowTouchMove: false,
        loop: false,
        speed: 0,        // never animate tabs list
        watchOverflow: true
      });
    } catch (e) {
      console.warn('[image-tabs] tabs init error', e);
      tabs = { slideTo: () => {} }; // noop fallback
    }

    // Images swiper: show partial next slide on desktop
    let images;
    try {
      images = new Swiper(imgsEl, {
        effect: 'slide',            // must be 'slide' to see 1.2 slides
        loop,
        speed: 600,
        spaceBetween: space,        // from schema slider
        centeredSlides: false,
        slidesPerView: 1,           // mobile default
        watchOverflow: true,
        pagination: {
          el: imgsEl.querySelector('.swiper-pagination'),
          clickable: true
        },
        autoplay: autoplay
          ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
          : false,
        // 1.2 slides on desktop
        breakpoints: {
          990: { slidesPerView: 1.2 }
        },
        on: {
          // keep active pill in sync
          slideChange(sw) {
            const idx = real(sw);
            setActive(idx);
            // never move the tabs list; just update the class
            // tabs.slideTo(idx, 0, false); // intentionally NOT moving
            console.log('[image-tabs] images -> slideChange', { idx });
          }
        }
      });
    } catch (e) {
      console.error('[image-tabs] images init error', e);
      return;
    }

    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      if (Number.isNaN(i)) return;
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      setActive(i);
      console.log('[image-tabs] goTo', { i });
    }

    // Hover / click on a tab drives images only (no page scroll)
    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab');
      if (!row) return;
      const idx = +row.dataset.index;
      goTo(idx);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab');
      if (!row || e.target.closest('a')) return; // let anchor work
      e.preventDefault();
      const idx = +row.dataset.index;
      goTo(idx);
    });

    // Initial active state
    setActive(real(images));

    // Expose destroy for theme editor
    root.__imageTabsDestroy = () => {
      try { tabs && tabs.destroy && tabs.destroy(true, true); } catch(e){}
      try { images && images.destroy && images.destroy(true, true); } catch(e){}
      root.__imageTabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    if (typeof loadSwiper !== 'function') {
      console.error('[image-tabs] loadSwiper not found. Ensure swiper-loader.js is included.');
      return;
    }
    loadSwiper(() => roots.forEach(initSection));
  }

  // Theme editor hooks
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
  document.addEventListener('shopify:section:unload', (e) => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__imageTabsDestroy) root.__imageTabsDestroy();
  });

  // Front-end boot
  document.addEventListener('DOMContentLoaded', () => boot());
})();
