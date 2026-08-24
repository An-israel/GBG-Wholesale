(function () {
  'use strict';

  var drawer = document.getElementById('CartDrawer');
  var removeTrap = null;

  function sectionsToRender() {
    var ids = ['cart-drawer'];
    if (document.getElementById('MainCart')) ids.push('main-cart');
    return ids;
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.hidden = false;
    document.body.style.overflow = 'hidden';
    removeTrap = window.GBG.trapFocus(drawer);
  }

  function closeDrawer() {
    if (!drawer) return;
    drawer.hidden = true;
    document.body.style.overflow = '';
    if (removeTrap) removeTrap();
  }

  document.addEventListener('cart:open', openDrawer);

  document.addEventListener('click', function (event) {
    if (event.target.closest('[data-cart-close]')) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && drawer && !drawer.hidden) closeDrawer();
  });

  function updateCartCount(count) {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function replaceSectionHTML(id, selector) {
    return fetch('/?sections=' + id)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var html = data[id];
        if (!html) return;
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var newEl = wrapper.querySelector(selector);
        var currentEl = document.querySelector(selector);
        if (newEl && currentEl) {
          currentEl.replaceWith(newEl);
        }
      });
  }

  function refreshCart() {
    var tasks = [replaceSectionHTML('cart-drawer', '#CartDrawer')];
    if (document.getElementById('MainCart')) {
      tasks.push(replaceSectionHTML('main-cart', '#MainCart'));
    }
    return Promise.all(tasks).then(function () {
      var newDrawer = document.getElementById('CartDrawer');
      if (newDrawer) drawer = newDrawer;
    });
  }

  function fetchCartCount() {
    fetch('/cart.js')
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        updateCartCount(cart.item_count);
      });
  }

  function setLineQuantity(line, quantity) {
    var body = JSON.stringify({ line: line, quantity: quantity });
    document.body.classList.add('is-loading');
    fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body,
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        updateCartCount(cart.item_count);
        return refreshCart();
      })
      .finally(function () {
        document.body.classList.remove('is-loading');
      });
  }

  document.addEventListener('click', function (event) {
    var increase = event.target.closest('[data-cart-qty-increase]');
    var decrease = event.target.closest('[data-cart-qty-decrease]');
    var remove = event.target.closest('[data-cart-remove]');

    if (increase) {
      var input = document.querySelector('[data-cart-qty-input][data-line="' + increase.dataset.line + '"]');
      var value = parseInt((input && input.value) || '0', 10) + 1;
      setLineQuantity(increase.dataset.line, value);
    }

    if (decrease) {
      var input2 = document.querySelector('[data-cart-qty-input][data-line="' + decrease.dataset.line + '"]');
      var value2 = Math.max(0, parseInt((input2 && input2.value) || '0', 10) - 1);
      setLineQuantity(decrease.dataset.line, value2);
    }

    if (remove) {
      setLineQuantity(remove.dataset.line, 0);
    }
  });

  document.addEventListener(
    'change',
    function (event) {
      if (event.target.matches('[data-cart-qty-input]')) {
        var value = Math.max(0, parseInt(event.target.value || '0', 10));
        setLineQuantity(event.target.dataset.line, value);
      }
    },
    true
  );

  /* Add-to-cart forms anywhere on the site (product page, featured products) */
  document.addEventListener('submit', function (event) {
    var form = event.target.closest('form[data-cart-add-form]');
    if (!form) return;
    event.preventDefault();

    var submitBtn = form.querySelector('[type="submit"]');
    var errorEl = form.querySelector('[data-cart-add-error]');
    if (errorEl) errorEl.hidden = true;
    if (submitBtn) submitBtn.setAttribute('aria-disabled', 'true');

    var formData = new FormData(form);
    fetch('/cart/add.js', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw data;
          return data;
        });
      })
      .then(function () {
        return refreshCart();
      })
      .then(function () {
        fetchCartCount();
        openDrawer();
      })
      .catch(function (err) {
        if (errorEl) {
          errorEl.textContent = (err && err.description) || 'That item could not be added - please try again.';
          errorEl.hidden = false;
        }
      })
      .finally(function () {
        if (submitBtn) submitBtn.removeAttribute('aria-disabled');
      });
  });

  fetchCartCount();
})();
