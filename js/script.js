/**
 * ZARREL Landing Page — Vanilla JavaScript
 * Navbar scroll, mobile menu, smooth scroll, reveal animations, stat counter
 */

(function () {
  'use strict';

  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.navbar__link');
  const sidebarLinks = document.querySelectorAll('.sidebar__link');
  const revealElements = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('.about__stat-number');

  /* ── Dynamic navbar clearance for hero padding ── */
  function setNavbarClearance() {
    if (!navbar) return;
    const top = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--navbar-top')) || 20;
    const breathing = 40;
    const clearance = navbar.offsetHeight + top + breathing;
    document.documentElement.style.setProperty('--navbar-clearance', clearance + 'px');
  }

  /* ── Navbar scroll glass effect ── */
  function handleScroll() {
    if (window.scrollY > 10 || document.body.classList.contains('nav-open')) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  }

  /* ── Mobile menu toggle ── */
  function toggleMobileMenu() {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.classList.toggle('is-open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');
    document.body.classList.toggle('nav-open', isOpen);
  }

  function closeMobileMenu() {
    navMenu.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menú');
    document.body.classList.remove('nav-open');
  }

  /* ── Smooth scroll for anchor links ── */
  function handleAnchorClick(e) {
    const href = e.currentTarget.getAttribute('href');
    if (!href || !href.startsWith('#') || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();
    closeMobileMenu();

    const offset = navbar.getBoundingClientRect().bottom + 12;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ── Active nav link on scroll ── */
  function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const scrollPos = window.scrollY + navbar.offsetHeight + 100;

    let current = 'inicio';

    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) {
        current = section.id;
      }
    });

    navLinks.forEach(function (link) {
      const href = link.getAttribute('href');
      if (href === '#' + current) {
        link.classList.add('navbar__link--active');
      } else {
        link.classList.remove('navbar__link--active');
      }
    });

    sidebarLinks.forEach(function (link) {
      const section = link.dataset.section;
      if (section === current) {
        link.classList.add('sidebar__link--active');
      } else {
        link.classList.remove('sidebar__link--active');
      }
    });
  }

  /* ── Scroll reveal via IntersectionObserver ── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ── Animated stat counter ── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function initStatCounters() {
    if (!statNumbers.length) return;

    if (!('IntersectionObserver' in window)) {
      statNumbers.forEach(animateCounter);
      return;
    }

    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ── Event listeners ── */
  window.addEventListener('scroll', handleScroll, { passive: true });
  setNavbarClearance();
  handleScroll();

  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileMenu);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', handleAnchorClick);
  });

  window.addEventListener('resize', function () {
    setNavbarClearance();
    if (window.innerWidth > 768) {
      closeMobileMenu();
    }
  });

  setNavbarClearance();

  document.addEventListener('click', function (e) {
    if (!navMenu.classList.contains('is-open')) return;
    if (navbar.contains(e.target)) return;
    closeMobileMenu();
  });

  /* ── Projects carousel navigation ── */
  function initProjectsCarousel() {
    const carousel = document.getElementById('projects-carousel');
    const prevBtn = document.querySelector('.projects__nav--prev');
    const nextBtn = document.querySelector('.projects__nav--next');

    if (!carousel || !prevBtn || !nextBtn) return;

    function getScrollAmount() {
      const card = carousel.querySelector('.project-card');
      if (!card) return 320;

      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      return card.offsetWidth + gap;
    }

    function updateNavButtons() {
      const threshold = 8;
      const atStart = carousel.scrollLeft <= threshold;
      const atEnd = carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - threshold;

      prevBtn.disabled = atStart;
      nextBtn.disabled = atEnd;
      prevBtn.setAttribute('aria-disabled', String(atStart));
      nextBtn.setAttribute('aria-disabled', String(atEnd));
    }

    prevBtn.addEventListener('click', function () {
      carousel.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', function () {
      carousel.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', updateNavButtons, { passive: true });
    window.addEventListener('resize', updateNavButtons);
    updateNavButtons();
  }

  /* ── Init ── */
  initReveal();
  initStatCounters();
  initProjectsCarousel();
})();
