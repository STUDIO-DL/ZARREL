/**
 * ZARREL — animations.js
 * Orchestrates entrance animations for hero elements.
 * Adds .is-visible to every .reveal node once the DOM is ready, producing
 * a staggered fade-up (delays set via --reveal-delay inline in HTML).
 */

(function () {
  'use strict';

  const REVEAL_SELECTOR = '.reveal';

  /**
   * Trigger entrance animations on all reveal targets.
   */
  function revealElements() {
    const targets = document.querySelectorAll(REVEAL_SELECTOR);
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  // Respect reduced-motion: skip the orchestration delay.
  const prefersReduced =
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    revealElements();
    return;
  }

  // Small delay so the browser paints the fallback background first.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(revealElements);
    });
  } else {
    requestAnimationFrame(revealElements);
  }
})();
