/* athlete-slider.js — Single BG swiper (SLIDE) + absolutely-positioned copy items */
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
    const content   = root.querySelector('.content');

    // Maintain height so absolutely positioned BG has space
    if (shell && getComputedStyle(shell).minHeight === '0px') shell.style.minHeight = '480px';

    // Read settings but FORCE slide (user asked for slide)
    const effectSetting = (shell?.getAttribute('data-effect') || 'slide').trim();
    const effect   = 'slide';
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
          el.querySelectorAll('.quote, .person').forEach(n => {
            n.style.animation = 'none';
            // force reflow
            // eslint-disable-next-line no-unused-expressions
            n.offsetHeight;
            n.style.animation = instant ? 'none' : '';
          });
          const h = el.offsetHeight || el.scrollHeight || 0;
          if (copyWrap) copyWrap.style.setProperty('--copy-h', h + 'px');
        }
      });
      resize();
    }

    // Background Swiper (the only swiper)
    const bg = new Swiper(bgEl, {
      effect,
      speed: 700,
      loop,
      allowTouchMove: true,
      // no bullets
      pagination: { enabled: false },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      observer: true,
      observeParents: true,
      initialSlide: 0
    });

    // Ensure first slide shows immediately (even before Swiper fires)
    setActive(0, true);

    // Init + sync
    bg.on('init', () => {
      setActive(realIndex(bg), true);
      restartKenBurns();
      resize();
    });

    // Sync on slide change (slide effect → we can switch immediately)
    bg.on('slideChange', () => {
      setActive(realIndex(bg), false);
      restartKenBurns();
    });

    // Arrows
    prevBtn?.addEventListener('click', (e) => { e.preventDefault(); bg.slidePrev(); });
    nextBtn?.addEventListener('click', (e) => { e.preventDefault(); bg.slideNext(); });

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

    // Keep shell tall enough for active content
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
