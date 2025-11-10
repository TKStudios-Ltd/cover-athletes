/* athlete-slider.js — keeps left header fixed; syncs background + copy swipers */
(() => {
  const SEL = '[data-component="athlete-slider"]';

  function real(sw) {
    return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex;
  }

  function init(root) {
    if (!root || root.__athleteInit) return;
    root.__athleteInit = true;

    const id = root.getAttribute('data-section-id');
    const bgEl = root.querySelector('#AthleteBg-' + id);
    const copyEl = root.querySelector('#AthleteCopy-' + id);
    const prevBtn = root.querySelector('.nav .prev');
    const nextBtn = root.querySelector('.nav .next');

    if (!bgEl || !copyEl) {
      console.warn('[athlete-slider] missing containers', { id });
      return;
    }

    const effect = (root.querySelector('.slider-shell')?.dataset.effect || 'fade');
    const autoplay = root.querySelector('.slider-shell')?.dataset.autoplay === 'true';
    const delay = parseInt(root.querySelector('.slider-shell')?.dataset.delay || '6000', 10);
    const loop = root.querySelector('.slider-shell')?.dataset.loop === 'true';

    // Background swiper (image/video)
    const bg = new Swiper(bgEl, {
      effect: effect,
      fadeEffect: { crossFade: true },
      speed: 700,
      loop,
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      allowTouchMove: true, // swipe on mobile
      pagination: { el: bgEl.querySelector('.swiper-pagination'), clickable: true },
      navigation: { prevEl: prevBtn, nextEl: nextBtn }
    });

    // Copy swiper (no touch, synced to bg)
    const copy = new Swiper(copyEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 500,
      loop,
      allowTouchMove: false
    });

    // Sync both ways with guards
    let isSyncing = false;

    bg.on('slideChange', () => {
      if (isSyncing) return;
      isSyncing = true;
      const i = real(bg);
      copy.slideToLoop ? copy.slideToLoop(i, 500) : copy.slideTo(i, 500);
      isSyncing = false;
    });

    copy.on('slideChange', () => {
      if (isSyncing) return;
      isSyncing = true;
      const i = real(copy);
      bg.slideToLoop ? bg.slideToLoop(i, 700) : bg.slideTo(i, 700);
      isSyncing = false;
    });

    // Expose destroy for editor
    root.__athleteDestroy = () => {
      try { bg.destroy(true, true); } catch(e){}
      try { copy.destroy(true, true); } catch(e){}
      root.__athleteInit = false;
      console.log('[athlete-slider] destroyed', { id });
    };

    console.log('[athlete-slider] init', { id, effect, autoplay, delay, loop });
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SEL).forEach(init);
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(SEL);
    if (root && root.__athleteDestroy) root.__athleteDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();

