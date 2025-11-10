/* athlete-slider.js — BG + copy swipers, effect + ken burns, arrows, autoplay, loop */
(() => {
  const ROOT_SEL = '[data-component="athlete-slider"]';

  function whenSwiper(cb){
    if (window.Swiper) return cb();
    let tries = 0;
    const t = setInterval(() => {
      if (window.Swiper || ++tries > 100) { clearInterval(t); if (window.Swiper) cb(); }
    }, 50);
  }

  function realIndex(sw){ return typeof sw.realIndex === 'number' ? sw.realIndex : sw.activeIndex; }

  function init(root){
    if (!root || root.__athleteInit) return;
    root.__athleteInit = true;

    const id        = root.getAttribute('data-section-id');
    const shell     = root.querySelector('.slider-shell');
    const bgEl      = root.querySelector('#AthleteBg-' + id);
    const copyEl    = root.querySelector('#AthleteCopy-' + id);
    const prevBtn   = root.querySelector('.nav .prev');
    const nextBtn   = root.querySelector('.nav .next');

    // Ensure container has height for absolutely-positioned BG swiper
    if (shell && getComputedStyle(shell).minHeight === '0px') {
      shell.style.minHeight = '480px';
    }

    const effect   = (shell?.getAttribute('data-effect') || 'fade').trim(); // 'fade' | 'slide'
    const autoplay = shell?.getAttribute('data-autoplay') === 'true';
    const delay    = parseInt(shell?.getAttribute('data-delay') || '6000', 10);
    const loop     = shell?.getAttribute('data-loop') === 'true';

    // BG Swiper (drives everything)
    const bg = new Swiper(bgEl, {
      effect,
      speed: 800,
      loop,
      allowTouchMove: false,
      // bullets were requested off; keep pagination node harmlessly disabled
      pagination: { el: bgEl.querySelector('.swiper-pagination'), clickable: false, enabled: false },
      autoplay: autoplay ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true } : false,
      // nicer cross-fade if using fade
      ...(effect === 'fade' ? { fadeEffect: { crossFade: true } } : {})
    });

    // Copy swiper (text), follow BG index exactly
    const copy = new Swiper(copyEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      speed: 0,
      loop,
      allowTouchMove: false
    });

    function syncCopy(i){
      if (typeof copy.slideToLoop === 'function') copy.slideToLoop(i, 0, false);
      else copy.slideTo(i, 0, false);
    }

    function restartKenBurns(idx){
      const wrapper = root.querySelector('.slider-shell');
      if (!wrapper || !wrapper.classList.contains('kenburns')) return;
      // restart animation only on the active slide media
      bg.slides.forEach(slide => {
        slide.querySelectorAll('.bg-media img, .bg-media video').forEach(el => {
          el.style.animation = 'none';
          // force reflow
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

    bg.on('init', () => {
      syncCopy(realIndex(bg));
      restartKenBurns(realIndex(bg));
    });

    bg.on('slideChange', () => {
      const idx = realIndex(bg);
      syncCopy(idx);
      restartKenBurns(idx);
    });

    // Arrow controls
    if (prevBtn) prevBtn.addEventListener('click', () => bg.slidePrev());
    if (nextBtn) nextBtn.addEventListener('click', () => bg.slideNext());

    // keep shell at least as tall as the content on resize
    const content = root.querySelector('.content');
    function resize(){
      if (!shell || !content) return;
      const h = Math.max( content.offsetHeight, 420 );
      shell.style.minHeight = h + 'px';
    }
    window.addEventListener('resize', resize);
    setTimeout(resize, 0);

    // Expose destroy for theme editor
    root.__athleteDestroy = () => {
      try{ bg.destroy(true,true); }catch(e){}
      try{ copy.destroy(true,true); }catch(e){}
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
