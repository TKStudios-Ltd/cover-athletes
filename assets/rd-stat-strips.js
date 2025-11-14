(() => {
  const SEL = '[data-component="rd-stat-strips"]';

  function init(section) {
    if (!section || section.__done) return;
    section.__done = true;

    const rows = section.querySelectorAll('.rd-row');

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          rows.forEach((row, i) => {
            setTimeout(() => row.classList.add('is-visible'), i * 150);
          });

          obs.disconnect();
        });
      },
      { threshold: 0.3 }
    );

    obs.observe(section);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(SEL).forEach(init);
  });

  document.addEventListener('shopify:section:load', (e) => {
    const sec = e.target.querySelector(SEL);
    if (sec) init(sec);
  });
})();
