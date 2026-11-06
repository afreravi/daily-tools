(function () {
  "use strict";

  var MAX_LEN = 300;

  var SUPER = {
    "0": "\u2070", "1": "\u00b9", "2": "\u00b2", "3": "\u00b3", "4": "\u2074",
    "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079",
    "+": "\u207a", "-": "\u207b", "=": "\u207c", "(": "\u207d", ")": "\u207e",
    "a": "\u1d43", "b": "\u1d47", "c": "\u1d9c", "d": "\u1d48", "e": "\u1d49",
    "f": "\u1da0", "g": "\u1d4d", "h": "\u02b0", "i": "\u2071", "j": "\u02b2",
    "k": "\u1d4f", "l": "\u02e1", "m": "\u1d50", "n": "\u207f", "o": "\u1d52",
    "p": "\u1d56", "r": "\u02b3", "s": "\u02e2", "t": "\u1d57", "u": "\u1d58",
    "v": "\u1d5b", "w": "\u02b7", "x": "\u02e3", "y": "\u02b8", "z": "\u1dbb"
  };

  var SUB = {
    "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084",
    "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089",
    "+": "\u208a", "-": "\u208b", "=": "\u208c", "(": "\u208d", ")": "\u208e",
    "a": "\u2090", "e": "\u2091", "h": "\u2095", "i": "\u1d62", "j": "\u2c7c",
    "k": "\u2096", "l": "\u2097", "m": "\u2098", "n": "\u2099", "o": "\u2092",
    "p": "\u209a", "r": "\u1d63", "s": "\u209b", "t": "\u209c", "u": "\u1d64",
    "v": "\u1d65", "x": "\u2093"
  };

  var form = document.getElementById("tinyForm");
  var input = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var errorBox = document.getElementById("errorBox");
  var results = document.getElementById("results");
  var resultList = document.getElementById("resultList");
  var keepUnmapped = document.getElementById("keepUnmapped");
  var autoConvert = document.getElementById("autoConvert");
  var sampleBtn = document.getElementById("sampleBtn");
  var coverageCanvas = document.getElementById("coverageChart");
  var coverageSummary = document.getElementById("coverageSummary");

  function convert(text, map) {
    var out = "";
    var converted = 0;
    var unchanged = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var lower = ch.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(map, lower)) {
        out += map[lower];
        converted++;
      } else if (ch === "\n" || ch === " " || ch === "\t") {
        out += ch;
      } else {
        if (keepUnmapped.checked) { out += ch; }
        unchanged++;
      }
    }
    return { text: out, converted: converted, unchanged: unchanged };
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function renderResult(label, value, index) {
    var card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML =
      '<div class="result-head">' +
        '<span class="result-label">' + escapeHtml(label) + "</span>" +
        '<button type="button" class="btn btn-outline-secondary btn-copy" data-index="' + index + '">Copy</button>' +
      "</div>" +
      '<div class="result-output" id="out-' + index + '"></div>';
    card.querySelector(".result-output").textContent = value || "\u2014";
    resultList.appendChild(card);
  }

  function build(stats) {
    var style = form.querySelector('input[name="tinyStyle"]:checked').value;
    resultList.innerHTML = "";
    var outputs = [];

    if (style === "super" || style === "both") {
      var s = convert(input.value, SUPER);
      outputs.push({ label: "Superscript", text: s.text, stats: s });
    }
    if (style === "sub" || style === "both") {
      var b = convert(input.value, SUB);
      outputs.push({ label: "Subscript", text: b.text, stats: b });
    }

    outputs.forEach(function (o, i) {
      renderResult(o.label, o.text, i);
    });

    var base = outputs[0].stats;
    document.getElementById("statTotal").textContent = input.value.length;
    document.getElementById("statConverted").textContent = base.converted;
    document.getElementById("statUnchanged").textContent = base.unchanged;
    var pct = input.value.length ? Math.round((base.converted / input.value.length) * 100) : 0;
    document.getElementById("statCoverage").textContent = pct + "%";
    coverageSummary.textContent =
      pct + "% of characters were converted. " +
      (base.unchanged ? base.unchanged + " had no tiny form and were kept as normal text." : "Every character had a tiny form.");

    results.classList.remove("d-none");
    drawChart(base.converted, base.unchanged, input.value.length);
  }

  function drawChart(converted, unchanged, total) {
    var ctx = coverageCanvas.getContext("2d");
    if (!ctx) { return; }
    var w = coverageCanvas.width;
    var h = coverageCanvas.height;
    ctx.clearRect(0, 0, w, h);

    var bars = [
      { label: "Converted", value: converted, color: "#60089c" },
      { label: "Unchanged", value: unchanged, color: "#cfa8ea" }
    ];
    var max = Math.max(converted, unchanged, 1);
    var chartLeft = 110;
    var chartRight = w - 30;
    var barH = 42;
    var gap = 34;
    var top = 26;

    ctx.fillStyle = "#221b2b";
    ctx.font = "bold 13px Segoe UI, Arial, sans-serif";
    ctx.fillText("Characters by outcome (total " + total + ")", chartLeft - 90, 16);

    bars.forEach(function (bar, i) {
      var y = top + i * (barH + gap);
      var width = Math.round(((chartRight - chartLeft) * bar.value) / max);

      ctx.fillStyle = "#6a6273";
      ctx.font = "13px Segoe UI, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(bar.label, chartLeft - 12, y + barH / 2 + 5);
      ctx.textAlign = "left";

      ctx.fillStyle = "#f1e9f8";
      roundRect(ctx, chartLeft, y, chartRight - chartLeft, barH, 6);
      ctx.fill();

      ctx.fillStyle = bar.color;
      roundRect(ctx, chartLeft, y, Math.max(width, 2), barH, 6);
      ctx.fill();

      ctx.fillStyle = "#221b2b";
      ctx.font = "bold 13px Segoe UI, Arial, sans-serif";
      ctx.fillText(String(bar.value), Math.min(chartLeft + width + 8, chartRight - 4), y + barH / 2 + 5);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function run() {
    var value = input.value;
    clearError();

    if (!value.trim()) {
      showError("Please enter some text before generating tiny text.");
      results.classList.add("d-none");
      return;
    }
    if (value.length > MAX_LEN) {
      showError("That is " + value.length + " characters. Please keep it under " + MAX_LEN + " so the result stays readable.");
      return;
    }
    if (value.trim().replace(/[^a-z0-9]/gi, "") === "") {
      showError("No letters or digits were found. Tiny text only applies to letters, digits and a few symbols.");
      results.classList.add("d-none");
      return;
    }
    build();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    run();
  });

  input.addEventListener("input", function () {
    charCount.textContent = input.value.length;
    if (autoConvert.checked && input.value.trim()) { run(); }
  });

  form.addEventListener("change", function () {
    if (!results.classList.contains("d-none") && input.value.trim()) { run(); }
  });

  resultList.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-copy");
    if (!btn) { return; }
    var out = document.getElementById("out-" + btn.getAttribute("data-index"));
    if (!out) { return; }
    var text = out.textContent;
    var done = function () {
      btn.textContent = "Copied";
      btn.classList.add("copied");
      setTimeout(function () {
        btn.textContent = "Copy";
        btn.classList.remove("copied");
      }, 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  });

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (err) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  sampleBtn.addEventListener("click", function () {
    input.value = "keep it tiny 2026";
    charCount.textContent = input.value.length;
    run();
  });

  form.addEventListener("reset", function () {
    setTimeout(function () {
      charCount.textContent = "0";
      clearError();
      results.classList.add("d-none");
      resultList.innerHTML = "";
    }, 0);
  });
})();
