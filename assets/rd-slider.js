document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.rd-slider').forEach(section => {
    const id = section.dataset.sectionId;
    const sliderEl = section.querySelector('#RDSlider-' + id);
    if (!sliderEl) return;

    const autoplay = section.dataset.autoplay === "true";
    const delay = parseInt(section.dataset.delay || 5) * 1000;

    new Swiper(sliderEl, {
      slidesPerView: "auto",
      spaceBetween: 20,
      speed: 600,
      grabCursor: true,
      autoplay: autoplay ? { delay, pauseOnMouseEnter: true } : false
    });
  });
});
