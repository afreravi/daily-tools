(function () {
  "use strict";

  var MAX_INPUT = 240;

  // Combining marks grouped by where they attach to the base character.
  var ABOVE = [
    0x0300, 0x0301, 0x0302, 0x0303, 0x0304, 0x0306, 0x0307, 0x0308, 0x0309,
    0x030a, 0x030b, 0x030c, 0x0311, 0x0313, 0x0314, 0x033d, 0x0342, 0x0344,
    0x0350, 0x0351, 0x0352, 0x0357, 0x035b
  ];
  var BELOW = [
    0x0316, 0x0317, 0x0318, 0x0319, 0x031c, 0x031d, 0x031e, 0x031f, 0x0320,
    0x0323, 0x0324, 0x0325, 0x0326, 0x0329, 0x032a, 0x032b, 0x032c, 0x032d,
    0x032e, 0x032f, 0x0330, 0x0331, 0x0332, 0x0333, 0x0339, 0x033a, 0x033b,
    0x033c, 0x0345, 0x0347, 0x0348, 0x0349, 0x034d, 0x034e
  ];
  var THROUGH = [0x0334, 0x0335, 0x0336, 0x0337, 0x0338];

  var STYLES = {
    zalgo:  { above: 1.0, below: 1.0, through: 0.6, label: "Zalgo" },
    static: { above: 0.7, below: 0.3, through: 0.9, label: "Static" },
    flicker:{ above: 0.5, below: 0.0, through: 0.1, label: "Flicker" },
    fade:   { above: 0.1, below: 1.0, through: 0.2, label: "Fade" }
  };

  var $ = function (id) { return document.getElementById(id); };
  var textInput = $("textInput");
  var intensity = $("intensity");
  var intensityValue = $("intensityValue");
  var styleSelect = $("styleSelect");
  var output = $("output");
  var errorBox = $("errorBox");
  var charCount = $("charCount");

  var last = { text: "", style: "zalgo", intensity: 4, marks: 0, out: 0 };

  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }

  function marksFor(style, level) {
    var cfg = STYLES[style];
    // Intensity 1..10 maps to a base stack of 1..18 marks.
    var base = Math.round(1 + (level - 1) * 1.9);
    var count = 0;
    for (var i = 0; i < base; i++) {
      if (Math.random() < cfg.above) count++;
    }
    for (var j = 0; j < Math.floor(base * 0.8); j++) {
      if (Math.random() < cfg.below) count++;
    }
    for (var k = 0; k < Math.floor(base * 0.5); k++) {
      if (Math.random() < cfg.through) count++;
    }
    return { count: count, base: base, cfg: cfg };
  }

  function glitch(text, style, level) {
    var cfg = STYLES[style];
    var out = "";
    var marks = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      out += ch;
      if (ch === " " || ch === "\n" || ch === "\t" || ch === "\r") continue;
      var info = marksFor(style, level);
      var produced = 0;
      for (var a = 0; a < info.base && produced < info.count; a++) {
        if (Math.random() < cfg.above) { out += String.fromCharCode(pick(ABOVE)); produced++; }
      }
      for (var b = 0; b < Math.floor(info.base * 0.8) && produced < info.count; b++) {
        if (Math.random() < cfg.below) { out += String.fromCharCode(pick(BELOW)); produced++; }
      }
      for (var c = 0; c < Math.floor(info.base * 0.5) && produced < info.count; c++) {
        if (Math.random() < cfg.through) { out += String.fromCharCode(pick(THROUGH)); produced++; }
      }
      marks += produced;
    }
    return { text: out, marks: marks };
  }

  function showError(msg) {
    if (!msg) { errorBox.classList.add("d-none"); errorBox.textContent = ""; return; }
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }

  function updateStats(inLen, outLen, marks, level) {
    $("statIn").textContent = inLen;
    $("statOut").textContent = outLen;
    $("statMarks").textContent = marks;
    var blend = outLen > 0 ? Math.round((marks / outLen) * 100) : 0;
    $("statBlend").textContent = blend + "%";
  }

  function render(text, style, level) {
    var trimmed = text.replace(/\s+$/g, "");
    if (!trimmed) {
      showError("Please enter some text to glitch. Try a short word or phrase.");
      output.textContent = "";
      updateStats(0, 0, 0, level);
      last = { text: "", style: style, intensity: level, marks: 0, out: 0 };
      drawChart(style, level, 0);
      return;
    }
    if (trimmed.length > MAX_INPUT) {
      trimmed = trimmed.slice(0, MAX_INPUT);
      textInput.value = trimmed;
    }
    showError("");
    var result = glitch(trimmed, style, level);
    output.textContent = result.text;
    last = { text: result.text, style: style, intensity: level, marks: result.marks, out: result.text.length };
    updateStats(trimmed.length, result.text.length, result.marks, level);
    drawChart(style, level, result.marks);
  }

  function drawChart(style, level, marks) {
    var canvas = $("glitchChart");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth || 320;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var labels = ["Zalgo", "Static", "Flicker", "Fade"];
    var keys = ["zalgo", "static", "flicker", "fade"];
    var perChar = 1 + (level - 1) * 1.9;
    var values = keys.map(function (k) {
      var cfg = STYLES[k];
      return Math.round(perChar * (cfg.above + cfg.below * 0.8 + cfg.through * 0.5));
    });
    var max = Math.max.apply(null, values.concat([1]));
    var pad = 28;
    var barW = (w - pad - 10) / values.length - 12;

    ctx.font = "11px Segoe UI, Arial, sans-serif";
    for (var i = 0; i < values.length; i++) {
      var x = pad + i * (barW + 12);
      var barH = Math.round(((h - 34) * values[i]) / max);
      var y = h - 20 - barH;
      var active = keys[i] === style;
      ctx.fillStyle = active ? "#60089c" : "#cfa8ea";
      ctx.fillRect(x, y, barW, barH);
      ctx.fillStyle = "#4b0779";
      ctx.fillText(labels[i], x, h - 6);
      ctx.fillStyle = "#6a6273";
      ctx.fillText(String(values[i]), x, y - 3);
    }
  }

  // Events
  textInput.addEventListener("input", function () {
    charCount.textContent = textInput.value.length;
  });

  intensity.addEventListener("input", function () {
    intensityValue.textContent = intensity.value;
  });

  $("glitchForm").addEventListener("submit", function (e) {
    e.preventDefault();
    render(textInput.value, styleSelect.value, parseInt(intensity.value, 10));
  });

  $("randomBtn").addEventListener("click", function () {
    var keys = Object.keys(STYLES);
    var s = pick(keys);
    styleSelect.value = s;
    var lvl = 2 + Math.floor(Math.random() * 8);
    intensity.value = lvl;
    intensityValue.textContent = lvl;
    if (!textInput.value.trim()) {
      textInput.value = "stay glitched";
      charCount.textContent = textInput.value.length;
    }
    render(textInput.value, s, lvl);
  });

  $("clearBtn").addEventListener("click", function () {
    textInput.value = "";
    charCount.textContent = "0";
    output.textContent = "";
    showError("");
    updateStats(0, 0, 0, parseInt(intensity.value, 10));
    drawChart(styleSelect.value, parseInt(intensity.value, 10), 0);
  });

  $("copyBtn").addEventListener("click", function () {
    if (!last.text) { showError("Generate some glitch text first, then copy it."); return; }
    var done = function () { flash($("copyBtn"), "Copied!"); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(last.text).then(done, function () { fallbackCopy(done); });
    } else {
      fallbackCopy(done);
    }
  });

  function fallbackCopy(cb) {
    var ta = document.createElement("textarea");
    ta.value = last.text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (err) { showError("Copy failed — please select the text manually."); }
    document.body.removeChild(ta);
  }

  function flash(btn, msg) {
    var original = btn.textContent;
    btn.textContent = msg;
    setTimeout(function () { btn.textContent = original; }, 1400);
  }

  $("downloadBtn").addEventListener("click", function () {
    if (!last.text) { showError("Generate some glitch text first, then download it."); return; }
    var blob = new Blob([last.text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "glitch-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  window.addEventListener("resize", function () {
    drawChart(last.style, last.intensity, last.marks);
  });

  // Initial paint
  drawChart("zalgo", 4, 0);
})();
