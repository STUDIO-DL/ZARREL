/**
 * ZARREL — navbar.js
 * Light-glass navbar scroll behaviour (centered above the hero card on the
 * white page). On load the bar is subtly translucent; after the user scrolls
 * past a small threshold we smoothly increase blur + opacity via the
 * .is-scrolled class (styled in css/style.css).
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const SCROLL_THRESHOLD = 40; // px before the glass intensifies

  /**
   * Toggle the scrolled state based on current scroll position.
   */
  function updateNavbar() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    navbar.classList.toggle('is-scrolled', scrolled);
  }

  // Passive listener — never blocks scroll performance.
  window.addEventListener('scroll', updateNavbar, { passive: true });

  // Set initial state (handles page reload mid-scroll).
  updateNavbar();
})();
