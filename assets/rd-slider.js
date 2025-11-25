(() => {
  const SEL = '[data-component="rd-slider"]';

  function wait(cb) {
    if (window.Swiper) return cb();
    const t = setInterval(() => {
      if (window.Swiper) { clearInterval(t); cb(); }
    }, 40);
  }

  function init(root) {
    if (!root || root.__init) return;
    root.__init = true;

    const id = root.getAttribute('data-section-id');
    const autoplay = root.getAttribute('data-autoplay') === 'true';
    const delay = parseInt(root.getAttribute('data-delay') || 5000, 10);

    const target = document.querySelector(`#RDSwiper-${id}`);
    if (!target) return;

    const sw = new Swiper(target, {
      slidesPerView: 'auto',
      spaceBetween: 24,
      speed: 600,
      grabCursor: true,
      allowTouchMove: true,
      autoplay: autoplay ? { delay, disableOnInteraction: false } : false
    });

    target.addEventListener('mouseenter', () => {
      if (sw.autoplay) sw.autoplay.stop();
    });
    target.addEventListener('mouseleave', () => {
      if (sw.autoplay) sw.autoplay.start();
    });

    root.__destroy = () => {
      try { sw.destroy(true, true); } catch(e){}
      root.__init = false;
    };
  }

  function boot(ctx) {
    wait(() => {
      (ctx || document).querySelectorAll(SEL).forEach(init);
    });
  }

  document.addEventListener('DOMContentLoaded', boot);
  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target?.querySelector(SEL);
    if (root?.__destroy) root.__destroy();
  });

})();
