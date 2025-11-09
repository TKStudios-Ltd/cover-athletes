/* image-tabs.js — 1.2 slides visible (desktop), square images, no tab-autoscroll */
(() => {
  const SELECTOR = '[data-component="image-tabs"]';

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

    const autoplay = imgsEl.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(imgsEl.getAttribute('data-delay') || '5000', 10);
    const loop     = imgsEl.getAttribute('data-loop') === 'true';
    const psvMobile  = parseFloat(imgsEl.getAttribute('data-psv-mobile') || '1');
    const psvDesktop = parseFloat(imgsEl.getAttribute('data-psv-desktop') || '1.2');
    const centered   = imgsEl.getAttribute('data-centered') === 'true';
    const space      = parseInt(imgsEl.getAttribute('data-space') || '16', 10);

    const tabs = Array.from(tabsEl.querySelectorAll('.tab'));
    function setActive(i){ tabs.forEach((t,idx)=>t.classList.toggle('is-active', idx===i)); }

    console.log('[image-tabs] init', { id, autoplay, delay, loop, psvMobile, psvDesktop, centered, space, tabs: tabs.length });

    // ONLY one Swiper (images). Tabs remain static DOM so no vertical scroll-jumps.
    const images = new Swiper(imgsEl, {
      slidesPerView: psvMobile,
      centeredSlides: centered,
      spaceBetween: space,
      loop,
      speed: 600,
      watchOverflow: true,
      pagination: { el: imgsEl.querySelector('.swiper-pagination'), clickable: true },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      breakpoints: {
        990: {
          slidesPerView: psvDesktop,
          centeredSlides: centered,
          spaceBetween: space
        }
      }
    });

    // Clicking/hovering tabs drives image swiper
    function goTo(i){
      if (typeof images.slideToLoop === 'function') images.slideToLoop(i);
      else images.slideTo(i);
      console.log('[image-tabs] goTo', { i });
    }
    tabsEl.addEventListener('mouseenter', (e)=>{
      const row = e.target.closest('.tab'); if (!row) return;
      const idx = +row.dataset.index; if (Number.isNaN(idx)) return;
      goTo(idx);
    }, true);
    tabsEl.addEventListener('click', (e)=>{
      const row = e.target.closest('.tab'); if (!row || e.target.closest('a')) return;
      e.preventDefault();
      const idx = +row.dataset.index; if (Number.isNaN(idx)) return;
      goTo(idx);
    });

    // Sync active state from images
    images.on('slideChange', ()=>{
      const idx = typeof images.realIndex === 'number' ? images.realIndex : images.activeIndex;
      setActive(idx);
      console.log('[image-tabs] images -> slideChange', { idx });
    });

    // Initial
    setActive(typeof images.realIndex === 'number' ? images.realIndex : images.activeIndex);

    // Expose destroy for theme editor
    root.__tabsDestroy = () => {
      try { images.destroy(true, true); } catch(e){}
      root.__tabsInit = false;
      console.log('[image-tabs] destroyed', { id });
    };
  }

  function boot(ctx){
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
