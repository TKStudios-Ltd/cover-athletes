(() => {
  const SELECTOR = '[data-component="rd-stat-strips"]';

  function animateSection(section) {
    const rows = section.querySelectorAll('.rd-row');
    rows.forEach((row, i) => {
      setTimeout(() => {
        row.classList.add('is-visible');
      }, i * 180); // slight stagger
    });
  }

  function init(section) {
    if (!section || section.__ready) return;
    section.__ready = true;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateSection(section);
          observer.disconnect();
        });
      },
      {
        threshold: 0.35,  // section must be 35% in view
      }
    );

    observer.observe(section);

    section.__cleanup = () => observer.disconnect();
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SELECTOR).forEach(init);
  }

  document.addEventListener("DOMContentLoaded", () => boot());
  document.addEventListener("shopify:section:load", (e) => boot(e.target));
  document.addEventListener("shopify:section:unload", (e) => {
    const s = e.target.querySelector(SELECTOR);
    if (s && s.__cleanup) s.__cleanup();
  });
})();
