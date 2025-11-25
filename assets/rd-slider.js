document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[class*=rnd-swiper]").forEach((el) => {
    const autoplay = el.dataset.autoplay === "true";
    const delay = parseInt(el.dataset.delay, 10);

    const swiper = new Swiper(el, {
      slidesPerView: "auto",
      spaceBetween: 30,
      grabCursor: true,
      autoplay: autoplay ? { delay, pauseOnMouseEnter: true } : false,
      speed: 650
    });
  });
});
