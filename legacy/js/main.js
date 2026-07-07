// ============================================
// ZARREL — main.js
// ============================================
document.addEventListener('DOMContentLoaded', () => {

  // Dynamic footer year
  document.querySelectorAll('#footer-year').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Render Lucide icons
  if (window.lucide) lucide.createIcons();

  // Navbar background on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    });
  }

  // Mobile menu toggle
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => mobileMenu.classList.remove('open'));
    });
  }

  // Reveal-on-scroll animation
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(el => observer.observe(el));
  }

  // Filter tabs (used on servicios.html and proyectos.html)
  const filterTabs = document.querySelectorAll('.filter-tab');
  const filterableCards = document.querySelectorAll('.filterable-card');
  if (filterTabs.length && filterableCards.length) {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;
        filterableCards.forEach(card => {
          const show = filter === 'todos' || card.dataset.category === filter;
          card.classList.toggle('hidden', !show);
        });
      });
    });
  }

  // Contact form (contacto.html)
  // NOTE: this form posts to Formspree. Replace YOUR_FORM_ID in contacto.html
  // with your real endpoint from https://formspree.io — no JS changes needed
  // for the submission itself, this just adds a friendlier pending state.
  const contactForm = document.querySelector('#contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      const btn = contactForm.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        btn.dataset.originalText = btn.innerHTML;
        btn.innerHTML = 'Enviando...';
      }
    });
  }

});
