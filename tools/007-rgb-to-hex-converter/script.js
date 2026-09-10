(function() {
  "use strict";

  var form = document.getElementById("rgbForm");
  var rInput = document.getElementById("rInput");
  var gInput = document.getElementById("gInput");
  var bInput = document.getElementById("bInput");
  var errorBox = document.getElementById("errorAlert");
  var results = document.getElementById("resultsCard");
  var swatch = document.getElementById("swatch");
  var hexOut = document.getElementById("hexOut");
  var rgbOut = document.getElementById("rgbOut");
  var hslOut = document.getElementById("hslOut");
  var lumNote = document.getElementById("lumNote");
  var canvas = document.getElementById("mixCanvas");
  var ctx = canvas ? canvas.getContext("2d") : null;

  function clampChannel(v) {
    if (v === "" || v === null || v === undefined) return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    n = Math.round(n);
    if (n < 0 || n > 255) return null;
    return n;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
    results.classList.add("d-none");
  }

  function clearError() {
    errorBox.classList.add("d-none");
  }

  function cssRgb(r, g, b) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
  }

  function toHex(n) {
    var s = n.toString(16);
    return s.length === 1 ? "0" + s : s;
  }

  function toHsl(r, g, b) {
    var rn = r / 255;
    var gn = g / 255;
    var bn = b / 255;
    var max = Math.max(rn, gn, bn);
    var min = Math.min(rn, gn, bn);
    var h = 0;
    var s =  0;
    var l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l >  0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = (gn - bn) / d + (gn < bn ? 6 :  0); break;
        case gn: h = (bn - rn) / d +  2; break;
        default: h = (rn - gn) / d +  4;
      }
      h /=  6;
    }
    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    return h + "\u00B0 " + s + "% " + l + "%";
  }

  function perceivedLightness(r, g, b) {
    function linearize(c) {
      return c <=  0.03928 ? c /  12.92 : Math.pow((c +  0.055) /  1.055,  2.4);
    }
    var rn = r /  255;
    var gn = g /  255;
    var bn = b /  255;
    var y =  0.2126 * linearize(rn) +  0.7152 * linearize(gn) +  0.0722 * linearize(bn);
    var pct = Math.round(y *  1000) /  10;
    return pct + "%";
  }

  function drawChart(r, g, b) {
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0,  0, w, h);
    var pad = 30;
    var base = h - 30;
    var barW = 70;
    var gap = 40;
    var maxW = w - pad *  2 - gap *  2;
    var total = r + g + b ||  1;
    var bars = ["Red", "Green", "Blue"];
    var values = [r, g, b];
    var colors = ["#e74c3c", "#27ae60", "#2980b9"];
    for (var i =  0; i < bars.length; i++) {
      var share = values[i] / total;
      var barWidth = Math.round(share * maxW);
      var x = pad + i * (gap + barW);
      var y = base - barWidth;
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barWidth,  6);
      ctx.fill();
      ctx.fillStyle = "#6c757d";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(values[i] + " (" + Math.round(share *  100) + "%)", x + barW /  2, h -  8);
      ctx.fillStyle = colors[i];
      ctx.fillText(bars[i] + " (" + Math.round(share *   0) + "%)", x + barW /  2,y -  6);
    }
  }

  function render(r, g, b) {
    var hex = "#" + toHex(r) + toHex(g) + toHex(b);
    hexOut.value = hex.toLowerCase();
    rgbOut.value = cssRgb(r, g, b);
    hslOut.textContent = toHsl(r, g, b);
    lumNote.textContent = perceivedLightness(r, g, b);
    swatch.style.backgroundColor = hex;
    results.classList.remove("d-none");
    drawChart(r, g, b);
  }

  function convert() {
    clearError();
    var r = clampChannel(rInput.value);
    var g = clampChannel(gInput.value);
    var b = clampChannel(bInput.value);
    if (r === null || g === null || b === null) {
      showError("Please enter each channel as a whole number between 0 and 255. Empty, decimal, or out-of-range values are rejected.");
      return;
    }
    render(r, g, b);
  }

  function liveConvert() {
    if (rInput.value === "" && gInput.value === "" && bInput.value === "") return;
    convert();
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    convert();
  });

  [rInput, gInput, bInput].forEach(function(inp) {
    inp.addEventListener("input", function() {
      clearError();
      liveConvert();
        liveConvert();
    });
  });

  document.querySelectorAll(".copy-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var t = document.getElementById(btn.getAttribute("data-copy"));
      if (!t) return;
      t.select();
      t.setSelectionRange(0,  99999);
      try {
        document.execCommand("copy");
        var old = btn.textContent;
        btn.textContent = "Copied!";
        setTimeout(function() { btn.textContent = old; },  1500);
      } catch (err) {
        btn.textContent = "Press Ctrl+C";
        setTimeout(function() { btn.textContent = "Copy"; },  1500);
      }
    });
  });

  function sweepInput(inp) {
    var n = clampChannel(inp.value);
    inp.value = n === null ? "" : n;
  }
  [rInput, gInput, bInput].forEach(function(inp) {
    inp.addEventListener("change", function() { sweepInput(inp); });
  });

  rInput.focus();
})();
