/* GBG hero slider.

   Advances on its own, and can also be driven by the arrows, the dots, a
   swipe, or the left/right arrow keys.

   It pauses while someone is hovering or has keyboard focus inside it, and
   while the tab is in the background, so it is not silently cycling where
   nobody can see it. A visitor who has asked their system to reduce motion
   gets the first slide and the controls, but no automatic movement.

   Written to survive the theme editor: initAll runs again on every section
   load and reorder, and each slider is only bound once. */
(function () {
  'use strict';

  function initSlider(root) {
    if (root.hasAttribute('data-slider-bound')) return;
    root.setAttribute('data-slider-bound', 'true');

    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    if (slides.length < 2) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var prevBtn = root.querySelector('[data-hero-prev]');
    var nextBtn = root.querySelector('[data-hero-next]');

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var autoplay = root.dataset.autoplay === 'true' && !reduceMotion;
    var interval = parseInt(root.dataset.interval, 10) || 6000;

    var index = 0;
    var timer = null;
    var paused = false;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        var active = i === index;
        slide.classList.toggle('is-active', active);
        if (active) {
          slide.removeAttribute('aria-hidden');
        } else {
          slide.setAttribute('aria-hidden', 'true');
        }
      });
      dots.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-selected', active ? 'true' : 'false');
      });
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    function start() {
      stop();
      if (!autoplay || paused || document.hidden) return;
      timer = window.setInterval(function () {
        show(index + 1);
      }, interval);
    }

    /* A manual move restarts the clock, so a slide the visitor just chose
       gets a full turn rather than the remainder of the previous one. */
    function goTo(next) {
      show(next);
      start();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        goTo(parseInt(dot.dataset.index, 10) || 0);
      });
    });

    root.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goTo(index - 1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goTo(index + 1);
      }
    });

    function pause() { paused = true; stop(); }
    function resume() { paused = false; start(); }

    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', resume);
    root.addEventListener('focusin', pause);
    root.addEventListener('focusout', function (event) {
      if (!root.contains(event.relatedTarget)) resume();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    /* Swipe. Only a mostly-horizontal drag counts, so a vertical scroll that
       starts on the hero still scrolls the page. */
    var startX = null;
    var startY = null;

    root.addEventListener('touchstart', function (event) {
      var touch = event.changedTouches[0];
      startX = touch.clientX;
      startY = touch.clientY;
    }, { passive: true });

    root.addEventListener('touchend', function (event) {
      if (startX === null) return;
      var touch = event.changedTouches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      startX = null;
      startY = null;
      if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(dx < 0 ? index + 1 : index - 1);
    }, { passive: true });

    show(0);
    start();
  }

  function initAll() {
    document.querySelectorAll('[data-hero-slider]').forEach(initSlider);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
  document.addEventListener('shopify:section:reorder', initAll);

  /* In the theme editor, selecting a slide in the sidebar should show it. */
  document.addEventListener('shopify:block:select', function (event) {
    var slide = event.target.closest('[data-hero-slide]');
    if (!slide) return;
    var root = slide.closest('[data-hero-slider]');
    if (!root) return;
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    var i = slides.indexOf(slide);
    slides.forEach(function (s, n) { s.classList.toggle('is-active', n === i); });
    dots.forEach(function (d, n) { d.classList.toggle('is-active', n === i); });
  });
})();
