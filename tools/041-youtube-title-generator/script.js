/* YouTube Title Generator — vanilla JS, no dependencies */
(function () {
  "use strict";

  var MAX_CHARS = 100;

  var els = {
    topic: document.getElementById("topicInput"),
    audience: document.getElementById("audienceInput"),
    format: document.getElementById("formatSelect"),
    tone: document.getElementById("toneSelect"),
    count: document.getElementById("countSelect"),
    numbers: document.getElementById("numbersToggle"),
    year: document.getElementById("yearToggle"),
    caps: document.getElementById("capsToggle"),
    norepeat: document.getElementById("norepeatToggle"),
    generate: document.getElementById("generateBtn"),
    clear: document.getElementById("clearBtn"),
    empty: document.getElementById("emptyState"),
    wrap: document.getElementById("resultsWrap"),
    alert: document.getElementById("alertBox"),
    body: document.getElementById("titleBody"),
    statCount: document.getElementById("statCount"),
    statAvg: document.getElementById("statAvg"),
    statScore: document.getElementById("statScore"),
    statFit: document.getElementById("statFit"),
    copyAll: document.getElementById("copyAllBtn"),
    download: document.getElementById("downloadBtn"),
    best: document.getElementById("bestPick"),
    chart: document.getElementById("lengthChart")
  };

  var current = [];
  var seenTitles = [];

  /* ------------------------------------------------------------------ *
   * Pattern library
   * Each pattern is a function(keyword, audience, rnd) -> title string.
   * ------------------------------------------------------------------ */
  var OPENERS = [
    "Why", "How", "What", "When", "The Truth About", "Everything About"
  ];

  var PATTERNS = {
    howto: [
      function (k, a) { return "How to " + k + " (Step-by-Step Guide)"; },
      function (k, a) { return "How to " + k + " in " + pick(["10 Minutes", "One Afternoon", "5 Simple Steps", "2026"]); },
      function (k, a) { return "How to " + k + " " + (a ? "for " + a : "Without Wasting Time"); },
      function (k, a) { return "How to " + k + " &mdash; Common Mistakes to Avoid"; },
      function (k, a) { return "The Beginner's Guide to " + k; },
      function (k, a) { return "How I Learned to " + k + " (What I'd Do Differently)"; },
      function (k, a) { return "How to " + k + " the Easy Way"; },
      function (k, a) { return "How to " + k + ": A Complete Walkthrough"; }
    ],
    listicle: [
      function (k, a) { return pick(["5", "7", "9", "10"]) + " " + k + " Tips That Actually Work"; },
      function (k, a) { return pick(["3", "5", "7"]) + " " + k + " Mistakes Everyone Makes"; },
      function (k, a) { return pick(["6", "8", "10"]) + " " + k + " Ideas for " + (a || "Beginners"); },
      function (k, a) { return pick(["5", "7", "12"]) + " Things Nobody Tells You About " + k; },
      function (k, a) { return pick(["4", "6", "9"]) + " " + k + " Rules Worth Following"; },
      function (k, a) { return "Top " + pick(["5", "7", "10"]) + " " + k + " Tools Compared"; },
      function (k, a) { return pick(["7", "10"]) + " Minute " + k + " Wins You Can Start Today"; },
      function (k, a) { return pick(["5", "8"]) + " " + k + " Questions, Answered"; }
    ],
    review: [
      function (k, a) { return k + " Review: Is It Worth It?"; },
      function (k, a) { return "I Tried " + k + " for 30 Days &mdash; Honest Review"; },
      function (k, a) { return k + " vs " + pick(["the Alternatives", "the Competition", "Last Year's Model"]); },
      function (k, a) { return "The Truth About " + k + " (No Hype)"; },
      function (k, a) { return k + ": 5 Pros and 3 Real Cons"; },
      function (k, a) { return "Before You Buy: " + k + " Explained"; },
      function (k, a) { return "Is " + k + " Worth the Money in " + year() + "?"; },
      function (k, a) { return "Best " + k + " for " + (a || "Every Budget"); }
    ],
    vlog: [
      function (k, a) { return "A Week of " + k + " &mdash; What Actually Happened"; },
      function (k, a) { return "My " + k + " Journey: From Zero to Here"; },
      function (k, a) { return "Day in the Life: " + k; },
      function (k, a) { return "I Started " + k + " From Scratch &mdash; Here's the Reality"; },
      function (k, a) { return "What " + k + " Taught Me About " + pick(["Patience", "Focus", "Failure", "Starting Over"]); },
      function (k, a) { return "The Honest Side of " + k; },
      function (k, a) { return "30 Days of " + k + ": The Results"; },
      function (k, a) { return "Why I Almost Quit " + k; }
    ],
    gaming: [
      function (k, a) { return "Can You Beat " + k + " Without " + pick(["Dying", "Upgrades", "Guides"]) + "?"; },
      function (k, a) { return pick(["5", "10"]) + " " + k + " Tricks the Pros Use"; },
      function (k, a) { return "I Survived 100 Hours of " + k; },
      function (k, a) { return k + ": Full Beginner Walkthrough"; },
      function (k, a) { return "Ranking Every " + k + " " + pick(["Weapon", "Build", "Level", "Strategy"]); },
      function (k, a) { return "The Hardest " + k + " Challenge I've Ever Tried"; },
      function (k, a) { return "Speedrunning " + k + " for the First Time"; },
      function (k, a) { return "Is " + k + " Still Worth Playing in " + year() + "?"; }
    ],
    education: [
      function (k, a) { return k + ", Explained Simply"; },
      function (k, a) { return "The Science Behind " + k; },
      function (k, a) { return "What Everyone Gets Wrong About " + k; },
      function (k, a) { return k + " in 5 Minutes"; },
      function (k, a) { return "A Clear Introduction to " + k; },
      function (k, a) { return "Why " + k + " Matters More Than You Think"; },
      function (k, a) { return k + ": The Complete Beginner Explainer"; },
      function (k, a) { return "Understanding " + k + " (With Real Examples)"; }
    ],
    news: [
      function (k, a) { return k + ": What Just Changed and Why It Matters"; },
      function (k, a) { return "Breaking Down the " + k + " Story"; },
      function (k, a) { return "Is " + k + " Over? An Honest Take"; },
      function (k, a) { return k + " in " + year() + ": Where Things Stand"; },
      function (k, a) { return "The " + k + " Update Everyone Missed"; },
      function (k, a) { return "My Take on the " + k + " Debate"; },
      function (k, a) { return "Why the " + k + " Headlines Are Misleading"; },
      function (k, a) { return k + ": 3 Things to Watch Next"; }
    ]
  };

  var TONE_WRAP = {
    clear: [
      function (t) { return t; },
      function (t) { return t; },
      function (t) { return t; }
    ],
    curiosity: [
      function (t) { return "The Real Reason " + lower(t); },
      function (t) { return t + " (You'll Want to See This)"; },
      function (t) { return "Nobody Talks About This: " + t; }
    ],
    bold: [
      function (t) { return t + " &mdash; No Fluff"; },
      function (t) { return t + " (Do This Today)"; },
      function (t) { return "Stop Guessing: " + t; }
    ],
    friendly: [
      function (t) { return t + " &#128075;"; },
      function (t) { return "Let's Talk: " + t; },
      function (t) { return t + " &mdash; The Easy Way"; }
    ],
    professional: [
      function (t) { return t + " | A Practical Guide"; },
      function (t) { return t + ": Best Practices"; },
      function (t) { return t + " &mdash; An Overview"; }
    ]
  };

  var FILLER = ["just", "really", "very", "actually", "basically", "simply"];

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function year() { return String(new Date().getFullYear()); }

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function lower(s) {
    if (!s) { return s; }
    return s.charAt(0).toLowerCase() + s.slice(1);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function decodeEntities(s) {
    return String(s)
      .replace(/&mdash;/g, "\u2014")
      .replace(/&ndash;/g, "\u2013")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#128075;/g, "\uD83D\uDC4B");
  }

  function cleanTopic(raw) {
    return String(raw || "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim();
  }

  function cleanAudience(raw) {
    return String(raw || "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim();
  }

  function titleCase(str) {
    var small = ["a", "an", "the", "and", "or", "but", "for", "to", "of", "in", "on", "at", "by", "vs"];
    return str.split(" ").map(function (word, i) {
      if (!word) { return word; }
      var bare = word.replace(/[^A-Za-z']/g, "");
      if (i > 0 && small.indexOf(bare.toLowerCase()) !== -1) { return word.toLowerCase(); }
      if (word.length > 1 && /^[A-Z]/.test(word)) { return word; }
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(" ");
  }

  /* ------------------------------------------------------------------ *
   * Scoring
   * ------------------------------------------------------------------ */
  function scoreTitle(title, topic, opts) {
    var plain = decodeEntities(title);
    var len = plain.length;
    var lowerTitle = plain.toLowerCase();
    var lowerTopic = topic.toLowerCase();
    var score = 0;
    var notes = [];

    if (len <= MAX_CHARS) {
      score += 25;
      if (len >= 45 && len <= 70) {
        score += 10;
        notes.push("ideal length");
      } else if (len < 35) {
        notes.push("a little short");
      } else {
        notes.push("still fits the limit");
      }
    } else {
      notes.push("over the 100-character limit");
    }

    if (lowerTitle.indexOf(lowerTopic) !== -1) {
      score += 20;
      notes.push("keyword included");
    } else {
      notes.push("keyword missing");
    }

    var keywordFront = lowerTitle.indexOf(lowerTopic) !== -1 && lowerTitle.indexOf(lowerTopic) <= 40;
    if (keywordFront) {
      score += 15;
      notes.push("keyword up front");
    }

    if (/\d/.test(plain)) {
      score += 10;
      notes.push("uses a number");
    }

    if (/[?:]/.test(plain) || /\u2014/.test(plain) || /\(/.test(plain)) {
      score += 10;
      notes.push("has a hook");
    }

    var fillerHits = FILLER.filter(function (w) {
      return new RegExp("\\b" + w + "\\b", "i").test(plain);
    });
    if (fillerHits.length === 0) {
      score += 10;
    } else {
      score -= 5 * fillerHits.length;
      notes.push("filler: " + fillerHits.join(", "));
    }

    if (opts.caps) {
      if (plain === titleCase(plain)) { score += 5; }
    }

    score = Math.max(5, Math.min(100, score));

    return { len: len, score: score, note: notes.slice(0, 2).join(", ") };
  }

  /* ------------------------------------------------------------------ *
   * Generation
   * ------------------------------------------------------------------ */
  function buildPool(format) {
    if (format !== "auto" && PATTERNS[format]) { return PATTERNS[format].slice(); }
    var all = [];
    Object.keys(PATTERNS).forEach(function (key) {
      all = all.concat(PATTERNS[key]);
    });
    return all;
  }

  function generate() {
    var topic = cleanTopic(els.topic.value);
    var audience = cleanAudience(els.audience.value);

    if (topic.length < 2) {
      showAlert("warning", "Please enter a video topic of at least 2 characters before generating titles.");
      els.topic.classList.add("is-invalid");
      els.topic.focus();
      return;
    }
    els.topic.classList.remove("is-invalid");

    var format = els.format.value;
    var tone = els.tone.value;
    var want = parseInt(els.count.value, 10);
    if (!want || want < 1) { want = 5; }

    if (!els.numbers.checked && format === "listicle") {
      showAlert("info", "The listicle format relies on numbers, but numbers are switched off. Falling back to a mixed set so the titles stay readable.");
      format = "auto";
    }

    var pool = buildPool(format);
    var tones = TONE_WRAP[tone] || TONE_WRAP.clear;
    var out = [];
    var attempts = 0;
    var maxAttempts = want * 40;

    while (out.length < want && attempts < maxAttempts) {
      attempts++;
      var pattern = pick(pool);
      var title = pattern(topic, audience, Math.random);

      if (!els.numbers.checked) {
        title = title.replace(/\b\d+\b\s*/g, "");
      }
      if (!els.year.checked) {
        title = title.replace(new RegExp("\\b" + year() + "\\b", "g"), "today");
      }

      var wrap = pick(tones);
      title = wrap(title);
      title = title.replace(/\s{2,}/g, " ").replace(/^[\s\-:|]+/, "").replace(/[\s\-:|]+$/, "").trim();

      if (title.length < 3) { continue; }

      if (els.caps.checked) { title = titleCase(decodeEntities(title)); }

      if (els.norepeat.checked && (out.indexOf(title) !== -1 || seenTitles.indexOf(title) !== -1)) {
        continue;
      }
      if (out.indexOf(title) !== -1) { continue; }

      out.push(title);
    }

    if (out.length === 0) {
      showAlert("danger", "Could not generate titles from that input. Try a shorter, simpler topic.");
      return;
    }

    current = out.map(function (title) {
      var info = scoreTitle(title, topic, { caps: els.caps.checked });
      return { title: title, len: info.len, score: info.score, note: info.note };
    });

    if (els.norepeat.checked) {
      seenTitles = seenTitles.concat(out);
      if (seenTitles.length > 400) { seenTitles = seenTitles.slice(-200); }
    }

    if (format === "auto" && els.format.value === "listicle") {
      showAlert("info", "Generated with a mixed set of formats because numbers were disabled.");
    } else {
      hideAlert();
    }

    render();
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */
  function render() {
    els.empty.classList.add("d-none");
    els.wrap.classList.remove("d-none");

    var rows = "";
    current.forEach(function (item, i) {
      var badge = item.len <= MAX_CHARS
        ? '<span class="badge badge-ok text-white">' + item.len + "</span>"
        : '<span class="badge badge-over text-white">' + item.len + "</span>";
      var pillClass = item.score >= 80 ? "" : (item.score >= 60 ? " is-mid" : " is-low");
      rows += "<tr>" +
        '<td class="text-muted">' + (i + 1) + "</td>" +
        '<td><span class="title-text">' + escapeHtml(item.title) + "</span>" +
          (item.note ? '<span class="title-note">' + escapeHtml(item.note) + "</span>" : "") +
        "</td>" +
        '<td class="text-center char-cell">' + badge + "</td>" +
        '<td class="text-center"><span class="score-pill' + pillClass + '">' + item.score + "</span></td>" +
        '<td class="text-right"><button type="button" class="btn btn-outline-secondary copy-btn" data-copy="' +
          escapeHtml(decodeEntities(item.title)) + '">Copy</button></td>' +
        "</tr>";
    });
    els.body.innerHTML = rows;

    var total = current.length;
    var sumLen = current.reduce(function (a, b) { return a + b.len; }, 0);
    var sumScore = current.reduce(function (a, b) { return a + b.score; }, 0);
    var fit = current.filter(function (t) { return t.len <= MAX_CHARS; }).length;

    els.statCount.textContent = String(total);
    els.statAvg.textContent = String(Math.round(sumLen / total));
    els.statScore.textContent = String(Math.round(sumScore / total));
    els.statFit.textContent = fit + "/" + total;

    var best = current.slice().sort(function (a, b) {
      if (b.score !== a.score) { return b.score - a.score; }
      return a.len - b.len;
    })[0];

    els.best.innerHTML =
      '<p class="bp-title mb-1">' + escapeHtml(decodeEntities(best.title)) + "</p>" +
      '<p class="mb-0 small text-muted">Score ' + best.score + "/100 &middot; " + best.len +
      " characters" + (best.len <= MAX_CHARS ? " (fits without truncation)" : " (over the limit)") + ".</p>";

    drawChart(current);
  }

  function showAlert(type, message) {
    els.alert.className = "alert alert-" + type;
    els.alert.textContent = message;
    els.alert.classList.remove("d-none");
  }

  function hideAlert() {
    els.alert.classList.add("d-none");
  }

  /* ------------------------------------------------------------------ *
   * Chart (plain canvas, no libraries)
   * ------------------------------------------------------------------ */
  function drawChart(items) {
    var canvas = els.chart;
    if (!canvas || !canvas.getContext) { return; }

    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 640;
    var cssHeight = 220;

    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 34;
    var padRight = 12;
    var padTop = 14;
    var padBottom = 30;
    var plotW = cssWidth - padLeft - padRight;
    var plotH = cssHeight - padTop - padBottom;
    var maxVal = MAX_CHARS * 1.15;

    // gridlines
    ctx.strokeStyle = "#e5dcf0";
    ctx.lineWidth = 1;
    ctx.font = "11px Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#6b6277";
    [0, 50, 100].forEach(function (v) {
      var y = padTop + plotH - (v / maxVal) * plotH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(String(v), padLeft - 6, y + 4);
    });

    var n = items.length;
    var gap = 6;
    var barW = Math.max(4, (plotW - gap * (n + 1)) / n);

    items.forEach(function (item, i) {
      var x = padLeft + gap + i * (barW + gap);
      var h = Math.min(1, item.len / maxVal) * plotH;
      var y = padTop + plotH - h;

      if (item.len <= MAX_CHARS) {
        var grad = ctx.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, "#7a1fbd");
        grad.addColorStop(1, "#9d5ad4");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "#b91c1c";
      }
      ctx.fillRect(x, y, barW, h);

      ctx.fillStyle = "#241a2e";
      ctx.textAlign = "center";
      ctx.fillText(String(item.len), x + barW / 2, y - 4);
    });

    // 100-char ceiling
    var limitY = padTop + plotH - (MAX_CHARS / maxVal) * plotH;
    ctx.save();
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = "#43006d";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(padLeft, limitY);
    ctx.lineTo(padLeft + plotW, limitY);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = "#43006d";
    ctx.textAlign = "left";
    ctx.fillText("100 char limit", padLeft + 4, limitY - 5);
  }

  /* ------------------------------------------------------------------ *
   * Copy / download
   * ------------------------------------------------------------------ */
  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function plainList() {
    return current.map(function (item) { return decodeEntities(item.title); }).join("\n");
  }

  els.body.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-copy]");
    if (!btn) { return; }
    copyText(btn.getAttribute("data-copy")).then(function () {
      var old = btn.textContent;
      btn.textContent = "Copied";
      window.setTimeout(function () { btn.textContent = old; }, 1200);
    }).catch(function () {
      btn.textContent = "Copy failed";
    });
  });

  els.copyAll.addEventListener("click", function () {
    if (!current.length) { return; }
    copyText(plainList()).then(function () {
      els.copyAll.textContent = "Copied!";
      window.setTimeout(function () { els.copyAll.textContent = "Copy all titles"; }, 1400);
    });
  });

  els.download.addEventListener("click", function () {
    if (!current.length) { return; }
    var blob = new Blob([plainList() + "\n"], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "youtube-title-ideas.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  });

  /* ------------------------------------------------------------------ *
   * Clear / events
   * ------------------------------------------------------------------ */
  els.clear.addEventListener("click", function () {
    els.topic.value = "";
    els.audience.value = "";
    els.format.value = "auto";
    els.tone.value = "clear";
    els.count.value = "8";
    els.numbers.checked = true;
    els.year.checked = true;
    els.caps.checked = false;
    els.norepeat.checked = true;
    current = [];
    seenTitles = [];
    els.body.innerHTML = "";
    els.wrap.classList.add("d-none");
    els.empty.classList.remove("d-none");
    hideAlert();
    els.topic.classList.remove("is-invalid");
    els.topic.focus();
  });

  els.generate.addEventListener("click", generate);

  els.topic.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });

  els.topic.addEventListener("input", function () {
    if (cleanTopic(els.topic.value).length >= 2) {
      els.topic.classList.remove("is-invalid");
    }
  });

  window.addEventListener("resize", function () {
    if (current.length) { drawChart(current); }
  });
})();
