(function () {
  'use strict';
  var rail = document.querySelector('.rail');
  var links = rail ? Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]')) : [];
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

  // Highlight the month being read and keep its chip in view inside the rail.
  function setCurrent(id) {
    links.forEach(function (a) { a.setAttribute('aria-current', 'false'); });
    var a = byId[id];
    if (!a) return;
    a.setAttribute('aria-current', 'true');
    var r = rail.getBoundingClientRect(), c = a.getBoundingClientRect();
    if (c.left < r.left + 24 || c.right > r.right - 24) {
      rail.scrollBy({ left: (c.left + c.width / 2) - (r.left + r.width / 2), behavior: 'smooth' });
    }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setCurrent(e.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    document.querySelectorAll('section.month, #intro, #afterword').forEach(function (s) { io.observe(s); });
  }

  // Toast
  var toastTimer;
  function toast(msg) {
    var t = document.querySelector('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; t.dir = 'rtl'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2200);
  }

  function pageUrl(hash) {
    var canon = document.querySelector('link[rel="canonical"]');
    var base = canon ? canon.href : (location.origin + location.pathname);
    return base.split('#')[0] + (hash ? '#' + hash : '');
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { toast('הקישור הועתק'); }, function () { fallbackCopy(text); });
    }
    fallbackCopy(text);
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); toast('הקישור הועתק'); } catch (e) { toast(text); }
    document.body.removeChild(ta);
  }

  // Share a quote (or the whole booklet). Uses the phone's share sheet when available.
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-share]');
    if (!b) return;
    var id = b.getAttribute('data-share');
    var url = pageUrl(id === 'top' ? '' : id);
    var title = document.title;
    var text = b.getAttribute('data-text') || '';
    if (navigator.share) {
      navigator.share({ title: title, text: text, url: url }).catch(function (e) { if (e && e.name !== 'AbortError') copy(url); });
    } else {
      copy(url);
    }
  });

  // Expand long quotes
  document.addEventListener('click', function (ev) {
    var m = ev.target.closest('.more');
    if (!m) return;
    var f = m.closest('.quote'); f.classList.add('open'); m.setAttribute('aria-expanded', 'true');
  });
  // A shared link to a quote opens it fully
  if (location.hash && /^#q-/.test(location.hash)) {
    var tgt = document.getElementById(location.hash.slice(1));
    if (tgt && tgt.classList.contains('long')) tgt.classList.add('open');
  }

  // Photo lightbox
  var dlg = document.querySelector('dialog.lb');
  if (dlg) {
    var img = dlg.querySelector('img'), cap = dlg.querySelector('p');
    document.addEventListener('click', function (ev) {
      var z = ev.target.closest('[data-zoom]');
      if (!z) return;
      img.src = z.getAttribute('data-zoom'); img.alt = z.getAttribute('data-alt') || '';
      cap.textContent = z.getAttribute('data-cap') || '';
      if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    });
    dlg.addEventListener('click', function (ev) { if (ev.target === dlg || ev.target.closest('.lb-close') || ev.target === img) dlg.close(); });
  }
})();
