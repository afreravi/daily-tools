(function () {
  "use strict";

  var MAX_INPUT = 120;

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

  var PRESETS = {
    mini:    { up: 1, mid: 0, down: 1 },
    classic: { up: 4, mid: 1, down: 4 },
    above:   { up: 6, mid: 0, down: 0 },
    below:   { up: 0, mid: 0, down: 6 },
    chaos:   { up: 12, mid: 12, down: 12 }
  };

  var $ = function (id) { return document.getElementById(id); };
  var textInput = $("textInput");
  var upRange = $("upRange");
  var midRange = $("midRange");
  var downRange = $("downRange");
  var presetSelect = $("presetSelect");
  var output = $("output");
  var errorBox = $("errorBox");
  var charCount = $("charCount");

  var last = { text: "", up: 3, mid: 1, down: 3, marks: 0, out: 0 };

  function pick(list, rand) { return list[Math.floor(rand() * list.length)]; }

  function curse(text, up, mid, down) {
    var marks = 0;
    var out = "";

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      out += ch;
      if (ch === "\n" || ch === "\r" || ch === " " || ch === "\t") continue;

      var a;
      for (a = 0; a < up; a++) {
        out += String.fromCharCode(pick(ABOVE, Math.random()));
        marks++;
      }
      for (a = 0; a < mid; a++) {
        out += String.fromCharCode(pick(THROUGH, Math.random()));
        marks++;
      }
      for (a = 0; a < down; a++) {
        out += String.fromCharCode(pick(BELOW, Math.random()));
        marks++;
      }
    }
    return { text: out, marks: marks, outLength: out.length };
  }

  function readRange(el, max) {
    var v = parseInt(el.value, 10);
    if (isNaN(v) || v < 0) return 0;
    if (v > max) return max;
    return v;
  }

  function syncLabels() {
    $("upValue").textContent = upRange.value;
    $("midValue").textContent = midRange.value;
    $("downValue").textContent = downRange.value;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }
  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function renderStats(inLen, outLen, marks) {
    $("statIn").textContent = inLen;
    $("statOut").textContent = outLen;
    $("statMarks").textContent = marks;
    var per = inLen > 0 ? (marks / inLen) : 0;
    $("statPerChar").textContent = per.toFixed(1);
  }

  function renderEmpty() {
    output.textContent = "Your zalgo text will appear here.";
    output.classList.add("is-empty");
    renderStats(0, 0, 0);
    drawChart(0, 0, 0);
  }

  function drawChart(up, mid, down) {
    var canvas = $("directionChart");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var w = canvas.width = canvas.clientWidth || 320;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var labels = ["Above", "Through", "Below"];
    var values = [up, mid, down];
    var colors = ["#60089c", "#7d21bd", "#b174e0"];
    var maxV = Math.max(1, up, mid, down);
    var barW = Math.floor((w - 30) / 3) - 14;
    var chartH = h - 34;

    labels.forEach(function (label, idx) {
      var v = values[idx];
      var bh = Math.max(2, Math.round((v / maxV) * chartH));
      var x = 15 + idx * (barW + 14);
      var y = h - 24 - bh;
      ctx.fillStyle = colors[idx];
      ctx.fillRect(x, y, barW, bh);
      ctx.fillStyle = "#3a3344";
      ctx.font = "11px Segoe UI, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(label, x + barW / 2, h - 8);
      ctx.fillText(String(v), x + barW / 2, y - 4);
    });
  }

  function generate() {
    clearError();
    var text = textInput.value;
    if (!text.trim()) {
      showError("Please enter some text first — even a single word works.");
      renderEmpty();
      textInput.focus();
      return;
    }
    if (text.length > MAX_INPUT) {
      text = text.slice(0, MAX_INPUT);
      textInput.value = text;
      charCount.textContent = String(text.length);
    }

    last.text = text;
    last.up = readRange(upRange, 12);
    last.mid = readRange(midRange, 12);
    last.down = readRange(downRange, 12);

    var result = curse(text, last.up, last.mid, last.down);
    output.textContent = result.text;
    output.classList.remove("is-empty");
    renderStats(text.length, result.outLength, result.marks);
    drawChart(last.up, last.mid, last.down);
  }

  function copyOutput() {
    var text = output.classList.contains("is-empty") ? "" : output.textContent;
    if (!text) { showError("Generate some zalgo text first, then copy it."); return; }
    clearError();
    var btn = $("copyBtn");
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "Copied!";
      btn.disabled = true;
      setTimeout(function () { btn.textContent = old; btn.disabled = false; }, 1200);
    };
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
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); }
    catch (e) { showError("Copy failed — select the output manually and copy it."); }
    document.body.removeChild(ta);
  }

  function download() {
    var text = output.classList.contains("is-empty") ? "" : output.textContent;
    if (!text) { showError("Generate some zalgo text before downloading."); return; }
    clearError();
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "zalgo-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  $("zalgoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    generate();
  });
  $("copyBtn").addEventListener("click", copyOutput);
  $("downloadBtn").addEventListener("click", download);
  $("rerollBtn").addEventListener("click", function () {
    if (!textInput.value.trim()) { showError("Enter some text first, then re-roll the marks."); return; }
    generate();
  });
  $("randomBtn").addEventListener("click", function () {
    upRange.value = String(Math.floor(Math.random() * 7));
    midRange.value = String(Math.floor(Math.random() * 4));
    downRange.value = String(Math.floor(Math.random() * 7));
    presetSelect.value = "custom";
    syncLabels();
    generate();
  });
  $("clearBtn").addEventListener("click", function () {
    textInput.value = "";
    charCount.textContent = "0";
    clearError();
    renderEmpty();
    textInput.focus();
  });

  [upRange, midRange, downRange].forEach(function (el) {
    el.addEventListener("input", function () {
      presetSelect.value = "custom";
      syncLabels();
      drawChart(readRange(upRange, 12), readRange(midRange, 12), readRange(downRange, 12));
    });
  });

  presetSelect.addEventListener("change", function () {
    var p = PRESETS[presetSelect.value];
    if (!p) return;
    upRange.value = String(p.up);
    midRange.value = String(p.mid);
    downRange.value = String(p.down);
    syncLabels();
    drawChart(p.up, p.mid, p.down);
  });

  textInput.addEventListener("input", function () {
    charCount.textContent = String(textInput.value.length);
  });

  window.addEventListener("resize", function () {
    drawChart(last.up, last.mid, last.down);
  });

  syncLabels();
  renderEmpty();
})();
