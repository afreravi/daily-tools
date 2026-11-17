(function () {
  "use strict";

  var MAX_INPUT = 120;
  var FB_LIMITS = { profile: 50, page: 75, group: 75, none: 0 };
  var SAMPLES = [
    "Our summer sale starts today",
    "Weekend market in the old town",
    "Join the reading club",
    "New album out now",
    "Fresh coffee, every morning"
  ];
  var WORDS = ["bright", "cozy", "urban", "golden", "quiet", "wild", "north", "little",
    "paper", "sunny", "velvet", "green", "midnight", "copper", "salt", "amber"];

  /* ---------- mapping helpers ---------- */

  function blockMap(lowerStart, upperStart, digitStart, holes) {
    return function (ch) {
      var c = ch.charCodeAt(0);
      if (c >= 97 && c <= 122) return String.fromCodePoint(lowerStart + (c - 97));
      if (c >= 65 && c <= 90) {
        if (holes && holes[ch]) return holes[ch];
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

  function passThrough(ch) {
    return ch;
  }

  var SMALL_CAPS = {
    a: "\u1D00", b: "\u0299", c: "\u1D04", d: "\u1D05", e: "\u1D07", f: "\uA730",
    g: "\u0262", h: "\u029C", i: "\u026A", j: "\u1D0A", k: "\u1D0B", l: "\u029F",
    m: "\u1D0D", n: "\u0274", o: "\u1D0F", p: "\u1D18", q: "\u01EB", r: "\u0280",
    s: "\uA731", t: "\u1D1B", u: "\u1D1C", v: "\u1D20", w: "\u1D21", x: "x",
    y: "\u028F", z: "\u1D22"
  };

  var BUBBLE = {
    a: "\u24D0", b: "\u24D1", c: "\u24D2", d: "\u24D3", e: "\u24D4", f: "\u24D5",
    g: "\u24D6", h: "\u24D7", i: "\u24D8", j: "\u24D9", k: "\u24DA", l: "\u24DB",
    m: "\u24DC", n: "\u24DD", o: "\u24DE", p: "\u24DF", q: "\u24E0", r: "\u24E1",
    s: "\u24E2", t: "\u24E3", u: "\u24E4", v: "\u24E5", w: "\u24E6", x: "\u24E7",
    y: "\u24E8", z: "\u24E9"
  };

  var PARENTHESIZED = {
    a: "\u249C", b: "\u249D", c: "\u249E", d: "\u249F", e: "\u24A0", f: "\u24A1",
    g: "\u24A2", h: "\u24A3", i: "\u24A4", j: "\u24A5", k: "\u24A6", l: "\u24A7",
    m: "\u24A8", n: "\u24A9", o: "\u24AA", p: "\u24AB", q: "\u24AC", r: "\u24AD",
    s: "\u24AE", t: "\u24AF", u: "\u24B0", v: "\u24B1", w: "\u24B2", x: "\u24B3",
    y: "\u24B4", z: "\u24B5"
  };

  var CIRCLED_DIGITS = {
    "0": "\u24EA", "1": "\u2460", "2": "\u2461", "3": "\u2462", "4": "\u2463",
    "5": "\u2464", "6": "\u2465", "7": "\u2466", "8": "\u2467", "9": "\u2468"
  };

  var SCRIPT_HOLES = {
    B: "\u212C", E: "\u2130", F: "\u2131", H: "\u210B", I: "\u2110",
    L: "\u2112", M: "\u2133", R: "\u211B"
  };

  var FRAKTUR_HOLES = {
    C: "\u212D", H: "\u210C", I: "\u2111", R: "\u211C", Z: "\u2128"
  };

  var DOUBLE_STRUCK_HOLES = {
    C: "\u2102", H: "\u210D", N: "\u2115", P: "\u2119", Q: "\u211A", R: "\u211D", Z: "\u2124"
  };

  var STYLES = [
    { id: "bold-serif", name: "Bold serif", group: "bold", map: blockMap(0x1D41A, 0x1D400, 0x1D7CE) },
    { id: "bold-sans", name: "Bold sans", group: "bold", map: blockMap(0x1D5EE, 0x1D5D4, 0x1D7EC) },
    { id: "italic-serif", name: "Italic serif", group: "bold", map: blockMap(0x1D44E, 0x1D434, null, { h: "\u210E" }) },
    { id: "bold-italic", name: "Bold italic", group: "bold", map: blockMap(0x1D482, 0x1D468, 0x1D7D8) },
    { id: "bold-script", name: "Bold script", group: "script", map: blockMap(0x1D4EA, 0x1D4D0, null) },
    { id: "script", name: "Script", group: "script", map: blockMap(0x1D4B6, 0x1D49C, null, SCRIPT_HOLES) },
    { id: "bold-fraktur", name: "Bold gothic", group: "script", map: blockMap(0x1D586, 0x1D56C, null) },
    { id: "fraktur", name: "Gothic", group: "script", map: blockMap(0x1D51E, 0x1D504, null, FRAKTUR_HOLES) },
    { id: "sans", name: "Plain sans", group: "sans", map: blockMap(0x1D5A0, 0x1D5A0, 0x1D7E2) },
    { id: "sans-italic", name: "Italic sans", group: "sans", map: blockMap(0x1D622, 0x1D608, null) },
    { id: "sans-bold-italic", name: "Bold italic sans", group: "sans", map: blockMap(0x1D656, 0x1D63C, 0x1D7F6) },
    { id: "monospace", name: "Monospace", group: "sans", map: blockMap(0x1D68A, 0x1D670, 0x1D7F6) },
    { id: "fullwidth", name: "Fullwidth wide", group: "sans", map: blockMap(0xFF41, 0xFF21, 0xFF10) },
    { id: "double-struck", name: "Outline (double-struck)", group: "sans", map: blockMap(0x1D552, 0x1D538, 0x1D7D8, DOUBLE_STRUCK_HOLES) },
    { id: "small-caps", name: "Small caps", group: "decorative", map: tableMap(SMALL_CAPS) },
    { id: "bubble", name: "Bubble letters", group: "decorative", map: tableMap(BUBBLE, CIRCLED_DIGITS) },
    { id: "negative-circled", name: "Filled bubble", group: "decorative", map: blockMap(0x1F150, 0x1F150, null) },
    { id: "squared", name: "Squared letters", group: "decorative", map: blockMap(0x1F130, 0x1F130, null) },
    { id: "parenthesized", name: "Parenthesised", group: "decorative", map: tableMap(PARENTHESIZED) },
    { id: "regional", name: "Flag letters", group: "decorative", map: blockMap(0x1F1E6, 0x1F1E6, null) },
    { id: "math-bold-cap", name: "Tall caps", group: "decorative", map: blockMap(0x1D41A, 0x1D400, null) }
  ];

  /* ---------- elements ---------- */

  var form = document.getElementById("fontForm");
  var input = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var styleFilter = document.getElementById("styleFilter");
  var sizePreset = document.getElementById("sizePreset");
  var errorBox = document.getElementById("errorBox");
  var infoBox = document.getElementById("infoBox");
  var results = document.getElementById("results");
  var resultSummary = document.getElementById("resultSummary");
  var statIn = document.getElementById("statIn");
  var statOut = document.getElementById("statOut");
  var statStyles = document.getElementById("statStyles");
  var canvas = document.getElementById("lengthChart");
  var sortDefault = document.getElementById("sortDefault");
  var sortAlpha = document.getElementById("sortAlpha");

  var sortMode = "default";
  var currentStyleIds = [];

  function convert(text, mapper) {
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      out += mapper(ch);
    }
    return out;
  }

  function visibleStyles() {
    var group = styleFilter.value;
    var list = STYLES.filter(function (s) {
      return group === "all" || s.group === group;
    });
    if (sortMode === "alpha") {
      list = list.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function showInfo(msg) {
    if (!msg) {
      infoBox.classList.add("d-none");
      infoBox.textContent = "";
      return;
    }
    infoBox.textContent = msg;
    infoBox.classList.remove("d-none");
  }

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function render() {
    var raw = input.value;
    clearError();

    if (raw.trim() === "") {
      results.innerHTML = "";
      resultSummary.textContent = "Enter text above to generate Facebook font styles.";
      statIn.textContent = "0";
      statOut.textContent = "0";
      statStyles.textContent = "0";
      showInfo("");
      drawChart(0, 0);
      return;
    }

    if (raw.length > MAX_INPUT) {
      showError("Please keep your text to " + MAX_INPUT + " characters or fewer.");
      input.value = raw.slice(0, MAX_INPUT);
      raw = input.value;
    }

    var styles = visibleStyles();
    currentStyleIds = styles.map(function (s) {
      return s.id;
    });

    var html = "";
    var maxOut = 0;

    styles.forEach(function (style) {
      var out = convert(raw, style.map);
      maxOut = Math.max(maxOut, out.length);
      html +=
        '<div class="col-12 col-md-6 mb-3">' +
        '<div class="card result-card border-0 shadow-sm">' +
        '<div class="card-body">' +
        '<div class="result-meta"><p class="result-name">' + escapeHtml(style.name) +
        '</p><span class="result-count">' + out.length + " chars</span></div>" +
        '<div class="result-text" id="out-' + style.id + '">' + escapeHtml(out) + "</div>" +
        '<div class="result-actions">' +
        '<button type="button" class="btn btn-primary btn-sm copy-btn" data-copy="' + style.id +
        '">Copy</button>' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-pick="' + style.id +
        '">Use in input</button>' +
        "</div></div></div></div>";
    });

    results.innerHTML = html;
    statIn.textContent = String(raw.length);
    statOut.textContent = String(maxOut);
    statStyles.textContent = String(styles.length);
    resultSummary.textContent = styles.length + " style" + (styles.length === 1 ? "" : "s") +
      " generated from " + raw.length + " characters.";

    var limit = FB_LIMITS[sizePreset.value];
    if (limit && raw.length > limit) {
      showInfo("Heads up: Facebook’s practical limit for this field is about " + limit +
        " characters, and your text is " + raw.length + ".");
    } else if (limit) {
      showInfo("Your text fits within the roughly " + limit + " characters Facebook allows for this field.");
    } else {
      showInfo("");
    }

    drawChart(raw.length, maxOut);
  }

  function copyText(text, btn) {
    var done = function () {
      var original = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("copied");
      window.setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1400);
    };
    var fail = function () {
      showError("Copy failed. Select the text and copy it manually.");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        fallbackCopy(text, done, fail);
      });
    } else {
      fallbackCopy(text, done, fail);
    }
  }

  function fallbackCopy(text, done, fail) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(ta);
    if (ok) {
      done();
    } else {
      fail();
    }
  }

  /* ---------- canvas chart ---------- */

  function drawChart(inLen, outLen) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var bars = [
      { label: "Your text", value: inLen, color: "#60089c" },
      { label: "Styled output", value: outLen, color: "#7d1fc0" },
      { label: "Profile name limit", value: FB_LIMITS.profile, color: "#b48ad8" },
      { label: "Page / group limit", value: FB_LIMITS.page, color: "#e2cdf4" }
    ];

    var maxVal = Math.max(10, inLen, outLen, FB_LIMITS.page);
    var padLeft = 8;
    var padBottom = 34;
    var padTop = 26;
    var plotW = w - padLeft * 2;
    var plotH = h - padBottom - padTop;
    var slot = plotW / bars.length;
    var barW = Math.min(64, slot * 0.55);

    ctx.strokeStyle = "#e2cdf4";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padLeft, y);
      ctx.stroke();
    }

    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "center";

    bars.forEach(function (bar, i) {
      var cx = padLeft + slot * i + slot / 2;
      var barH = maxVal === 0 ? 0 : (bar.value / maxVal) * plotH;
      var top = padTop + plotH - barH;
      ctx.fillStyle = bar.color;
      ctx.fillRect(cx - barW / 2, top, barW, barH);

      ctx.fillStyle = "#45036f";
      ctx.font = "bold 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(String(bar.value), cx, top - 6);

      ctx.fillStyle = "#6b6478";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      wrapLabel(ctx, bar.label, cx, h - padBottom + 14, slot - 6);
    });
  }

  function wrapLabel(ctx, label, cx, y, maxWidth) {
    var words = label.split(" ");
    var lines = [];
    var line = "";
    words.forEach(function (word) {
      var test = line ? line + " " + word : word;
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    });
    if (line) lines.push(line);
    lines.slice(0, 2).forEach(function (l, i) {
      ctx.fillText(l, cx, y + i * 12);
    });
  }

  /* ---------- events ---------- */

  input.addEventListener("input", function () {
    charCount.textContent = String(input.value.length);
    render();
  });

  styleFilter.addEventListener("change", render);
  sizePreset.addEventListener("change", render);

  sortDefault.addEventListener("click", function () {
    sortMode = "default";
    sortDefault.classList.add("active");
    sortAlpha.classList.remove("active");
    render();
  });

  sortAlpha.addEventListener("click", function () {
    sortMode = "alpha";
    sortAlpha.classList.add("active");
    sortDefault.classList.remove("active");
    render();
  });

  document.getElementById("sampleBtn").addEventListener("click", function () {
    input.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    charCount.textContent = String(input.value.length);
    render();
    input.focus();
  });

  document.getElementById("randomBtn").addEventListener("click", function () {
    var a = WORDS[Math.floor(Math.random() * WORDS.length)];
    var b = WORDS[Math.floor(Math.random() * WORDS.length)];
    input.value = a + " " + b + " news";
    charCount.textContent = String(input.value.length);
    render();
    input.focus();
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    input.value = "";
    charCount.textContent = "0";
    clearError();
    render();
    input.focus();
  });

  results.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-copy], button[data-pick]");
    if (!btn) return;
    var copyId = btn.getAttribute("data-copy");
    var pickId = btn.getAttribute("data-pick");
    var node = document.getElementById("out-" + (copyId || pickId));
    if (!node) return;
    if (copyId) {
      copyText(node.textContent, btn);
    } else {
      input.value = node.textContent.slice(0, MAX_INPUT);
      charCount.textContent = String(input.value.length);
      render();
      input.focus();
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    render();
  });

  drawChart(0, 0);
  render();
})();
