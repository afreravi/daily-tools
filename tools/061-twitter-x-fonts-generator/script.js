(function () {
  "use strict";

  var MAX_INPUT = 90;
  var HANDLE_LIMIT = 15;

  /* ---------- character mapping helpers ---------- */

  // Build a mapper from three contiguous Unicode blocks.
  // When upperStart is null, uppercase letters reuse the lowercase block so the
  // style still converts fully even if its own capital block has reserved gaps.
  function blockMap(lowerStart, upperStart, digitStart) {
    return function (ch) {
      var c = ch.charCodeAt(0);
      if (c >= 97 && c <= 122) return String.fromCodePoint(lowerStart + (c - 97));
      if (c >= 65 && c <= 90) {
        return String.fromCodePoint((upperStart === null ? lowerStart : upperStart) + (c - 65));
      }
      if (digitStart && c >= 48 && c <= 57) return String.fromCodePoint(digitStart + (c - 48));
      return ch;
    };
  }

  function tableMap(table, digits) {
    return function (ch) {
      var lower = ch.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(table, lower)) return table[lower];
      if (digits && Object.prototype.hasOwnProperty.call(digits, ch)) return digits[ch];
      return ch;
    };
  }

  function combiningMap(mark) {
    return function (ch) {
      if (ch === " " || ch === "\n" || ch === "\t") return ch;
      return ch + mark;
    };
  }

  var SMALL_CAPS = {
    a: "\u1D00", b: "\u0299", c: "\u1D04", d: "\u1D05", e: "\u1D07", f: "\uA730",
    g: "\u0262", h: "\u029C", i: "\u026A", j: "\u1D0A", k: "\u1D0B", l: "\u029F",
    m: "\u1D0D", n: "\u0274", o: "\u1D0F", p: "\u1D18", q: "\u01EB", r: "\u0280",
    s: "\uA731", t: "\u1D1B", u: "\u1D1C", v: "\u1D20", w: "\u1D21", x: "x",
    y: "\u028F", z: "\u1D22"
  };

  var SUPERSCRIPT = {
    a: "\u1D43", b: "\u1D47", c: "\u1D9C", d: "\u1D48", e: "\u1D49", f: "\u1DA0",
    g: "\u1D4D", h: "\u02B0", i: "\u2071", j: "\u02B2", k: "\u1D4F", l: "\u02E1",
    m: "\u1D50", n: "\u207F", o: "\u1D52", p: "\u1D56", q: "q", r: "\u02B3",
    s: "\u02E2", t: "\u1D57", u: "\u1D58", v: "\u1D5B", w: "\u02B7", x: "\u02E3",
    y: "\u02B8", z: "\u1DBB"
  };
  var SUPERSCRIPT_DIGITS = {
    "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
    "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079"
  };

  var SUBSCRIPT = {
    a: "\u2090", e: "\u2091", h: "\u2095", i: "\u1D62", j: "\u2C7C", k: "\u2096",
    l: "\u2097", m: "\u2098", n: "\u2099", o: "\u2092", p: "\u209A", r: "\u1D63",
    s: "\u209B", t: "\u209C", u: "\u1D64", v: "\u1D65", x: "\u2093"
  };
  var SUBSCRIPT_DIGITS = {
    "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084",
    "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089"
  };

  var FLIP = {
    a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183",
    h: "\u0265", i: "\u1D09", j: "\u027E", k: "\u029E", l: "l", m: "\u026F", n: "u",
    o: "o", p: "d", q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n", v: "\u028C",
    w: "\u028D", x: "x", y: "\u028E", z: "z",
    ".": "\u02D9", ",": "'", "?": "\u00BF", "!": "\u00A1", "'": ",", "\"": "\u201E",
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<",
    "&": "\u214B", "_": "\u203E"
  };
  var FLIP_DIGITS = { "0": "0", "1": "\u0196", "2": "\u1105", "3": "\u0190", "4": "\u3123", "5": "\u03DB", "6": "9", "7": "\u3125", "8": "8", "9": "6" };

  function upsideDown(text) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      var lower = ch.toLowerCase();
      if (FLIP_DIGITS[ch]) out = FLIP_DIGITS[ch] + out;
      else if (FLIP[lower]) out = FLIP[lower] + out;
      else if (ch === " ") out = " " + out;
      else out = ch + out;
    }
    return out;
  }

  function spaced(text) {
    return text.split("").join("\u2005");
  }

  /* ---------- style library ---------- */

  var STYLES = [
    { name: "Bold", cat: "bold", map: blockMap(0x1D400, 0x1D400, 0x1D7CE) },
    { name: "Italic", cat: "italic", map: blockMap(0x1D434, 0x1D434, null) },
    { name: "Bold Italic", cat: "bold italic", map: blockMap(0x1D468, 0x1D468, null) },
    { name: "Script", cat: "script", map: blockMap(0x1D4B6, null, null) },
    { name: "Bold Script", cat: "script", map: blockMap(0x1D4EA, 0x1D4D0, null) },
    { name: "Fraktur (Gothic)", cat: "decorative", map: blockMap(0x1D51E, null, null) },
    { name: "Bold Fraktur", cat: "decorative", map: blockMap(0x1D586, 0x1D56C, null) },
    { name: "Double-Struck", cat: "decorative", map: blockMap(0x1D552, null, 0x1D7D8) },
    { name: "Sans-Serif", cat: "sans", map: blockMap(0x1D5BA, 0x1D5A0, 0x1D7E2) },
    { name: "Sans-Serif Bold", cat: "bold", map: blockMap(0x1D5EE, 0x1D5D4, 0x1D7EC) },
    { name: "Sans-Serif Italic", cat: "italic", map: blockMap(0x1D622, 0x1D608, null) },
    { name: "Monospace", cat: "mono", map: blockMap(0x1D68A, 0x1D670, 0x1D7F6) },
    { name: "Fullwidth", cat: "mono", map: blockMap(0xFF41, 0xFF21, 0xFF10) },
    { name: "Circled (Bubble)", cat: "enclosed", map: blockMap(0x24D0, 0x24B6, null) },
    { name: "Squared", cat: "enclosed", map: blockMap(0x1F130, 0x1F130, null) },
    { name: "Negative Circled", cat: "enclosed", map: blockMap(0x1F150, 0x1F150, null) },
    { name: "Parenthesized", cat: "enclosed", map: blockMap(0x249C, null, null) },
    { name: "Small Caps", cat: "decorative", map: tableMap(SMALL_CAPS, null) },
    { name: "Superscript", cat: "special", map: tableMap(SUPERSCRIPT, SUPERSCRIPT_DIGITS) },
    { name: "Subscript", cat: "special", map: tableMap(SUBSCRIPT, SUBSCRIPT_DIGITS) },
    { name: "Upside Down", cat: "special", map: function (t) { return upsideDown(t); } },
    { name: "Strikethrough", cat: "decorative", map: combiningMap("\u0336") },
    { name: "Underline", cat: "decorative", map: combiningMap("\u0332") },
    { name: "Slashed", cat: "decorative", map: combiningMap("\u0338") },
    { name: "Wide Spacing", cat: "special", map: function (t) { return spaced(t); } },
    { name: "Flag Letters", cat: "special", map: blockMap(0x1F1E6, 0x1F1E6, null) }
  ];

  /* ---------- dom ---------- */

  var $ = function (id) { return document.getElementById(id); };
  var textInput = $("textInput");
  var charCount = $("charCount");
  var styleFilter = $("styleFilter");
  var usernameCheck = $("usernameCheck");
  var formMessage = $("formMessage");
  var resultsEl = $("results");
  var copyAllBtn = $("copyAllBtn");
  var clearBtn = $("clearBtn");
  var statStyles = $("statStyles");
  var statChars = $("statChars");
  var statBest = $("statBest");
  var usernameResult = $("usernameResult");
  var canvas = $("coverageChart");

  var current = []; // { name, value, coverage }

  function convert(text, style) { return style.map(text); }

  function coverageOf(text, style) {
    var total = 0, changed = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (ch === " " || ch === "\n" || ch === "\t") continue;
      total++;
      if (convert(ch, style) !== ch) changed++;
    }
    if (!total) return 0;
    return Math.round((changed / total) * 100);
  }

  function showMessage(text, kind) {
    if (!text) { formMessage.className = "alert d-none mt-3 mb-0"; formMessage.textContent = ""; return; }
    formMessage.className = "alert alert-" + (kind || "success") + " mt-3 mb-0";
    formMessage.textContent = text;
  }

  function copyText(value, button) {
    function done() {
      if (!button) return;
      var original = button.textContent;
      button.textContent = "Copied";
      button.classList.add("btn-primary");
      button.classList.remove("btn-outline-secondary");
      setTimeout(function () {
        button.textContent = original;
        button.classList.remove("btn-primary");
        button.classList.add("btn-outline-secondary");
      }, 1200);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value, done); });
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    var ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  function visibleStyles() {
    var f = styleFilter.value;
    if (f === "all") return STYLES;
    return STYLES.filter(function (s) { return s.cat.indexOf(f) !== -1; });
  }

  function render() {
    var text = textInput.value;
    charCount.textContent = text.length;

    if (!text.trim()) {
      resultsEl.innerHTML = '<p class="text-muted mb-0">Your styled text will appear here.</p>';
      statStyles.textContent = "0";
      statChars.textContent = "0";
      statBest.textContent = "\u2014";
      current = [];
      drawChart([]);
      showMessage("", "");
      return;
    }

    var list = visibleStyles();
    current = list.map(function (style) {
      return { name: style.name, value: convert(text, style), coverage: coverageOf(text, style) };
    });

    var frag = document.createDocumentFragment();
    current.forEach(function (item) {
      var card = document.createElement("div");
      card.className = "style-card d-flex align-items-center justify-content-between";

      var body = document.createElement("div");
      body.className = "flex-grow-1";
      var name = document.createElement("div");
      name.className = "style-name";
      name.textContent = item.name + " \u00B7 " + item.coverage + "%";
      var preview = document.createElement("div");
      preview.className = "style-preview";
      preview.textContent = item.value;
      body.appendChild(name);
      body.appendChild(preview);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-outline-secondary style-copy";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy the " + item.name + " version");
      btn.addEventListener("click", function () { copyText(item.value, btn); });

      card.appendChild(body);
      card.appendChild(btn);
      frag.appendChild(card);
    });

    resultsEl.innerHTML = "";
    resultsEl.appendChild(frag);

    statStyles.textContent = String(current.length);
    statChars.textContent = String(text.length);
    var best = current.reduce(function (a, b) { return b.coverage > a.coverage ? b : a; }, current[0]);
    statBest.textContent = best.name + " (" + best.coverage + "%)";

    drawChart(current);
  }

  /* ---------- coverage chart ---------- */

  function drawChart(items) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 480;
    var cssHeight = 240;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var rows = items.slice().sort(function (a, b) { return b.coverage - a.coverage; }).slice(0, 8);

    if (!rows.length) {
      ctx.fillStyle = "#8a8394";
      ctx.font = "13px Segoe UI, Arial, sans-serif";
      ctx.fillText("Enter text to see style coverage.", 12, 30);
      return;
    }

    var labelW = 108;
    var chartW = cssWidth - labelW - 44;
    var rowH = Math.min(26, (cssHeight - 16) / rows.length);
    var barH = rowH - 8;

    rows.forEach(function (item, i) {
      var y = 10 + i * rowH;
      ctx.fillStyle = "#4a4352";
      ctx.font = "11px Segoe UI, Arial, sans-serif";
      ctx.textBaseline = "middle";
      var label = item.name.length > 17 ? item.name.slice(0, 16) + "\u2026" : item.name;
      ctx.fillText(label, 4, y + barH / 2 + 1);

      ctx.fillStyle = "#efe9f5";
      ctx.fillRect(labelW, y, chartW, barH);

      ctx.fillStyle = "#60089c";
      ctx.fillRect(labelW, y, Math.max(2, chartW * (item.coverage / 100)), barH);

      ctx.fillStyle = "#4a4352";
      ctx.fillText(item.coverage + "%", labelW + chartW + 6, y + barH / 2 + 1);
    });
  }

  /* ---------- username check ---------- */

  function checkUsername() {
    var value = usernameCheck.value;
    if (!value) { usernameResult.className = "small mt-3 d-none"; usernameResult.textContent = ""; return; }
    var valid = /^[A-Za-z0-9_]*$/.test(value);
    var len = value.length;
    usernameResult.className = "small mt-3";
    if (!valid) {
      usernameResult.innerHTML = '<span class="text-danger">Only letters, numbers and underscores are allowed in an X handle.</span>';
    } else if (len > HANDLE_LIMIT) {
      usernameResult.innerHTML = '<span class="text-danger">' + len + " characters \u2014 " + (len - HANDLE_LIMIT) + " over the 15-character X handle limit.</span>";
    } else {
      usernameResult.innerHTML = '<span style="color:#46056f">' + len + " of " + HANDLE_LIMIT + " characters \u2014 this fits an X handle.</span>";
    }
  }

  /* ---------- events ---------- */

  $("fontForm").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!textInput.value.trim()) {
      showMessage("Enter some text first \u2014 then your styled versions will appear below.", "warning");
      textInput.focus();
      return;
    }
    render();
    showMessage("Generated " + current.length + " styles. Use Copy on any card.", "success");
  });

  textInput.addEventListener("input", function () {
    if (textInput.value.length > MAX_INPUT) textInput.value = textInput.value.slice(0, MAX_INPUT);
    render();
  });

  styleFilter.addEventListener("change", render);
  usernameCheck.addEventListener("input", checkUsername);

  clearBtn.addEventListener("click", function () {
    textInput.value = "";
    usernameCheck.value = "";
    checkUsername();
    render();
    textInput.focus();
  });

  copyAllBtn.addEventListener("click", function () {
    if (!current.length) { showMessage("Nothing to copy yet \u2014 enter some text first.", "warning"); return; }
    var payload = current.map(function (i) { return i.name + ": " + i.value; }).join("\n");
    copyText(payload, copyAllBtn);
    showMessage("Copied all " + current.length + " styles to your clipboard.", "success");
  });

  window.addEventListener("resize", function () { drawChart(current); });

  render();
})();
