(function () {
  'use strict';

  var sortSelect = document.querySelector('[data-collection-sort]');
  if (sortSelect) {
    sortSelect.addEventListener('change', function () {
      var url = new URL(window.location.href);
      url.searchParams.set('sort_by', sortSelect.value);
      window.location.href = url.toString();
    });
  }

  /* "Just want it for yourself?" routes to /collections/all?ref=direct-buyer —
     suppress reseller-oriented banners on that visit so there's no business pitch. */
  if (window.location.search.indexOf('ref=direct-buyer') !== -1) {
    document.querySelectorAll('[data-reseller-banner]').forEach(function (el) {
      el.remove();
    });
  }
})();
