(function() {
  "use strict";

  var fgInput = document.getElementById("fgInput");
  var bgInput = document.getElementById("bgInput");
  var fgPicker = document.getElementById("fgPicker");
  var bgPicker = document.getElementById("bgPicker");
  var swapBtn = document.getElementById("swapBtn");
  var errorBox = document.getElementById("errorAlert");
  var ratioValue = document.getElementById("ratioValue");
  var vNormal = document.getElementById("vNormal");
  var vLarge = document.getElementById("vLarge");
  var vUi = document.getElementById("vUi");
  var previewBox = document.getElementById("previewBox");
  var previewBig = document.getElementById("previewBig");
  var previewSmall = document.getElementById("previewSmall");
  var pointer = document.getElementById("pointer");
  var pointerLabel = document.getElementById("pointerLabel");
  var thresholdsG = document.getElementById("thresholds");
  var cssMap = null;

  function clamp255(n) {
    return Math.max(0, Math.min(255, Math.round(n)));
  }

  function clamp01(n) {
    return Math.max(0, Math.min(1, n));
  }

  function hexToRgb(hex) {
    var h = hex.replace(/^#/, "");
    if (h.length === 3 || h.length === 4) {
      h = h.split("").map(function(c) { return c + c; }).join("");
    }
    if (h.length === 8) h = h.slice(0, 6);
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return {
      r: parseInt(h.substr(0, 2), 16),
      g: parseInt(h.substr(2, 2), 16),
      b: parseInt(h.substr(4, 2), 16),
      a: 1
    };
  }

  function mixWithWhite(c) {
    var a = c.a === undefined ? 1 : c.a;
    return {
      r: Math.round(c.r * a + (1 - a) * 255),
      g: Math.round(c.g * a + (1 - a) * 255),
      b: Math.round(c.b * a + (1 - a) * 255),
      a: 1
    };
  }

  function loadCssColors(cb) {
    if (cssMap) return cb();
    var s = document.createElement("script");
    s.src = "https://unpkg.com/css-color-names@1.0.1/src/css-color-names.json";
    s.onload = function() {
      try {
        cssMap = JSON.parse(s.textContent || "{}");
      } catch (e) {
        cssMap = {};
      }
      cb();
    };
    s.onerror = function() {
      cssMap = {};
      cb();
    };
    document.head.appendChild(s);
  }

  function hslToRgb(hsl) {
    var h = (((hsl.h % 360) + 360) % 360) / 360;
    var s = hsl.s;
    var l = hsl.l;
    if (s === 0) {
      var v = Math.round(l * 255);
      return { r: v, g: v, b: v };
    }
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hue2rgb(p2, q2, t2) {
      if (t2 < 0) t2 += 1;
      if (t2 > 1) t2 -= 1;
      if (t2 < 1 / 6) return p2 + (q2 - p2) * 6 * t2;
      if (t2 < 1 / 2) return q2;
      if (t2 < 2 / 3) return p2 + (q2 - p2) * (2 / 3 - t2) * 6;
      return p2;
    }
    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
    };
  }

  function parseColor(str) {
    if (!str) return null;
    var s = str.trim().toLowerCase();
    if (s === "transparent") return null;
    if (s === "black") return hexToRgb("#000000");
    if (s === "white") return hexToRgb("#ffffff");
    if (s.charAt(0) === "#") return hexToRgb(s);
    if (cssMap && cssMap[s]) return hexToRgb(cssMap[s]);

    var rgbMatch = s.match(/^rgba?\(([^)]*)\)$/);
    if (rgbMatch) {
      var parts = rgbMatch[1].split(",").map(function(p) { return p.trim(); });
      var r = parseFloat(parts[0]);
      var g = parseFloat(parts[1]);
      var b = parseFloat(parts[2]);
      var a = parts.length > 3 ? parseFloat(parts[3]) : 1;
      if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) return null;
      if (parts[0].indexOf("%") !== -1) r = parseFloat(parts[0]) / 100 * 255;
      if (parts[1].indexOf("%") !== -1) g = parseFloat(parts[1]) / 100 * 255;
      if (parts[2].indexOf("%") !== -1) b = parseFloat(parts[2]) / 100 * 255;
      if (a > 1) a = a / 100;
      return mixWithWhite({ r: clamp255(r), g: clamp255(g), b: clamp255(b), a: clamp01(a) });
    }

    var hslMatch = s.match(/^hsla?\(([^)]*)\)$/);
    if (hslMatch) {
      var hParts = hslMatch[1].split(",").map(function(p) { return p.trim(); });
      var h = parseFloat(hParts[0]);
      var sat = parseFloat(hParts[1]);
      var lum = parseFloat(hParts[2]);
      var a2 = hParts.length > 3 ? parseFloat(hParts[3]) : 1;
      if (isNaN(h) || isNaN(sat) || isNaN(lum) || isNaN(a2)) return null;
      if (hParts[1].indexOf("%") !== -1) sat = parseFloat(hParts[1]) / 100;
      if (hParts[2].indexOf("%") !== -1) lum = parseFloat(hParts[2]) / 100;
      if (a2 > 1) a2 = a2 / 100;
      return mixWithWhite(hslToRgb({ h: h, s: sat, l: lum, a: clamp01(a2) }));
    }

    var simple = s.match(/^([0-9]+)(?:\s+([0-9]+))?(?:\s+([0-9]+))?$/);
    if (simple) {
      var r2 = parseInt(simple[1], 10);
      var g2 = simple[2] ? parseInt(simple[2], 10) : r2;
      var b2 = simple[3] ? parseInt(simple[3], 10) : r2;
      return mixWithWhite({ r: clamp255(r2), g: clamp255(g2), b: clamp255(b2), a: 1 });
    }

    return null;
  }

  function gammaExpand(ch) {
    var c = ch / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  }

  function luminance(c) {
    return 0.2126 * gammaExpand(c.r) + 0.7152 * gammaExpand(c.g) + 0.0722 * gammaExpand(c.b);
  }

  function contrastRatio(c1, c2) {
    var l1 = luminance(c1);
    var l2 = luminance(c2);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function cssToRgbString(c) {
    return "rgb(" + c.r + "," + c.g + "," + c.b + ")";
  }

  function toHex(c) {
    return "#" + [c.r, c.g, c.b].map(function(n) {
      return ("0" + n.toString(16)).slice(-2);
    }).join("");
  }

  function setBadge(el, kind, text) {
    el.textContent = text;
    el.className = "badge";
    if (kind === "pass") el.classList.add("badge-pass");
    else if (kind === "fail") el.classList.add("badge-fail");
    else el.classList.add("badge-neu");
  }

  function scaleX(ratio) {
    var min = 1, max = 21;
    var clamped = Math.max(min, Math.min(max, ratio));
    return 10 + (clamped - min) / (max - min) * 580;
  }

  function drawThresholds() {
    thresholdsG.innerHTML = "";
    [[3, "3"], [4.5, "4.5"], [7, "7"]] .forEach(function(t) {
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", scaleX(t[0]).toString());
      line.setAttribute("x2", scaleX(t[0]).toString());
      line.setAttribute("y1", "14");
      line.setAttribute("y2", "40");
      line.setAttribute("stroke", "#6c757d");
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("stroke-dasharray", "3 2");
      thresholdsG.appendChild(line);
      var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", scaleX(t[0]).toString());
      label.setAttribute("y", "52");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-size", "10");
      label.setAttribute("fill", "#6c757d");
      label.textContent = t[1];
      thresholdsG.appendChild(label);
    });
  }

  function syncPicker(which) {
    var val = which === "fg" ? fgInput.value : bgInput.value;
    var t = val.trim();
    if (/^#?[0-9a-fA-F]{3,6}$/.test(t)) {
      var rgb = hexToRgb(t);
      if (rgb) {
        var target = which === "fg" ? fgPicker : bgPicker;
        target.value = toHex(rgb);
      }
    }
  }

  function update(forceUpdate) {
    var fg = parseColor(fgInput.value);
    var bg = parseColor(bgInput.value);
    if (!fg || !bg) {
      errorBox.textContent = "Please enter two valid colors - hex, rgb(), hsl(), or a CSS color name.";
      errorBox.classList.remove("d-none");
      return;
    }
    errorBox.classList.add("d-none");

    var ratio = contrastRatio(fg, bg);
    var rounded = Math.round(ratio * 10) / 10;
    ratioValue.textContent = rounded.toFixed(1);

    var pNormalAA = ratio >= 4.5;
    setBadge(vNormal, pNormalAA ? "pass" : "fail", pNormalAA ? "AA Pass" : "Fail");

    var pLargeAA = ratio >= 3;
    setBadge(vLarge, pLargeAA ? "pass" : "fail", pLargeAA ? "AA Pass" : "Fail");

    var pUi = ratio >=  3;
    setBadge(vUi, pUi ? "pass" : "fail", pUi ? "AA Pass" : "Fail");

    previewBox.style.backgroundColor = cssToRgbString(bg);
    previewBig.style.color = cssToRgbString(fg);
    previewSmall.style.color = cssToRgbString(fg);

    var x = scaleX(ratio);
    pointer.setAttribute("x1", x.toString());
    pointer.setAttribute("x2", x.toString());
    pointerLabel.setAttribute("x", x.toString());
    pointerLabel.textContent = rounded.toFixed(1);
  }

  loadCssColors(function() {
    fgInput.addEventListener("input", function() { update(true); syncPicker("fg"); });
    bgInput.addEventListener("input", function() { update(true); syncPicker("bg"); });
    fgPicker.addEventListener("input", function() { fgInput.value = fgPicker.value; update(true); });
    bgPicker.addEventListener("input", function() { bgInput.value = bgPicker.value; update(true); });
    swapBtn.addEventListener("click", function() {
      var tmp = fgInput.value;
      fgInput.value = bgInput.value;
      bgInput.value = tmp;
      var t2 = fgPicker.value;
      fgPicker.value = bgPicker.value;
      bgPicker.value = t2;
      update(true);
    });
    Array.prototype.forEach.call(document.querySelectorAll(".preset"), function(btn) {
      btn.addEventListener("click", function() {
        fgInput.value = btn.getAttribute("data-fg");
        fgPicker.value = btn.getAttribute("data-fg");
        bgInput.value = btn.getAttribute("data-bg");
        bgPicker.value = btn.getAttribute("data-bg");
        update(true);
      });
    });
    fgInput.addEventListener("keydown", function(e) { if (e.key === "Enter") e.preventDefault(); });
    bgInput.addEventListener("keydown", function(e) { if (e.key === "Enter") e.preventDefault(); });
    drawThresholds();
    update(true);
  });

})();
