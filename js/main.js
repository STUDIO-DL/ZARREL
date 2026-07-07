/**
 * ZARREL — main.js
 * App bootstrap: hero video loading inside the rounded card, graceful
 * fallback (gradient / SVG clipped by the card), smooth anchor scrolling,
 * and performance helpers. The video is enforced muted so autoplay is
 * permitted, and swaps to the in-card fallback on any failure.
 */

(function () {
  'use strict';

  const video = document.getElementById('hero-video');
  const hero = document.getElementById('hero');

  /* ------------------------------------------------------------------ */
  /*  Hero video — non-blocking load with graceful fallback              */
  /* ------------------------------------------------------------------ */

  /**
   * Fade the video in once it can play. If the file is missing, fails to
   * decode, or the browser blocks autoplay, we swap to the static fallback
   * (CSS gradient + image) by flagging the hero with .is-video-error.
   */
  function initHeroVideo() {
    if (!video) return;

    let settled = false;

    const showVideo = () => {
      if (settled) return;
      settled = true;
      video.classList.add('is-ready');
    };

    const showFallback = () => {
      if (settled) return;
      settled = true;
      video.classList.remove('is-ready');
      video.removeAttribute('autoplay');
      if (hero) hero.classList.add('is-video-error');
    };

    // Guarantee muted so autoplay is permitted on every browser/policy.
    video.muted = true;
    video.setAttribute('muted', '');

    // Already buffered enough (e.g. cached) — reveal immediately.
    if (video.readyState >= 3) {
      showVideo();
    } else {
      video.addEventListener('canplay', showVideo, { once: true });
    }

    // Missing file, decode failure, or unsupported codec -> fallback.
    video.addEventListener('error', showFallback, { once: true });

    // Some browsers report a dead <source> only via the media element's
    // NETWORK_NO_SOURCE state rather than firing "error" on the <video>.
    const guardNoSource = () => {
      if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
        showFallback();
      }
    };
    video.addEventListener('loadstart', guardNoSource);
    video.addEventListener('stalled', guardNoSource);

    // Explicitly kick off playback; if autoplay is blocked, fall back.
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt.then(showVideo).catch(showFallback);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Smooth in-page anchor scrolling                                   */
  /* ------------------------------------------------------------------ */

  /**
   * Intercept hash links for a polished scroll (respects reduced motion).
   */
  function initSmoothAnchors() {
    const prefersReduced =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) return;

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;

        const target = document.querySelector(id);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Bootstrap                                                         */
  /* ------------------------------------------------------------------ */

  function init() {
    initHeroVideo();
    initSmoothAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
