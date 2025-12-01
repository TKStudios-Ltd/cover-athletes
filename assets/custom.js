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
  console.log('[Custom Gallery] DOM loaded');

  document.querySelectorAll('[data-drag-scroll]').forEach((slider, index) => {
    console.log(`[Custom Gallery] Initialised slider ${index + 1}`, slider);

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    slider.addEventListener('mousedown', e => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
      console.log('[Custom Gallery] Drag start', { startX, scrollLeft });
    });

    slider.addEventListener('mouseup', () => {
      isDown = false;
      console.log('[Custom Gallery] Drag end');
    });

    slider.addEventListener('mouseleave', () => {
      isDown = false;
    });

    slider.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 1.2;
      slider.scrollLeft = scrollLeft - walk;
      console.log('[Custom Gallery] Dragging', slider.scrollLeft);
    });
  });
});


/* Counter Text */

(function () {
  function animateCount(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = parseInt(el.dataset.duration, 10) || 3000;

    let start = null;

    function update(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      el.textContent = Math.floor(progress * target);

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.count-up').forEach(el => observer.observe(el));
  });
})();


/* NZ Clock */

(function () {
  function initNZClock(clock) {
    const timeEl = clock.querySelector('[data-nz-clock-time]');
    const ampmEl = clock.querySelector('[data-nz-clock-ampm]');

    function updateClock() {
      const now = new Date();

      const parts = new Intl.DateTimeFormat('en-NZ', {
        timeZone: 'Pacific/Auckland',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).formatToParts(now);

      const hour = parts.find(p => p.type === 'hour').value;
      const minute = parts.find(p => p.type === 'minute').value;
      const ampm = parts.find(p => p.type === 'dayPeriod').value.toUpperCase();

      timeEl.textContent = `${hour}:${minute}`;
      ampmEl.textContent = ampm;
    }

    updateClock();
    setInterval(updateClock, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nz-live-clock').forEach(initNZClock);
  });
})();

/* Product Sticky Bar */

document.addEventListener('DOMContentLoaded', () => {
  const bar = document.querySelector('.product-sticky-bar');
  const trigger = document.getElementById('sticky-bar-trigger');

  if (!bar || !trigger) return;

  let hasPassedTrigger = false;

  const observer = new IntersectionObserver(
    ([entry]) => {
      // First time the trigger leaves viewport after being seen
      if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
        hasPassedTrigger = true;
      }

      if (hasPassedTrigger) {
        bar.classList.add('is-visible');
      } else {
        bar.classList.remove('is-visible');
      }
    },
    {
      threshold: 0
    }
  );

  observer.observe(trigger);
});


document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-scroll-to-top]');
  if (!btn) return;

  e.preventDefault();

  const target = document.getElementById('MainContent');
  if (!target) return;

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
});

