/* The reseller questionnaire.

   Eleven questions shown one at a time, because eleven questions shown at
   once is a wall people close. Nothing is posted until the end, except the
   name, email and phone, which go the moment they are given: someone who
   answers three questions and wanders off is still a lead worth having, and
   waiting for a perfect submission loses them entirely.

   Answers go to Omnisend through its own script, which the app embed already
   loads. No server of ours is involved, so there is nothing to keep running
   and nothing that can be down.

   With JavaScript off the whole thing degrades to one long form with a normal
   submit button, which is why the markup is a real form with real fields
   rather than something assembled here. */
(function () {
  'use strict';

  var form = document.querySelector('[data-lead-form]');
  if (!form) return;

  var steps = Array.prototype.slice.call(form.querySelectorAll('[data-step]'));
  if (steps.length < 2) return;

  var bar = form.querySelector('[data-progress-bar]');
  var counter = form.querySelector('[data-progress-count]');
  var backBtn = form.querySelector('[data-lead-back]');
  var nextBtn = form.querySelector('[data-lead-next]');
  var submitBtn = form.querySelector('[data-lead-submit]');
  var closing = form.querySelector('[data-lead-closing]');
  var liveError = form.querySelector('[data-lead-error]');
  var thanksUrl = form.getAttribute('data-thanks-url') || '/';

  var index = 0;
  var identified = false;

  /* Step-by-step is a JS enhancement. Announce that to assistive tech only
     once it is actually running, and take the fallback submit out of the tab
     order so there are not two submit buttons. */
  form.classList.add('lead-form--stepped');

  function fieldsIn(step) {
    return Array.prototype.slice.call(
      step.querySelectorAll('input, textarea, select')
    );
  }

  function stepAnswered(step) {
    var fields = fieldsIn(step);
    if (!fields.length) return true;

    var required = step.getAttribute('data-required') === 'true';
    if (!required) return true;

    var type = fields[0].type;

    if (type === 'radio' || type === 'checkbox') {
      return fields.some(function (f) {
        return f.checked;
      });
    }

    return fields.every(function (f) {
      if (!f.required) return true;
      return f.value.trim() !== '' && f.checkValidity();
    });
  }

  function show(n) {
    index = Math.max(0, Math.min(n, steps.length - 1));

    steps.forEach(function (step, i) {
      step.hidden = i !== index;
    });

    var human = index + 1;
    if (bar) bar.style.setProperty('--progress', (human / steps.length) * 100 + '%');
    if (counter) counter.textContent = 'Question ' + human + ' of ' + steps.length;

    if (backBtn) backBtn.hidden = index === 0;
    var last = index === steps.length - 1;
    if (nextBtn) nextBtn.hidden = last;
    if (submitBtn) submitBtn.hidden = !last;
    /* The closing pitch belongs beside the button that submits, not halfway
       up a questionnaire. */
    if (closing) closing.hidden = !last;

    if (liveError) liveError.textContent = '';

    var first = steps[index].querySelector('input, textarea, select');
    if (first) first.focus({ preventScroll: true });

    steps[index].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  function complain() {
    if (!liveError) return;
    liveError.textContent = 'Pick an answer to carry on.';
  }

  /* Values, keyed by the name Omnisend will store them under. */
  function collect() {
    var out = {};
    Array.prototype.slice.call(form.elements).forEach(function (el) {
      if (!el.name) return;
      var key = el.name.replace(/\[\]$/, '');

      if (el.type === 'checkbox') {
        if (!el.checked) return;
        out[key] = out[key] ? out[key] + ', ' + el.value : el.value;
        return;
      }
      if (el.type === 'radio') {
        if (el.checked) out[key] = el.value;
        return;
      }
      if (el.value && el.value.trim() !== '') out[key] = el.value.trim();
    });
    return out;
  }

  function omnisend(payload) {
    /* The app embed defines this. If Omnisend is switched off the array still
       exists and the call is simply never flushed, so nothing throws. */
    window.omnisend = window.omnisend || [];
    window.omnisend.push(payload);
  }

  /* Sent as soon as the contact details exist, so a half-finished
     questionnaire still leaves somebody to follow up. */
  function identifyEarly() {
    if (identified) return;
    var v = collect();
    if (!v.email) return;

    omnisend([
      'identifyContact',
      {
        email: v.email,
        phone: v.phone || undefined,
        firstName: v.firstName || undefined,
        tags: ['lead-form', 'lead-partial'],
        customProperties: { leadFormStarted: new Date().toISOString() },
      },
    ]);
    identified = true;
  }

  function sendAll() {
    var v = collect();

    /* Tags for the three things Lami will want to filter on, so a segment can
       be built without digging through custom properties. */
    var tags = ['lead-form', 'lead-complete'];
    if (v.stage) tags.push('stage: ' + v.stage);
    if (v.budget) tags.push('budget: ' + v.budget);
    if (v.timeline) tags.push('timeline: ' + v.timeline);

    omnisend([
      'identifyContact',
      {
        email: v.email,
        phone: v.phone || undefined,
        firstName: v.firstName || undefined,
        city: v.city || undefined,
        tags: tags,
        customProperties: {
          leadStage: v.stage || '',
          leadPlatforms: v.platforms || '',
          leadCategories: v.categories || '',
          leadBudget: v.budget || '',
          leadNeed: v.need || '',
          leadTimeline: v.timeline || '',
          leadChallenge: v.challenge || '',
          leadFormCompleted: new Date().toISOString(),
        },
      },
    ]);
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      if (!stepAnswered(steps[index])) {
        complain();
        var bad = fieldsIn(steps[index])[0];
        if (bad) bad.focus();
        return;
      }
      identifyEarly();
      show(index + 1);
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      show(index - 1);
    });
  }

  /* Enter moves on rather than submitting halfway through. The open text box
     is exempt, because a newline in there is a newline. */
  form.addEventListener('keydown', function (event) {
    if (event.key !== 'Enter') return;
    if (event.target.tagName === 'TEXTAREA') return;
    if (index === steps.length - 1) return;
    event.preventDefault();
    if (nextBtn) nextBtn.click();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    if (!stepAnswered(steps[index])) {
      complain();
      return;
    }

    sendAll();

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Just a moment...';
    }

    /* A short wait so the Omnisend call leaves the page before it unloads,
       then on regardless: a lead is not worth losing to a slow third party. */
    window.setTimeout(function () {
      window.location.href = thanksUrl;
    }, 600);
  });

  show(0);
})();
