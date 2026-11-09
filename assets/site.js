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

  /* There used to be a reveal-on-scroll here. It hid the work for up to three
     seconds from anyone who didn't scroll the way the observer expected, and a
     recruiter skimming the page is exactly that person, so it went. */

  /* ---- Copy the address --------------------------------------------------- */
  var copyBtn = document.getElementById('copyBtn');
  if (copyBtn) {
    var status = document.getElementById('copyStatus');
    var label = copyBtn.textContent;
    var timer;

    var feedback = function (buttonText, announcement) {
      copyBtn.textContent = buttonText;
      if (status) status.textContent = announcement;
      clearTimeout(timer);
      timer = setTimeout(function () {
        copyBtn.textContent = label;
        if (status) status.textContent = '';
      }, 3200);
    };

    var selectAddress = function () {
      var addressLink = document.querySelector('.contact-mail');
      if (addressLink && window.getSelection && document.createRange) {
        var selection = window.getSelection();
        var range = document.createRange();
        range.selectNodeContents(addressLink);
        selection.removeAllRanges();
        selection.addRange(range);
        feedback('Address selected', 'Email address selected. Use your device\'s Copy command.');
      } else {
        feedback('Copy unavailable', 'Clipboard access is unavailable. Use the email link above to compose a message.');
      }
    };

    copyBtn.addEventListener('click', function () {
      var address = copyBtn.getAttribute('data-email');
      if (navigator.clipboard && window.isSecureContext && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(function () {
          feedback('Copied', 'Email address copied to clipboard.');
        }, selectAddress);
      } else {
        selectAddress();
      }
    });
  }

  /* ---- Year --------------------------------------------------------------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
