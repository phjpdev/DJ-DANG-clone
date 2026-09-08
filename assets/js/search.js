/* ==========================================================================
   Search — client-side, over the static index in search-index.js.

   Mirrors the Google Sites search page it replaces:
     - URL carries the query, so results are linkable and back/forward work
     - live filtering as you type
     - snippet centred on the first match, with matched terms emboldened
   ========================================================================== */
(function () {
  "use strict";

  var SNIPPET = 165;      // characters either side of the match
  var MAX_RESULTS = 25;

  /**
   * No-results state, rendered inside the results card like the original:
   * headline, grey flashlight illustration, and a hint line. The artwork is
   * an original inline-SVG approximation of the site's raster graphic.
   */
  var NO_RESULTS_HTML =
    '<div class="search-noresults">' +
      '<h2>No results match your search</h2>' +
      '<svg class="search-noresults-art" viewBox="0 0 200 200" aria-hidden="true">' +
        '<defs><clipPath id="snrClip"><circle cx="100" cy="100" r="100"/></clipPath></defs>' +
        '<circle cx="100" cy="100" r="100" fill="#d8d8d8"/>' +
        '<g clip-path="url(#snrClip)">' +
          '<path d="M100 0 A100 100 0 0 1 100 200 L100 100 Z" fill="#000" opacity="0.05"/>' +
          '<polygon points="92,86 122,104 100,204 -8,138" fill="#fbfbfb"/>' +
          '<g transform="rotate(38 96 66)">' +
            '<rect x="46" y="52" width="50" height="22" rx="5" fill="#8f8f8f"/>' +
            '<circle cx="60" cy="63" r="4" fill="#6f6f6f"/>' +
            '<rect x="94" y="55" width="8" height="16" fill="#7c7c7c"/>' +
            '<path d="M102 50 L122 42 L122 84 L102 76 Z" fill="#a3a3a3"/>' +
            '<rect x="121" y="42" width="5" height="42" fill="#ffffff"/>' +
          '</g>' +
        '</g>' +
      '</svg>' +
      '<p>Check the spelling, or try a different search</p>' +
    '</div>';

  function $(sel) { return document.querySelector(sel); }

  var form    = $("#searchForm");
  var input   = $("#searchInput");
  var clear   = $("#searchClear");
  var card    = $("#searchCard");
  var list    = $("#searchResults");
  var empty   = $("#searchEmpty");
  var back    = $("#searchBack");

  if (!form || !input || !list) return;

  var INDEX = window.SITE_INDEX || [];

  /* ---------------------------------------------------------------- utils */

  function escapeHTML(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function escapeRE(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

  /** Split "tax  return" -> ["tax","return"], longest first so we bold greedily. */
  function terms(query) {
    return query.toLowerCase().split(/\s+/)
      .filter(function (t) { return t.length > 0; })
      .sort(function (a, b) { return b.length - a.length; });
  }

  /* --------------------------------------------------------------- search */

  function scorePage(page, ts) {
    var hay = page.text.toLowerCase();
    var title = page.title.toLowerCase();
    var score = 0, matchedAll = true;

    ts.forEach(function (t) {
      var inTitle = title.indexOf(t) !== -1;
      var n = 0, i = hay.indexOf(t);
      while (i !== -1) { n++; i = hay.indexOf(t, i + t.length); }

      if (!n && !inTitle) { matchedAll = false; return; }
      score += n + (inTitle ? 25 : 0);
    });

    return matchedAll ? score : 0;
  }

  /** Window of text around the first hit, trimmed to whole words. */
  function snippet(text, ts) {
    var hay = text.toLowerCase();
    var at = -1;

    for (var i = 0; i < ts.length; i++) {
      var j = hay.indexOf(ts[i]);
      if (j !== -1 && (at === -1 || j < at)) at = j;
    }
    if (at === -1) at = 0;

    var start = Math.max(0, at - Math.floor(SNIPPET / 2));
    var end = Math.min(text.length, start + SNIPPET);

    if (start > 0) {
      var sp = text.indexOf(" ", start);
      if (sp !== -1 && sp < start + 20) start = sp + 1;
    }
    if (end < text.length) {
      var sp2 = text.lastIndexOf(" ", end);
      if (sp2 > start) end = sp2;
    }

    return (start > 0 ? "... " : "") + text.slice(start, end).trim() + (end < text.length ? " ..." : "");
  }

  /** Embolden every matched term inside an already-escaped string. */
  function highlight(escaped, ts) {
    if (!ts.length) return escaped;
    var re = new RegExp("(" + ts.map(escapeRE).join("|") + ")", "gi");
    return escaped.replace(re, "<b>$1</b>");
  }

  function search(query) {
    var ts = terms(query.trim());
    if (!ts.length) return [];

    return INDEX
      .map(function (page) { return { page: page, score: scorePage(page, ts) }; })
      .filter(function (r) { return r.score > 0; })
      .sort(function (a, b) { return b.score - a.score; })
      .slice(0, MAX_RESULTS)
      .map(function (r) { return r.page; });
  }

  /* --------------------------------------------------------------- render */

  function render(query) {
    var q = query.trim();

    clear.hidden = q === "";

    if (!q) {
      card.hidden = true;
      if (empty) empty.hidden = true;
      list.innerHTML = "";
      return;
    }

    var ts = terms(q);
    var hits = search(q);

    if (!hits.length) {
      if (empty) empty.hidden = true;
      card.hidden = false;
      list.innerHTML = NO_RESULTS_HTML;
      return;
    }

    if (empty) empty.hidden = true;
    card.hidden = false;

    list.innerHTML = hits.map(function (page) {
      return '<a class="search-result" href="' + escapeHTML(page.url) +
                 '?highlight=' + encodeURIComponent(q) + '">' +
               '<span class="search-result-title">' +
                 highlight(escapeHTML(page.title), ts) +
               '</span>' +
               '<span class="search-result-snippet">' +
                 highlight(escapeHTML(snippet(page.text, ts)), ts) +
               '</span>' +
               '<span class="search-result-meta">Last modified on ' +
                 escapeHTML(page.modified) +
               '</span>' +
             '</a>';
    }).join("");
  }

  /* ------------------------------------------------------------------ URL */

  function queryFromURL() {
    var m = /[?&]query=([^&]*)/.exec(window.location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, " ")) : "";
  }

  function pushQuery(q, replace) {
    if (!window.history || !window.history.pushState) return;
    var url = window.location.pathname +
      (q ? "?query=" + encodeURIComponent(q) + "&scope=site" : "");
    window.history[replace ? "replaceState" : "pushState"]({ q: q }, "", url);
  }

  /* --------------------------------------------------------------- events */

  var debounce;
  input.addEventListener("input", function () {
    window.clearTimeout(debounce);
    var q = input.value;
    render(q);
    debounce = window.setTimeout(function () { pushQuery(q, true); }, 350);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    window.clearTimeout(debounce);
    render(input.value);
    pushQuery(input.value, false);
  });

  clear.addEventListener("click", function () {
    input.value = "";
    render("");
    pushQuery("", true);
    input.focus();
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && input.value) {
      e.preventDefault();
      input.value = "";
      render("");
      pushQuery("", true);
    }
  });

  window.addEventListener("popstate", function () {
    input.value = queryFromURL();
    render(input.value);
  });

  if (back) {
    back.addEventListener("click", function () {
      if (window.history.length > 1) window.history.back();
      else window.location.href = "index.html";
    });
  }

  /* ----------------------------------------------------------------- boot */

  input.value = queryFromURL();
  render(input.value);
  input.focus();
})();
