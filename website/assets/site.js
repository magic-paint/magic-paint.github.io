/* Magic Paint website — OS-aware download buttons, live release info, small delights. */
(function () {
  'use strict';
  // Filled in automatically by the Pages workflow (owner/repo). Left as-is in local previews.
  var REPO = '__REPO__';
  var LIVE = REPO.indexOf('__') === -1;
  var FILES = {
    mac: 'MagicPaint-Mac.dmg',
    win: 'MagicPaint-Windows-Setup.exe',
    linux: 'MagicPaint-Linux.AppImage'
  };
  var NAMES = { mac: 'Mac', win: 'Windows', linux: 'Linux', web: 'your browser' };
  var RELEASES = LIVE ? 'https://github.com/' + REPO + '/releases' : '#download';

  function link(os) {
    if (os === 'web') return 'play/';
    return LIVE ? 'https://github.com/' + REPO + '/releases/latest/download/' + FILES[os] : '#download';
  }

  function detect() {
    var ua = navigator.userAgent || '';
    var p = (navigator.userAgentData && navigator.userAgentData.platform) || navigator.platform || '';
    if (/iPhone|iPad|iPod|Android|CrOS/i.test(ua) || (/Mac/.test(p) && navigator.maxTouchPoints > 1)) return 'web';
    if (/Win/i.test(p) || /Windows/i.test(ua)) return 'win';
    if (/Mac/i.test(p) || /Mac OS X/i.test(ua)) return 'mac';
    if (/Linux/i.test(p) || /Linux/i.test(ua)) return 'linux';
    return 'web';
  }
  var OS = detect();

  // Wire every [data-dl] link to the right file.
  document.querySelectorAll('[data-dl]').forEach(function (a) {
    var os = a.getAttribute('data-dl') === 'auto' ? OS : a.getAttribute('data-dl');
    a.href = link(os);
    a.setAttribute('data-os', os);
    if (os !== 'web') a.addEventListener('click', function () { setTimeout(function () { openModal(os); }, 350); });
  });
  document.querySelectorAll('[data-os-name]').forEach(function (el) { el.textContent = NAMES[OS]; });
  document.querySelectorAll('[data-releases]').forEach(function (a) { a.href = RELEASES; });

  // Hero button: on phones/tablets/Chromebooks the main action is "Play in your browser".
  var heroLabel = document.getElementById('hero-dl-label');
  if (heroLabel) heroLabel.textContent = OS === 'web' ? 'Play in your browser' : 'Download for ' + NAMES[OS];
  var heroAlt = document.getElementById('hero-alt');
  if (heroAlt && OS === 'web') heroAlt.hidden = true;
  document.querySelectorAll('.dl[data-card="' + OS + '"]').forEach(function (c) { c.classList.add('rec'); var b = c.querySelector('.badge'); if (b) b.hidden = false; });

  // Live version + sizes from the latest GitHub Release (no key needed; fails quietly).
  if (LIVE && window.fetch) {
    fetch('https://api.github.com/repos/' + REPO + '/releases/latest', { headers: { Accept: 'application/vnd.github+json' } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rel) {
        if (!rel) return;
        document.querySelectorAll('[data-version]').forEach(function (el) { el.textContent = rel.tag_name; });
        (rel.assets || []).forEach(function (a) {
          Object.keys(FILES).forEach(function (os) {
            if (a.name === FILES[os]) {
              var el = document.querySelector('[data-size="' + os + '"]');
              if (el) el.textContent = (a.size / 1048576).toFixed(0) + ' MB · ' + rel.tag_name;
            }
          });
        });
      }).catch(function () {});
  }

  // "Your download is starting" sheet with first-open steps for that OS.
  var modal = document.getElementById('dl-modal');
  function openModal(os) {
    if (!modal) return;
    modal.querySelectorAll('[data-steps]').forEach(function (s) { s.hidden = s.getAttribute('data-steps') !== os; });
    var t = modal.querySelector('[data-modal-os]'); if (t) t.textContent = NAMES[os];
    modal.hidden = false;
    var x = modal.querySelector('.x'); if (x) x.focus();
  }
  function closeModal() { if (modal) modal.hidden = true; }
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal || e.target.closest('[data-close]')) closeModal(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  // Showcase tabs.
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (o) { o.setAttribute('aria-selected', o === t ? 'true' : 'false'); });
      document.querySelectorAll('.shots figure').forEach(function (f) { f.hidden = f.id !== t.getAttribute('aria-controls'); });
    });
  });

  // Nav border once scrolled.
  var nav = document.querySelector('.nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Footer year.
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
