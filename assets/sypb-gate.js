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

  /* Shopify's customer form posts and reloads the page, so the modal has to
     put itself back on the way in, on the video step.

     Two independent signals, because relying on one of them was the bug: the
     page came back, the modal stayed shut, and the visitor landed on the
     landing page looking like the video was broken.

       1. data-autoopen, set by Liquid when form.posted_successfully? is true.
       2. ?customer_posted=true, which Shopify itself appends to the URL after
          a successful customer form post.

     The second one is the reliable half. It comes from Shopify rather than
     from anything this theme has to get right. */
  function returnedFromForm() {
    if (modal.dataset.autoopen === 'true') return true;
    try {
      return new URLSearchParams(window.location.search).get('customer_posted') === 'true';
    } catch (err) {
      return window.location.search.indexOf('customer_posted=true') !== -1;
    }
  }

  if (returnedFromForm()) {
    remember();
    showVideo();
    open();

    /* Take the parameter back out of the address bar, so a refresh or a
       shared link does not reopen the modal for someone who never filled the
       form in. */
    try {
      var url = new URL(window.location.href);
      url.searchParams.delete('customer_posted');
      url.searchParams.delete('form_type');
      url.searchParams.delete('utf8');
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (err) {
      /* An address bar that will not tidy up is not worth failing over. */
    }
  } else if (hasSeen()) {
    showVideo();
  } else {
    showForm();
  }
})();
