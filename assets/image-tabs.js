/* image-tabs.js — stable sync, no vertical auto-scroll on tabs */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id      = root.getAttribute('data-section-id');
    const tabsEl  = root.querySelector('#Tabs-' + id);
    const imgsEl  = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) return console.warn('[image-tabs] missing containers', { id });

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, slides: slides.length });

    // Tabs list: NO autoplay, NO loop — keep list steady
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0 // instant changes so the list does not visibly scroll
    });

    // Images: autoplay/loop here only
    const images = new Swiper(imgsEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop,
      speed: 600,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false
    });

    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      // Drive the image swiper (handles loop clones safely)
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);

      // Snap tabs silently without animation
      tabs.slideTo(i, 0, false);

      // Ensure the active tab is visible but do not jump the page
      const el = slides[i];
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });

      console.log('[image-tabs] goTo', { target: i });
    }

    // Sync active state from images (single source of truth)
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover / focus / click on a tab drives images (and thus active state)
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

    // Expose destroy for editor
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
    loadSwiper(() => roots.forEach(initSection));
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__tabsDestroy) root.__tabsDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
