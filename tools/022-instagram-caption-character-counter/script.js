/* Instagram Caption Character Counter — vanilla JS, no dependencies. */
(function () {
  "use strict";

  var LIMITS = {
    caption: 2200,
    bio: 150,
    username: 30
  };
  var PREVIEW_CUT = 125;
  var MAX_HASHTAGS = 30;
  var WARN_RATIO = 0.9;

  var el = {
    caption: document.getElementById("caption"),
    chars: document.getElementById("outChars"),
    charsOf: document.getElementById("outCharsOf"),
    remaining: document.getElementById("outRemaining"),
    words: document.getElementById("outWords"),
    lines: document.getElementById("outLines"),
    tags: document.getElementById("outTags"),
    tagsNote: document.getElementById("outTagsNote"),
    statTotal: document.getElementById("statTotal"),
    statRemaining: document.getElementById("statRemaining"),
    progress: document.getElementById("progressBar"),
    progressWrap: document.querySelector(".caption-progress"),
    limitStatus: document.getElementById("limitStatus"),
    preview: document.getElementById("previewBox"),
    previewNote: document.getElementById("previewNote"),
    checkLimit: document.getElementById("checkLimit"),
    checkTags: document.getElementById("checkTags"),
    checkPreview: document.getElementById("checkPreview"),
    errorBox: document.getElementById("errorBox"),
    canvas: document.getElementById("breakChart"),
    copyBtn: document.getElementById("copyBtn"),
    clearBtn: document.getElementById("clearBtn"),
    sampleBtn: document.getElementById("sampleBtn"),
    copyStatus: document.getElementById("copyStatus")
  };

  var SAMPLE =
    "Golden hour on the coast hits different when the whole team is there.\n\n" +
    "We spent three days shooting the spring lookbook and came home with sand " +
    "in every bag and 4,000 frames to edit.\n\n" +
    "Which shot is your favourite: 1, 2 or 3? Tell me below.\n\n" +
    "Full gallery in bio.\n\n" +
    "#coastalshoot #goldenhour #lookbook #behindthescenes #springstyle";

  function fmt(n) {
    return Number(n).toLocaleString("en-US");
  }

  /* Instagram measures captions in UTF-16 code units, which is what .length gives. */
  function countChars(text) {
    return text.length;
  }

  function countWords(text) {
    var trimmed = text.trim();
    if (!trimmed) { return 0; }
    return trimmed.split(/\s+/).length;
  }

  function countLines(text) {
    if (!text) { return 0; }
    return text.split(/\r\n|\r|\n/).length;
  }

  function countHashtags(text) {
    var matches = text.match(/#[\p{L}\p{N}_]+/gu);
    return matches ? matches.length : 0;
  }

  function showError(message) {
    if (!el.errorBox) { return; }
    if (message) {
      el.errorBox.textContent = message;
      el.errorBox.classList.remove("d-none");
    } else {
      el.errorBox.textContent = "";
      el.errorBox.classList.add("d-none");
    }
  }

  function setState(card, state) {
    if (!card) { return; }
    card.classList.remove("is-good", "is-warn", "is-bad");
    if (state) { card.classList.add(state); }
  }

  function setCheck(item, pass) {
    if (!item) { return; }
    item.classList.remove("pass", "fail");
    item.classList.add(pass ? "pass" : "fail");
  }

  function renderPreview(text) {
    if (!el.preview) { return; }
    el.preview.textContent = "";
    if (!text) {
      var ph = document.createElement("span");
      ph.className = "preview-placeholder";
      ph.textContent = "Your caption preview will appear here as you type.";
      el.preview.appendChild(ph);
      el.previewNote.textContent = "0 of 125 visible characters used.";
      return;
    }

    var visible = text.slice(0, PREVIEW_CUT);
    var rest = text.slice(PREVIEW_CUT);

    var visibleSpan = document.createElement("span");
    visibleSpan.className = "visible";
    visibleSpan.textContent = visible;
    el.preview.appendChild(visibleSpan);

    if (rest) {
      var pill = document.createElement("span");
      pill.className = "more-pill";
      pill.textContent = "… more";
      el.preview.appendChild(pill);

      var hiddenSpan = document.createElement("span");
      hiddenSpan.className = "hidden-part";
      hiddenSpan.textContent = rest;
      el.preview.appendChild(hiddenSpan);
    }

    var used = Math.min(countChars(text), PREVIEW_CUT);
    var note = fmt(used) + " of " + PREVIEW_CUT + " visible characters used.";
    if (!text.slice(0, PREVIEW_CUT).trim()) {
      note += " Add your hook here — this is what readers see first.";
    } else if (text.length > PREVIEW_CUT) {
      note += " " + fmt(text.length - PREVIEW_CUT) + " characters sit behind “more”.";
    }
    el.previewNote.textContent = note;
  }

  function drawChart(total, active) {
    var canvas = el.canvas;
    if (!canvas || !canvas.getContext) { return; }

    var ctx = canvas.getContext("2d");
    var cssW = canvas.clientWidth || 900;
    var cssH = 280;
    var dpr = window.devicePixelRatio || 1;

    if (canvas.width !== Math.round(cssW * dpr) || canvas.height !== Math.round(cssH * dpr)) {
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var rows = [
      { key: "caption", label: "Caption", limit: LIMITS.caption, color: "#60089c" },
      { key: "bio", label: "Bio", limit: LIMITS.bio, color: "#8b2fd0" },
      { key: "username", label: "Username", limit: LIMITS.username, color: "#b06fe0" }
    ];

    var padL = 82;
    var padR = 74;
    var padT = 34;
    var rowH = 62;
    var barH = 24;
    var trackW = cssW - padL - padR;

    ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
    ctx.textBaseline = "middle";

    rows.forEach(function (row, i) {
      var y = padT + i * rowH;

      ctx.fillStyle = "#67616f";
      ctx.textAlign = "right";
      ctx.fillText(row.label, padL - 12, y + barH / 2);

      // track
      ctx.fillStyle = "#f8f3fd";
      ctx.fillRect(padL, y, trackW, barH);
      ctx.strokeStyle = "#eae3f3";
      ctx.lineWidth = 1;
      ctx.strokeRect(padL + 0.5, y + 0.5, trackW - 1, barH - 1);

      var ratio = Math.min(total / row.limit, 1);
      var w = Math.max(ratio * trackW, total > 0 ? 3 : 0);
      ctx.fillStyle = total > row.limit ? "#b32639" : row.color;
      ctx.fillRect(padL, y, w, barH);

      ctx.fillStyle = total > row.limit ? "#b32639" : "#3f0568";
      ctx.textAlign = "left";
      var overflow = total > row.limit ? " ✗ over" : "";
      ctx.fillText(fmt(total) + " / " + fmt(row.limit) + overflow, padL + trackW + 8, y + barH / 2);

      ctx.fillStyle = "#67616f";
      ctx.font = "400 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
      ctx.fillText(Math.round(ratio * 100) + "% of limit used", padL, y + barH + 14);
      ctx.font = "600 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
    });

    ctx.fillStyle = "#211d29";
    ctx.font = "700 13px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Where your text lands in each Instagram field limit", padL, 14);

    if (active) {
      ctx.fillStyle = "#3f0568";
      ctx.font = "600 11px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText("draft: " + fmt(total) + " chars", cssW - padR, 14);
    }
  }

  function update() {
    var text = el.caption ? el.caption.value : "";
    var total = countChars(text);
    var words = countWords(text);
    var lines = countLines(text);
    var tags = countHashtags(text);
    var remaining = LIMITS.caption - total;
    var over = total > LIMITS.caption;
    var near = !over && total >= LIMITS.caption * WARN_RATIO;

    showError(over ? "Over the Instagram caption limit by " + fmt(total - LIMITS.caption) +
      " characters. Instagram will stop accepting input at 2,200 — trim the caption before posting." : "");

    el.chars.textContent = fmt(total);
    el.charsOf.textContent = "of " + fmt(LIMITS.caption);
    el.remaining.textContent = over ? "−" + fmt(total - LIMITS.caption) : fmt(remaining);
    el.words.textContent = fmt(words);
    el.lines.textContent = fmt(lines) + (lines === 1 ? " line" : " lines");
    el.tags.textContent = fmt(tags);
    el.tagsNote.textContent = tags === 0
      ? "no hashtags yet"
      : tags > MAX_HASHTAGS
        ? fmt(tags - MAX_HASHTAGS) + " over the 30 tag limit"
        : fmt(MAX_HASHTAGS - tags) + " tags left";

    setState(el.statTotal, over ? "is-bad" : near ? "is-warn" : total > 0 ? "is-good" : "");
    setState(el.statRemaining, over ? "is-bad" : near ? "is-warn" : "");

    var pct = Math.min((total / LIMITS.caption) * 100, 100);
    el.progress.style.width = pct.toFixed(2) + "%";
    el.progress.setAttribute("aria-valuenow", String(Math.round(pct)));
    if (el.progressWrap) {
      el.progressWrap.classList.remove("is-warn", "is-bad");
      if (over) { el.progressWrap.classList.add("is-bad"); }
      else if (near) { el.progressWrap.classList.add("is-warn"); }
    }

    if (over) {
      el.limitStatus.textContent = "Too long — cut " + fmt(total - LIMITS.caption) +
        " characters to fit Instagram's 2,200-character caption limit.";
    } else if (near) {
      el.limitStatus.textContent = "Almost full — " + fmt(remaining) +
        " characters left before the Instagram caption limit.";
    } else if (total === 0) {
      el.limitStatus.textContent = "Start typing to see how your caption measures up against the 2,200-character limit.";
    } else {
      el.limitStatus.textContent = "Good — " + fmt(remaining) +
        " characters of room left in the Instagram caption limit.";
    }

    setCheck(el.checkLimit, !over);
    setCheck(el.checkTags, tags <= MAX_HASHTAGS);
    var hook = text.slice(0, PREVIEW_CUT).trim();
    setCheck(el.checkPreview, hook.length > 0);

    renderPreview(text);
    drawChart(total, total > 0);
  }

  function copyCaption() {
    var text = el.caption ? el.caption.value : "";
    if (!text) {
      el.copyStatus.textContent = "Nothing to copy yet.";
      return;
    }
    function done() {
      el.copyStatus.textContent = "Caption copied to clipboard.";
      window.setTimeout(function () { el.copyStatus.textContent = ""; }, 2500);
    }
    function fail() {
      el.copyStatus.textContent = "Copy failed — select the text and copy manually.";
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fail);
    } else if (el.caption) {
      el.caption.select();
      try { document.execCommand("copy") ? done() : fail(); } catch (e) { fail(); }
    } else {
      fail();
    }
  }

  if (el.caption) {
    el.caption.addEventListener("input", update);
    el.caption.addEventListener("change", update);
  }
  if (el.copyBtn) { el.copyBtn.addEventListener("click", copyCaption); }
  if (el.clearBtn) {
    el.clearBtn.addEventListener("click", function () {
      if (el.caption) { el.caption.value = ""; el.caption.focus(); }
      el.copyStatus.textContent = "";
      update();
    });
  }
  if (el.sampleBtn) {
    el.sampleBtn.addEventListener("click", function () {
      if (el.caption) { el.caption.value = SAMPLE; el.caption.focus(); }
      el.copyStatus.textContent = "";
      update();
    });
  }
  window.addEventListener("resize", function () {
    drawChart(countChars(el.caption ? el.caption.value : ""), true);
  });

  update();
})();
