/* rd-tabs.js — pill tabs, fades panels; no inline JS */
(() => {
  const Q = '[data-component="rd-tabs"]';

  function init(root){
    if (!root || root.__rdInit) return;
    root.__rdInit = true;

    const pills = root.querySelector('.pills');
    const buttons = Array.from(root.querySelectorAll('.pill-btn'));
    const panels  = Array.from(root.querySelectorAll('.media-wrap .panel'));
    const captions= Array.from(root.querySelectorAll('.caption'));
    const fill    = root.querySelector('.pill-fill');

    function layoutFill(idx){
      const btn = buttons[idx];
      if (!btn || !fill) return;
      const r = btn.getBoundingClientRect();
      const pr = pills.getBoundingClientRect();
      fill.style.left = (r.left - pr.left + 4) + 'px';
      fill.style.width = (r.width - 8) + 'px';
    }

    function activate(idx){
      buttons.forEach((b,i)=>{
        b.classList.toggle('is-active', i===idx);
        b.setAttribute('aria-selected', i===idx ? 'true' : 'false');
      });
      panels.forEach((p,i)=>{
        if (i===idx){ p.style.position=''; p.style.opacity='1'; p.style.visibility='visible'; }
        else { p.style.position='absolute'; p.style.opacity='0'; p.style.visibility='hidden'; }
      });
      captions.forEach(c => c.style.display = (+c.dataset.caption===idx) ? 'block' : 'none');
      layoutFill(idx);
    }

    pills.addEventListener('click', e=>{
      const btn = e.target.closest('.pill-btn');
      if (!btn) return;
      activate(+btn.dataset.idx);
    });

    window.addEventListener('resize', ()=>layoutFill(buttons.findIndex(b=>b.classList.contains('is-active'))));

    // initial
    const start = Math.max(0, parseInt(pills.getAttribute('data-active')||'0',10));
    requestAnimationFrame(()=>activate(start));
    console.log('[rd-tabs] init', { count: buttons.length, start });
  }

  function boot(ctx){
    (ctx||document).querySelectorAll(Q).forEach(init);
  }

  document.addEventListener('shopify:section:load', e => boot(e.target));
  document.addEventListener('shopify:section:unload', e => {
    const root = e.target && e.target.querySelector(Q);
    if (root) root.__rdInit = false;
  });
  document.addEventListener('DOMContentLoaded', ()=>boot());
})();
