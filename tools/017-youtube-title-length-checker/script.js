(function () {
  "use strict";

  var MAX_LEN = 100;
  var MOBILE_CUTOFF = 70;

  var titleInput = document.getElementById("titleInput");
  var counterBadge = document.getElementById("counterBadge");
  var meterFill = document.getElementById("meterFill");
  var verdict = document.getElementById("verdict");
  var statChars = document.getElementById("statChars");
  var statCharsNote = document.getElementById("statCharsNote");
  var statWords = document.getElementById("statWords");
  var statWordsNote = document.getElementById("statWordsNote");
  var checkList = document.getElementById("checkList");
  var prevMobile = document.getElementById("prevMobile");
  var prevSearch = document.getElementById("prevSearch");
  var chartCaption = document.getElementById("chartCaption");
  var copyBtn = document.getElementById("copyBtn");
  var trimBtn = document.getElementById("trimBtn");
  var clearBtn = document.getElementById("clearBtn");
  var copyStatus = document.getElementById("copyStatus");
  var canvas = document.getElementById("budgetChart");

  var EMOJI_RE = /[\u203C-\u3299\uD83C-\uDBFF\uDC00-\uDFFF\uFE0F\u2600-\u27BF]/g;

  function classify(text) {
    var buckets = { letters: 0, digits: 0, spaces: 0, punctuation: 0, emoji: 0 };
    var chars = Array.from(text);
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      if (/\s/.test(ch)) {
        buckets.spaces++;
      } else if (/[0-9]/.test(ch)) {
        buckets.digits++;
      } else if (/[\p{L}]/u.test(ch)) {
        buckets.letters++;
      } else if (EMOJI_RE.test(ch)) {
        buckets.emoji++;
      } else {
        buckets.punctuation++;
      }
      EMOJI_RE.lastIndex = 0;
    }
    return buckets;
  }

  function truncateAt(text, limit) {
    var chars = Array.from(text);
    if (chars.length <= limit) return text;
    var cut = chars.slice(0, limit).join("");
    var lastSpace = cut.lastIndexOf(" ");
    if (lastSpace > limit * 0.6) cut = cut.slice(0, lastSpace);
    return cut.replace(/[\s\-|:,;]+$/, "") + "\u2026";
  }

  function renderPreview(el, text, lines) {
    if (!text) {
      el.textContent = "Your title appears here";
      setClipNote(el, null);
      return;
    }
    el.textContent = text;
    var visible = measureVisibleChars(el, lines);
    setClipNote(el, visible);
  }

  function setClipNote(el, visible) {
    var row = el.closest(".yt-row");
    if (!row) return;
    var note = row.parentNode.querySelector(".clip-note");
    if (visible === null || visible >= Array.from(titleInput.value).length) {
      if (note) note.remove();
      return;
    }
    if (!note) {
      note = document.createElement("p");
      note.className = "clip-note";
      row.parentNode.appendChild(note);
    }
    note.innerHTML = "Approx. <b>" + visible + "</b> characters visible before the preview cuts off.";
  }

  function measureVisibleChars(el, lines) {
    var style = window.getComputedStyle(el);
    var font = style.fontWeight + " " + style.fontSize + " " + style.fontFamily;
    var avail = el.clientWidth || el.parentNode.clientWidth;
    if (!avail) return null;

    var ctx = measureVisibleChars._ctx || (measureVisibleChars._ctx = document.createElement("canvas").getContext("2d"));
    ctx.font = font;

    var chars = Array.from(titleInput.value);
    var used = 0;
    var charIndex = 0;

    for (var line = 0; line < lines && charIndex < chars.length; line++) {
      var lineWidth = 0;
      var lineChars = 0;
      while (charIndex < chars.length) {
        var w = ctx.measureText(chars[charIndex]).width;
        if (lineWidth + w > avail) break;
        lineWidth += w;
        charIndex++;
        lineChars++;
      }
      used += lineChars;
      if (lineChars === 0) break;
    }
    return used;
  }

  function drawChart(buckets, total) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 760;
    var cssHeight = 200;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var segs = [
      { key: "letters", label: "Letters", color: "#60089c" },
      { key: "digits", label: "Digits", color: "#8a2fc4" },
      { key: "spaces", label: "Spaces", color: "#c9a5e8" },
      { key: "punctuation", label: "Punctuation", color: "#a9a2b5" },
      { key: "emoji", label: "Emoji", color: "#e19a2b" }
    ];

    var padL = 12, padR = 12, padT = 44, barH = 30;
    var trackW = cssWidth - padL - padR;
    var barY = padT;

    ctx.fillStyle = "#f5eefc";
    ctx.strokeStyle = "#e6d5f6";
    ctx.beginPath();
    ctx.rect(padL, barY, trackW, barH);
    ctx.fill();
    ctx.stroke();

    var x = padL;
    for (var i = 0; i < segs.length; i++) {
      var count = buckets[segs[i].key];
      if (!count) continue;
      var w = (count / MAX_LEN) * trackW;
      if (w < 1) w = 1;
      if (x + w > padL + trackW) w = padL + trackW - x;
      ctx.fillStyle = segs[i].color;
      ctx.fillRect(x, barY, w, barH);
      x += w;
    }

    var limitX = padL + trackW;
    ctx.strokeStyle = "#c0273a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(limitX - 1, barY - 8);
    ctx.lineTo(limitX - 1, barY + barH + 8);
    ctx.stroke();

    ctx.fillStyle = "#c0273a";
    ctx.font = "700 11px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("100 limit", limitX, barY - 12);

    var cutX = padL + (MOBILE_CUTOFF / MAX_LEN) * trackW;
    ctx.strokeStyle = "rgba(36,34,42,.45)";
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cutX, barY - 8);
    ctx.lineTo(cutX, barY + barH + 8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#6b6b73";
    ctx.textAlign = "left";
    ctx.fillText("70 mobile cut-off", cutX + 5, barY - 12);

    var legendY = barY + barH + 26;
    var lx = padL;
    ctx.font = "500 12px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "left";
    for (var j = 0; j < segs.length; j++) {
      var val = buckets[segs[j].key];
      var label = segs[j].label + " " + val;
      ctx.fillStyle = segs[j].color;
      ctx.fillRect(lx, legendY - 8, 10, 10);
      ctx.fillStyle = "#24222a";
      ctx.fillText(label, lx + 15, legendY + 1);
      lx += ctx.measureText(label).width + 34;
      if (lx > cssWidth - 90) {
        lx = padL;
        legendY += 18;
      }
    }

    ctx.fillStyle = "#6b6b73";
    ctx.font = "600 11px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.fillText("Used " + total + " of " + MAX_LEN + " characters", padL, 20);
    return legendY;
  }

  function addCheck(results, state, text) {
    results.push({ state: state, text: text });
  }

  function buildChecks(text, buckets, total) {
    var results = [];

    if (!text.trim()) {
      addCheck(results, "info", "Waiting for a title.");
      return results;
    }

    if (total > MAX_LEN) {
      addCheck(results, "over", "Too long by " + (total - MAX_LEN) + " characters. YouTube Studio will reject a title over 100 characters, so cut something before you publish.");
    } else if (total > MOBILE_CUTOFF) {
      addCheck(results, "warn", "Within the 100-character limit, but past the 70-character mark where phone feeds start clipping the ending. Characters " + (MOBILE_CUTOFF + 1) + "-" + total + " may be hidden on mobile.");
    } else {
      addCheck(results, "ok", "Good length. At " + total + " characters the whole title should stay visible in mobile feeds and search results.");
    }

    var words = text.trim().split(/\s+/);
    if (words.length < 4) {
      addCheck(results, "warn", "Only " + words.length + " word" + (words.length === 1 ? "" : "s") + ". Very short titles give the search systems little to match on. Four to twelve words is a comfortable working range.");
    } else if (words.length > 12) {
      addCheck(results, "warn", words.length + " words. Long titles tend to bury the promise, and the reader is scanning, not reading. Try to land between 8 and 12.");
    } else {
      addCheck(results, "ok", words.length + " words - a comfortable length for scanning on any screen.");
    }

    var seen = {};
    var repeats = [];
    for (var i = 0; i < words.length; i++) {
      var w = words[i].toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
      if (!w || w.length < 3) continue;
      if (seen[w]) {
        if (repeats.indexOf(w) === -1) repeats.push(w);
      } else {
        seen[w] = true;
      }
    }
    if (repeats.length) {
      addCheck(results, "warn", "Repeated word" + (repeats.length > 1 ? "s" : "") + ": " + repeats.join(", ") + ". Repetition eats characters without adding meaning - say it once and spend the space on specifics.");
    } else {
      addCheck(results, "ok", "No duplicated keywords. Every word is doing a job.");
    }

    if (/\b[A-Z]{4,}\b/.test(text)) {
      addCheck(results, "warn", "A block of capitals reads as shouting and slows down scanning. Sentence case or title case is easier on the eye.");
    } else {
      addCheck(results, "ok", "Capitalisation is easy to read.");
    }

    var tags = text.match(/#[\p{L}\p{N}_]+/gu) || [];
    if (tags.length > 3) {
      addCheck(results, "warn", tags.length + " hashtags. YouTube only shows three above the title, and a long tag list can look like spam. Keep it to three or fewer.");
    } else if (tags.length > 0) {
      addCheck(results, "ok", tags.length + " hashtag" + (tags.length === 1 ? "" : "s") + " - within the three that YouTube displays.");
    }

    if (total > 0) {
      var nonLetters = buckets.digits + buckets.punctuation + buckets.spaces + buckets.emoji;
      if (nonLetters / total > 0.45) {
        addCheck(results, "info", "About " + Math.round((nonLetters / total) * 100) + "% of the title is spaces, punctuation, digits or emoji. Some of that is doing no work - trim what you can.");
      }
    }

    return results;
  }

  function renderChecks(results) {
    checkList.innerHTML = "";
    results.forEach(function (r) {
      var li = document.createElement("li");
      li.className = "check-item is-" + r.state;
      var dot = document.createElement("span");
      dot.className = "dot";
      var txt = document.createElement("span");
      txt.className = "check-text";
      txt.textContent = r.text;
      li.appendChild(dot);
      li.appendChild(txt);
      checkList.appendChild(li);
    });
  }

  function update() {
    var text = titleInput.value;
    var chars = Array.from(text);
    var total = chars.length;
    var buckets = classify(text);

    counterBadge.textContent = total + " / " + MAX_LEN;
    counterBadge.classList.toggle("is-warn", total > MOBILE_CUTOFF && total <= MAX_LEN);
    counterBadge.classList.toggle("is-over", total > MAX_LEN);

    var pct = Math.min(100, (total / MAX_LEN) * 100);
    meterFill.style.width = pct + "%";
    meterFill.classList.toggle("is-warn", total > MOBILE_CUTOFF && total <= MAX_LEN);
    meterFill.classList.toggle("is-over", total > MAX_LEN);

    statChars.textContent = String(total);
    statChars.classList.toggle("is-over", total > MAX_LEN);
    statChars.classList.toggle("is-warn", total > MOBILE_CUTOFF && total <= MAX_LEN);
    statCharsNote.textContent = total > MAX_LEN
      ? (total - MAX_LEN) + " over the limit"
      : (MAX_LEN - total) + " characters left";

    var words = text.trim() ? text.trim().split(/\s+/) : [];
    statWords.textContent = String(words.length);
    statWordsNote.textContent = words.length === 0
      ? "aim for 8-12"
      : (words.length < 8 ? (8 - words.length) + " short of the 8-12 range"
        : words.length > 12 ? (words.length - 12) + " over the 8-12 range"
        : "inside the 8-12 range");

    if (!text.trim()) {
      verdict.textContent = "Start typing and a verdict will appear here.";
      verdict.className = "verdict mb-4";
    } else if (total > MAX_LEN) {
      verdict.textContent = "Too long. YouTube stops accepting titles at " + MAX_LEN + " characters - remove " + (total - MAX_LEN) + ".";
      verdict.className = "verdict is-over mb-4";
    } else if (total > MOBILE_CUTOFF) {
      verdict.textContent = "Valid but risky on mobile. " + (MAX_LEN - total) + " characters of headroom remain, yet phone feeds start clipping around " + MOBILE_CUTOFF + ".";
      verdict.className = "verdict is-warn mb-4";
    } else {
      verdict.textContent = "Looks good - " + total + " characters, comfortably inside the mobile cut-off with " + (MAX_LEN - total) + " to spare.";
      verdict.className = "verdict is-ok mb-4";
    }

    renderPreview(prevMobile, text, 2);
    renderPreview(prevSearch, text, 1);

    drawChart(buckets, total);
    chartCaption.textContent = total === 0
      ? "The chart fills in as you type."
      : "Letters " + buckets.letters + " \u00b7 digits " + buckets.digits + " \u00b7 spaces " + buckets.spaces +
        " \u00b7 punctuation " + buckets.punctuation + " \u00b7 emoji " + buckets.emoji + ".";

    renderChecks(buildChecks(text, buckets, total));
  }

  function setStatus(msg) {
    copyStatus.textContent = msg;
    window.setTimeout(function () {
      if (copyStatus.textContent === msg) copyStatus.textContent = "";
    }, 4000);
  }

  function copyTitle() {
    var text = titleInput.value;
    if (!text.trim()) {
      setStatus("Nothing to copy yet.");
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus("Title copied to your clipboard.");
      }).catch(function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    titleInput.select();
    try {
      document.execCommand("copy");
      setStatus("Title copied to your clipboard.");
    } catch (err) {
      setStatus("Copy failed - select the text above and copy manually.");
    }
  }

  titleInput.addEventListener("input", update);
  copyBtn.addEventListener("click", copyTitle);
  clearBtn.addEventListener("click", function () {
    titleInput.value = "";
    titleInput.focus();
    copyStatus.textContent = "";
    update();
  });
  trimBtn.addEventListener("click", function () {
    var text = titleInput.value;
    if (Array.from(text).length <= MOBILE_CUTOFF) {
      setStatus("Already within the 70-character mobile cut-off.");
      return;
    }
    titleInput.value = truncateAt(text, MOBILE_CUTOFF);
    titleInput.focus();
    update();
    setStatus("Trimmed to " + Array.from(titleInput.value).length + " characters.");
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(update, 150);
  });

  update();
})();