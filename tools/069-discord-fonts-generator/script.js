(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Unicode alphabet builders
   * ------------------------------------------------------------------ */

  function offsetMap(upStart, lowStart, digStart) {
    var m = {};
    var i;
    if (upStart) {
      for (i = 0; i < 26; i++) {
        m[String.fromCharCode(65 + i)] = String.fromCodePoint(upStart + i);
      }
    }
    if (lowStart) {
      for (i = 0; i < 26; i++) {
        m[String.fromCharCode(97 + i)] = String.fromCodePoint(lowStart + i);
      }
    }
    if (digStart) {
      for (i = 0; i < 10; i++) {
        m[String(i)] = String.fromCodePoint(digStart + i);
      }
    }
    return m;
  }

  function applyOverrides(map, overrides) {
    Object.keys(overrides).forEach(function (key) {
      map[key] = overrides[key];
    });
    return map;
  }

  var BOLD = offsetMap(0x1d5d4, 0x1d5ee, 0x1d7ec);
  var ITALIC = offsetMap(0x1d608, 0x1d622, null);
  var BOLD_ITALIC = offsetMap(0x1d63c, 0x1d656, null);
  var SANS = offsetMap(0x1d5a0, 0x1d5ba, 0x1d7e2);
  var MONO = offsetMap(0x1d670, 0x1d68a, 0x1d7f6);
  var SCRIPT = offsetMap(0x1d4d0, 0x1d4ea, null);
  var GOTHIC = offsetMap(0x1d56c, 0x1d586, null);
  var DOUBLE = applyOverrides(offsetMap(0x1d538, 0x1d552, 0x1d7d8), {
    C: "\u2102", H: "\u210d", N: "\u2115", P: "\u2119",
    Q: "\u211a", R: "\u211d", Z: "\u2124"
  });
  var FULLWIDTH = offsetMap(0xff21, 0xff41, 0xff10);

  var CIRCLED = applyOverrides(offsetMap(0x24b6, 0x24d0, null), {
    "0": "\u24ea", "1": "\u2460", "2": "\u2461", "3": "\u2462", "4": "\u2463",
    "5": "\u2464", "6": "\u2465", "7": "\u2466", "8": "\u2467", "9": "\u2468"
  });
  CIRCLED[" "] = "\u00a0";

  var SQUARED = offsetMap(0x1f130, null, null);
  var BUBBLE = offsetMap(0x1f150, null, null);

  var SMALL_CAPS = {
    a: "\u1d00", b: "\u0299", c: "\u1d04", d: "\u1d05", e: "\u1d07", f: "\ua730",
    g: "\u0262", h: "\u029c", i: "\u026a", j: "\u1d0a", k: "\u1d0b", l: "\u029f",
    m: "\u1d0d", n: "\u0274", o: "\u1d0f", p: "\u1d18", q: "\ua7af", r: "\u0280",
    s: "\ua731", t: "\u1d1b", u: "\u1d1c", v: "\u1d20", w: "\u1d21", x: "x",
    y: "\u028f", z: "\u1d22"
  };
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach(function (ch) {
    SMALL_CAPS[ch] = SMALL_CAPS[ch.toLowerCase()];
  });

  var UPSIDE = {
    a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01dd", f: "\u025f", g: "\u0183",
    h: "\u0265", i: "\u1d09", j: "\u027e", k: "\u029e", l: "\u05df", m: "\u026f",
    n: "u", o: "o", p: "d", q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n",
    v: "\u028c", w: "\u028d", x: "x", y: "\u028e", z: "z",
    A: "\u2200", B: "\u10412", C: "\u0186", D: "\u15e1", E: "\u018e", F: "\u2132",
    G: "\u2141", H: "H", I: "I", J: "\u017f", K: "\u029e", L: "\u2142", M: "W",
    N: "N", O: "O", P: "\u0500", Q: "\u038c", R: "\u1d1a", S: "S", T: "\u22a5",
    U: "\u2229", V: "\u039b", W: "M", X: "X", Y: "\u2144", Z: "Z",
    ".": "\u02d9", ",": "'", "'": ",", "?": "\u00bf", "!": "\u00a1",
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<"
  };

  /* ------------------------------------------------------------------
   * Style definitions
   * ------------------------------------------------------------------ */

  var STYLES = [
    { id: "bold", name: "Bold", family: "bold", map: BOLD },
    { id: "bold-italic", name: "Bold italic", family: "bold", map: BOLD_ITALIC },
    { id: "sans", name: "Sans-serif", family: "bold", map: SANS },
    { id: "mono", name: "Monospace", family: "bold", map: MONO },
    { id: "script", name: "Script", family: "script", map: SCRIPT },
    { id: "gothic", name: "Gothic", family: "gothic", map: GOTHIC },
    { id: "double", name: "Double-struck", family: "decorative", map: DOUBLE },
    { id: "circled", name: "Circled", family: "decorative", map: CIRCLED },
    { id: "squared", name: "Squared", family: "decorative", map: SQUARED },
    { id: "bubble", name: "Bubble", family: "decorative", map: BUBBLE },
    { id: "fullwidth", name: "Full width", family: "decorative", map: FULLWIDTH },
    { id: "small-caps", name: "Small caps", family: "caps", map: SMALL_CAPS },
    { id: "spaced", name: "Wide spacing", family: "caps", map: null },
    { id: "strike", name: "Strikethrough", family: "effects", map: null },
    { id: "underline", name: "Underlined", family: "effects", map: null },
    { id: "wavy", name: "Wavy underline", family: "effects", map: null },
    { id: "upside", name: "Upside down", family: "effects", map: UPSIDE },
    { id: "italic", name: "Italic", family: "script", map: ITALIC }
  ];

  function transform(text, style) {
    var chars = Array.from(text);
    var out;
    switch (style.id) {
      case "spaced":
        return chars.join("\u2009");
      case "strike":
        return chars.map(function (c) { return c + "\u0336"; }).join("");
      case "underline":
        return chars.map(function (c) { return c + "\u0332"; }).join("");
      case "wavy":
        return chars.map(function (c) { return c + "\u0330"; }).join("");
      case "upside":
        out = chars.map(function (c) { return UPSIDE[c] || c; }).join("");
        return Array.from(out).reverse().join("");
      default:
        if (!style.map) return text;
        return chars.map(function (c) {
          return Object.prototype.hasOwnProperty.call(style.map, c) ? style.map[c] : c;
        }).join("");
    }
  }

  /* ------------------------------------------------------------------
   * Element references
   * ------------------------------------------------------------------ */

  var form = document.getElementById("fontForm");
  var input = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var styleFilter = document.getElementById("styleFilter");
  var targetPreset = document.getElementById("targetPreset");
  var errorBox = document.getElementById("errorBox");
  var infoBox = document.getElementById("infoBox");
  var results = document.getElementById("results");
  var resultSummary = document.getElementById("resultSummary");
  var statIn = document.getElementById("statIn");
  var statOut = document.getElementById("statOut");
  var statStyles = document.getElementById("statStyles");
  var canvas = document.getElementById("limitChart");
  var sortMode = "default";

  var LIMITS = {
    server: { label: "Server name", max: 100 },
    channel: { label: "Channel name", max: 100 },
    role: { label: "Role name", max: 100 },
    nickname: { label: "Nickname", max: 32 },
    bio: { label: "About me bio", max: 190 }
  };

  var SAMPLES = ["Midnight Gamers", "Cozy Corner", "Pixel Raiders", "The Daily Grind"];
  var WORDS_A = ["Neon", "Cosmic", "Silent", "Crimson", "Frost", "Lucky", "Wild", "Velvet"];
  var WORDS_B = ["Foxes", "Comet", "Harbor", "Raven", "Meadow", "Circuit", "Lantern", "Voyage"];

  function currentLimit() {
    return LIMITS[targetPreset.value] || LIMITS.server;
  }

  function hideAlerts() {
    errorBox.classList.add("d-none");
    infoBox.classList.add("d-none");
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
    infoBox.classList.add("d-none");
  }

  function showInfo(message) {
    infoBox.textContent = message;
    infoBox.classList.remove("d-none");
    errorBox.classList.add("d-none");
  }

  /* ------------------------------------------------------------------
   * Rendering
   * ------------------------------------------------------------------ */

  function visibleStyles() {
    var family = styleFilter.value;
    var list = STYLES.filter(function (s) {
      return family === "all" || s.family === family;
    });
    if (sortMode === "alpha") {
      list = list.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }

  function copyText(value, button) {
    var done = function () {
      var original = button.textContent;
      button.textContent = "Copied";
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-success");
      window.setTimeout(function () {
        button.textContent = original;
        button.classList.add("btn-outline-secondary");
        button.classList.remove("btn-success");
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () {
        fallbackCopy(value, done);
      });
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-9999px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      done();
    } catch (err) {
      showError("Copying is blocked by your browser. Select the text and copy it manually.");
    }
    document.body.removeChild(area);
  }

  function renderEmpty(message) {
    results.innerHTML = "";
    resultSummary.textContent = message;
    statIn.textContent = "0";
    statOut.textContent = "0";
    statStyles.textContent = "0";
    drawChart(0, 0);
  }

  function render(raw) {
    var limit = currentLimit();
    var styles = visibleStyles();
    var longest = 0;
    var overCount = 0;

    results.innerHTML = "";

    styles.forEach(function (style) {
      var value = transform(raw, style);
      var len = Array.from(value).length;
      if (len > longest) longest = len;
      var over = len > limit.max;
      if (over) overCount++;

      var col = document.createElement("div");
      col.className = "col-12 col-md-6 mb-3";

      var card = document.createElement("div");
      card.className = "font-card";

      var body = document.createElement("div");
      body.className = "card-body";

      var label = document.createElement("div");
      label.className = "font-label";
      label.textContent = style.name;

      var preview = document.createElement("div");
      preview.className = "font-preview" + (over ? " is-over" : "");
      preview.textContent = value;
      preview.setAttribute("aria-label", style.name + " preview");

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-outline-secondary btn-sm copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy " + style.name + " text");
      btn.addEventListener("click", function () {
        copyText(value, btn);
      });

      body.appendChild(label);
      body.appendChild(preview);
      body.appendChild(btn);
      card.appendChild(body);
      col.appendChild(card);
      results.appendChild(col);
    });

    statIn.textContent = String(Array.from(raw).length);
    statOut.textContent = String(longest);
    statStyles.textContent = String(styles.length);

    if (overCount > 0) {
      resultSummary.textContent = overCount + " of " + styles.length +
        " styles exceed the " + limit.max + "-character limit for a Discord " +
        limit.label.toLowerCase() + ". Trim your text to fit.";
    } else {
      resultSummary.textContent = "All " + styles.length + " styles fit inside the " +
        limit.max + "-character limit for a Discord " + limit.label.toLowerCase() + ".";
    }

    drawChart(Array.from(raw).length, longest, limit.max);
  }

  function update() {
    hideAlerts();
    var raw = input.value.trim();
    charCount.textContent = String(input.value.length);

    if (raw.length === 0) {
      renderEmpty("Type something above to see Discord font styles.");
      return;
    }
    if (raw.length > 100) {
      showError("That is " + raw.length + " characters. Trim it to 100 or fewer.");
      renderEmpty("Waiting for text within the character limit.");
      return;
    }
    if (!/[\p{L}\p{N}]/u.test(raw)) {
      showError("Add at least one letter or number — symbols alone cannot be styled.");
      renderEmpty("Waiting for letters or numbers.");
      return;
    }

    var limit = currentLimit();
    if (Array.from(raw).length > limit.max) {
      showInfo("Heads up: your text is longer than the " + limit.max +
        "-character limit for a Discord " + limit.label.toLowerCase() + ".");
    }
    render(raw);
  }

  /* ------------------------------------------------------------------
   * Canvas chart
   * ------------------------------------------------------------------ */

  function drawChart(inLen, longest, limit) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width;
    var h = canvas.height;
    var pad = { top: 24, right: 16, bottom: 46, left: 44 };
    var plotW = w - pad.left - pad.right;
    var plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    var cap = Math.max(limit || 0, inLen, longest, 10);
    var bars = [
      { label: "Your input", value: inLen, color: "#b06ce0" },
      { label: "Longest styled", value: longest, color: "#60089c" },
      { label: "Discord limit", value: limit || 0, color: "#e0cbf3" }
    ];

    ctx.strokeStyle = "#e6dfee";
    ctx.fillStyle = "#8a8296";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.lineWidth = 1;
    var ticks = 4;
    for (var t = 0; t <= ticks; t++) {
      var val = Math.round((cap / ticks) * t);
      var y = pad.top + plotH - (plotH * (t / ticks));
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(String(val), pad.left - 6, y);
    }

    var slot = plotW / bars.length;
    var barW = Math.min(78, slot * 0.55);

    bars.forEach(function (bar, i) {
      var x = pad.left + slot * i + (slot - barW) / 2;
      var barH = cap > 0 ? (bar.value / cap) * plotH : 0;
      var y = pad.top + plotH - barH;

      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barW, Math.max(barH, bar.value > 0 ? 2 : 0));

      ctx.fillStyle = "#3f0568";
      ctx.font = "bold 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(String(bar.value), x + barW / 2, y - 4);

      ctx.fillStyle = "#6b6478";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(bar.label, x + barW / 2, pad.top + plotH + 8);
    });

    ctx.strokeStyle = "#c9bcd9";
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.stroke();
  }

  /* ------------------------------------------------------------------
   * Events
   * ------------------------------------------------------------------ */

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    update();
  });
  form.addEventListener("input", update);
  styleFilter.addEventListener("change", update);
  targetPreset.addEventListener("change", update);

  document.getElementById("sampleBtn").addEventListener("click", function () {
    input.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    update();
    input.focus();
  });

  document.getElementById("randomBtn").addEventListener("click", function () {
    var a = WORDS_A[Math.floor(Math.random() * WORDS_A.length)];
    var b = WORDS_B[Math.floor(Math.random() * WORDS_B.length)];
    input.value = a + " " + b;
    update();
    input.focus();
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    input.value = "";
    update();
    input.focus();
  });

  document.getElementById("sortDefault").addEventListener("click", function () {
    sortMode = "default";
    this.classList.add("active");
    document.getElementById("sortAlpha").classList.remove("active");
    update();
  });

  document.getElementById("sortAlpha").addEventListener("click", function () {
    sortMode = "alpha";
    this.classList.add("active");
    document.getElementById("sortDefault").classList.remove("active");
    update();
  });

  renderEmpty("Type something above to see Discord font styles.");
})();
