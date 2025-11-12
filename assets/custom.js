document.addEventListener('DOMContentLoaded', () => {
  // Find all external slideshow-arrows elements
  document.querySelectorAll('slideshow-arrows[data-controls]').forEach(arrowsEl => {
    const targetId = arrowsEl.getAttribute('data-controls');
    const target = document.getElementById(targetId);

    if (!target) return;

    const prevBtn = arrowsEl.querySelector('.prev');
    const nextBtn = arrowsEl.querySelector('.next');

    // Dispatch native slideshow events that Shopify listens for
    const slide = dir => {
      const event = new CustomEvent(`slideshow:${dir}`, { bubbles: true });
      target.dispatchEvent(event);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => slide('previous'));
    if (nextBtn) nextBtn.addEventListener('click', () => slide('next'));
  });
});
