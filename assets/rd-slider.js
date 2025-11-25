(() => {
  const ROOT = '[data-component="rd-slider"]';

  function whenSwiper(cb) {
    if (window.Swiper) return cb();
    const t = setInterval(() => {
      if (window.Swiper) { clearInterval(t); cb(); }
    }, 40);
  }

  function init(root) {
    if (!root || root.__rdInit) return;
    root.__rdInit = true;

    const id = root.getAttribute('data-section-id');
    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(root.getAttribute('data-delay') || 5000, 10);

    const el = document.querySelector('#RDSwiper-' + id);
    if (!el) return;

    const swiper = new Swiper(el, {
      slidesPerView: 'auto',
      spaceBetween: 24,
      speed: 600,
      grabCursor: true,
      allowTouchMove: true,

      autoplay: autoplay
        ? { delay, disableOnInteraction: false }
        : false,
    });

    // Pause autoplay on hover
    el.addEventListener('mouseenter', () => {
      if (swiper.autoplay) swiper.autoplay.stop();
    });
    el.addEventListener('mouseleave', () => {
      if (swiper.autoplay) swiper.autoplay.start();
    });

    root.__rdDestroy = () => {
      try { swiper.destroy(true, true); } catch(e){}
      root.__rdInit = false;
    };
  }

  function boot(ctx) {
    whenSwiper(() => {
      (ctx || document).querySelectorAll(ROOT).forEach(init);
    });
  }

  document.addEventListener('DOMContentLoaded', () => boot());
  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target?.querySelector(ROOT);
    if (root && root.__rdDestroy) root.__rdDestroy();
  });
})();
