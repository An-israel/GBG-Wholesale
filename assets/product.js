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
      /* This was worked out and then thrown away, so picking a sold out
         variant still offered an Add to cart button that the cart would
         later refuse. */
      var available = !match.hasAttribute('data-unavailable');
      if (submitBtn) {
        submitBtn.disabled = !available;
        if (available) {
          submitBtn.removeAttribute('aria-disabled');
        } else {
          submitBtn.setAttribute('aria-disabled', 'true');
        }
      }
      if (submitText) submitText.textContent = available ? 'Add to cart' : 'Sold out';
    } else if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-disabled', 'true');
      if (submitText) submitText.textContent = 'Unavailable';
    }

    /* Anything mirroring this button needs to hear about it. */
    document.dispatchEvent(new CustomEvent('gbg:variant:change'));
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
  /* One mount per recommendation band. Each fetches its own intent, so
     "you may also like" and "complete your order" stay different questions
     rather than the same four products under two headings. */
  document.querySelectorAll('.related-products-mount').forEach(function (mount) {
    if (!mount.dataset.recommendationsUrl) return;
    fetch(mount.dataset.recommendationsUrl)
      .then(function (res) {
        return res.text();
      })
      .then(function (html) {
        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        var section = wrapper.querySelector('.related-products');
        /* An empty band is worse than no band, so a mount with nothing to
           show removes itself rather than leaving a gap. */
        if (section) {
          mount.replaceWith(section);
        } else {
          mount.remove();
        }
      })
      .catch(function () {
        /* fail silently - recommendations are a nice-to-have, not critical path */
        mount.remove();
      });
  });
})();

/* ---------------------------------------------------------------------------
   Sticky Add to cart

   Shows a bar at the bottom of the screen once the real Add to cart button
   has scrolled out of view, and hides it again when it comes back.

   The bar holds no form of its own. Its button clicks the real one, so the
   quantity, the chosen variant and the minimum order check are whatever the
   page already says they are.
--------------------------------------------------------------------------- */
(function () {
  'use strict';

  var bar = document.querySelector('[data-sticky-atc]');
  if (!bar) return;

  var realButton = document.querySelector('[data-product-submit]');
  if (!realButton) return;

  var barButton = bar.querySelector('[data-sticky-atc-button]');

  function setVisible(visible) {
    bar.hidden = !visible;
    bar.setAttribute('aria-hidden', visible ? 'false' : 'true');
    document.body.classList.toggle('has-sticky-atc', visible);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          /* Only once the button has gone past the top. Off the bottom means
             the reader has not reached it yet, and a bar over a button they
             can already see is just clutter. */
          setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
        });
      },
      { threshold: 0 }
    ).observe(realButton);
  }

  if (barButton) {
    barButton.addEventListener('click', function () {
      realButton.click();
    });
  }

  /* The real button is the one that knows whether the variant can be bought,
     so the bar copies it rather than working it out a second time. */
  function mirror() {
    if (!barButton) return;
    var disabled = realButton.disabled;
    barButton.disabled = disabled;
    barButton.setAttribute('aria-disabled', disabled ? 'true' : 'false');

    var label = realButton.querySelector('[data-submit-text]');
    if (label) barButton.textContent = label.textContent.trim();

    var price = bar.querySelector('[data-sticky-atc-price]');
    var source = document.querySelector('.price__sale, .price__regular');
    if (price && source) price.textContent = source.textContent.trim();
  }

  document.addEventListener('gbg:variant:change', mirror);
  mirror();
})();
