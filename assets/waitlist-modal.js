(function () {
  'use strict';

  var modal = document.getElementById('WaitlistModal');
  if (!modal) return;

  var removeTrap = null;

  function openModal() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    removeTrap = window.GBG.trapFocus(modal, document.getElementById('WaitlistEmail'));
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
    if (removeTrap) removeTrap();
  }

  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-waitlist-trigger]');
    if (trigger) {
      event.preventDefault();
      openModal();
    }
    if (event.target.closest('[data-waitlist-close]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  if (modal.dataset.autoopen === 'true') {
    openModal();
  }
})();
