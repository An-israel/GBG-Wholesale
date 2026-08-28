/* SYPB gate.

   Intercepts any [data-sypb-trigger] link and opens the modal instead of
   following it. The links keep a real href, so with JavaScript off or broken
   the visitor still reaches the video rather than a dead button.

   Once someone has given their details the gate remembers it locally and goes
   straight to the video on every later visit. The remembered flag is a
   convenience, not a security measure: the point is not to ask the same
   person twice, and their details are already saved server-side as a Shopify
   customer by then. */
(function () {
  'use strict';

  var STORAGE_KEY = 'gbg-sypb-seen';

  var modal = document.getElementById('SypbGate');
  if (!modal) return;

  var formStep = modal.querySelector('[data-sypb-step="form"]');
  var videoStep = modal.querySelector('[data-sypb-step="video"]');
  var removeTrap = null;

  function hasSeen() {
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (err) {
      /* Private windows and blocked site data throw on access. Treat it as
         a first visit and show the form again. */
      return false;
    }
  }

  function remember() {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {
      /* Nothing to do: the customer record is already saved server-side. */
    }
  }

  function showVideo() {
    if (formStep) formStep.hidden = true;
    if (videoStep) videoStep.hidden = false;
  }

  function showForm() {
    if (formStep) formStep.hidden = false;
    if (videoStep) videoStep.hidden = true;
  }

  function open() {
    if (hasSeen()) showVideo();
    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    var focusTarget = modal.querySelector('[data-sypb-step]:not([hidden]) input, [data-sypb-step]:not([hidden]) a, [data-sypb-close]');
    if (window.GBG && window.GBG.trapFocus) {
      removeTrap = window.GBG.trapFocus(modal, focusTarget);
    } else if (focusTarget) {
      focusTarget.focus();
    }
  }

  function close() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (removeTrap) {
      removeTrap();
      removeTrap = null;
    }
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-sypb-trigger]');
    if (trigger) {
      event.preventDefault();
      open();
      return;
    }
    if (event.target.closest('[data-sypb-close]')) {
      close();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) close();
  });

  /* Shopify's customer form reloads the page, so the server marks the modal
     to reopen itself and we land straight on the video. */
  if (modal.dataset.autoopen === 'true') {
    remember();
    showVideo();
    open();
  } else if (hasSeen()) {
    showVideo();
  } else {
    showForm();
  }
})();
