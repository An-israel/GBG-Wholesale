(function () {
  'use strict';

  document.querySelectorAll('[data-pricing-calculator]').forEach(function (form) {
    var result = form.querySelector('[data-pricing-result]');
    var priceEl = form.querySelector('[data-result-price]');

    form.addEventListener('submit', function (event) {
      event.preventDefault();

      var cost = parseFloat(form.cost.value);
      var quantity = parseFloat(form.quantity.value);
      var packaging = parseFloat(form.packaging.value) || 0;
      var fee = parseFloat(form.fee.value) || 0;

      var valid = true;
      form.querySelectorAll('.field').forEach(function (field) {
        field.classList.remove('has-error');
      });

      if (!cost || cost <= 0) {
        form.cost.closest('.field').classList.add('has-error');
        valid = false;
      }
      if (!quantity || quantity <= 0) {
        form.quantity.closest('.field').classList.add('has-error');
        valid = false;
      }

      if (!valid) {
        result.hidden = true;
        return;
      }

      var unitCost = cost / quantity + packaging;
      var feeMultiplier = 1 - fee / 100;
      var minSellPrice = feeMultiplier > 0 ? unitCost / feeMultiplier : unitCost;

      priceEl.textContent = '£' + minSellPrice.toFixed(2);
      result.hidden = false;
    });
  });
})();
