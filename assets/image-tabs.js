/* image-tabs.js — 1.2 slides visible (desktop), no page scroll on hover */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  const real = (sw) => (typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex);

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id      = root.getAttribute('data-section-id');
    const tabsEl  = root.querySelector('#Tabs-' + id);
    const imgsEl  = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) {
      console.warn('[image-tabs] missing containers', { id });
      return;
    }

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const space    = parseInt(imgsEl.getAttribute('data-space') || '16', 10);
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, space, slides: slides.length });

    // Tabs list: static (no autoplay, no loop)
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    // Images: vertical stack; 1.2 slides on desktop so next image peeks in
    const images = new Swiper(imgsEl, {
      direction: 'vertical',
      loop,
      allowTouchMove: false,
      spaceBetween: space,
      centeredSlides: false,
      slidesPerView: 1.05, // mobile default (slight peek)
      breakpoints: {
        990: { slidesPerView: 1.2 } // desktop peek
      },
      speed: 500,
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true }
    });

    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);

      // Snap tabs silently without page scrolling
      tabs.slideTo(i, 0, false);
      // ❌ removed scrollIntoView — this was causing the page to jump on hover

      console.log('[image-tabs] goTo', { target: i });
    }

    // Sync active state from images
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover / click drives images
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
