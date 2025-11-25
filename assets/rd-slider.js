document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.rd-slider').forEach(section => {
    const id = section.dataset.sectionId;
    const sliderEl = section.querySelector('#RDSlider-' + id);
    if (!sliderEl) return;

    const autoplaySetting = section.querySelector('.rd-slider__inner')
      ?.closest('.rd-slider')
      ?.dataset?.autoplay;

    const delay = parseInt(section.dataset.delay || 5000);

    const swiper = new Swiper(sliderEl, {
      slidesPerView: "auto",
      spaceBetween: 20,
      grabCursor: true,
      autoplay: autoplaySetting ? { delay: delay * 1000, pauseOnMouseEnter: true } : false,
      speed: 600
    });
  });
});
