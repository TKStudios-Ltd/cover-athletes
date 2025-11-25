(() => {
  const ROOT = '[data-component="rd-slider"]';

  function onSwiperReady(cb) {
    if (window.Swiper) return cb();
    const t = setInterval(() => {
      if (window.Swiper) {
        clearInterval(t);
        cb();
      }
    }, 40);
  }

  function init(root) {
    if (!root || root.__rdInit) return;
    root.__rdInit = true;

    const id = root.getAttribute('data-section-id');
    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(root.getAttribute('data-delay') || 5000, 10);

    const el = document.querySelector(`#RDSwiper-${id}`);
    if (!el) return;

    const sw = new Swiper(el, {
      slidesPerView: 'auto',
      spaceBetween: 24,
      speed: 600,
      grabCursor: true,
      allowTouchMove: true,
      autoplay: autoplay
        ? { delay, disableOnInteraction: false }
        : false
    });

    el.addEventListener('mouseenter', () => {
      if (sw.autoplay) sw.autoplay.stop();
    });

    el.addEventListener('mouseleave', () => {
      if (sw.autoplay) sw.autoplay.start();
    });

    root.__rdDestroy = () => {
      try { sw.destroy(true, true); } catch(e){}
      root.__rdInit = false;
    };
  }

  function boot(ctx) {
    onSwiperReady(() => {
      (ctx || document).querySelectorAll(ROOT).forEach(init);
    });
  }

  document.addEventListener('DOMContentLoaded', () => boot());
  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target?.querySelector(ROOT);
    if (root?.__rdDestroy) root.__rdDestroy();
  });
})();
