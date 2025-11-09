/* assets/image-tabs.js
   Image Tabs — vertical image stack with 1.2 slides, 20px gap, tab sync
   Expects loadSwiper(cb) to exist (from your swiper-loader.js)
*/
(() => {
  const SELECTOR = '[data-component="image-tabs"]';
  const DESKTOP_MQ = '(min-width: 990px)';

  const real = (sw) =>
    typeof sw?.realIndex === 'number' ? sw.realIndex : sw?.activeIndex ?? 0;

  function init(root) {
    if (!root || root.__imageTabsInit) return;
    root.__imageTabsInit = true;

    const id     = root.getAttribute('data-section-id');
    const tabsEl = root.querySelector('#Tabs-' + id);
    const imgsEl = root.querySelector('#Images-' + id);

    if (!tabsEl || !imgsEl) {
      console.warn('[image-tabs] missing containers', { id, tabsEl, imgsEl });
      return;
    }

    const autoplay = tabsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(tabsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = tabsEl.getAttribute('data-loop') === 'true'; // we’ll keep images non-looping on vertical to avoid offset creep
    const gap      = parseInt(imgsEl.getAttribute('data-space') || '20', 10);
    const slides   = Array.from(tabsEl.querySelectorAll('.tab'));
    const mq       = window.matchMedia(DESKTOP_MQ);

    console.log('[image-tabs] init', { id, autoplay, delay, loop, gap, tabs: slides.length });

    // TABS: vertical list, no autoplay/loop, no drag
    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop: false,
      speed: 0
    });

    let images = null;

    function createImagesSwiper(isDesktop) {
      // Clean before (guard against editor reloads/breakpoint flips)
      if (images) {
        try { images.destroy(true, true); } catch (e) {}
        images = null;
      }

      // Desktop: vertical stack, 1.2 in view with gap
      // Mobile: horizontal 1.0 (safe default)
      const config = isDesktop
        ? {
            direction: 'vertical',
            slidesPerView: 1.2,
            spaceBetween: gap,
            centeredSlides: false,
            autoHeight: false,
            loop: false, // IMPORTANT: avoid visual drift when a partial slide is visible
            speed: 600,
            pagination: {
              el: imgsEl.querySelector('.swiper-pagination'),
              clickable: true
            },
            autoplay: autoplay
              ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false,
            // Helps Swiper recalc sizes when fonts/layout settle
            observer: true,
            observeParents: true,
            on: {
              afterInit(sw) {
                // Force a pass to compute sizes with CSS aspect-ratio
                setTimeout(() => sw.update(), 0);
              }
            }
          }
        : {
            direction: 'horizontal',
            slidesPerView: 1,
            spaceBetween: gap,
            centeredSlides: false,
            autoHeight: false,
            loop: false,
            speed: 600,
            pagination: {
              el: imgsEl.querySelector('.swiper-pagination'),
              clickable: true
            },
            autoplay: autoplay
              ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
              : false,
            observer: true,
            observeParents: true,
            on: {
              afterInit(sw) {
                setTimeout(() => sw.update(), 0);
              }
            }
          };

      images = new Swiper(imgsEl, config);

      // Sync active state to tabs
      images.on('slideChange', () => {
        const idx = real(images);
        setActive(idx);
        // Keep tabs position in view without jumping the page
        tabs.slideTo(idx, 0, false);
        console.log('[image-tabs] images -> slideChange', { idx });
      });

      // Initial active state
      setActive(real(images));
      tabs.slideTo(real(images), 0, false);

      console.log('[image-tabs] images created', {
        direction: config.direction,
        slidesPerView: config.slidesPerView,
        spaceBetween: config.spaceBetween
      });
    }

    function setActive(i) {
      slides.forEach((el, idx) => el.classList.toggle('is-active', idx === i));
    }

    function goTo(i) {
      if (!images) return;
      images.slideTo(i, 600, false); // no loop — index is direct
      console.log('[image-tabs] goTo', { i });
    }

    // Hover & click on tabs drive images
    tabsEl.addEventListener(
      'mouseenter',
      (e) => {
        const row = e.target.closest('.tab');
        if (!row) return;
        const idx = +row.dataset.index;
        if (Number.isNaN(idx)) return;
        goTo(idx);
      },
      true
    );

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab');
      if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const idx = +row.dataset.index;
      if (Number.isNaN(idx)) return;
      goTo(idx);
    });

    // Build images swiper for the current breakpoint
    createImagesSwiper(mq.matches);

    // Rebuild on breakpoint change (ensures vertical on desktop, horizontal on mobile)
    const mqHandler = (ev) => {
      console.log('[image-tabs] breakpoint change', { matches: ev.matches });
      createImagesSwiper(ev.matches);
    };
    if (mq.addEventListener) mq.addEventListener('change', mqHandler);
    else mq.addListener(mqHandler); // Safari < 14

    // Expose teardown for the theme editor
    root.__imageTabsDestroy = () => {
      try { tabs.destroy(true, true); } catch (e) {}
      try { images?.destroy(true, true); } catch (e) {}
      if (mq.removeEventListener) mq.removeEventListener('change', mqHandler);
      else mq.removeListener(mqHandler);
      root.__imageTabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(SELECTOR);
    if (!roots.length) return;
    loadSwiper(() => roots.forEach(init));
  }

  document.addEventListener('shopify:section:load', (e) => boot(e.target));
  document.addEventListener('shopify:section:unload', (e) => {
    const root = e.target && e.target.querySelector(SELECTOR);
    if (root && root.__imageTabsDestroy) root.__imageTabsDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
