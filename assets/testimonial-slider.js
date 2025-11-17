/* testimonial-slider.js — BG swiper + copy sync + text pager with progress */
(() => {
  const ROOT_SEL = '[data-component="testimonial-slider"]';

  function whenSwiper(cb) {
    if (window.Swiper) return cb();
    let tries = 0;
    const t = setInterval(() => {
      if (window.Swiper || ++tries > 100) {
        clearInterval(t);
        if (window.Swiper) cb();
      }
    }, 50);
  }

  const realIndex = (sw) =>
    typeof sw.realIndex === "number" ? sw.realIndex : sw.activeIndex;

  function init(root) {
    if (!root || root.__tsInit) return;
    root.__tsInit = true;

    const id = root.getAttribute("data-section-id");
    const shell = root.querySelector(".slider-shell");
    const bgEl = root.querySelector("#TestimonialBg-" + id);
    const copyWrap = root.querySelector("#TestimonialCopy-" + id);
    const copyItems = Array.from(
      copyWrap?.querySelectorAll(".item") || []
    );
    const pager = root.querySelector("#TestimonialPager-" + id);
    const pagerItems = Array.from(
      pager?.querySelectorAll(".pager__item") || []
    );
    const content = root.querySelector(".content");

    const effectSetting = (shell?.getAttribute("data-effect") || "slide").trim();
    const effect = effectSetting === "fade" ? "fade" : "slide";
    const autoplay = shell?.getAttribute("data-autoplay") === "true";
    const delay = parseInt(shell?.getAttribute("data-delay") || "5000", 10);
    const loop = shell?.getAttribute("data-loop") === "true";

    if (shell && getComputedStyle(shell).minHeight === "0px") {
      shell.style.minHeight = "480px";
    }

    const bg = new Swiper(bgEl, {
      effect,
      speed: 700,
      loop,
      allowTouchMove: true,
      pagination: { enabled: false },
      autoplay: autoplay
        ? { delay, disableOnInteraction: false, pauseOnMouseEnter: true }
        : false,
      ...(effect === "fade" ? { fadeEffect: { crossFade: true } } : {}),
      observer: true,
      observeParents: true,
      initialSlide: 0,
    });

    function setActive(i, instant) {
      const idx = Math.max(0, Math.min(i, copyItems.length - 1));

      // copy
      copyItems.forEach((el, j) => {
        const on = j === idx;
        el.classList.toggle("is-active", on);
        if (on) {
          el.querySelectorAll(".quote, .person").forEach((n) => {
            n.style.animation = "none";
            void n.offsetWidth;
            n.style.animation = instant ? "none" : "";
          });
          const h = el.offsetHeight || el.scrollHeight || 0;
          copyWrap?.style.setProperty("--copy-h", h + "px");
        }
      });

      // pager + progress
      pagerItems.forEach((p, j) => {
        const active = j === idx;
        p.classList.toggle("is-active", active);
        p.classList.remove("is-anim");
        void p.offsetWidth;
        if (autoplay && active) {
          p.style.setProperty("--delay-ms", `${delay}ms`);
          p.classList.add("is-anim");
        }
      });

      resize();
    }

    function restartKenBurns() {
      const wrapper = shell;
      if (!wrapper || !wrapper.classList.contains("kenburns")) return;
      bg.slides.forEach((slide) => {
        slide
          .querySelectorAll(".bg-media img, .bg-media video")
          .forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
          });
      });
      const active = bg.slides[bg.realIndex];
      if (!active) return;
      active
        .querySelectorAll(".bg-media img, .bg-media video")
        .forEach((el) => {
          el.style.animation = `kb-${id} 10s ease forwards`;
        });
    }

    setActive(0, true);

    bg.on("init", () => {
      setActive(realIndex(bg), true);
      restartKenBurns();
      resize();
    });

    bg.on("slideChange", () => {
      setActive(realIndex(bg), false);
      restartKenBurns();
    });

    // pager click
    pagerItems.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const idx = parseInt(btn.getAttribute("data-idx") || "0", 10);
        if (typeof bg.slideToLoop === "function") bg.slideToLoop(idx);
        else bg.slideTo(idx);
      });
    });

    function resize() {
      if (!shell || !content) return;
      const h = Math.max(content.offsetHeight, 420);
      shell.style.minHeight = h + "px";
    }

    window.addEventListener("resize", resize);
    setTimeout(resize, 0);

    root.__tsDestroy = () => {
      try {
        bg.destroy(true, true);
      } catch (e) {}
      window.removeEventListener("resize", resize);
      root.__tsInit = false;
    };
  }

  function boot(ctx) {
    const roots = (ctx || document).querySelectorAll(ROOT_SEL);
    if (!roots.length) return;
    whenSwiper(() => roots.forEach(init));
  }

  document.addEventListener("shopify:section:load", (e) => boot(e.target));
  document.addEventListener("shopify:section:unload", (e) => {
    const root = e.target && e.target.querySelector(ROOT_SEL);
    if (root && root.__tsDestroy) root.__tsDestroy();
  });
  document.addEventListener("DOMContentLoaded", () => boot());
})();
