(() => {
  const SELECTOR = '[data-component="rd-stat-strips"]';

  function init(root) {
    if (!root || root.__rdInit) return;
    root.__rdInit = true;

    const rows = root.querySelectorAll('[data-row]');
    if (!rows.length) return;

    if (!("IntersectionObserver" in window)) {
      rows.forEach((row) => row.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -20% 0px",
        threshold: 0.4,
      }
    );

    rows.forEach((row) => observer.observe(row));

    root.__rdCleanup = () => {
      observer.disconnect();
    };
  }

  function destroy(root) {
    if (!root || !root.__rdInit) return;
    if (typeof root.__rdCleanup === "function") {
      root.__rdCleanup();
    }
    root.__rdInit = false;
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SELECTOR).forEach(init);
  }

  document.addEventListener("DOMContentLoaded", () => boot());
  document.addEventListener("shopify:section:load", (event) => {
    boot(event.target);
  });
  document.addEventListener("shopify:section:unload", (event) => {
    const root = event.target.querySelector(SELECTOR);
    if (root) destroy(root);
  });
})();
