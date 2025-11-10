/* athlete-slider.js — BG fade w/ synced text; arrows above; autoplay + loop; console logs */
(() => {
  const SEL = '[data-component="athlete-slider"]';

  function init(root) {
    if (!root || root.__athInit) return;
    root.__athInit = true;

    const id = root.getAttribute('data-section-id');
    const bgEl = root.querySelector('#AthleteBG-' + id);
    const txtEl = root.querySelector('#AthleteTXT-' + id);
    const prev = root.querySelector('.nav-btn.prev');
    const next = root.querySelector('.nav-btn.next');

    if (!bgEl || !txtEl) {
      console.warn('[athlete-slider] containers missing', { id });
      return;
    }

    const autoplay = bgEl.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(bgEl.getAttribute('data-delay') || '6000', 10);
    const loop = bgEl.getAttribute('data-loop') === 'true';

    console.log('[athlete-slider] init', { id, autoplay, delay, loop });

    // Background: fade
    const bg = new Swiper(bgEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 700,
      loop,
      allowTouchMove: false,
      autoplay: autoplay ? { delay, disableOnInteraction: false } : false
    });

    // Text: fade, no touch, synced
    const txt = new Swiper(txtEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 450,
      loop,
      allowTouchMove: false
    });

    // Sync
    bg.on('slideChange', () => {
      const i = typeof bg.realIndex === 'number' ? bg.realIndex : bg.activeIndex;
      txt.slideToLoop ? txt.slideToLoop(i) : txt.slideTo(i);
      console.log('[athlete-slider] bg ->', i);
    });

    // Arrows
    if (prev) prev.addEventListener('click', () => { bg.slidePrev(); console.log('[athlete-slider] prev'); });
    if (next) next.addEventListener('click', () => { bg.slideNext(); console.log('[athlete-slider] next'); });

    // Expose destroy for editor
    root.__athDestroy = () => {
      try { bg.destroy(true, true); } catch(e){}
      try { txt.destroy(true, true); } catch(e){}
      root.__athInit = false;
      console.log('[athlete-slider] destroyed', { id });
    };
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SEL).forEach(init);
  }

  document.addEventListener('DOMContentLoaded', () => boot());
  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SEL);
    if (root && root.__athDestroy) root.__athDestroy();
  });
})();
