/* GBG Wholesale Hub - shared theme behaviour. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  /* Reveal-on-scroll: subtle fade + translate, respects prefers-reduced-motion.
     Content is visible by default (see .reveal in theme.css) - this function
     only ever ADDS a temporary hidden state to elements it can guarantee it
     will reveal. Anything already on-screen, or any failure of JS/observer,
     leaves content exactly as visible as if this never ran. Safe to call
     repeatedly (e.g. after the Shopify theme editor re-renders a section). */
  var revealObserver = null;

  function initReveal() {
    var items = document.querySelectorAll('.reveal:not([data-reveal-bound])');
    if (!items.length) return;

    /* Never run the hide-then-fade-in inside Shopify's theme editor. The editor
       swaps section HTML in and out constantly while a merchant edits, and any
       element left mid-animation reads as a blank section. Content is worth
       more than the animation, so in design mode we simply skip it. */
    if (window.Shopify && window.Shopify.designMode) {
      items.forEach(function (el) {
        el.setAttribute('data-reveal-bound', 'true');
        el.classList.remove('pre-reveal');
      });
      return;
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var hasObserver = 'IntersectionObserver' in window;

    items.forEach(function (el) {
      el.setAttribute('data-reveal-bound', 'true');

      if (reduceMotion || !hasObserver) return;

      var rect = el.getBoundingClientRect();
      var alreadyInView = rect.top < window.innerHeight * 0.95 && rect.bottom > 0;
      if (alreadyInView) return;

      el.classList.add('pre-reveal');

      if (!revealObserver) {
        revealObserver = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.12 }
        );
      }
      revealObserver.observe(el);

      /* Belt-and-suspenders: force visible after 2.5s no matter what, in
         case the observer never fires (hidden ancestor, layout edge case). */
      window.setTimeout(function () {
        el.classList.add('is-visible');
      }, 2500);
    });
  }

  /* Generic accordion: each item toggles independently (multi-open).
     Works for the FAQ page, FAQ preview, and any [data-accordion] block. */
  function initAccordions() {
    var triggers = document.querySelectorAll('[data-accordion-trigger]:not([data-bound])');

    triggers.forEach(function (trigger) {
      trigger.setAttribute('data-bound', 'true');
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
    document.querySelectorAll('[data-dismiss-key]:not([data-bound])').forEach(function (el) {
      el.setAttribute('data-bound', 'true');
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

  function initAll() {
    initReveal();
    initAccordions();
    initDismissible();
    initAddressDelete();
  }

  document.addEventListener('DOMContentLoaded', initAll);

  /* Shopify theme editor re-renders individual sections via AJAX whenever a
     merchant edits settings - no DOMContentLoaded fires for that. Without
     this, anything gated behind a one-time init (reveal-on-scroll, accordion
     bindings) would silently stop working the moment a section reloads. */
  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:section:reorder', initAll);
  document.addEventListener('shopify:block:select', initAll);
})();
