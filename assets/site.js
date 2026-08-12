/*
 * Everything here is an enhancement. The pages are complete without it:
 * the theme falls back to the OS preference via a media query, the email is
 * a mailto link before the copy button exists, and the header only loses a
 * hairline border.
 */
(function () {
  'use strict';

  var root = document.documentElement;

  /* ---- Theme -------------------------------------------------------------
     Follows the OS unless the visitor says otherwise. The choice is kept for
     the visit only; there is no reason for a portfolio to write to storage. */
  var themeBtn = document.getElementById('themeBtn');

  function systemDark() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function isDark() {
    var set = root.getAttribute('data-theme');
    if (set === 'dark') return true;
    if (set === 'light') return false;
    return systemDark();
  }

  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    if (themeBtn) {
      themeBtn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', mode === 'dark' ? '#121316' : '#efefec');
  }

  if (themeBtn) {
    setTheme(systemDark() ? 'dark' : 'light');
    themeBtn.addEventListener('click', function () {
      setTheme(isDark() ? 'light' : 'dark');
    });
  }

  /* ---- Header hairline --------------------------------------------------- */
  var head = document.querySelector('.site-head');
  if (head) {
    var ticking = false;
    var onScroll = function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        head.setAttribute('data-scrolled', window.scrollY > 8 ? 'true' : 'false');
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Which section am I in ---------------------------------------------
     Only runs on pages that have the matching nav links. */
  var spyIds = ['work', 'experience', 'about', 'contact'];
  var links = {};
  spyIds.forEach(function (id) {
    var link = document.querySelector('.nav a[href="#' + id + '"]');
    if (link) links[id] = link;
  });

  if (Object.keys(links).length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var link = links[entry.target.id];
          if (!link) return;
          Object.keys(links).forEach(function (key) {
            links[key].removeAttribute('aria-current');
          });
          link.setAttribute('aria-current', 'true');
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    spyIds.forEach(function (id) {
      var section = document.getElementById(id);
      if (section) spy.observe(section);
    });
  }

  /* ---- Reveal on scroll ---------------------------------------------------
     Deliberately small in scope: the work items and the pulled statement,
     not the whole page. The hidden state lives entirely under
     .js-reveal-ready, added here in the same breath as the observer starting,
     so nothing is ever hidden with no observer watching it — no-JS, no
     IntersectionObserver, and reduced-motion all just see everything. */
  var revealTargets = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealTargets.length && !reduceMotion && 'IntersectionObserver' in window) {
    root.classList.add('js-reveal-ready');

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    Array.prototype.forEach.call(revealTargets, function (el, i) {
      el.style.transitionDelay = (i % 3) * 70 + 'ms';
      revealObserver.observe(el);
    });

    /* A backstop, not the mechanism. Real scrolling triggers the observer
       well before this fires. This exists for anything that doesn't scroll
       in a way the observer sees — a keyboard-only visitor tabbing past a
       still-hidden link, an automated tool that captures the page without
       scrolling through it — so nothing stays invisible indefinitely. */
    window.setTimeout(function () {
      revealObserver.disconnect();
      root.classList.remove('js-reveal-ready');
    }, 3000);
  }

  /* ---- Copy the address --------------------------------------------------- */
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    var status = document.getElementById('copyStatus');
    var label = copyBtn.textContent;
    var timer;

    copyBtn.addEventListener('click', function () {
      var address = copyBtn.getAttribute('data-email');

      var done = function () {
        copyBtn.textContent = 'Copied';
        if (status) status.textContent = 'Email address copied to clipboard.';
        clearTimeout(timer);
        timer = setTimeout(function () {
          copyBtn.textContent = label;
          if (status) status.textContent = '';
        }, 2400);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(address).then(done, function () {
          copyBtn.textContent = 'Press ⌘C';
        });
      } else {
        copyBtn.textContent = 'Press ⌘C';
      }
    });
  }

  /* ---- Year --------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
