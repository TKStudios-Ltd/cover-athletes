(function () {
  function wireExternalArrows(root = document) {
    const arrowsList = root.querySelectorAll('slideshow-arrows[data-controls]');
    if (!arrowsList.length) {
      console.log('[slideshow-arrows] No external arrows found');
      return;
    }

    arrowsList.forEach((arrowsEl) => {
      const targetId = arrowsEl.getAttribute('data-controls');
      const target = document.getElementById(targetId);

      if (!target) {
        console.warn('[slideshow-arrows] Target not found by id:', targetId);
        return;
      }

      const prevBtn = arrowsEl.querySelector('.prev');
      const nextBtn = arrowsEl.querySelector('.next');

      if (!prevBtn && !nextBtn) {
        console.warn('[slideshow-arrows] No .prev or .next buttons inside:', arrowsEl);
        return;
      }

      // cache internal arrows if we need to click them as a fallback
      const internalPrev = target.querySelector('slideshow-arrows [ref="previous"], .slideshow-control--previous, [on\\:click="/previous"]');
      const internalNext = target.querySelector('slideshow-arrows [ref="next"], .slideshow-control--next, [on\\:click="/next"]');

      function logTargetInfo() {
        console.log('[slideshow-arrows] Target:', target);
        console.log('[slideshow-arrows] Methods available:', {
          previous: typeof target.previous === 'function',
          next: typeof target.next === 'function',
          scrollToSlide: typeof target.scrollToSlide === 'function'
        });
        console.log('[slideshow-arrows] Internal arrows:', { internalPrev, internalNext });
      }

      logTargetInfo();

      function go(dir) {
        console.log(`[slideshow-arrows] Requested: ${dir} on`, target);

        // 1) try native event
        try {
          const ev = new CustomEvent(`slideshow:${dir}`, { bubbles: true });
          const dispatched = target.dispatchEvent(ev);
          console.log(`[slideshow-arrows] Dispatched event slideshow:${dir}`, { dispatched });
        } catch (e) {
          console.warn('[slideshow-arrows] Event dispatch error:', e);
        }

        // 2) try method on the component
        try {
          if (dir === 'previous' && typeof target.previous === 'function') {
            console.log('[slideshow-arrows] Using target.previous()');
            target.previous();
            return;
          }
          if (dir === 'next' && typeof target.next === 'function') {
            console.log('[slideshow-arrows] Using target.next()');
            target.next();
            return;
          }
        } catch (e) {
          console.warn('[slideshow-arrows] Method call error:', e);
        }

        // 3) click the internal buttons
        try {
          if (dir === 'previous' && internalPrev) {
            console.log('[slideshow-arrows] Clicking internal previous');
            internalPrev.click();
            return;
          }
          if (dir === 'next' && internalNext) {
            console.log('[slideshow-arrows] Clicking internal next');
            internalNext.click();
            return;
          }
        } catch (e) {
          console.warn('[slideshow-arrows] Internal click error:', e);
        }

        console.warn('[slideshow-arrows] No control path worked for', dir);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          go('previous');
        });
      }
      if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          go('next');
        });
      }

      console.log('[slideshow-arrows] Wired external arrows for target:', targetId);
    });
  }

  // Initial bind
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => wireExternalArrows(document));
  } else {
    wireExternalArrows(document);
  }

  // Rebind when sections are loaded in the editor
  document.addEventListener('shopify:section:load', (e) => {
    console.log('[slideshow-arrows] section load -> rewire');
    wireExternalArrows(e.target || document);
  });
})();
