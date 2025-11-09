/* image-tabs.js — vertical 1.2 slides, 20px gap, stable tabs */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  const realIndex = (sw) =>
    typeof sw?.realIndex === 'number' ? sw.realIndex : sw?.activeIndex || 0;

  function initSection(root) {
    if (!root || root.__imageTabsInitialized) return;
    root.__imageTabsInitialized = true;

    const id     = root.getAttribute('data-section-id');
    const tabsEl = root.querySelector('#Tabs-' + id);
    const imgsEl = root.querySelector('#Images-' + id);

    if (!tabsEl || !imgsEl) {
      console.warn('[image-tabs] Missing containers', { id, tabsEl: !!tabsEl, imgsEl: !!imgsEl });
      return;
    }

    // read settings from DOM
    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';

    // vertical viewport config
    const spaceBetween = parseInt(imgsEl.getAttribute('data-space') || '20', 10);
    const slidesPerView = 1.2; // force 1.2 on desktop per design

    const tabSlides = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, spaceBetween, slidesPerView, tabs: tabSlides.length });

    // ----- Tabs Swiper (vertical list, no movement) -----
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0, // instant so list never animates
      // keep layout stable even if editor injects DOM
      observer: true,
      observeParents: true
    });

    // ----- Image Swiper (vertical, 1.2 slides, gap) -----
    const images = new Swiper(imgsEl, {
      direction: 'vertical',
      slidesPerView,
      spaceBetween,
      loop,
      speed: 600,
      pagination: {
        el: imgsEl.querySelector('.swiper-pagination'),
        clickable: true
      },
      autoplay: autoplay
        ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
        : false,
      // performance & stability
      watchSlidesProgress: true,
      observer: true,
      observeParents: true
    });

    // helper: mark active tab
    function setActive(i) {
      tabSlides.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    }

    // Drive images, keep tabs snapped (no page scroll)
    function goTo(index) {
      if (Number.isNaN(index)) return;
      if (loop && typeof images.slideToLoop === 'function') images.slideToLoop(index);
      else images.slideTo(index);

      // snap tabs silently to the same index without moving the page
      tabs.slideTo(index, 0, false);
      setActive(index);

      console.log('[image-tabs] goTo', { index });
    }

    // Sync from images (single source of truth)
    images.on('slideChange', () => {
      const idx = realIndex(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover / click on a tab → go to image
    tabsEl.addEventListener(
      'mouseenter',
      (e) => {
        const item = e.target.closest('.tab');
        if (!item) return;
        const idx = +item.dataset.index;
        if (!Number.isNaN(idx)) goTo(idx);
      },
      true
    );

    tabsEl.addEventListener('click', (e) => {
      const item = e.target.closest('.tab');
      if (!item || e.target.closest('a')) return; // allow inline link clicks
      e.preventDefault();
      const idx = +item.dataset.index;
      if (!Number.isNaN(idx)) goTo(idx);
    });

    // Initial state
    setActive(realIndex(images));
    tabs.slideTo(realIndex(images), 0, false);

    // Expose destroy for theme editor
    root.__imageTabsDestroy = () => {
      try { tabs.destroy(true, true); } catch (e) {}
      try { images.destroy(true, true); } catch (e) {}
      root.__imageTabsInitialized = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    // Ensure Swiper is loaded via your swiper-loader.js
    if (typeof loadSwiper === 'function') {
      loadSwiper(() => roots.forEach(initSection));
    } else {
      // fallback: assume Swiper is already present
      if (!window.Swiper) {
        console.error('[image-tabs] Swiper not found and loadSwiper() missing.');
        return;
      }
      roots.forEach(initSection);
    }
  }

  // Theme editor events
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
  document.addEventListener('shopify:section:unload', (e) => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__imageTabsDestroy) root.__imageTabsDestroy();
  });

  // Front-end boot
  document.addEventListener('DOMContentLoaded', () => boot());
})();
