/* image-tabs.js — vertical 1.2 slides on desktop, dots, stable tabs list */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) { return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex; }

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id      = root.getAttribute('data-section-id');
    const tabsEl  = root.querySelector('#Tabs-' + id);
    const imgsEl  = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) { console.warn('[image-tabs] missing containers', { id }); return; }

    const autoplay = imgsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(imgsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = imgsEl.getAttribute('data-loop') === 'true';
    const gap      = parseInt(imgsEl.getAttribute('data-gap') || '16', 10);
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, gap, slides: slides.length });

    // Tabs list: static (no auto / no loop / no animation)
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    // Images: vertical 1.2 slides on desktop, horizontal 1 on mobile
    const images = new Swiper(imgsEl, {
      loop,
      speed: 600,
      spaceBetween: gap,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      // Default (mobile):
      direction: 'horizontal',
      slidesPerView: 1,
      centeredSlides: false,
      breakpoints: {
        990: {
          direction: 'vertical',
          slidesPerView: 1.2,        // <- peek previous/next vertically
          centeredSlides: false,
          spaceBetween: gap
        }
      }
    });

    function setActive(i) { slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i)); }

    function goTo(i) {
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      tabs.slideTo(i, 0, false);
      console.log('[image-tabs] goTo', { i });
    }

    // Sync from images (source of truth)
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Interactions on tabs -> drive images
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
    if (typeof loadSwiper !== 'function') { console.error('[image-tabs] loadSwiper missing — include swiper-loader.js'); return; }
    loadSwiper(() => roots.forEach(initSection));
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__tabsDestroy) root.__tabsDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
