(function () {
  'use strict';

  /* Gallery thumbnails */
  var mainImage = document.getElementById('ProductMainImage');
  document.querySelectorAll('[data-product-thumb]').forEach(function (thumb) {
    thumb.addEventListener('click', function () {
      document.querySelectorAll('[data-product-thumb]').forEach(function (t) {
        t.classList.remove('is-active');
      });
      thumb.classList.add('is-active');
      if (mainImage) mainImage.src = thumb.dataset.imageUrl;
    });
  });

  /* Variant selection: map visible option selects to the hidden variant <select name="id"> */
  var optionSelects = document.querySelectorAll('[data-product-option]');
  var variantSelect = document.querySelector('[data-product-variant-id]');
  var submitBtn = document.querySelector('[data-product-submit]');
  var submitText = document.querySelector('[data-submit-text]');

  function updateVariant() {
    if (!variantSelect) return;
    var values = Array.prototype.map.call(optionSelects, function (select) {
      return select.value;
    });

    var match = Array.prototype.find.call(variantSelect.options, function (option) {
      var optionValues = option.dataset.optionValues ? option.dataset.optionValues.split('|||') : [];
      return values.every(function (val, i) {
        return optionValues[i] === val;
      });
    });

    if (match) {
      variantSelect.value = match.value;
      var available = !match.hasAttribute('data-unavailable');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-disabled');
      }
      if (submitText) submitText.textContent = 'Add to cart';
    } else if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');
      if (submitText) submitText.textContent = 'Unavailable';
    }
  }

  optionSelects.forEach(function (select) {
    select.addEventListener('change', updateVariant);
  });

  /* Quantity stepper */
  var qtyInput = document.getElementById('ProductQuantity');
  var decreaseBtn = document.querySelector('[data-qty-decrease]');
  var increaseBtn = document.querySelector('[data-qty-increase]');

  if (qtyInput && decreaseBtn && increaseBtn) {
    decreaseBtn.addEventListener('click', function () {
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || '1', 10) - 1);
    });
    increaseBtn.addEventListener('click', function () {
      qtyInput.value = parseInt(qtyInput.value || '1', 10) + 1;
    });
  }

  /* Related products: fetched via the native recommendations endpoint and
     injected as pre-rendered section HTML. */
  var mount = document.querySelector('.related-products-mount');
  if (mount && mount.dataset.recommendationsUrl) {
    fetch(mount.dataset.recommendationsUrl)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var section = wrapper.querySelector('.related-products');
        if (section) mount.replaceWith(section);
      })
      .catch(function () {
        /* fail silently - related products are a nice-to-have, not critical path */
      });
  }
})();
