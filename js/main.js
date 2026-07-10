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
   *
   * Smooth-playback notes:
   *  - We reveal the video only when the browser reports it can play without
   *    re-buffering (canplaythrough / readyState 4), so it doesn't fade in
   *    mid-stutter. canplay (readyState 3) is the fallback trigger.
   *  - The <video> uses preload="auto" (see index.html) to buffer ahead.
   *  - No DOM writes happen during playback; we only toggle a class once.
   *
   *  NOTE: hero.mp4 is ~24MB. The CSS/JS here removes rendering jank, but if
   *  the video still buffers on slow networks, compress/re-encode it
   *  (e.g. `ffmpeg -i hero.mp4 -vf scale=1920:-2 -c:v libx264 -crf 26
   *  -preset slow -movflags +faststart -an hero.mp4`) to shrink it and add
   *  the faststart flag so playback can begin before the full download.
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

    // Guarantee autoplay-friendly attributes on every browser/policy.
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const shouldPlay = () =>
      !hero?.classList.contains('is-video-error') &&
      !document.hidden &&
      !video.error;

    /** Resume playback without fighting native loop transitions. */
    const ensurePlaying = () => {
      if (!shouldPlay() || !video.paused) return;
      const retry = video.play();
      if (retry && typeof retry.catch === 'function') {
        retry.catch(() => { /* transient autoplay / buffer hiccup */ });
      }
    };

    // Reveal only when enough is buffered to play through smoothly. Fall back
    // to canplay so we never leave the card blank if canplaythrough is slow.
    if (video.readyState >= 4) {
      showVideo();
    } else {
      video.addEventListener('canplaythrough', showVideo, { once: true });
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

    // Kick off playback; a rejected promise alone is not a fatal error.
    ensurePlaying();

    // Resume when the tab becomes visible again.
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) ensurePlaying();
    });

    // After buffer stalls, nudge playback once data is available again.
    video.addEventListener('waiting', () => {
      video.addEventListener('canplay', ensurePlaying, { once: true });
    });
    video.addEventListener('stalled', () => {
      video.addEventListener('canplay', ensurePlaying, { once: true });
    });

    // Lightweight watchdog — catches silent pauses without hooking `pause`
    // (which can fight the native loop on Safari/Chrome).
    const watchdog = window.setInterval(ensurePlaying, 2500);
    window.addEventListener(
      'pagehide',
      () => window.clearInterval(watchdog),
      { once: true }
    );
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
