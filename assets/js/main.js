/* ==========================================================================
   Dang & Associates, LLC — site behaviour
   Vanilla JS, no dependencies. Loaded with `defer`.
   ========================================================================== */
(function () {
  "use strict";

  /* --------------------------------------------------------------- config */

  /**
   * Where the contact form posts. The live site has no form at all — this is
   * an addition, and it runs in demo mode until you set an endpoint here.
   *
   *   ""                                  -> demo mode, sends nothing
   *   "https://formspree.io/f/xxxxxxxx"   -> Formspree
   *   "/api/contact"                      -> your own handler
   */
  var FORM_ENDPOINT = "";

  var FALLBACK_EMAIL = "DANGASSOCIATESLLC@GMAIL.COM";

  /* ---------------------------------------------------------------- utils */

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function on(el, evt, fn, opts) { if (el) el.addEventListener(evt, fn, opts); }

  /** Resolve a path relative to this script so pages in subfolders still work. */
  var SCRIPT_SRC = (function () {
    if (document.currentScript && document.currentScript.src) return document.currentScript.src;
    var s = $$('script[src*="main.js"]').pop();
    return (s && s.src) || window.location.href;
  })();

  function assetURL(file) {
    try { return new URL("../img/" + file, SCRIPT_SRC).href; }
    catch (e) { return "assets/img/" + file; }
  }

  /** Resolve true only if the image actually decodes. */
  function imageExists(src) {
    return new Promise(function (resolve) {
      var img = new Image();
      img.onload = function () { resolve(img.naturalWidth > 0); };
      img.onerror = function () { resolve(false); };
      img.src = src;
    });
  }

  /* ----------------------------------------------------------- image slots */

  /**
   * Every image on the live site is served from Google's CDN, which returns
   * 403 to direct requests, so none could be carried over. Each slot renders
   * a placeholder and upgrades itself the moment the real file appears in
   * assets/img/ under the name in its data-bg attribute.
   */
  function initImages() {
    $$("[data-bg]").forEach(function (el) {
      var src = assetURL(el.getAttribute("data-bg"));
      imageExists(src).then(function (ok) {
        if (!ok) return;
        el.style.backgroundImage = "url('" + src + "')";
        el.classList.add("has-image");
      });
    });

    // Logo: swap the placeholder monogram for assets/img/logo.png when present.
    var src = assetURL("logo.png");
    imageExists(src).then(function (ok) {
      if (!ok) return;
      $$(".brand-mark").forEach(function (mark) {
        var img = new Image();
        img.src = src;
        img.alt = "";
        img.className = "brand-logo";
        img.setAttribute("aria-hidden", "true");
        mark.replaceWith(img);
      });
    });
  }

  /* --------------------------------------------------------- mobile nav */

  function initNav() {
    var toggle = $(".nav-toggle");
    var nav = $("#siteNav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    on(toggle, "click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    $$("a", nav).forEach(function (a) {
      on(a, "click", function () { setOpen(false); });
    });

    on(document, "keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    on(document, "click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    var mq = window.matchMedia("(min-width: 768px)");
    var onChange = function (e) { if (e.matches) setOpen(false); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  /* ------------------------------------------------------ sticky header */

  /**
   * The header is fixed, so it stays put as the page scrolls. It is
   * transparent while it overlays the banner and fills with the theme's
   * dark bar once the page moves.
   */
  function initStickyHeader() {
    var header = $(".site-header");
    if (!header) return;

    var ticking = false;

    function update() {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      header.classList.toggle("is-stuck", y > 8);
      ticking = false;
    }

    on(window, "scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  function initActiveNav() {
    var page = document.body.getAttribute("data-page");
    if (!page) return;
    $$('.site-nav a[data-nav="' + page + '"]').forEach(function (a) {
      a.setAttribute("aria-current", "page");
    });
  }

  /* ------------------------------------------------- search highlighting */

  /**
   * search.html links back with ?highlight=<query>. Mark those terms in the
   * page body so the reader lands on the thing they searched for.
   */
  function initHighlight() {
    var m = /[?&]highlight=([^&]*)/.exec(window.location.search);
    if (!m) return;

    var query = decodeURIComponent(m[1].replace(/\+/g, " ")).trim();
    if (!query) return;

    var terms = query.split(/\s+/)
      .filter(function (t) { return t.length > 1; })
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); });
    if (!terms.length) return;

    var re = new RegExp("(" + terms.join("|") + ")", "gi");
    var main = $("#main");
    if (!main) return;

    var walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var tag = node.parentNode.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "MARK") return NodeFilter.FILTER_REJECT;
        return re.test(node.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });

    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var text = node.nodeValue;
      var last = 0;
      re.lastIndex = 0;
      var match;
      while ((match = re.exec(text)) !== null) {
        if (match.index > last) frag.appendChild(document.createTextNode(text.slice(last, match.index)));
        var mark = document.createElement("mark");
        mark.textContent = match[0];
        frag.appendChild(mark);
        last = match.index + match[0].length;
      }
      if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });

    var first = $("#main mark");
    if (first && first.scrollIntoView) {
      first.scrollIntoView({ block: "center", behavior: "auto" });
    }
  }

  /* ----------------------------------------------------------- the form */

  var RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var RE_TEL = /^[\d\s()+.\-]{7,}$/;

  function fieldError(input) {
    var wrap = input.closest(".form-field");
    return wrap ? $(".field-error", wrap) : null;
  }

  function setError(input, message) {
    var err = fieldError(input);
    input.setAttribute("aria-invalid", "true");
    if (err) { err.textContent = message; err.classList.add("is-visible"); }
  }

  function clearError(input) {
    var err = fieldError(input);
    input.removeAttribute("aria-invalid");
    if (err) { err.classList.remove("is-visible"); err.textContent = ""; }
  }

  function validateField(input) {
    var value = (input.value || "").trim();
    var label = input.getAttribute("data-label") || "This field";

    if (input.type === "checkbox") {
      if (input.required && !input.checked) { setError(input, label + " is required."); return false; }
      clearError(input); return true;
    }
    if (input.required && !value) { setError(input, label + " is required."); return false; }
    if (value && input.type === "email" && !RE_EMAIL.test(value)) {
      setError(input, "Enter a valid email address."); return false;
    }
    if (value && input.type === "tel" && !RE_TEL.test(value)) {
      setError(input, "Enter a valid phone number."); return false;
    }
    clearError(input);
    return true;
  }

  function initForm() {
    var form = $("#contactForm");
    if (!form) return;

    var status = $("#formStatus");
    var submit = $("button[type=submit]", form);
    var submitLabel = submit ? submit.textContent : "";
    var fields = $$("input, select, textarea", form).filter(function (el) {
      return el.type !== "hidden" && !el.classList.contains("hp-input");
    });

    function say(message, kind) {
      if (!status) return;
      status.textContent = message;
      status.className = "form-status is-visible is-" + kind;
      status.setAttribute("role", kind === "error" ? "alert" : "status");
    }

    function busy(isBusy) {
      if (!submit) return;
      submit.disabled = isBusy;
      submit.textContent = isBusy ? "Sending…" : submitLabel;
    }

    fields.forEach(function (input) {
      on(input, "blur", function () { validateField(input); });
      ["input", "change"].forEach(function (evt) {
        on(input, evt, function () {
          if (input.getAttribute("aria-invalid") === "true") validateField(input);
        });
      });
    });

    on(form, "submit", function (e) {
      e.preventDefault();

      var hp = $(".hp-input", form);
      if (hp && hp.value) return;               // honeypot: silently drop bots

      var firstBad = null;
      fields.forEach(function (input) {
        if (!validateField(input) && !firstBad) firstBad = input;
      });
      if (firstBad) {
        say("Please correct the highlighted fields and try again.", "error");
        firstBad.focus();
        return;
      }

      if (!FORM_ENDPOINT) {
        busy(true);
        window.setTimeout(function () {
          busy(false);
          form.reset();
          fields.forEach(clearError);
          say("Thank you — your request has been received. We will be in touch within one " +
              "business day. (Demo mode: set FORM_ENDPOINT in assets/js/main.js to deliver these.)",
              "success");
        }, 600);
        return;
      }

      busy(true);
      fetch(FORM_ENDPOINT, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (!res.ok) throw new Error("status " + res.status);
          busy(false);
          form.reset();
          fields.forEach(clearError);
          say("Thank you — your request has been received. We will be in touch within one business day.", "success");
        })
        .catch(function () {
          busy(false);
          say("Sorry, the message could not be sent. Please call (703) 791-9598 or email " +
              FALLBACK_EMAIL + " and we will help you right away.", "error");
        });
    });
  }

  /* ---------------------------------------------------------------- misc */

  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* ---------------------------------------------------------------- boot */

  function boot() {
    initImages();
    initNav();
    initStickyHeader();
    initActiveNav();
    initHighlight();
    initForm();
    initYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
