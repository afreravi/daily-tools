(function () {
  "use strict";

  var A_UPPER = 65;
  var A_LOWER = 97;

  function buildMap(upperStart, lowerStart, digitStart, upperExc, lowerExc, digitExc) {
    var map = {};
    var i;
    if (upperStart) {
      for (i = 0; i < 26; i++) {
        var key = String.fromCharCode(A_UPPER + i);
        var code = upperStart + i;
        if (upperExc && upperExc[key] !== undefined) code = upperExc[key];
        map[key] = String.fromCodePoint(code);
      }
    }
    if (lowerStart) {
      for (i = 0; i < 26; i++) {
        var lkey = String.fromCharCode(A_LOWER + i);
        var lcode = lowerStart + i;
        if (lowerExc && lowerExc[lkey] !== undefined) lcode = lowerExc[lkey];
        map[lkey] = String.fromCodePoint(lcode);
      }
    }
    if (digitStart) {
      for (i = 0; i < 10; i++) {
        var dkey = String.fromCharCode(48 + i);
        var dcode = digitStart + i;
        if (digitExc && digitExc[dkey] !== undefined) dcode = digitExc[dkey];
        map[dkey] = String.fromCodePoint(dcode);
      }
    }
    return map;
  }

  function manual(pairs) {
    var map = {};
    Object.keys(pairs).forEach(function (k) { map[k] = pairs[k]; });
    return map;
  }

  function combining(mark) {
    return function (text) {
      var out = "";
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        out += ch;
        if (ch.trim() !== "") out += mark;
      }
      return out;
    };
  }

  var scriptUpper = { B: 0x212C, E: 0x2130, F: 0x2131, H: 0x210B, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211B };
  var scriptLower = { e: 0x212F, g: 0x210A, o: 0x2134 };
  var frakturUpper = { C: 0x212D, H: 0x210C, I: 0x2111, R: 0x211C, Z: 0x2128 };
  var doubleUpper = { C: 0x2102, H: 0x210D, N: 0x2115, P: 0x2119, Q: 0x211A, R: 0x211D, Z: 0x2124 };
  var italicLower = { h: 0x210E };
  var circledDigits = { "0": 0x24EA, "1": 0x2460, "2": 0x2461, "3": 0x2462, "4": 0x2463, "5": 0x2464, "6": 0x2465, "7": 0x2466, "8": 0x2467, "9": 0x2468 };

  var smallCaps = manual({
    a: "\u1D00", b: "\u0299", c: "\u1D04", d: "\u1D05", e: "\u1D07", f: "\uA730", g: "\u0262",
    h: "\u029C", i: "\u026A", j: "\u1D0A", k: "\u1D0B", l: "\u029F", m: "\u1D0D", n: "\u0274",
    o: "\u1D0F", p: "\u1D18", q: "\u01EB", r: "\u0280", s: "\uA731", t: "\u1D1B", u: "\u1D1C",
    v: "\u1D20", w: "\u1D21", x: "x", y: "\u028F", z: "\u1D22"
  });

  var superscript = manual({
    a: "\u1D43", b: "\u1D47", c: "\u1D9C", d: "\u1D48", e: "\u1D49", f: "\u1DA0", g: "\u1D4D",
    h: "\u02B0", i: "\u2071", j: "\u02B2", k: "\u1D4F", l: "\u02E1", m: "\u1D50", n: "\u207F",
    o: "\u1D52", p: "\u1D56", q: "q", r: "\u02B3", s: "\u02E2", t: "\u1D57", u: "\u1D58",
    v: "\u1D5B", w: "\u02B7", x: "\u02E3", y: "\u02B8", z: "\u1DBB",
    "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
    "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079"
  });

  var upsideDownMap = manual({
    a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183", h: "\u0265",
    i: "\u1D09", j: "\u027E", k: "\u029E", l: "l", m: "\u026F", n: "u", o: "o", p: "d", q: "b",
    r: "\u0279", s: "s", t: "\u0287", u: "n", v: "\u028C", w: "\u028D", x: "x", y: "\u028E", z: "z",
    "0": "0", "1": "\u0196", "2": "2", "3": "\u0190", "4": "4", "5": "\u03DB", "6": "9", "7": "7",
    "8": "8", "9": "6", ".": "\u02D9", ",": "'", "?": "\u00BF", "!": "\u00A1", "'": ",", "\"": "\u201E",
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<", "&": "\u214B", "_": "\u203E"
  });

  var STYLES = [
    { name: "Bold", map: buildMap(0x1D400, 0x1D41A, 0x1D7CE) },
    { name: "Italic", map: buildMap(0x1D434, 0x1D44E, null, null, italicLower) },
    { name: "Bold italic", map: buildMap(0x1D468, 0x1D482, null) },
    { name: "Sans-serif", map: buildMap(0x1D5A0, 0x1D5BA, 0x1D7E2) },
    { name: "Sans-serif bold", map: buildMap(0x1D5D4, 0x1D5EE, 0x1D7EC) },
    { name: "Sans-serif italic", map: buildMap(0x1D608, 0x1D622, null) },
    { name: "Sans-serif bold italic", map: buildMap(0x1D63C, 0x1D656, null) },
    { name: "Script", map: buildMap(0x1D49C, 0x1D4B6, null, scriptUpper, scriptLower) },
    { name: "Bold script", map: buildMap(0x1D4D0, 0x1D4EA, null) },
    { name: "Gothic", map: buildMap(0x1D504, 0x1D51E, null, frakturUpper) },
    { name: "Bold gothic", map: buildMap(0x1D56C, 0x1D586, null) },
    { name: "Double-struck", map: buildMap(0x1D538, 0x1D552, 0x1D7D8, doubleUpper) },
    { name: "Monospace", map: buildMap(0x1D670, 0x1D68A, 0x1D7F6) },
    { name: "Fullwidth", map: buildMap(0xFF21, 0xFF41, 0xFF10) },
    { name: "Circled", map: buildMap(0x24B6, 0x24D0, 0x2460, null, null, circledDigits) },
    { name: "Squared", map: buildMap(0x1F130, null, null) },
    { name: "Negated circled", map: buildMap(0x1F150, null, null) },
    { name: "Parenthesized", map: buildMap(0x1F110, null, null) },
    { name: "Regional indicator", map: buildMap(0x1F1E6, null, null) },
    { name: "Small caps", map: smallCaps, sample: "Small Caps" },
    { name: "Superscript", map: superscript },
    { name: "Upside down", transform: function (t) {
        var flipped = "";
        for (var i = 0; i < t.length; i++) {
          var c = t[i];
          flipped += upsideDownMap[c] || upsideDownMap[c.toLowerCase()] || c;
        }
        return flipped.split("").reverse().join("");
      } },
    { name: "Strikethrough", transform: combining("\u0336") },
    { name: "Underline", transform: combining("\u0332") },
    { name: "Double underline", transform: combining("\u0333") },
    { name: "Slash through", transform: combining("\u0338") },
    { name: "Overline", transform: combining("\u0305") },
    { name: "Wavy underline", transform: combining("\u0330") },
    { name: "Spaced out", transform: function (t) { return t.split("").join(" "); } },
    { name: "Dot separated", transform: function (t) { return t.split("").join("\u00B7"); } },
    { name: "Bracket boxed", transform: function (t) {
        return t.split("").map(function (c) { return c.trim() ? "[" + c + "]" : c; }).join("");
      } }
  ];

  function applyMap(text, map) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      out += map[ch] !== undefined ? map[ch] : ch;
    }
    return out;
  }

  function applyStyle(text, style) {
    if (style.transform) return style.transform(text);
    return applyMap(text, style.map);
  }

  // Share of non-space source characters a style actually swaps for a new glyph.
  // Combining styles touch every character, so they always report 100%.
  function countConverted(text, style) {
    if (!style || !style.map) return style && style.transform ? 100 : 0;
    var chars = Array.from(text);
    var total = 0;
    var changed = 0;
    chars.forEach(function (ch) {
      if (ch.trim() === "") return;
      total++;
      var mapped = style.map[ch];
      if (mapped !== undefined && mapped !== ch) changed++;
    });
    if (total === 0) return 0;
    return Math.round((changed / total) * 100);
  }

  var form = document.getElementById("styleForm");
  var results = document.getElementById("results");
  var errorBox = document.getElementById("formError");
  var textInput = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var searchStyle = document.getElementById("searchStyle");
  var trimToggle = document.getElementById("trimToggle");
  var keepLineToggle = document.getElementById("keepLineToggle");
  var styleList = document.getElementById("styleList");
  var summaryEl = document.getElementById("resultSummary");
  var chart = document.getElementById("coverageChart");

  var lastEntries = [];

  function prepareText(raw) {
    var text = raw;
    if (trimToggle.checked) text = text.replace(/^\s+|\s+$/g, "");
    if (!keepLineToggle.checked) text = text.replace(/\s*\n\s*/g, " ");
    return text;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
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

  function copyText(text, button, label) {
    var original = button ? button.textContent : "";
    function done() {
      if (button) {
        button.textContent = label || "Copied";
        setTimeout(function () { button.textContent = original; }, 1200);
      }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function renderStyles(text, filter) {
    var needle = (filter || "").trim().toLowerCase();
    styleList.innerHTML = "";
    lastEntries = [];

    STYLES.forEach(function (style) {
      if (needle && style.name.toLowerCase().indexOf(needle) === -1) return;
      var styled = applyStyle(text, style);
      lastEntries.push({ name: style.name, styled: styled, style: style });

      var col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4 mb-3";

      var card = document.createElement("div");
      card.className = "style-card p-3";

      var header = document.createElement("div");
      header.className = "d-flex justify-content-between align-items-center mb-2";
      var nameEl = document.createElement("span");
      nameEl.className = "style-name";
      nameEl.textContent = style.name;
      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "copy-one";
      copyBtn.textContent = "Copy";
      copyBtn.setAttribute("aria-label", "Copy " + style.name + " text");
      copyBtn.addEventListener("click", function () {
        copyText(styled, copyBtn, "Copied");
      });
      header.appendChild(nameEl);
      header.appendChild(copyBtn);

      var output = document.createElement("div");
      output.className = "style-output";
      output.textContent = styled;
      output.setAttribute("lang", "en");
      output.setAttribute("tabindex", "0");

      card.appendChild(header);
      card.appendChild(output);
      col.appendChild(card);
      styleList.appendChild(col);
    });

    return lastEntries.length;
  }

  function drawCoverage(text, entries) {
    var ctx = chart.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = chart.clientWidth || 600;
    var rowHeight = 24;
    var padTop = 10;
    var padBottom = 10;
    var cssHeight = padTop + padBottom + entries.length * rowHeight;
    chart.style.height = cssHeight + "px";
    chart.width = cssWidth * dpr;
    chart.height = cssHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var labelWidth = Math.min(150, cssWidth * 0.38);
    var valueWidth = 44;
    var barArea = cssWidth - labelWidth - valueWidth - 12;
    if (barArea < 20) barArea = 20;

    entries.forEach(function (entry, i) {
      var y = padTop + i * rowHeight;
      var pct = countConverted(text, entry.style);

      ctx.fillStyle = "#37313f";
      ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "left";
      var label = entry.name.length > 20 ? entry.name.slice(0, 19) + "\u2026" : entry.name;
      ctx.fillText(label, 0, y + 15);

      var trackX = labelWidth;
      ctx.fillStyle = "#f1e6fb";
      ctx.fillRect(trackX, y + 6, barArea, 11);

      var barWidth = Math.max(2, (pct / 100) * barArea);
      var gradient = ctx.createLinearGradient(trackX, 0, trackX + barArea, 0);
      gradient.addColorStop(0, "#60089c");
      gradient.addColorStop(1, "#b45cf0");
      ctx.fillStyle = gradient;
      ctx.fillRect(trackX, y + 6, barWidth, 11);

      ctx.fillStyle = "#45016f";
      ctx.font = "600 11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(pct + "%", cssWidth - 2, y + 15);
    });
  }

  function generate(event) {
    if (event) event.preventDefault();
    clearError();

    var text = prepareText(textInput.value);
    if (!text) {
      showError("Type or paste some text first \u2014 even a single word works.");
      results.classList.add("d-none");
      return;
    }
    if (text.length > 500) {
      showError("Please keep your text to 500 characters or fewer.");
      return;
    }

    var count = renderStyles(text, searchStyle.value);
    if (!count) {
      showError("No styles match that filter. Try a different word.");
      results.classList.add("d-none");
      return;
    }

    summaryEl.textContent = count + (count === 1 ? " style" : " styles") + " for \u201C" +
      (text.length > 60 ? text.slice(0, 57) + "\u2026" : text) + "\u201D";
    results.classList.remove("d-none");
    drawCoverage(text, lastEntries);
  }

  textInput.addEventListener("input", function () {
    charCount.textContent = textInput.value.length;
  });

  searchStyle.addEventListener("input", function () {
    if (!results.classList.contains("d-none") && textInput.value.trim()) {
      var text = prepareText(textInput.value);
      var count = renderStyles(text, searchStyle.value);
      summaryEl.textContent = count + (count === 1 ? " style" : " styles") +
        " match your filter";
      drawCoverage(text, lastEntries);
    }
  });

  form.addEventListener("submit", generate);

  form.addEventListener("reset", function () {
    clearError();
    results.classList.add("d-none");
    charCount.textContent = "0";
    lastEntries = [];
  });

  document.getElementById("copyAllBtn").addEventListener("click", function () {
    if (!lastEntries.length) return;
    var payload = lastEntries.map(function (e) { return e.name + ": " + e.styled; }).join("\n");
    copyText(payload, this, "Copied all");
  });

  document.getElementById("downloadBtn").addEventListener("click", function () {
    if (!lastEntries.length) return;
    var payload = lastEntries.map(function (e) { return e.name + ": " + e.styled; }).join("\n");
    var blob = new Blob([payload + "\n"], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "stylish-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  var resizeTimer;
  window.addEventListener("resize", function () {
    if (results.classList.contains("d-none") || !lastEntries.length) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      drawCoverage(prepareText(textInput.value), lastEntries);
    }, 150);
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
