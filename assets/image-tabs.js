/* Image Tabs component (uses window.loadSwiper from swiper-loader.js)
   - vertical image swiper with 1.2 slides per view (peek)
   - synced with tab list on the left
   - verbose console logs for debugging
*/
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  function real(sw) { return typeof sw?.realIndex === 'number' ? sw.realIndex : sw?.activeIndex ?? 0; }

  function initOne(root) {
    if (!root || root.__init) return;
    root.__init = true;

    const id = root.getAttribute('data-section-id');
    const tabsEl   = root.querySelector('#Tabs-' + id);
    const imagesEl = root.querySelector('#Images-' + id);

    if (!tabsEl || !imagesEl) {
      console.warn('[image-tabs] Missing tabs/images containers', { tabsEl, imagesEl });
      return;
    }

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const space    = parseInt(imagesEl.getAttribute('data-space') || '16', 10);
    const slides   = tabsEl.querySelectorAll('.tab');

    console.log('[image-tabs] init', { id, autoplay, delay, loop, space, tabCount: slides.length });

    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop,
      speed: 500,
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false
    });

    const images = new Swiper(imagesEl, {
      direction: 'vertical',
      slidesPerView: 1.2,          // shows a bit of previous/next
      spaceBetween: space,
      centeredSlides: false,
      loop,
      speed: 600,
      pagination: { el: imagesEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false
    });

    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    // keep selected state in sync
    tabs.on('slideChange', () => {
      const i = real(tabs);
      setActive(i);
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      console.log('[image-tabs] tabs -> images', i);
    });

    images.on('slideChange', () => {
      const i = real(images);
      setActive(i);
      if (typeof tabs.slideToLoop === 'function') tabs.slideToLoop(i);
      else tabs.slideTo(i);
      console.log('[image-tabs] images -> tabs', i);
    });

    // hover / click
    const go = (i) => {
      if (typeof tabs.slideToLoop === 'function') { tabs.slideToLoop(i); images.slideToLoop(i); }
      else { tabs.slideTo(i); images.slideTo(i); }
      console.log('[image-tabs] go', i);
    };

    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab'); if (!row) return;
      const i = +row.dataset.index;
      if (!Number.isNaN(i)) go(i);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab'); if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const i = +row.dataset.index;
      if (!Number.isNaN(i)) go(i);
    });

    // expose destroy for theme editor
    root.__destroy = () => {
      try { tabs.destroy(true, true); } catch(e){}
      try { images.destroy(true, true); } catch(e){}
      root.__init = false;
      console.log('[image-tabs] destroyed', id);
    };

    setActive(real(tabs));
    console.log('[image-tabs] ready', { id });
  }

  function boot(container) {
    const scope = container || document;
    const nodes = scope.querySelectorAll(SELECTOR);
    if (!nodes.length) return;
    if (typeof window.loadSwiper !== 'function') {
      console.error('[image-tabs] loadSwiper not found – include swiper-loader.js first');
      return;
    }
    window.loadSwiper(() => nodes.forEach(initOne));
  }

  // storefront load
  document.addEventListener('DOMContentLoaded', () => boot());

  // theme editor hooks
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
  document.addEventListener('shopify:section:unload', (e) => {
    const root = e.target?.querySelector(SELECTOR);
    if (root && root.__destroy) root.__destroy();
  });
})();
