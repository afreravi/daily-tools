(function () {
  "use strict";

  var MAX_INPUT = 120;
  var MAX_BAR_MARKS = 24;

  // Combining diacritical marks, grouped by where they attach to a base character.
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

  // Per-style bias: how likely each region receives marks, plus a decay curve.
  var STYLES = {
    cursed:  { above: 1.0, below: 1.0, through: 0.55, decay: 0.0, label: "Cursed" },
    haunted: { above: 0.25, below: 1.0, through: 0.15, decay: 0.0, label: "Haunted" },
    static:  { above: 0.6, below: 0.25, through: 1.0, decay: 0.0, label: "Static" },
    decay:   { above: 1.0, below: 0.0, through: 0.05, decay: 0.35, label: "Decay" },
    void:    { above: 0.7, below: 0.7, through: 0.4, decay: 0.1, gap: 0.22, label: "Void" }
  };

  var $ = function (id) { return document.getElementById(id); };

  var form = $("curseForm");
  var textInput = $("textInput");
  var styleSelect = $("styleSelect");
  var intensity = $("intensity");
  var levelBadge = $("levelBadge");
  var charCount = $("charCount");
  var errorBox = $("errorBox");
  var resultWrap = $("resultWrap");
  var output = $("output");
  var styleBadge = $("styleBadge");
  var chart = $("chart");
  var copyStatus = $("copyStatus");

  var stats = {
    chars: $("statChars"),
    marks: $("statMarks"),
    avg: $("statAvg"),
    out: $("statOut"),
    read: $("statRead")
  };

  var lastPlain = "";
  var lastCursed = "";

  function randomMark(list) {
    return String.fromCharCode(list[Math.floor(Math.random() * list.length)]);
  }

  function markCount(level, regionBias, decayFactor, gapChance) {
    if (regionBias <= 0) { return 0; }
    if (gapChance && Math.random() < gapChance) { return 0; }
    var roll = Math.random() * regionBias * (0.35 + level * 0.9);
    var count = Math.round(roll * decayFactor);
    return count > 0 ? count : (regionBias > 0.5 && Math.random() < 0.4 ? 1 : 0);
  }

  function curseChar(ch, style, level, position, total) {
    if (/\s/.test(ch)) { return { text: ch, marks: 0 }; }

    var bias = STYLES[style];
    var decayFactor = bias.decay > 0
      ? Math.max(0.25, 1 - bias.decay * (position / Math.max(1, total - 1)))
      : 1;

    var marks = "";
    var count = 0;

    var above = markCount(level, bias.above, decayFactor, bias.gap);
    for (var a = 0; a < above; a++) { marks += randomMark(ABOVE); }
    count += above;

    var below = markCount(level, bias.below, decayFactor, bias.gap);
    for (var b = 0; b < below; b++) { marks += randomMark(BELOW); }
    count += below;

    var through = markCount(level, bias.through, decayFactor, bias.gap);
    for (var t = 0; t < through; t++) { marks += randomMark(THROUGH); }
    count += through;

    return { text: ch + marks, marks: count };
  }

  function curseText(text, style, level) {
    var out = "";
    var totalMarks = 0;
    var perChar = [];
    var chars = Array.from(text);

    for (var i = 0; i < chars.length; i++) {
      var res = curseChar(chars[i], style, level, i, chars.length);
      out += res.text;
      totalMarks += res.marks;
      perChar.push({ ch: chars[i], marks: res.marks });
    }

    return { text: out, marks: totalMarks, perChar: perChar };
  }

  function renderChart(perChar) {
    chart.innerHTML = "";
    var max = 1;
    perChar.forEach(function (item) {
      if (item.marks > max) { max = item.marks; }
    });

    perChar.forEach(function (item) {
      var bar = document.createElement("div");
      bar.className = "bar" + (item.marks === 0 ? " is-space" : "");
      var capped = Math.min(item.marks, MAX_BAR_MARKS);
      var pct = item.marks === 0 ? 0 : Math.max(6, Math.round((capped / Math.min(max, MAX_BAR_MARKS)) * 100));
      bar.style.height = pct + "%";
      bar.title = item.ch === " " ? "space: 0 marks" : "'" + item.ch + "': " + item.marks + " marks";
      chart.appendChild(bar);
    });
  }

  function readability(marks, chars) {
    if (chars === 0) { return "—"; }
    var avg = marks / chars;
    if (avg < 1.2) { return "Easy"; }
    if (avg < 3) { return "Strained"; }
    if (avg < 6) { return "Hard"; }
    return "Lost";
  }

  function update(plainText) {
    var style = styleSelect.value;
    var level = parseInt(intensity.value, 10);
    var result = curseText(plainText, style, level);

    lastPlain = plainText;
    lastCursed = result.text;

    output.textContent = result.text;
    styleBadge.textContent = STYLES[style].label;

    var visible = result.perChar.filter(function (i) { return i.ch.trim() !== ""; }).length;
    stats.chars.textContent = visible;
    stats.marks.textContent = result.marks;
    stats.avg.textContent = visible ? (result.marks / visible).toFixed(1) : "0.0";
    stats.out.textContent = result.text.length;
    stats.read.textContent = readability(result.marks, visible);

    renderChart(result.perChar);
    resultWrap.classList.remove("d-none");
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function validate() {
    var value = textInput.value;
    if (!value.trim()) {
      showError("Type something to curse first — even one short word will do.");
      textInput.focus();
      return null;
    }
    if (value.length > MAX_INPUT) {
      showError("That is " + value.length + " characters. Please keep it to " + MAX_INPUT + " or fewer.");
      return null;
    }
    clearError();
    return value;
  }

  textInput.addEventListener("input", function () {
    charCount.textContent = textInput.value.length;
    clearError();
  });

  intensity.addEventListener("input", function () {
    levelBadge.textContent = intensity.value + " / 10";
    if (lastPlain) { update(lastPlain); }
  });

  styleSelect.addEventListener("change", function () {
    if (lastPlain) { update(lastPlain); }
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var value = validate();
    if (value === null) { return; }
    update(value);
  });

  $("rerollBtn").addEventListener("click", function () {
    if (!lastPlain) {
      var value = validate();
      if (value === null) { return; }
      update(value);
      return;
    }
    update(lastPlain);
  });

  $("resetBtn").addEventListener("click", function () {
    textInput.value = "";
    charCount.textContent = "0";
    intensity.value = 4;
    levelBadge.textContent = "4 / 10";
    styleSelect.value = "cursed";
    lastPlain = "";
    lastCursed = "";
    resultWrap.classList.add("d-none");
    copyStatus.textContent = "";
    clearError();
    textInput.focus();
  });

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  $("copyBtn").addEventListener("click", function () {
    if (!lastCursed) { return; }
    copyToClipboard(lastCursed).then(function () {
      copyStatus.textContent = "Copied!";
      window.setTimeout(function () { copyStatus.textContent = ""; }, 2000);
    }).catch(function () {
      copyStatus.textContent = "Copy failed — select the text and copy manually.";
    });
  });

  $("downloadBtn").addEventListener("click", function () {
    if (!lastCursed) { return; }
    var blob = new Blob([lastCursed], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "cursed-text.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    copyStatus.textContent = "Downloaded.";
    window.setTimeout(function () { copyStatus.textContent = ""; }, 2000);
  });

  charCount.textContent = "0";
  levelBadge.textContent = "4 / 10";
})();
