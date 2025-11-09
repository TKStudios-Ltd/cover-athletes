/* assets/image-tabs.js
   Image Tabs — vertical images with 1.2 slides per view + 20px gap
   - No page scroll jump
   - No drift/offset between steps
   - Uses loadSwiper() that you already have in swiper-loader.js
*/
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

  // Small debounce for resize
  const debounce = (fn, ms = 120) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Swiper index helper
  const real = (sw) => (typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex);

  function computePaneSizes(root, imagesSwiper) {
    // Figure out the visible pane size from the image column width to keep 1:1 frames
    const col = root.querySelector('.image-tabs__image');
    const pane = root.querySelector('.image-pane');
    if (!col || !pane) return;

    // Width of the image column = base for 1:1 cards
    const cardSize = Math.round(col.clientWidth); // px
    const gap = Number(pane.getAttribute('data-space') || 20); // px, fallback 20
    const visible = 1.2;

    // Height of the container must fit 1.2 cards + spaceBetween
    const containerH = Math.round(cardSize * visible + gap);

    // Drive CSS variable your Liquid is using for slide height
    root.style.setProperty('--pane-size', `${cardSize}px`);

    // Fix container height so Swiper calculates slide sizes correctly
    pane.style.setProperty('height', `${containerH}px`);

    // If swiper exists, update its layout params
    if (imagesSwiper) {
      imagesSwiper.params.spaceBetween = gap;
      imagesSwiper.updateSize();
      imagesSwiper.updateSlides();
      imagesSwiper.updateProgress();
      imagesSwiper.updateSlidesClasses();
      imagesSwiper.snapGrid = imagesSwiper.slidesGrid.slice(); // keep snapping tight
    }

    console.log('[image-tabs] pane sizing', { cardSize, gap, containerH });
  }

  function initSection(root) {
    if (!root || root.__tabsInit) return;
    root.__tabsInit = true;

    const id     = root.getAttribute('data-section-id');
    const tabsEl = root.querySelector('#Tabs-' + id);
    const imgsEl = root.querySelector('#Images-' + id);
    if (!tabsEl || !imgsEl) {
      console.warn('[image-tabs] missing containers', { id });
      return;
    }

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true';
    const gap      = Number(imgsEl.getAttribute('data-space') || 20);
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));

    console.log('[image-tabs] init', { id, autoplay, delay, loop, gap, slides: slides.length });

    // --- Tabs list (no autoplay, no visual scroll) ---
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    // --- Images (vertical, 1.2 per view, 20px gap) ---
    const images = new Swiper(imgsEl, {
      direction: 'vertical',
      slidesPerView: 1.2,            // 1.2 visible cards
      spaceBetween: gap,             // 20px gap (overridden if schema changes)
      loop,
      centeredSlides: false,
      roundLengths: true,            // avoids sub-pixel drift
      watchSlidesProgress: true,
      watchOverflow: true,
      resistanceRatio: 0.85,
      speed: 600,
      // Use regular slide effect; fade breaks vertical size math
      effect: 'slide',
      pagination: {
        el: imgsEl.querySelector('.swiper-pagination'),
        clickable: true
      },
      autoplay: autoplay ? {
        delay,
        disableOnInteraction: false,
        pauseOnMouseEnter: true
      } : false
    });

    // Size the pane to keep each slide 1:1 and the container at 1.2 slides tall
    computePaneSizes(root, images);

    // Active tab helper
    function setActive(i) {
      slides.forEach((s, idx) => s.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      // Drive the image swiper (loop-safe)
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);

      // Keep the tabs list in sync without animation
      tabs.slideTo(i, 0, false);

      // Keep active class
      setActive(i);

      console.log('[image-tabs] goTo', { i });
    }

    // Sync when images change (source of truth)
    images.on('slideChange', () => {
      const idx = real(images);
      setActive(idx);
      tabs.slideTo(idx, 0, false);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Hover/focus/click on a tab drives images (no page scroll jump)
    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab');
      if (!row) return;
      const idx = +row.dataset.index;
      if (!Number.isNaN(idx)) goTo(idx);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab');
      if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const idx = +row.dataset.index;
      if (!Number.isNaN(idx)) goTo(idx);
    });

    // Initial state
    setActive(real(images));
    tabs.slideTo(real(images), 0, false);

    // Handle live resizing so 1.2 view stays perfect
    const onResize = debounce(() => computePaneSizes(root, images), 120);
    window.addEventListener('resize', onResize);

    // Expose destroy for theme editor
    root.__tabsDestroy = () => {
      window.removeEventListener('resize', onResize);
      try { tabs.destroy(true, true); } catch {}
      try { images.destroy(true, true); } catch {}
      root.__tabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    loadSwiper(() => roots.forEach(initSection));
  }

  // Theme editor hooks
  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__tabsDestroy) root.__tabsDestroy();
  });

  // Page load
  document.addEventListener('DOMContentLoaded', () => boot());
})();
