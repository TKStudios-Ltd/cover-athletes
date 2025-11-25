console.log("[rd-slider] init");

document.addEventListener("DOMContentLoaded", () => {
  const sliders = document.querySelectorAll("[data-rd-slider]");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const autoplayEnabled = slider.dataset.autoplay === "true";
    const delay = parseInt(slider.dataset.delay, 10) || 5000;
    const swiperEl = slider.querySelector(".swiper");

    const swiper = new Swiper(swiperEl, {
      slidesPerView: "auto",
      spaceBetween: 16,
      grabCursor: true,
      speed: 600,
      autoplay: autoplayEnabled
        ? {
            delay: delay,
            disableOnInteraction: false
          }
        : false,
      loop: false,
      resistanceRatio: 0.85,
      breakpoints: {
        750: { spaceBetween: 24 }
      }
    });

    // Pause on hover
    slider.addEventListener("mouseenter", () => {
      if (swiper.autoplay) swiper.autoplay.stop();
    });

    slider.addEventListener("mouseleave", () => {
      if (swiper.autoplay) swiper.autoplay.start();
    });

    console.log("[rd-slider] ready");
  });
});
