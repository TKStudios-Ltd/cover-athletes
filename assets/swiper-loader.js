/* Swiper Loader (shared)
   - Ensures one-time loading of Swiper core CSS/JS
   - Falls back to CDN if theme assets missing
   - window.loadSwiper(cb) → guarantees Swiper is available before cb runs
*/
(() => {
  const READY_EVENT = 'swiper:ready';
  const STATE_KEY = 'swiperLoading';

  function fireReady() { document.dispatchEvent(new Event(READY_EVENT)); }

  function fromCdn(cb){
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/swiper@9/swiper-bundle.min.css';
    document.head.appendChild(css);

    const js  = document.createElement('script');
    js.src = 'https://unpkg.com/swiper@9/swiper-bundle.min.js';
    js.defer = true;
    js.onload = () => { fireReady(); cb && cb(); };
    document.head.appendChild(js);
  }

  window.loadSwiper = function(cb){
    if (window.Swiper) { cb && cb(); return; }

    if (document.documentElement.dataset[STATE_KEY] === '1') {
      document.addEventListener(READY_EVENT, () => cb && cb(), { once: true });
      return;
    }
    document.documentElement.dataset[STATE_KEY] = '1';

    // Try theme assets first
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = (window.Shopify && Shopify.assetUrl ? Shopify.assetUrl('swiper-bundle.min.css') : '{{ "swiper-bundle.min.css" | asset_url }}');
    css.onerror = () => fromCdn(cb);
    document.head.appendChild(css);

    const js  = document.createElement('script');
    js.src = (window.Shopify && Shopify.assetUrl ? Shopify.assetUrl('swiper-bundle.min.js') : '{{ "swiper-bundle.min.js" | asset_url }}');
    js.defer = true;
    js.onload = () => { fireReady(); cb && cb(); };
    js.onerror = () => fromCdn(cb);
    document.head.appendChild(js);
  };
})();
