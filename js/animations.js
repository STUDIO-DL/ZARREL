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
   * Trigger entrance animations on all reveal targets. Once each element's
   * entrance finishes we flag it .is-animated, which drops its `will-change`
   * hint (see animations.css) so no standing compositor layers linger to
   * compete with the looping hero video.
   */
  function revealElements() {
    const targets = document.querySelectorAll(REVEAL_SELECTOR);
    targets.forEach((el) => {
      el.addEventListener(
        'animationend',
        () => el.classList.add('is-animated'),
        { once: true }
      );
      el.classList.add('is-visible');
    });
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
