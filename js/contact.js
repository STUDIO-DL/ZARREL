/**
 * ZARREL — contact.js
 * Contact form validation, character counter, and Formspree submission
 * via fetch. Replace the form action attribute with your Formspree endpoint
 * (e.g. https://formspree.io/f/xxxxxxxx) — no other changes needed.
 */

(function () {
  'use strict';

  const FORM_ENDPOINT_PLACEHOLDER = 'YOUR_FORMSPREE_ENDPOINT_HERE';
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MAX_MESSAGE_LENGTH = 1000;

  const form = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit');
  const successPanel = document.getElementById('contact-success');
  const errorPanel = document.getElementById('contact-error');
  const resetBtn = document.getElementById('contact-reset');
  const retryBtn = document.getElementById('contact-retry');
  const mensajeField = document.getElementById('mensaje');
  const counterEl = document.getElementById('mensaje-counter');

  const fields = {
    'quien-eres': {
      el: document.getElementById('quien-eres'),
      errorEl: document.getElementById('quien-eres-error'),
      validate: (value) => {
        if (!value) return 'Selecciona si eres persona o empresa.';
        return '';
      },
    },
    nombre: {
      el: document.getElementById('nombre'),
      errorEl: document.getElementById('nombre-error'),
      validate: (value) => {
        if (!value.trim()) return 'Introduce tu nombre completo.';
        return '';
      },
    },
    email: {
      el: document.getElementById('email'),
      errorEl: document.getElementById('email-error'),
      validate: (value) => {
        const trimmed = value.trim();
        if (!trimmed) return 'Introduce tu correo electrónico.';
        if (!EMAIL_RE.test(trimmed)) return 'Introduce un correo electrónico válido.';
        return '';
      },
    },
    servicio: {
      el: document.getElementById('servicio'),
      errorEl: document.getElementById('servicio-error'),
      validate: (value) => {
        if (!value) return 'Selecciona el servicio que necesitas.';
        return '';
      },
    },
    mensaje: {
      el: mensajeField,
      errorEl: document.getElementById('mensaje-error'),
      validate: (value) => {
        if (value.length > MAX_MESSAGE_LENGTH) {
          return `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres.`;
        }
        return '';
      },
    },
  };

  let isSubmitting = false;

  /* ------------------------------------------------------------------ */
  /*  UI helpers                                                         */
  /* ------------------------------------------------------------------ */

  function getFieldWrapper(key) {
    return fields[key].el.closest('.form-field');
  }

  function showFieldError(key, message) {
    const { errorEl } = fields[key];
    const wrapper = getFieldWrapper(key);
    if (message) {
      wrapper.classList.add('is-invalid');
      errorEl.textContent = message;
      errorEl.hidden = false;
      fields[key].el.setAttribute('aria-invalid', 'true');
    } else {
      wrapper.classList.remove('is-invalid');
      errorEl.textContent = '';
      errorEl.hidden = true;
      fields[key].el.removeAttribute('aria-invalid');
    }
  }

  function validateField(key) {
    const { el, validate } = fields[key];
    const message = validate(el.value);
    showFieldError(key, message);
    return !message;
  }

  function validateForm() {
    let valid = true;
    Object.keys(fields).forEach((key) => {
      if (!validateField(key)) valid = false;
    });
    return valid;
  }

  function setLoading(loading) {
    isSubmitting = loading;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.setAttribute('aria-busy', loading ? 'true' : 'false');
  }

  function showForm() {
    form.classList.remove('is-hidden');
    successPanel.hidden = true;
    errorPanel.hidden = true;
  }

  function showSuccess() {
    form.classList.add('is-hidden');
    errorPanel.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
  }

  function showError() {
    form.classList.add('is-hidden');
    successPanel.hidden = true;
    errorPanel.hidden = false;
    errorPanel.focus();
  }

  function updateCounter() {
    if (!mensajeField || !counterEl) return;
    const len = mensajeField.value.length;
    counterEl.textContent = `${len} / ${MAX_MESSAGE_LENGTH}`;
    counterEl.classList.toggle('is-near-limit', len > MAX_MESSAGE_LENGTH * 0.9);
  }

  function isEndpointConfigured() {
    const action = form.getAttribute('action') || '';
    return (
      action &&
      action !== FORM_ENDPOINT_PLACEHOLDER &&
      action.startsWith('http')
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Formspree submission (fetch + JSON accept header)                  */
  /* ------------------------------------------------------------------ */

  async function submitForm() {
    if (!isEndpointConfigured()) {
      showError();
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        form.reset();
        updateCounter();
        Object.keys(fields).forEach((key) => showFieldError(key, ''));
        showSuccess();
      } else {
        // Surface Formspree field errors when available
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            const fieldKey = err.field || '';
            const match = Object.keys(fields).find(
              (k) => fields[k].el.name === fieldKey || fields[k].el.id === fieldKey
            );
            if (match) showFieldError(match, err.message);
          });
          showForm();
        } else {
          showError();
        }
      }
    } catch {
      showError();
    } finally {
      setLoading(false);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Event bindings                                                     */
  /* ------------------------------------------------------------------ */

  Object.keys(fields).forEach((key) => {
    const { el } = fields[key];
    el.addEventListener('blur', () => validateField(key));
    el.addEventListener('input', () => {
      if (getFieldWrapper(key).classList.contains('is-invalid')) {
        validateField(key);
      }
      if (key === 'mensaje') updateCounter();
    });
    el.addEventListener('change', () => {
      if (getFieldWrapper(key).classList.contains('is-invalid')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) {
      const firstInvalid = form.querySelector('.form-field.is-invalid .form-field__input');
      firstInvalid?.focus();
      return;
    }
    submitForm();
  });

  resetBtn?.addEventListener('click', () => {
    showForm();
    form.querySelector('.form-field__input')?.focus();
  });

  retryBtn?.addEventListener('click', () => {
    showForm();
    submitBtn.focus();
  });

  updateCounter();
})();
