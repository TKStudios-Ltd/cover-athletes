/* athlete-slider.js — Single BG swiper (fade/slide) + absolutely-positioned copy items */
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
    const copyWrap  = root.querySelector('#AthleteCopy-' + id);
    const copyItems = Array.from(root.querySelectorAll('#AthleteCopy-' + id + ' .item'));

    // Maintain height so absolutely positioned BG has space
    if (shell && getComputedStyle(shell).minHeight === '0px') shell.style.minHeight = '480px';

    const effect   = (shell?.getAttribute('data-effect') || 'fade').trim(); // 'fade' | 'slide'
    const autoplay = shell?.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(shell?.getAttribute('data-delay') || '6000', 10);
    const loop     = shell?.getAttribute('data-loop') === 'true';

    // Helper: toggle active copy item and lock height
    function setActive(i, instant){
      const clamped = Math.max(0, Math.min(i, copyItems.length - 1));
      copyItems.forEach((el, idx) => {
        const on = idx === clamped;
        el.classList.toggle('is-active', on);
        if (on) {
          // restart nested keyframes so they play every time (unless instant)
          el.querySelectorAll('.quote, .person').forEach(n => {
            n.style.animation = 'none';
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            n.offsetHeight;
            n.style.animation = instant ? 'none' : '';
          });
          // lock container height to active content
          const h = el.offsetHeight || el.scrollHeight || 0;
          if (copyWrap) copyWrap.style.setProperty('--copy-h', h + 'px');
        }
      });
      // update shell min-height to cover content block
      resize();
    }

    // Create the only swiper (background)
    const bg = new Swiper(bgEl, {
      effect,
      speed: 800,
      loop,
      allowTouchMove: false,
      pagination: { enabled: false },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      ...(effect === 'fade' ? { fadeEffect: { crossFade: true } } : {}),
      observer: true,
      observeParents: true,
      initialSlide: 0
    });

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

    // Ensure first slide is visible even if Swiper init timing changes
    setActive(0, /*instant*/ true);

    bg.on('init', () => {
      setActive(realIndex(bg), true);
      restartKenBurns();
      resize();
    });

    // Sync after the visual transition completes (prevents ghost/double)
    bg.on('slideChangeTransitionEnd', () => {
      setActive(realIndex(bg), false);
      restartKenBurns();
    });

    // Arrows
    prevBtn?.addEventListener('click', () => bg.slidePrev());
    nextBtn?.addEventListener('click', () => bg.slideNext());

    // Keep shell tall enough for active content
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
