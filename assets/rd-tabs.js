/* rd-tabs.js — pill tabs w/ image or video panels, no inline JS */
(() => {
  const SELECTOR = '[data-component="rd-tabs"]';

  function setActive(root, nextIdx) {
    const pills = root.querySelectorAll('.pill-btn');
    const panels = root.querySelectorAll('.panel');
    const captions = root.querySelectorAll('.caption');

    pills.forEach((btn, i) => {
      const active = i === nextIdx;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach((p, i) => {
      const active = i === nextIdx;
      p.classList.toggle('is-active', active);
      // Pause other videos, play active (if any)
      const vid = p.querySelector('video');
      if (vid) {
        if (active) { try { vid.play(); } catch(e){} }
        else { try { vid.pause(); } catch(e){} }
      }
    });

    captions.forEach((c, i) => {
      if (parseInt(c.dataset.caption, 10) === nextIdx) c.removeAttribute('hidden');
      else c.setAttribute('hidden', '');
    });
  }

  function init(root) {
    if (!root || root.__rdInit) return;
    root.__rdInit = true;

    const id = root.getAttribute('data-section-id');
    const pillsWrap = root.querySelector('.pills');
    if (!pillsWrap) return;

    const start = parseInt(pillsWrap.getAttribute('data-active') || '0', 10) || 0;
    setActive(root, start);

    pillsWrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      const idx = parseInt(btn.dataset.idx, 10);
      if (Number.isNaN(idx)) return;
      setActive(root, idx);
    });

    document.addEventListener('shopify:section:unload', (ev) => {
      if (root.contains(ev.target)) {
        root.__rdInit = false;
      }
    });
  }

  function boot(ctx) {
    (ctx || document).querySelectorAll(SELECTOR).forEach(init);
  }

  document.addEventListener('DOMContentLoaded', () => boot());
  document.addEventListener('shopify:section:load', (e) => boot(e.target));
})();
