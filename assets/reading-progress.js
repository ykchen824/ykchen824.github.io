(() => {
  'use strict';

  const progressBar = document.querySelector('.reading-progress');
  const scrollRoot = document.scrollingElement;
  if (!progressBar || !scrollRoot) return;

  let progressFrame = 0;

  function updateReadingProgress() {
    if (progressFrame) return;

    progressFrame = requestAnimationFrame(() => {
      const scrollRange = scrollRoot.scrollHeight - scrollRoot.clientHeight;
      const fraction = scrollRange > 0 ? scrollRoot.scrollTop / scrollRange : 0;
      const progress = Math.min(1, Math.max(0, fraction));
      progressBar.style.transform = `scaleX(${progress})`;
      progressFrame = 0;
    });
  }

  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);
  window.addEventListener('pageshow', updateReadingProgress);
  if (typeof ResizeObserver === 'function') {
    new ResizeObserver(updateReadingProgress).observe(document.body);
  }
  updateReadingProgress();
})();
