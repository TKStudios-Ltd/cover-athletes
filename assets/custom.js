(function () {
  function wireExternalArrows(root = document) {
    const allArrows = root.querySelectorAll('slideshow-arrows[data-controls]');
    if (!allArrows.length) {
      console.log('[slideshow-arrows] none found');
      return;
    }

    allArrows.forEach(arrowsEl => {
      const targetId = arrowsEl.getAttribute('data-controls');
      const target =
        document.getElementById(targetId) ||
        document.querySelector(`#${CSS.escape(targetId)}`);
      console.log('[slideshow-arrows] looking for target:', targetId, target);

      if (!target) {
        console.warn('[slideshow-arrows] target not found:', targetId);
        return;
      }

      const prev = arrowsEl.querySelector('.prev');
      const next = arrowsEl.querySelector('.next');

      function slide(dir) {
        console.log(`[slideshow-arrows] ${dir} click on`, target);

        // dispatch event for Shopify’s slideshow logic
        target.dispatchEvent(
          new CustomEvent(`slideshow:${dir}`, { bubbles: true })
        );

        // fallback: scroll horizontally
        const amount = target.offsetWidth || 400;
        if (dir === 'previous') target.scrollBy({ left: -amount, behavior: 'smooth' });
        if (dir === 'next') target.scrollBy({ left: amount, behavior: 'smooth' });
      }

      prev?.addEventListener('click', e => {
        e.preventDefault();
        slide('previous');
      });
      next?.addEventListener('click', e => {
        e.preventDefault();
        slide('next');
      });

      console.log('[slideshow-arrows] wired for', targetId);
    });
  }

  document.addEventListener('DOMContentLoaded', () => wireExternalArrows());
  document.addEventListener('shopify:section:load', e => wireExternalArrows(e.target));
})();


document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-drag-scroll]').forEach(slider => {
    let isDown = false;
    let startX;
    let scrollLeft;

    slider.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
    });

    slider.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      slider.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  });
});


