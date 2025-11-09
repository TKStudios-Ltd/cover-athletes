/* Image Tabs — component JS (uses global loadSwiper from swiper-loader.js)
   - One Swiper only: the image column.
   - Tabs list is static; we sync on hover/click.
   - Pagination bullets, vertical, 1.2 slides per view (previous image peeks).
*/

(() => {
  const SEL = '[data-component="image-tabs"]';

  function realIndex(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  function initSection(root) {
    if (!root || root.__imageTabsInit) return;
    root.__imageTabsInit = true;

    const id       = root.getAttribute('data-section-id');
    const imagesEl = root.querySelector('#Images-' + id);
    const tabsEl   = root.querySelector('[data-role="tabs-list"]');
    const rows     = [...root.querySelectorAll('[data-role="tab-row"]')];

    if (!imagesEl || !tabsEl || rows.length === 0) {
      console.log('[image-tabs] Missing elements, abort init', { imagesEl: !!imagesEl, tabsEl: !!tabsEl, rows: rows.length });
      return;
    }

    const autoplay = imagesEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(imagesEl.getAttribute('data-delay') || '5000', 10);

    loadSwiper(() => {
      console.log('[image-tabs] Swiper ready — initializing image swiper for section', id);

      const images = new Swiper(imagesEl, {
        direction: 'vertical',
        slidesPerView: 1.2,         // shows a bit of previous slide at top
        spaceBetween: 12,
        loop: false,                // keeps indices stable
        speed: 600,
        allowTouchMove: false,      // UX is via tabs; change to true if you want drag
        pagination: {
          el: imagesEl.querySelector('.swiper-pagination'),
          clickable: true
        },
        autoplay: autoplay ? {
          delay,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        } : false
      });

      function setActive(i) {
        rows.forEach((r, idx) => r.classList.toggle('is-active', idx === i));
      }

      images.on('slideChange', () => {
        const i = realIndex(images);
        setActive(i);
        console.log('[image-tabs] slideChange →', i);
      });

      // Hover / click sync
      const go = (i) => {
        if (Number.isNaN(i)) return;
        images.slideTo(i);
      };

      tabsEl.addEventListener('mouseenter', (e) => {
        const row = e.target.closest('[data-role="tab-row"]');
        if (!row) return;
        const i = +row.dataset.index;
        go(i);
      }, true);

      tabsEl.addEventListener('click', (e) => {
        const row = e.target.closest('[data-role="tab-row"]');
        if (!row) return;
        e.preventDefault();
        const i = +row.dataset.index;
        go(i);
      });

      // Initial state
      setActive(realIndex(images));

      // Expose destroy for editor
      root.__imageTabsDestroy = () => {
        try { images.destroy(true, true); } catch(e){}
        root.__imageTabsInit = false;
      };
    });
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SEL).forEach(initSection);
  }

  // Theme editor hooks
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
  document.addEventListener('shopify:section:unload', (e) => {
    const root = e.target && e.target.querySelector(SEL);
    if (root && root.__imageTabsDestroy) root.__imageTabsDestroy();
  });

  // Front-end
  document.addEventListener('DOMContentLoaded', () => boot());
})();
