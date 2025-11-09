/* image-tabs.js — vertical 1.2 slides on desktop, 1.0 on mobile; synced with tabs; no list auto-scroll */
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
    const space    = parseInt(imgsEl.getAttribute('data-space') || '16', 10);
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, space, slides: slides.length });

    // Tabs list: keep steady (no autoplay/loop)
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    // Images: vertical on desktop with 1.2 slides, horizontal 1.0 on mobile
    const images = new Swiper(imgsEl, {
      loop,
      speed: 600,
      spaceBetween: space,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      // Use breakpoints to control layout
      direction: 'horizontal',
      slidesPerView: 1,
      centeredSlides: false,
      breakpoints: {
        990: {
          direction: 'vertical',
          slidesPerView: 1.2,
          centeredSlides: false
        }
      }
    });

    function setActive(i) { slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i)); }

    function goTo(i) {
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      tabs.slideTo(i, 0, false);
      const el = slides[i];
      if (el) el.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
      console.log('[image-tabs] goTo', { i });
    }

    // Sync from images
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover / click on tabs → drive images
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

    // Editor destroy hook
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
