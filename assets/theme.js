/* GBG Wholesale Hub — shared theme behaviour. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* Reveal-on-scroll: subtle fade + translate, respects prefers-reduced-motion */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* Generic accordion: each item toggles independently (multi-open).
     Works for the FAQ page, FAQ preview, and any [data-accordion] block. */
  function initAccordions() {
    var triggers = document.querySelectorAll('[data-accordion-trigger]');

    triggers.forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var panelId = trigger.getAttribute('aria-controls');
        var panel = document.getElementById(panelId);
        if (!panel) return;

        var isOpen = trigger.getAttribute('aria-expanded') === 'true';
        trigger.setAttribute('aria-expanded', String(!isOpen));

        if (isOpen) {
          panel.style.setProperty('--panel-height', '0px');
          panel.dataset.open = 'false';
        } else {
          panel.dataset.open = 'true';
          var inner = panel.querySelector('.accordion__panel-inner');
          var height = inner ? inner.scrollHeight : panel.scrollHeight;
          panel.style.setProperty('--panel-height', height + 40 + 'px');
        }
      });
    });
  }

  /* Dismissible banners/floats persisted in sessionStorage */
  function initDismissible() {
    document.querySelectorAll('[data-dismiss-key]').forEach(function (el) {
      var key = el.getAttribute('data-dismiss-key');
      if (sessionStorage.getItem(key) === 'dismissed') {
        el.remove();
        return;
      }
      var btn = el.querySelector('[data-dismiss-trigger]');
      if (btn) {
        btn.addEventListener('click', function () {
          sessionStorage.setItem(key, 'dismissed');
          el.remove();
        });
      }
    });
  }

  /* Focus trap + Escape-to-close helper reused by cart drawer, search, mobile nav, modals */
  window.GBG = window.GBG || {};
  window.GBG.trapFocus = function (container, elementToFocus) {
    var focusable = container.querySelectorAll(
      'summary, a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return function () {};
    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    (elementToFocus || first).focus();

    function handleKeydown(event) {
      if (event.key !== 'Tab') return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    container.addEventListener('keydown', handleKeydown);
    return function removeTrap() {
      container.removeEventListener('keydown', handleKeydown);
    };
  };

  window.GBG.formatMoney = function (cents, format) {
    var value = (cents / 100).toFixed(2);
    return (format || '£{{amount}}').replace('{{amount}}', value);
  };

  function initAddressDelete() {
    document.querySelectorAll('[data-address-delete]').forEach(function (btn) {
      btn.addEventListener('click', function (event) {
        if (!window.confirm('Delete this address?')) {
          event.preventDefault();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initAccordions();
    initDismissible();
    initAddressDelete();
  });
})();
