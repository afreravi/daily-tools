/* Random Color Generator - vanilla JS, no dependencies. */
(function () {
  "use strict";

  var MAX_COLORS = 24;
  var MIN_COLORS = 1;

  var form = document.getElementById("colorForm");
  var modeSelect = document.getElementById("modeSelect");
  var harmonySelect = document.getElementById("harmonySelect");
  var countInput = document.getElementById("countInput");
  var seedInput = document.getElementById("seedInput");
  var lockToggle = document.getElementById("lockToggle");
  var namesToggle = document.getElementById("namesToggle");
  var generateBtn = document.getElementById("generateBtn");
  var copyAllBtn = document.getElementById("copyAllBtn");
  var copyCssBtn = document.getElementById("copyCssBtn");
  var downloadBtn = document.getElementById("downloadBtn");
  var errorBox = document.getElementById("errorBox");
  var statusBox = document.getElementById("statusBox");
  var swatchGrid = document.getElementById("swatchGrid");
  var paletteMeta = document.getElementById("paletteMeta");
  var hueChart = document.getElementById("hueChart");

  /* Locked hex codes, preserved across generations. */
  var locked = [];
  var current = [];

  /* ---------- Randomness ---------- */

  /* xmur3: string -> 32-bit seed. Lets a text seed reproduce a palette. */
  function hashSeed(str) {
    var h = 1779033703 ^ str.length;
    for (var i = 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    return function () {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      h ^= h >>> 16;
      return h >>> 0;
    };
  }

  /* mulberry32: small deterministic PRNG. */
  function makeRng(seedNum) {
    var a = seedNum >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rand = Math.random;

  function randInt(min, max) {
    return Math.floor(rand() * (max - min + 1)) + min;
  }

  function pick(arr) {
    return arr[Math.floor(rand() * arr.length)];
  }

  /* ---------- Color maths ---------- */

  function hslToRgb(h, s, l) {
    h = ((h % 360) + 360) % 360;
    s = clamp(s, 0, 100) / 100;
    l = clamp(l, 0, 100) / 100;
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    var m = l - c / 2;
    var r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var l = (max + min) / 2;
    var d = max - min;
    var h = 0;
    var s = 0;
    if (d !== 0) {
      s = d / (1 - Math.abs(2 * l - 1));
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;
    return [h, s * 100, l * 100];
  }

  function toHex(n) {
    var v = clamp(Math.round(n), 0, 255).toString(16).toUpperCase();
    return v.length === 1 ? "0" + v : v;
  }

  function rgbToHex(rgb) {
    return "#" + toHex(rgb[0]) + toHex(rgb[1]) + toHex(rgb[2]);
  }

  function hexToRgb(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
    if (!m) return null;
    var v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }

  function relativeLuminance(rgb) {
    var c = rgb.map(function (v) {
      var s = v / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }

  function contrastWithWhite(rgb) {
    var l = relativeLuminance(rgb);
    return (1.05) / (l + 0.05);
  }

  /* ---------- Color naming (small, human-friendly table) ---------- */

  var HUE_NAMES = [
    [0, "Red"], [15, "Vermilion"], [30, "Orange"], [45, "Amber"], [60, "Yellow"],
    [75, "Chartreuse"], [90, "Lime"], [120, "Green"], [150, "Spring green"],
    [165, "Teal"], [180, "Cyan"], [195, "Sky"], [210, "Azure"], [225, "Blue"],
    [250, "Indigo"], [270, "Violet"], [285, "Purple"], [300, "Magenta"],
    [320, "Pink"], [340, "Rose"], [350, "Crimson"]
  ];

  function hueName(h) {
    var best = "Red";
    var bestDist = Infinity;
    for (var i = 0; i < HUE_NAMES.length; i++) {
      var d = Math.abs(((h - HUE_NAMES[i][0] + 540) % 360) - 180);
      if (d < bestDist) { bestDist = d; best = HUE_NAMES[i][1]; }
    }
    return best;
  }

  function describe(rgb) {
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var h = hsl[0], s = hsl[1], l = hsl[2];
    if (s < 8) {
      if (l < 12) return "Near black";
      if (l < 30) return "Charcoal grey";
      if (l < 55) return "Grey";
      if (l < 78) return "Light grey";
      if (l < 93) return "Off white";
      return "Near white";
    }
    var base = hueName(h);
    var tone;
    if (l >= 85) tone = "Pale";
    else if (l >= 70) tone = "Pastel";
    else if (l >= 50) tone = "Soft";
    else if (l >= 34) tone = "Deep";
    else tone = "Dark";
    var strength;
    if (s >= 78) strength = "vivid ";
    else if (s <= 26) strength = "muted ";
    else strength = "";
    return tone + " " + strength + base.toLowerCase();
  }

  /* ---------- Generation ---------- */

  /* Mode defines the hue band, saturation band and lightness band. */
  var MODES = {
    any:   { hue: null,          sat: [35, 92], lit: [28, 72] },
    pastel:{ hue: null,          sat: [42, 68], lit: [78, 90] },
    vivid: { hue: null,          sat: [82, 100], lit: [42, 58] },
    dark:  { hue: null,          sat: [28, 72], lit: [12, 30] },
    light: { hue: null,          sat: [30, 70], lit: [70, 92] },
    warm:  { hue: [0, 60],       sat: [50, 95], lit: [38, 68] },
    cool:  { hue: [170, 290],    sat: [40, 90], lit: [34, 66] },
    mono:  { hue: null,          sat: [30, 70], lit: [22, 84], mono: true }
  };

  function randomHue(cfg) {
    if (!cfg.hue) return rand() * 360;
    /* warm mode wraps past 360, so treat it as a plain range. */
    return cfg.hue[0] + rand() * (cfg.hue[1] - cfg.hue[0]);
  }

  function randomSl(cfg) {
    return {
      s: cfg.sat[0] + rand() * (cfg.sat[1] - cfg.sat[0]),
      l: cfg.lit[0] + rand() * (cfg.lit[1] - cfg.lit[0])
    };
  }

  /* Harmony offsets, in degrees, applied around a base hue. */
  var HARMONY = {
    free: null,
    analogous: [-30, -15, 0, 15, 30, 45, -45],
    complementary: [0, 180, 0, 180, 0, 180],
    triadic: [0, 120, 240, 0, 120, 240],
    tetradic: [0, 90, 180, 270, 0, 90, 180, 270],
    mono: [0, 0, 0, 0, 0, 0, 0, 0]
  };

  function buildPalette(count, modeKey, harmonyKey) {
    var cfg = MODES[modeKey] || MODES.any;
    var offsets = HARMONY[harmonyKey] || null;
    var baseHue = randomHue(cfg);
    var out = [];

    /* Monochrome mood overrides harmony: one hue, spread lightness. */
    if (cfg.mono) {
      var step = (cfg.lit[1] - cfg.lit[0]) / Math.max(count, 1);
      for (var i = 0; i < count; i++) {
        var l = cfg.lit[0] + step * (i + 0.5) + (rand() - 0.5) * 4;
        out.push(hslToRgb(baseHue, cfg.sat[0] + rand() * (cfg.sat[1] - cfg.sat[0]), clamp(l, 8, 94)));
      }
      return out;
    }

    /* Monochromatic harmony: hold hue, vary saturation and lightness. */
    if (harmonyKey === "mono") {
      for (var j = 0; j < count; j++) {
        var ls = randomSl(cfg);
        out.push(hslToRgb(baseHue + (rand() - 0.5) * 8, ls.s, ls.l));
      }
      return out;
    }

    for (var k = 0; k < count; k++) {
      var off;
      if (offsets) {
        off = offsets[k % offsets.length];
        /* Re-seed the base hue for each full cycle so long palettes still vary. */
        if (k > 0 && k % offsets.length === 0) baseHue = randomHue(cfg);
      } else {
        off = 0;
        baseHue = randomHue(cfg);
      }
      var hue = baseHue + off + (rand() - 0.5) * 6;
      var sl = randomSl(cfg);
      out.push(hslToRgb(hue, sl.s, sl.l));
    }
    return out;
  }

  /* ---------- Rendering ---------- */

  function hexOf(rgb) { return rgbToHex(rgb); }

  function makeSwatch(rgb, index) {
    var hex = hexOf(rgb);
    var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    var textLight = contrastWithWhite(rgb) >= 3.4;

    var col = document.createElement("div");
    col.className = "col-6 col-md-4 col-lg-3 mb-3";

    var card = document.createElement("div");
    card.className = "swatch-card";

    var chip = document.createElement("div");
    chip.className = "swatch-chip";
    chip.style.backgroundColor = hex;

    var lockBtn = document.createElement("button");
    lockBtn.type = "button";
    lockBtn.className = "swatch-lock";
    lockBtn.setAttribute("aria-pressed", locked.indexOf(hex) !== -1 ? "true" : "false");
    lockBtn.setAttribute("aria-label", "Lock color " + hex);
    lockBtn.title = "Lock this color";
    lockBtn.textContent = locked.indexOf(hex) !== -1 ? "\uD83D\uDD12" : "\uD83D\uDD13";
    lockBtn.addEventListener("click", function () {
      var at = locked.indexOf(hex);
      if (at === -1) locked.push(hex);
      else locked.splice(at, 1);
      var on = locked.indexOf(hex) !== -1;
      lockBtn.setAttribute("aria-pressed", on ? "true" : "false");
      lockBtn.textContent = on ? "\uD83D\uDD12" : "\uD83D\uDD13";
      setStatus(on ? hex + " locked." : hex + " unlocked.");
    });

    chip.appendChild(lockBtn);

    var body = document.createElement("div");
    body.className = "swatch-body";

    var hexLine = document.createElement("div");
    hexLine.className = "swatch-hex";
    hexLine.style.color = textLight ? "#fff" : "#241f2b";
    hexLine.textContent = hex;
    /* Show the hex on the chip itself for quick reading. */
    hexLine.style.position = "absolute";
    hexLine.style.left = ".7rem";
    hexLine.style.bottom = ".5rem";
    chip.appendChild(hexLine);

    var nameLine = document.createElement("div");
    nameLine.className = "swatch-name";
    nameLine.textContent = namesToggle.checked ? describe(rgb) : "";
    if (!namesToggle.checked) nameLine.style.display = "none";

    var values = document.createElement("div");
    values.className = "swatch-values";
    values.textContent =
      "rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")\n" +
      "hsl(" + Math.round(hsl[0]) + ", " + Math.round(hsl[1]) + "%, " + Math.round(hsl[2]) + "%)";
    values.style.whiteSpace = "pre-line";

    var actions = document.createElement("div");
    actions.className = "swatch-actions";

    var copyHex = document.createElement("button");
    copyHex.type = "button";
    copyHex.className = "btn btn-outline-secondary";
    copyHex.textContent = "Copy hex";
    copyHex.addEventListener("click", function () { copyText(hex, hex + " copied."); });

    var copyRgb = document.createElement("button");
    copyRgb.type = "button";
    copyRgb.className = "btn btn-outline-secondary";
    copyRgb.textContent = "Copy rgb";
    copyRgb.addEventListener("click", function () {
      copyText("rgb(" + rgb[0] + ", " + rgb[1] + ", " + rgb[2] + ")", hex + " rgb copied.");
    });

    actions.appendChild(copyHex);
    actions.appendChild(copyRgb);
    body.appendChild(nameLine);
    body.appendChild(values);
    body.appendChild(actions);
    card.appendChild(chip);
    card.appendChild(body);
    col.appendChild(card);
    col.setAttribute("data-index", String(index));
    return col;
  }

  function render(palette) {
    current = palette;
    swatchGrid.innerHTML = "";
    var frag = document.createDocumentFragment();
    palette.forEach(function (rgb, i) { frag.appendChild(makeSwatch(rgb, i)); });
    swatchGrid.appendChild(frag);

    paletteMeta.textContent = palette.length + (palette.length === 1 ? " color" : " colors") +
      (locked.length ? " \u00b7 " + locked.length + " locked" : "");

    drawChart(palette);
  }

  /* ---------- Hue chart (canvas, no libraries) ---------- */

  function drawChart(palette) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = hueChart.clientWidth || 900;
    var cssHeight = 260;
    hueChart.width = Math.round(cssWidth * dpr);
    hueChart.height = Math.round(cssHeight * dpr);
    var ctx = hueChart.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 8;
    var padRight = 8;
    var padTop = 26;
    var padBottom = 34;
    var plotW = cssWidth - padLeft - padRight;
    var plotH = cssHeight - padTop - padBottom;

    /* Background grid */
    ctx.strokeStyle = "#ece2f6";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
    }

    /* Axis labels */
    ctx.fillStyle = "#6d6675";
    ctx.font = "12px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ["0\u00b0", "90\u00b0", "180\u00b0", "270\u00b0", "360\u00b0"].forEach(function (label, i) {
      ctx.fillText(label, padLeft + (plotW / 4) * i, cssHeight - 12);
    });
    ctx.textAlign = "left";
    ctx.fillText("Hue angle of each color", padLeft, 16);

    var n = palette.length || 1;
    var slot = plotW / n;
    var barW = Math.max(6, Math.min(slot * 0.62, 64));

    palette.forEach(function (rgb, i) {
      var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
      var ratio = hsl[0] / 360;
      var h = Math.max(6, ratio * plotH);
      var x = padLeft + slot * i + (slot - barW) / 2;
      var y = padTop + plotH - h;

      ctx.fillStyle = rgbToHex(rgb);
      roundRect(ctx, x, y, barW, h, 5);
      ctx.fill();

      ctx.strokeStyle = "#d9c8ec";
      ctx.stroke();

      ctx.fillStyle = "#3d3746";
      ctx.textAlign = "center";
      ctx.font = "600 11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.fillText(String(Math.round(hsl[0])), x + barW / 2, y - 6);
      ctx.fillStyle = "#6d6675";
      ctx.font = "11px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.fillText("#" + (i + 1), x + barW / 2, padTop + plotH + 14);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  /* ---------- Clipboard & export ---------- */

  function copyText(text, message) {
    var done = function () { setStatus(message || "Copied."); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); }
    catch (e) { setStatus("Copy failed - please select and copy manually."); }
    document.body.removeChild(ta);
  }

  function setStatus(msg) {
    statusBox.textContent = msg;
    statusBox.classList.remove("d-none");
    window.clearTimeout(setStatus._t);
    setStatus._t = window.setTimeout(function () {
      statusBox.classList.add("d-none");
    }, 2600);
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function hexList() {
    return current.map(function (rgb) { return hexOf(rgb); }).join(", ");
  }

  function cssVariables() {
    return ":root {\n" + current.map(function (rgb, i) {
      return "  --color-" + (i + 1) + ": " + hexOf(rgb).toLowerCase() + ";";
    }).join("\n") + "\n}";
  }

  function downloadJson() {
    var payload = {
      generatedAt: new Date().toISOString(),
      seed: seedInput.value.trim() || null,
      mode: modeSelect.value,
      harmony: harmonySelect.value,
      colors: current.map(function (rgb) {
        var hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
        return {
          hex: hexOf(rgb),
          rgb: rgb,
          hsl: [Math.round(hsl[0]), Math.round(hsl[1]), Math.round(hsl[2])],
          name: describe(rgb)
        };
      })
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "palette-" + (seedInput.value.trim() || Date.now()) + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setStatus("Palette downloaded as JSON.");
  }

  /* ---------- Validation ---------- */

  function readCount() {
    var raw = countInput.value.trim();
    if (raw === "") return { ok: false, msg: "Enter how many colors you want (1 to 24)." };
    var n = Number(raw);
    if (!isFinite(n) || Math.floor(n) !== n) {
      return { ok: false, msg: "Number of colors must be a whole number between 1 and 24." };
    }
    if (n < MIN_COLORS) return { ok: false, msg: "Please ask for at least 1 color." };
    if (n > MAX_COLORS) return { ok: false, msg: "The maximum is 24 colors at a time." };
    return { ok: true, value: n };
  }

  /* ---------- Main generate ---------- */

  function generate(evt) {
    if (evt) evt.preventDefault();
    clearError();

    var count = readCount();
    if (!count.ok) {
      showError(count.msg);
      countInput.focus();
      return;
    }

    var seedText = seedInput.value.trim();
    if (seedText) {
      rand = makeRng(hashSeed(seedText)());
    } else {
      rand = Math.random;
    }

    var total = count.value;
    var keep = lockToggle.checked ? locked.slice() : [];
    if (keep.length > total) keep = keep.slice(0, total);

    var fresh = Math.max(total - keep.length, 0);
    var generated = fresh > 0
      ? buildPalette(fresh, modeSelect.value, harmonySelect.value)
      : [];

    var palette = keep.map(hexToRgb).filter(Boolean).concat(generated);

    /* Top up if a locked hex failed to parse. */
    while (palette.length < total) {
      palette.push(hslToRgb(rand() * 360, 55, 50));
    }

    render(palette);
    setStatus("Generated " + palette.length + " random " + (palette.length === 1 ? "color" : "colors") +
      (seedText ? " from seed \"" + seedText + "\"." : "."));
  }

  /* ---------- Wiring ---------- */

  form.addEventListener("submit", generate);
  copyAllBtn.addEventListener("click", function () {
    if (!current.length) { showError("Generate a palette first."); return; }
    clearError();
    copyText(hexList(), "All hex codes copied.");
  });
  copyCssBtn.addEventListener("click", function () {
    if (!current.length) { showError("Generate a palette first."); return; }
    clearError();
    copyText(cssVariables(), "CSS variables copied.");
  });
  downloadBtn.addEventListener("click", function () {
    if (!current.length) { showError("Generate a palette first."); return; }
    clearError();
    downloadJson();
  });

  namesToggle.addEventListener("change", function () {
    render(current);
  });

  countInput.addEventListener("input", clearError);

  /* Space on the generate button re-rolls; browsers fire click for space on buttons,
     so nothing extra is needed - but we keep the shortcut explicit for clarity. */
  generateBtn.addEventListener("keydown", function (e) {
    if (e.key === " " || e.key === "Enter") return; /* native activation handles it */
  });

  window.addEventListener("resize", function () {
    if (current.length) drawChart(current);
  });

  /* First palette on load. */
  generate();
})();
