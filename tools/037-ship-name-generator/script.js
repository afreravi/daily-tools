(function () {
  "use strict";

  var STYLE_LABELS = {
    classic: "Classic",
    romantic: "Romantic",
    celebrity: "Celebrity",
    cute: "Cute",
    nature: "Nature",
    funny: "Funny"
  };

  var NATURE_TOKENS = ["rose", "moon", "sky", "rain", "star", "leaf", "sun", "wave", "bloom", "fern"];
  var FUNNY_TOKENS = ["zilla", "saurus", "tron", "face", "pants", "oops", "inator", "mcgiggle", "nado", "stein"];
  var SOFT_ENDINGS = ["ie", "a", "o", "elle", "ina"];

  var els = {
    nameA: document.getElementById("nameA"),
    nameB: document.getElementById("nameB"),
    count: document.getElementById("count"),
    generate: document.getElementById("generateBtn"),
    reset: document.getElementById("resetBtn"),
    copyAll: document.getElementById("copyAllBtn"),
    results: document.getElementById("results"),
    error: document.getElementById("errorBox"),
    statBest: document.getElementById("statBest"),
    statScore: document.getElementById("statScore"),
    statCount: document.getElementById("statCount"),
    statStyle: document.getElementById("statStyle"),
    chart: document.getElementById("shipChart"),
    caption: document.getElementById("chartCaption")
  };

  var current = { names: [], a: "", b: "" };

  function lettersOnly(value) {
    return (value || "").toLowerCase().replace(/[^a-z]/g, "");
  }

  function titleCase(word) {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function selectedStyle() {
    var checked = document.querySelector('input[name="style"]:checked');
    return checked ? checked.value : "classic";
  }

  function showError(message) {
    els.error.textContent = message;
    els.error.classList.remove("d-none");
  }

  function clearError() {
    els.error.textContent = "";
    els.error.classList.add("d-none");
  }

  // Rough readability score: rewards medium length and smooth vowel flow.
  function scoreName(name) {
    var len = name.length;
    var lenScore;
    if (len >= 5 && len <= 9) {
      lenScore = 100;
    } else if (len < 5) {
      lenScore = 100 - (5 - len) * 9;
    } else {
      lenScore = 100 - (len - 9) * 6;
    }

    var run = 0;
    var maxRun = 0;
    for (var i = 0; i < len; i++) {
      if (/[aeiouy]/.test(name.charAt(i))) {
        run = 0;
      } else {
        run++;
        if (run > maxRun) maxRun = run;
      }
    }
    var flow = 100 - Math.max(0, maxRun - 2) * 13;

    // Small deterministic spread so equally shaped names do not tie exactly.
    var hash = 0;
    for (var j = 0; j < len; j++) {
      hash = (hash * 31 + name.charCodeAt(j)) % 97;
    }
    var spread = (hash % 9) - 4;

    var score = Math.round(0.45 * lenScore + 0.55 * flow + spread);
    if (score > 99) score = 99;
    if (score < 34) score = 34;
    return score;
  }

  function pairBlends(a, b) {
    var out = [];
    var i, j;
    for (i = 1; i < a.length; i++) {
      for (j = 1; j < b.length; j++) {
        out.push({ text: a.slice(0, i) + b.slice(j), kind: "blend" });
        out.push({ text: b.slice(0, j) + a.slice(i), kind: "reverse" });
      }
    }
    return out;
  }

  function baseBlends(a, b) {
    var out = pairBlends(a, b);
    // Whole-name joins are always worth offering.
    out.push({ text: a + b.slice(-2), kind: "blend" });
    out.push({ text: b.slice(0, 2) + a, kind: "reverse" });
    return out;
  }

  function styleCandidates(style, a, b) {
    var bases = baseBlends(a, b);
    var out = [];
    var i, cand, token;

    if (style === "classic") {
      for (i = 0; i < bases.length; i++) {
        if (bases[i].text.length >= 4 && bases[i].text.length <= 12) out.push(bases[i].text);
      }
    } else if (style === "celebrity") {
      bases.sort(function (x, y) { return x.text.length - y.text.length; });
      for (i = 0; i < bases.length; i++) {
        if (bases[i].text.length >= 4 && bases[i].text.length <= 7) out.push(bases[i].text);
      }
    } else if (style === "romantic") {
      for (i = 0; i < bases.length; i++) {
        cand = bases[i].text;
        if (/[aeiou]/.test(cand.charAt(Math.max(1, Math.floor(cand.length / 2))))) out.push(cand);
      }
      out.push(a.slice(0, 2) + "l" + b.slice(-2));
      out.push(a.slice(0, 2) + "r" + b.slice(-2));
      for (i = 0; i < SOFT_ENDINGS.length; i++) {
        out.push(a.slice(0, 2) + b.slice(-2) + SOFT_ENDINGS[i]);
      }
    } else if (style === "cute") {
      for (i = 0; i < bases.length; i++) {
        if (bases[i].text.length >= 4 && bases[i].text.length <= 9) out.push(bases[i].text);
      }
      out.push(a.slice(0, 2) + b.slice(-2) + b.slice(-2));
      out.push(a.slice(0, 3) + b.slice(-1) + b.slice(-1));
      out.push(a.slice(0, 2) + b.slice(-2) + "ie");
    } else if (style === "nature") {
      for (i = 0; i < NATURE_TOKENS.length; i++) {
        token = NATURE_TOKENS[i];
        out.push(a.slice(0, 2) + token);
        out.push(b.slice(0, 2) + token);
        out.push(a.slice(0, 1) + b.slice(-1) + token);
      }
    } else if (style === "funny") {
      for (i = 0; i < FUNNY_TOKENS.length; i++) {
        token = FUNNY_TOKENS[i];
        out.push(a.slice(0, 3) + token);
        out.push(b.slice(0, 3) + token);
        out.push(a.slice(0, 2) + b.slice(-2) + token);
      }
    }

    if (!out.length) {
      out.push(a.slice(0, 2) + b.slice(-2));
      out.push(b.slice(0, 2) + a.slice(-2));
    }
    return out;
  }

  function buildNames(a, b, style, count) {
    var raw = styleCandidates(style, a, b);
    var seen = {};
    var scored = [];
    for (var i = 0; i < raw.length; i++) {
      var text = lettersOnly(raw[i]);
      if (text.length < 3) continue;
      if (seen[text]) continue;
      seen[text] = true;
      scored.push({ name: titleCase(text), score: scoreName(text) });
    }
    scored.sort(function (x, y) {
      if (y.score !== x.score) return y.score - x.score;
      return x.name.length - y.name.length;
    });
    return scored.slice(0, count);
  }

  function render(list, style) {
    els.results.innerHTML = "";
    if (!list.length) {
      els.results.innerHTML = '<p class="text-muted placeholder-text mb-0">No names could be built from those letters. Try slightly longer names.</p>';
      return;
    }

    var best = list[0].name;

    list.forEach(function (item, index) {
      var card = document.createElement("div");
      card.className = "ship-card" + (index === 0 ? " is-best" : "");

      var info = document.createElement("div");
      var nameEl = document.createElement("span");
      nameEl.className = "ship-name";
      nameEl.textContent = item.name;
      var meta = document.createElement("span");
      meta.className = "ship-meta d-block";
      meta.textContent = item.name.length + " letters" + (index === 0 ? " \u00b7 best match" : "");
      info.appendChild(nameEl);
      info.appendChild(meta);

      var score = document.createElement("span");
      score.className = "ship-score";
      score.textContent = item.score + "%";

      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "ship-copy";
      copyBtn.textContent = "Copy";
      copyBtn.setAttribute("aria-label", "Copy " + item.name);
      copyBtn.addEventListener("click", function () {
        copyText(item.name, copyBtn);
      });

      card.appendChild(info);
      card.appendChild(score);
      card.appendChild(copyBtn);
      els.results.appendChild(card);
    });

    els.statBest.textContent = best;
    els.statScore.textContent = list[0].score + "%";
    els.statCount.textContent = list.length;
    els.statStyle.textContent = STYLE_LABELS[style] || "Classic";

    drawChart(list);
  }

  function drawChart(list) {
    var canvas = els.chart;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 600;
    var cssHeight = 260;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 34;
    var padBottom = 44;
    var padTop = 12;
    var chartW = cssWidth - padLeft - 10;
    var chartH = cssHeight - padBottom - padTop;

    // Gridlines and axis labels.
    ctx.strokeStyle = "#e4d9ef";
    ctx.fillStyle = "#6b5a7a";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    for (var g = 0; g <= 4; g++) {
      var val = g * 25;
      var y = padTop + chartH - (val / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + chartW, y);
      ctx.stroke();
      ctx.fillText(val + "%", padLeft - 6, y + 4);
    }

    var n = list.length;
    var slot = chartW / n;
    var barW = Math.min(slot * 0.6, 46);

    for (var i = 0; i < n; i++) {
      var item = list[i];
      var barH = (item.score / 100) * chartH;
      var x = padLeft + slot * i + (slot - barW) / 2;
      var y2 = padTop + chartH - barH;

      ctx.fillStyle = i === 0 ? "#60089c" : "#8a35c4";
      ctx.fillRect(x, y2, barW, barH);

      ctx.fillStyle = "#4a0679";
      ctx.textAlign = "center";
      ctx.fillText(item.score + "%", x + barW / 2, y2 - 4);

      ctx.save();
      ctx.translate(x + barW / 2, padTop + chartH + 14);
      ctx.rotate(-Math.PI / 5);
      ctx.fillStyle = "#35273f";
      ctx.textAlign = "right";
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    }
  }

  function copyText(text, button) {
    var done = function () {
      if (!button) return;
      var original = button.textContent;
      button.textContent = "Copied";
      window.setTimeout(function () { button.textContent = original; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "absolute";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(area);
    done();
  }

  function generate() {
    clearError();
    var a = lettersOnly(els.nameA.value);
    var b = lettersOnly(els.nameB.value);

    if (!a && !b) {
      showError("Please enter two names to build a ship name.");
      return;
    }
    if (!a || !b) {
      showError("Please enter both names \u2014 a ship name needs two.");
      return;
    }
    if (a.length < 2 || b.length < 2) {
      showError("Each name needs at least two letters.");
      return;
    }

    var style = selectedStyle();
    var count = parseInt(els.count.value, 10);
    if (isNaN(count) || count < 1) count = 9;

    var list = buildNames(a, b, style, count);
    current.names = list;
    current.a = a;
    current.b = b;
    render(list, style);
    els.caption.textContent = "Top picks for " + titleCase(a) + " + " + titleCase(b) +
      " in the " + (STYLE_LABELS[style] || "Classic").toLowerCase() +
      " style. Scores are a playful blend of name balance and length, not a scientific measure.";
  }

  function reset() {
    els.nameA.value = "";
    els.nameB.value = "";
    els.count.value = "9";
    document.getElementById("style-classic").checked = true;
    clearError();
    els.results.innerHTML = '<p class="text-muted placeholder-text mb-0">Enter two names and press <strong>Create ship names</strong>. Your couple names will appear here.</p>';
    els.statBest.textContent = "--";
    els.statScore.textContent = "--";
    els.statCount.textContent = "0";
    els.statStyle.textContent = "Classic";
    els.caption.textContent = "Scores are a playful blend of name balance and length, not a scientific measure.";
    var canvas = els.chart;
    if (canvas && canvas.getContext) {
      var ctx = canvas.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    els.nameA.focus();
  }

  els.generate.addEventListener("click", generate);
  els.reset.addEventListener("click", reset);
  els.copyAll.addEventListener("click", function () {
    if (!current.names.length) return;
    var text = current.names.map(function (item) { return item.name; }).join(", ");
    copyText(text, els.copyAll);
  });

  els.nameA.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); els.nameB.focus(); }
  });
  els.nameB.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });

  window.addEventListener("resize", function () {
    if (current.names.length) drawChart(current.names);
  });
})();
