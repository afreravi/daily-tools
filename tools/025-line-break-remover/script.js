(function () {
  "use strict";

  var input = document.getElementById("inputText");
  var output = document.getElementById("outputText");
  var btnCopy = document.getElementById("btnCopy");
  var btnApply = document.getElementById("btnApply");
  var btnClear = document.getElementById("btnClear");
  var btnSample = document.getElementById("btnSample");
  var copyMsg = document.getElementById("copyMsg");
  var warnBox = document.getElementById("warnBox");

  var optTrim = document.getElementById("optTrim");
  var optCollapse = document.getElementById("optCollapse");
  var optEmpty = document.getElementById("optEmpty");

  var statChars = document.getElementById("statChars");
  var statWords = document.getElementById("statWords");
  var statLinesBefore = document.getElementById("statLinesBefore");
  var statLinesAfter = document.getElementById("statLinesAfter");
  var statCharsDelta = document.getElementById("statCharsDelta");
  var statWordsDelta = document.getElementById("statWordsDelta");
  var statLinesDelta = document.getElementById("statLinesDelta");

  var canvas = document.getElementById("resultChart");

  var SAMPLE = "The quick brown fox\njumps over the lazy dog.\n\nThis second paragraph was\nbroken across several lines\nby a PDF export.\n\n\nPaste text like this and the\ntool rejoins it cleanly.";

  function getMode() {
    var chosen = document.querySelector('input[name="mode"]:checked');
    return chosen ? chosen.value : "space";
  }

  function normalise(text) {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function countWords(text) {
    var m = text.match(/\S+/g);
    return m ? m.length : 0;
  }

  function countLines(text) {
    if (text.length === 0) return 0;
    return text.split("\n").length;
  }

  function clean(text) {
    if (text.length === 0) return "";

    var mode = getMode();
    var lines = normalise(text).split("\n");

    if (optTrim.checked) {
      lines = lines.map(function (line) { return line.replace(/[ \t]+$/, "").replace(/^[ \t]+/, ""); });
    }

    var result = lines.join("\n");

    if (mode === "paragraph") {
      // join wrapped lines, keep blank-line paragraph separators
      result = result
        .split(/\n{2,}/)
        .map(function (block) {
          return block.split("\n").filter(function (l) { return l.length > 0; }).join(" ");
        })
        .filter(function (b) { return b.length > 0; })
        .join("\n\n");
    } else if (mode === "space") {
      result = result.replace(/\n+/g, " ");
    } else {
      result = result.replace(/\n+/g, "");
    }

    if (optCollapse.checked) {
      result = result.replace(/[ \t]{2,}/g, " ");
    }

    if (optEmpty.checked) {
      result = result
        .split("\n")
        .filter(function (l) { return l.trim().length > 0; })
        .join("\n");
    }

    if (mode !== "paragraph") {
      result = result.trim();
    }

    return result;
  }

  function formatDelta(before, after) {
    var diff = after - before;
    if (before === 0 && after === 0) return "";
    if (diff === 0) return "no change";
    return (diff > 0 ? "+" : "\u2212") + Math.abs(diff);
  }

  function drawChart(before, after) {
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var groups = [
      { label: "Characters", b: before.chars, a: after.chars },
      { label: "Words", b: before.words, a: after.words },
      { label: "Lines", b: before.lines, a: after.lines }
    ];

    var maxVal = 1;
    groups.forEach(function (g) { maxVal = Math.max(maxVal, g.b, g.a); });

    var padLeft = 44;
    var padBottom = 34;
    var padTop = 18;
    var plotW = W - padLeft - 20;
    var plotH = H - padBottom - padTop;

    // gridlines
    ctx.strokeStyle = "#ece6f4";
    ctx.fillStyle = "#8a8296";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var i = 0; i <= 4; i++) {
      var val = (maxVal / 4) * i;
      var y = padTop + plotH - (plotH * (i / 4));
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.fillText(String(Math.round(val)), padLeft - 8, y);
    }

    var groupW = plotW / groups.length;
    var barW = Math.min(38, groupW / 3);
    var gap = 6;

    ctx.textAlign = "center";
    groups.forEach(function (g, gi) {
      var cx = padLeft + groupW * gi + groupW / 2;
      var bx = cx - barW - gap / 2;
      var ax = cx + gap / 2;

      drawBar(ctx, bx, barW, plotH, padTop, maxVal, g.b, "#c9a6e6", g.b);
      drawBar(ctx, ax, barW, plotH, padTop, maxVal, g.a, "#60089c", g.a);

      ctx.fillStyle = "#4a4256";
      ctx.font = "12px sans-serif";
      ctx.textBaseline = "top";
      ctx.fillText(g.label, cx, padTop + plotH + 10);
    });

    // legend
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#c9a6e6";
    ctx.fillRect(padLeft, 4, 10, 10);
    ctx.fillStyle = "#4a4256";
    ctx.font = "11px sans-serif";
    ctx.fillText("Before", padLeft + 15, 9);
    ctx.fillStyle = "#60089c";
    ctx.fillRect(padLeft + 70, 4, 10, 10);
    ctx.fillStyle = "#4a4256";
    ctx.fillText("After", padLeft + 85, 9);
  }

  function drawBar(ctx, x, w, plotH, padTop, maxVal, value, color, numVal) {
    var h = maxVal > 0 ? (plotH * (value / maxVal)) : 0;
    var y = padTop + plotH - h;
    ctx.fillStyle = color;
    if (h > 0) {
      ctx.fillRect(x, y, w, h);
    } else {
      ctx.fillRect(x, padTop + plotH - 2, w, 2);
    }
    ctx.fillStyle = "#4a4256";
    ctx.font = "11px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(String(numVal), x + w / 2, y - 3);
  }

  function update() {
    var raw = input.value;
    var hadInput = raw.length > 0;
    var result = clean(raw);

    output.value = result;

    var before = { chars: raw.length, words: countWords(raw), lines: countLines(raw) };
    var after = { chars: result.length, words: countWords(result), lines: countLines(result) };

    statChars.textContent = after.chars;
    statWords.textContent = after.words;
    statLinesBefore.textContent = before.lines;
    statLinesAfter.textContent = after.lines;

    statCharsDelta.textContent = formatDelta(before.chars, after.chars);
    statWordsDelta.textContent = formatDelta(before.words, after.words);
    statLinesDelta.textContent = formatDelta(before.lines, after.lines);

    drawChart(before, after);

    if (!hadInput) {
      showWarn("Paste some text above to clean it. Nothing leaves your browser.");
    } else if (result.length === 0) {
      showWarn("The result is empty \u2014 your input contained only whitespace or blank lines.");
    } else if (before.lines === 1) {
      showWarn("Your text has no line breaks to remove, but spacing has still been tidied.");
    } else {
      hideWarn();
    }

    btnCopy.disabled = result.length === 0;
    btnApply.disabled = result.length === 0;
  }

  function showWarn(msg) {
    warnBox.textContent = msg;
    warnBox.classList.remove("d-none");
  }
  function hideWarn() {
    warnBox.textContent = "";
    warnBox.classList.add("d-none");
  }

  function flash(msg) {
    copyMsg.textContent = msg;
    window.setTimeout(function () { copyMsg.textContent = ""; }, 1800);
  }

  function copyResult() {
    var text = output.value;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flash("Copied!"); },
        function () { legacyCopy(text); }
      );
    } else {
      legacyCopy(text);
    }
  }

  function legacyCopy(text) {
    output.removeAttribute("readonly");
    output.select();
    try {
      document.execCommand("copy");
      flash("Copied!");
    } catch (e) {
      flash("Press Ctrl+C to copy");
    }
    output.setAttribute("readonly", "readonly");
  }

  // events
  input.addEventListener("input", update);
  Array.prototype.forEach.call(document.querySelectorAll('input[name="mode"]'), function (r) {
    r.addEventListener("change", update);
  });
  [optTrim, optCollapse, optEmpty].forEach(function (c) { c.addEventListener("change", update); });

  btnCopy.addEventListener("click", copyResult);
  btnApply.addEventListener("click", function () {
    if (!output.value) return;
    input.value = output.value;
    update();
    input.focus();
  });
  btnClear.addEventListener("click", function () {
    input.value = "";
    update();
    input.focus();
  });
  btnSample.addEventListener("click", function () {
    input.value = SAMPLE;
    update();
  });

  // keyboard-friendly: allow Esc in output to refocus input
  output.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.focus(); }
  });

  update();
})();
