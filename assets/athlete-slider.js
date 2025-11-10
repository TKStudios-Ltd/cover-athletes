/* athlete-slider.js — Single BG swiper (fade/slide) + class-toggled copy items */
(() => {
  const ROOT_SEL = '[data-component="athlete-slider"]';

  function whenSwiper(cb){
    if (window.Swiper) return cb();
    let tries = 0;
    const t = setInterval(() => {
      if (window.Swiper || ++tries > 100) { clearInterval(t); if (window.Swiper) cb(); }
    }, 50);
  }

  const realIndex = (sw) => (typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex);

  function init(root){
    if (!root || root.__athleteInit) return;
    root.__athleteInit = true;

    const id        = root.getAttribute('data-section-id');
    const shell     = root.querySelector('.slider-shell');
    const bgEl      = root.querySelector('#AthleteBg-' + id);
    const prevBtn   = root.querySelector('.nav .prev');
    const nextBtn   = root.querySelector('.nav .next');
    const copyItems = Array.from(root.querySelectorAll('#AthleteCopy-' + id + ' .item'));

    // Maintain height so absolutely positioned BG has space
    if (shell && getComputedStyle(shell).minHeight === '0px') shell.style.minHeight = '480px';

    const effect   = (shell?.getAttribute('data-effect') || 'fade').trim(); // 'fade' | 'slide'
    const autoplay = shell?.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(shell?.getAttribute('data-delay') || '6000', 10);
    const loop     = shell?.getAttribute('data-loop') === 'true';

    // Background Swiper (the only swiper)
    const bg = new Swiper(bgEl, {
      effect,
      speed: 800,
      loop,
      allowTouchMove: false,
      // no bullets
      pagination: { enabled: false },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      ...(effect === 'fade' ? { fadeEffect: { crossFade: true } } : {})
    });

    // Helper: toggle active copy item and restart its CSS keyframes
    function setActive(i){
      copyItems.forEach((el, idx) => {
        const on = idx === i;
        el.classList.toggle('is-active', on);
        if (on) {
          // restart nested keyframes so they play every time
          el.querySelectorAll('.quote, .person').forEach(n => {
            n.style.animation = 'none';  // reset
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            n.offsetHeight;
            n.style.animation = '';
          });
        }
      });
    }

    // Ken Burns restart so the active media animates each time
    function restartKenBurns(){
      const wrapper = root.querySelector('.slider-shell');
      if (!wrapper || !wrapper.classList.contains('kenburns')) return;
      bg.slides.forEach(slide => {
        slide.querySelectorAll('.bg-media img, .bg-media video').forEach(el => {
          el.style.animation = 'none';
          void el.offsetWidth;
          el.style.animation = '';
        });
      });
      const activeSlide = bg.slides[bg.realIndex];
      if (activeSlide){
        activeSlide.querySelectorAll('.bg-media img, .bg-media video').forEach(el => {
          el.style.animation = 'kb-' + id + ' 10s ease forwards';
        });
      }
    }

    // Init + sync
    bg.on('init', () => {
      const idx = realIndex(bg);
      setActive(idx);
      restartKenBurns();
      resize();
    });

    // Sync after the visual transition completes to avoid ghosting
    bg.on('slideChangeTransitionEnd', () => {
      const idx = realIndex(bg);
      setActive(idx);
      restartKenBurns();
      resize();
    });

    // Arrows
    prevBtn?.addEventListener('click', () => bg.slidePrev());
    nextBtn?.addEventListener('click', () => bg.slideNext());

    // Keep shell tall enough for whatever text is active
    const content = root.querySelector('.content');
    function resize(){
      if (!shell || !content) return;
      const h = Math.max(content.offsetHeight, 420);
      shell.style.minHeight = h + 'px';
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    // Expose destroy for editor
    root.__athleteDestroy = () => {
      try{ bg.destroy(true, true); }catch(e){}
      window.removeEventListener('resize', resize);
      root.__athleteInit = false;
    };
  }

  function boot(ctx){
    const roots = (ctx || document).querySelectorAll(ROOT_SEL);
    if (!roots.length) return;
    whenSwiper(() => roots.forEach(init));
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(ROOT_SEL);
    if (root && root.__athleteDestroy) root.__athleteDestroy();
  });
  document.addEventListener('DOMContentLoaded', () => boot());
})();
