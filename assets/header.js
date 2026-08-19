(function () {
  'use strict';

  /* Mega menu: keyboard-accessible, closes on outside click / Escape */
  var megaTriggers = document.querySelectorAll('[data-mega-trigger]');

  function closeAllMega(except) {
    megaTriggers.forEach(function (trigger) {
      if (trigger === except) return;
      trigger.setAttribute('aria-expanded', 'false');
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) panel.hidden = true;
    });
  }

  megaTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAllMega(trigger);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  document.addEventListener('click', function (event) {
    if (!event.target.closest('.site-nav__item--mega')) {
      closeAllMega();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeAllMega();
  });

  /* Mobile nav drawer */
  var mobileNav = document.getElementById('MobileNav');
  var mobileToggle = document.querySelector('[data-mobile-nav-trigger]');
  var removeMobileTrap = null;

  function openMobileNav() {
    mobileNav.hidden = false;
    mobileToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    removeMobileTrap = window.GBG.trapFocus(mobileNav);
  }

  function closeMobileNav() {
    mobileNav.hidden = true;
    mobileToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (removeMobileTrap) removeMobileTrap();
    mobileToggle.focus();
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener('click', openMobileNav);
    mobileNav.querySelectorAll('[data-mobile-nav-close]').forEach(function (el) {
      el.addEventListener('click', closeMobileNav);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !mobileNav.hidden) closeMobileNav();
    });
  }

  /* Mobile accordion (Shop dropdown inside mobile nav) */
  document.querySelectorAll('[data-mobile-accordion-trigger]').forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });

  /* Search + cart triggers dispatch shared events for their own modules */
  document.querySelectorAll('[data-search-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('search:open'));
    });
  });

  document.querySelectorAll('[data-cart-trigger]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.dispatchEvent(new CustomEvent('cart:open'));
    });
  });
})();
