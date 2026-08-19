(function () {
  'use strict';

  var reasonSelect = document.querySelector('[data-contact-reason]');
  if (!reasonSelect) return;

  var groups = document.querySelectorAll('[data-contact-group]');

  function updateGroups() {
    var reason = reasonSelect.value;
    groups.forEach(function (group) {
      var matches = group.getAttribute('data-contact-group') === reason;
      group.hidden = !matches;
    });
  }

  reasonSelect.addEventListener('change', updateGroups);
  updateGroups();
})();
