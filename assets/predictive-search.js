(function () {
  'use strict';

  var overlay = document.getElementById('SearchOverlay');
  if (!overlay) return;

  var input = overlay.querySelector('[data-predictive-search-input]');
  var results = overlay.querySelector('[data-predictive-search-results]');
  var removeTrap = null;
  var debounceTimer = null;
  var currentController = null;

  function openOverlay() {
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    removeTrap = window.GBG.trapFocus(overlay, input);
  }

  function closeOverlay() {
    overlay.hidden = true;
    document.body.style.overflow = '';
    if (removeTrap) removeTrap();
  }

  document.addEventListener('search:open', openOverlay);

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-search-close]')) closeOverlay();
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) closeOverlay();
  });

  function money(cents) {
    return '£' + (cents / 100).toFixed(2);
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function renderResults(data, query) {
    var resources = (data && data.resources && data.resources.results) || {};
    var products = resources.products || [];
    var pages = resources.pages || [];
    var articles = resources.articles || [];

    if (!products.length && !pages.length && !articles.length) {
      results.innerHTML = '<p>No results found for “' + query + '”.</p>';
      return;
    }

    var html = '';

    if (products.length) {
      html += '<div class="search-overlay__group"><h3>Products</h3>';
      products.forEach(function (product) {
        html +=
          '<a class="search-overlay__product" href="' +
          product.url +
          '">' +
          (product.featured_image
            ? '<img src="' + product.featured_image.url + '" alt="" width="56" height="56" loading="lazy">'
            : '') +
          '<span><span style="display:block;font-weight:700;">' +
          escapeHTML(product.title) +
          '</span><span class="search-overlay__product-price">' +
          money(product.price) +
          '</span></span></a>';
      });
      html += '</div>';
    }

    if (pages.length || articles.length) {
      html += '<div class="search-overlay__group"><h3>Pages & guides</h3>';
      pages.concat(articles).forEach(function (item) {
        html += '<a class="search-overlay__page-link" href="' + item.url + '">' + escapeHTML(item.title) + '</a>';
      });
      html += '</div>';
    }

    html +=
      '<a class="btn btn--secondary search-overlay__view-all" href="/search?q=' +
      encodeURIComponent(query) +
      '&type=product">View all results for “' +
      query +
      '”</a>';

    results.innerHTML = html;
  }

  function fetchResults(query) {
    if (currentController) currentController.abort();
    currentController = new AbortController();

    fetch(
      '/search/suggest.json?q=' +
        encodeURIComponent(query) +
        '&resources[type]=product,page,article&resources[limit]=6&resources[options][unavailable_products]=last',
      { headers: { Accept: 'application/json' }, signal: currentController.signal }
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        renderResults(data, query);
      })
      .catch(function (err) {
        if (err.name !== 'AbortError') {
          results.innerHTML = '<p>Something went wrong loading results. Try pressing enter to search.</p>';
        }
      });
  }

  if (input) {
    input.addEventListener('input', function () {
      var query = input.value.trim();
      clearTimeout(debounceTimer);
      if (query.length < 2) {
        results.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(function () {
        fetchResults(query);
      }, 250);
    });
  }
})();
