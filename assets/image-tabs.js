(() => {
  function real(sw) {
    return typeof sw.realIndex === 'number'
      ? sw.realIndex
      : sw.activeIndex;
  }

  function init(el) {
    if (!el || el.__init) return;
    el.__init = true;

    const id = el.dataset.sectionId;
    const tabsEl = el.querySelector('#Tabs-' + id);
    const imagesEl = el.querySelector('#Images-' + id);
    if (!tabsEl || !imagesEl) return;

    const autoplay = tabsEl.dataset.autoplay === 'true';
    const delay = parseInt(tabsEl.dataset.delay || '5000', 10);
    const loop = tabsEl.dataset.loop === 'true';

    const slides = tabsEl.querySelectorAll('.tab');

    const tabs = new Swiper(tabsEl, {
      direction: 'vertical',
      slidesPerView: 'auto',
      allowTouchMove: false,
      loop,
      speed: 500,
      autoplay: autoplay ? { delay, disableOnInteraction: false } : false
    });

    const images = new Swiper(imagesEl, {
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop,
      speed: 600,
      pagination: {
        el: imagesEl.querySelector('.swiper-pagination'),
        clickable: true
      },
      autoplay: autoplay ? { delay, disableOnInteraction: false } : false
    });

    function setActive(i) {
      slides.forEach((s, idx) =>
        s.classList.toggle('is-active', idx === i)
      );
    }

    tabs.on('slideChange', () =>
      setActive(real(tabs))
    );

    images.on('slideChange', () =>
      setActive(real(images))
    );

    tabsEl.addEventListener('mouseenter', (e) => {
      const row = e.target.closest('.tab');
      if (!row) return;
      const idx = +row.dataset.index;
      tabs.slideToLoop(idx);
      images.slideToLoop(idx);
    }, true);

    tabsEl.addEventListener('click', (e) => {
      const row = e.target.closest('.tab');
      if (!row) return;
      const idx = +row.dataset.index;
      tabs.slideToLoop(idx);
      images.slideToLoop(idx);
    });

    setActive(real(tabs));
  }

  function mount(scope) {
    const els = (scope || document).querySelectorAll('[data-component="image-tabs"]');
    if (!els.length) return;
    loadSwiper(() => els.forEach(init));
  }

  document.addEventListener('DOMContentLoaded', () => mount());
  document.addEventListener('shopify:section:load', (e) => mount(e.target));
})();
