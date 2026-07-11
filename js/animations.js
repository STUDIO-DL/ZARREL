/**
 * ZARREL — animations.js
 * Scroll-triggered entrance animations for .reveal elements.
 * Hero items near the top still animate on first paint; lower story
 * sections reveal as they enter the viewport (AKQA-style rhythm).
 */

(function () {
  'use strict';

  const REVEAL_SELECTOR = '.reveal';

  function markAnimated(el) {
    el.addEventListener(
      'animationend',
      () => el.classList.add('is-animated'),
      { once: true }
    );
  }

  function revealEl(el) {
    if (el.classList.contains('is-visible')) return;
    markAnimated(el);
    el.classList.add('is-visible');
  }

  function init() {
    const targets = Array.from(document.querySelectorAll(REVEAL_SELECTOR));
    if (!targets.length) return;

    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || !('IntersectionObserver' in window)) {
      targets.forEach(revealEl);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          revealEl(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      }
    );

    targets.forEach((el) => observer.observe(el));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      requestAnimationFrame(init);
    });
  } else {
    requestAnimationFrame(init);
  }
})();
