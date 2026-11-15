/* Italics Text Generator - Unicode italic engine (vanilla JS) */
(function () {
  "use strict";

  var UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LOWER = "abcdefghijklmnopqrstuvwxyz";

  function rangeMap(upperStart, lowerStart, digitsStart) {
    var map = {};
    var i;
    for (i = 0; i < 26; i++) {
      map[UPPER.charAt(i)] = String.fromCodePoint(upperStart + i);
      map[LOWER.charAt(i)] = String.fromCodePoint(lowerStart + i);
    }
    if (digitsStart) {
      for (i = 0; i < 10; i++) map[String(i)] = String.fromCodePoint(digitsStart + i);
    }
    return map;
  }

  function withOverrides(map, overrides) {
    Object.keys(overrides).forEach(function (k) {
      map[k] = String.fromCodePoint(overrides[k]);
    });
    return map;
  }

  function combiningMap(base) {
    var m = {};
    var i;
    for (i = 0; i < 26; i++) {
      m[UPPER.charAt(i)] = UPPER.charAt(i) + base;
      m[LOWER.charAt(i)] = LOWER.charAt(i) + base;
    }
    for (i = 0; i < 10; i++) m[String(i)] = String(i) + base;
    return m;
  }

  /* serif italic - the two letters without a precomposed form use the letterlike symbols */
  var italic = withOverrides(rangeMap(0x1d434, 0x1d44e, null), { h: 0x210e });

  /* script italic */
  var script = withOverrides(rangeMap(0x1d49c, 0x1d4b6, null), {
    B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110, L: 0x2112, M: 0x2133, R: 0x211b,
    e: 0x212f, g: 0x210a, o: 0x2134
  });

  var boldScript = rangeMap(0x1d4d0, 0x1d4ea, null);

  var sansItalic = rangeMap(0x1d608, 0x1d622, null);

  var sansBoldItalic = rangeMap(0x1d63c, 0x1d656, null);

  var serifBoldItalic = rangeMap(0x1d468, 0x1d482, null);

  /* small caps, then the caller can slant the whole line */
  var smallCaps = {
    A: "\u1D00", B: "\u0299", C: "\u1D04", D: "\u1D05", E: "\u1D07", F: "\uA730", G: "\u0262",
    H: "\u029C", I: "\u026A", J: "\u1D0A", K: "\u1D0C", L: "\u029F", M: "\u1D0D", N: "\u0274",
    O: "\u1D0F", P: "\u1D18", Q: "\uA7AF", R: "\u0280", S: "\uA731", T: "\u1D1B", U: "\u1D1C",
    V: "\u1D20", W: "\u1D21", X: "\u02E3", Y: "\u028F", Z: "\u1D22"
  };

  var SLANT = "\u0332";

  /* build a map that first slants the letter, then stacks a combining mark on it */
  function decorated(baseMap, base) {
    var out = {};
    Object.keys(baseMap).forEach(function (k) {
      out[k] = baseMap[k] + base;
    });
    return out;
  }

  var STYLES = [
    { id: "serif-italic", name: "Serif Italic", family: "serif", map: italic },
    { id: "serif-bold-italic", name: "Serif Bold Italic", family: "serif", map: serifBoldItalic },
    { id: "sans-italic", name: "Sans Italic", family: "sans", map: sansItalic },
    { id: "sans-bold-italic", name: "Sans Bold Italic", family: "sans", map: sansBoldItalic },
    { id: "script", name: "Script", family: "script", map: script },
    { id: "bold-script", name: "Bold Script", family: "script", map: boldScript },
    { id: "slanted-caps", name: "Slanted Small Caps", family: "decorated", map: smallCaps, upperToLower: true },
    { id: "caps-underline", name: "Small Caps Underline", family: "decorated", map: decorated(smallCaps, SLANT), upperToLower: true },
    { id: "italic-strike", name: "Italic Strikethrough", family: "decorated", map: decorated(italic, "\u0336") },
    { id: "italic-underline", name: "Italic Underline", family: "decorated", map: decorated(italic, SLANT) },
    { id: "italic-spaced", name: "Italic Spaced", family: "decorated", map: italic, spacer: true }
  ];

  function convert(text, style) {
    var chars = Array.from(text);
    if (style.spacer) {
      return chars.map(function (ch) {
        return style.map && Object.prototype.hasOwnProperty.call(style.map, ch) ? style.map[ch] : ch;
      }).join("\u2009");
    }
    return chars.map(function (ch) {
      if (style.map && Object.prototype.hasOwnProperty.call(style.map, ch)) {
        return style.map[ch];
      }
      if (style.upperToLower && ch >= "a" && ch <= "z") {
        var up = ch.toUpperCase();
        return Object.prototype.hasOwnProperty.call(style.map, up) ? style.map[up] : ch;
      }
      return ch;
    }).join("");
  }

  function coverage(text, style) {
    var chars = Array.from(text).filter(function (ch) { return !/\s/.test(ch); });
    if (!chars.length) return { mapped: 0, total: 0, pct: 100 };
    var mapped = 0;
    chars.forEach(function (ch) {
      if (style.spacer) { mapped++; return; }
      var up = (ch >= "a" && ch <= "z") ? ch.toUpperCase() : ch;
      if (style.map && (Object.prototype.hasOwnProperty.call(style.map, ch) ||
          Object.prototype.hasOwnProperty.call(style.map, up))) {
        mapped++;
      }
    });
    return { mapped: mapped, total: chars.length, pct: Math.round((mapped / chars.length) * 100) };
  }

  /* ---------- dom ---------- */
  var input = document.getElementById("textInput");
  var familySelect = document.getElementById("familySelect");
  var pills = document.getElementById("stylePills");
  var rows = document.getElementById("styleRows");
  var emptyMsg = document.getElementById("emptyMsg");
  var alertBox = document.getElementById("alertBox");
  var styleCount = document.getElementById("styleCount");
  var previewStrip = document.getElementById("previewStrip");
  var previewName = document.getElementById("previewName");
  var copyPreviewBtn = document.getElementById("copyPreviewBtn");
  var copyAllBtn = document.getElementById("copyAllBtn");
  var chips = document.getElementById("sampleChips");
  var canvas = document.getElementById("coverageChart");

  var activeId = "serif-italic";

  ["Hello", "just do it", "Book Title", "Stay curious", "Good vibes"].forEach(function (s) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "chip";
    b.textContent = s;
    b.addEventListener("click", function () {
      input.value = s;
      render();
      input.focus();
    });
    chips.appendChild(b);
  });

  var toast = document.createElement("div");
  toast.className = "toast-note";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  document.body.appendChild(toast);
  var toastTimer = null;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("show"); }, 1600);
  }

  function copyText(text, label) {
    function done() { showToast(label + " copied"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); done(); }
      catch (e) { showToast("Copy failed - select and copy manually"); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  function visibleStyles() {
    var fam = familySelect.value;
    return STYLES.filter(function (s) {
      return fam === "all" || s.family === fam;
    });
  }

  function currentText() {
    return input.value.trim();
  }

  function render() {
    var text = currentText();
    var styles = visibleStyles();

    if (!text) {
      alertBox.classList.add("d-none");
      previewStrip.textContent = "Start typing to see your text in italics.";
      previewName.textContent = "-";
      pills.innerHTML = "";
      rows.innerHTML = "";
      emptyMsg.classList.add("d-none");
      styleCount.textContent = "";
      drawChart([]);
      return;
    }

    if (text.length > 120) {
      alertBox.textContent = "That is " + text.length + " characters. Keep it to 120 or fewer for best results.";
      alertBox.classList.remove("d-none");
    } else {
      alertBox.classList.add("d-none");
    }

    if (styles.indexOf(styles.filter(function (s) { return s.id === activeId; })[0]) === -1) {
      activeId = styles[0].id;
    }

    pills.innerHTML = "";
    styles.forEach(function (s) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "pill" + (s.id === activeId ? " is-active" : "");
      b.textContent = s.name;
      b.addEventListener("click", function () {
        activeId = s.id;
        render();
      });
      pills.appendChild(b);
    });

    rows.innerHTML = "";
    styles.forEach(function (s) {
      var cov = coverage(text, s);
      var tr = document.createElement("tr");

      var tdName = document.createElement("th");
      tdName.setAttribute("scope", "row");
      tdName.className = "font-weight-normal";
      tdName.textContent = s.name;

      var tdOut = document.createElement("td");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "style-out btn btn-link p-0 text-left";
      btn.textContent = convert(text, s);
      btn.setAttribute("aria-label", "Preview " + s.name);
      btn.addEventListener("click", function () {
        activeId = s.id;
        render();
      });
      tdOut.appendChild(btn);

      var tdCov = document.createElement("td");
      tdCov.className = "text-center";
      var badge = document.createElement("span");
      badge.className = cov.pct === 100 ? "badge-full" : "badge-part";
      badge.textContent = cov.pct === 100 ? "full" : cov.pct + "%";
      badge.title = cov.mapped + " of " + cov.total + " characters mapped";
      tdCov.appendChild(badge);

      var tdCopy = document.createElement("td");
      tdCopy.className = "text-right";
      var copyBtn = document.createElement("button");
      copyBtn.type = "button";
      copyBtn.className = "btn btn-xs btn-brand";
      copyBtn.textContent = "Copy";
      copyBtn.addEventListener("click", function () {
        copyText(convert(text, s), s.name);
      });
      tdCopy.appendChild(copyBtn);

      tr.appendChild(tdName);
      tr.appendChild(tdOut);
      tr.appendChild(tdCov);
      tr.appendChild(tdCopy);
      rows.appendChild(tr);
    });

    var active = styles.filter(function (s) { return s.id === activeId; })[0] || styles[0];
    previewName.textContent = active.name;
    previewStrip.textContent = convert(text, active);

    emptyMsg.classList.toggle("d-none", styles.length > 0);
    styleCount.textContent = "(" + styles.length + " of " + STYLES.length + ")";
    drawChart(styles.map(function (s) {
      return { name: s.name, pct: coverage(text, s).pct };
    }));
  }

  function drawChart(data) {
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 900;
    var cssH = 300;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padL = 42, padR = 12, padT = 16, padB = 78;
    var plotW = cssW - padL - padR;
    var plotH = cssH - padT - padB;

    ctx.strokeStyle = "#ece5f4";
    ctx.fillStyle = "#6f677d";
    ctx.font = "11px Segoe UI, Arial, sans-serif";
    ctx.lineWidth = 1;
    [0, 25, 50, 75, 100].forEach(function (v) {
      var y = padT + plotH - (v / 100) * plotH;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.textAlign = "right";
      ctx.fillText(v + "%", padL - 6, y + 4);
    });

    if (!data.length) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#a49cb3";
      ctx.fillText("Coverage appears here once you type something.", cssW / 2, padT + plotH / 2);
      return;
    }

    var n = data.length;
    var gap = 5;
    var barW = Math.max(6, (plotW - gap * (n - 1)) / n);
    var grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, "#b34ce0");
    grad.addColorStop(1, "#60089c");

    data.forEach(function (d, i) {
      var x = padL + i * (barW + gap);
      var h = Math.max(2, (d.pct / 100) * plotH);
      var y = padT + plotH - h;
      ctx.fillStyle = d.pct === 100 ? grad : "#d9c2f2";
      ctx.beginPath();
      ctx.moveTo(x, padT + plotH);
      ctx.lineTo(x, y + 3);
      ctx.quadraticCurveTo(x, y, x + 3, y);
      ctx.lineTo(x + barW - 3, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + 3);
      ctx.lineTo(x + barW, padT + plotH);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(x + barW / 2, padT + plotH + 6);
      ctx.rotate(-Math.PI / 3);
      ctx.textAlign = "right";
      ctx.fillStyle = "#6f677d";
      ctx.fillText(d.name, 0, 0);
      ctx.restore();
    });
  }

  var debounce = null;
  input.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 60);
  });
  familySelect.addEventListener("change", render);
  copyPreviewBtn.addEventListener("click", function () {
    var text = currentText();
    if (!text) { showToast("Type something first"); input.focus(); return; }
    var active = visibleStyles().filter(function (s) { return s.id === activeId; })[0] || visibleStyles()[0];
    copyText(convert(text, active), active.name);
  });
  copyAllBtn.addEventListener("click", function () {
    var text = currentText();
    if (!text) { showToast("Type something first"); input.focus(); return; }
    var lines = STYLES.map(function (s) { return s.name + ": " + convert(text, s); });
    copyText(lines.join("\n"), "All " + STYLES.length + " styles");
  });
  window.addEventListener("resize", function () {
    clearTimeout(debounce);
    debounce = setTimeout(render, 120);
  });

  render();
})();
