(function () {
  "use strict";

  var GLYPH_W = 5;
  var GLYPH_H = 7;

  var FONT = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "B": ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
    "C": ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "G": ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "J": ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
    "K": ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "M": ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
    "N": ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "P": ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
    "Q": ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    "W": ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
    "X": ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "Z": ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
    "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
    "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
    "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
    "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
    "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
    "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
    "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
    "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
    "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
    "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
    " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
    "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
    "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
    ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
    ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
    "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
    "_": ["00000", "00000", "00000", "00000", "00000", "00000", "11111"],
    "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
    "\"": ["01010", "01010", "01010", "00000", "00000", "00000", "00000"],
    "&": ["01100", "10010", "10100", "01000", "10101", "10010", "01101"],
    ":": ["00000", "01100", "01100", "00000", "01100", "01100", "00000"],
    ";": ["00000", "01100", "01100", "00000", "01100", "00100", "01000"],
    "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
    "\\": ["10000", "01000", "01000", "00100", "00010", "00010", "00001"],
    "*": ["00000", "10101", "01110", "11111", "01110", "10101", "00000"],
    "#": ["01010", "01010", "11111", "01010", "11111", "01010", "01010"],
    "+": ["00000", "00100", "00100", "11111", "00100", "00100", "00000"],
    "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
    "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
    "@": ["01110", "10001", "10111", "10101", "10111", "10000", "01110"],
    "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
    ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"]
  };

  var STYLES = {
    classic: { fill: "#" },
    solid: { fill: "█" },
    outline: { fill: "█", outline: true },
    dots: { fill: "•" },
    stars: { fill: "*" },
    shadow: { fill: "█", shadow: "░" },
    at: { fill: "@" }
  };

  var LIMITS = [
    { label: "72", value: 72 },
    { label: "80", value: 80 },
    { label: "120", value: 120 },
    { label: "280", value: 280 }
  ];

  var form = document.getElementById("art-form");
  var textInput = document.getElementById("art-text");
  var styleSelect = document.getElementById("art-style");
  var scaleSelect = document.getElementById("art-scale");
  var spacingSelect = document.getElementById("art-spacing");
  var outputEl = document.getElementById("art-output");
  var badgeEl = document.getElementById("badge-line");
  var statusEl = document.getElementById("status-line");
  var errorEl = document.getElementById("text-error");
  var copyBtn = document.getElementById("copy-btn");
  var downloadBtn = document.getElementById("download-btn");
  var canvas = document.getElementById("fit-chart");
  var lastArt = "";

  function normalize(raw) {
    var text = String(raw || "").toUpperCase().replace(/\s+/g, " ").trim();
    var dropped = 0;
    var out = "";
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (FONT[ch]) {
        out += ch;
      } else {
        out += "?";
        dropped++;
      }
    }
    return { text: out, replaced: dropped };
  }

  function buildGrid(text, spacing) {
    var rows = [];
    for (var r = 0; r < GLYPH_H; r++) {
      rows.push([]);
    }
    for (var i = 0; i < text.length; i++) {
      var glyph = FONT[text.charAt(i)] || FONT["?"];
      for (var gr = 0; gr < GLYPH_H; gr++) {
        for (var gc = 0; gc < GLYPH_W; gc++) {
          rows[gr].push(glyph[gr].charAt(gc) === "1");
        }
        if (i < text.length - 1) {
          for (var s = 0; s < spacing; s++) {
            rows[gr].push(false);
          }
        }
      }
    }
    return rows;
  }

  function scaleGrid(grid, scale) {
    if (scale === 1) return grid;
    var out = [];
    for (var r = 0; r < grid.length; r++) {
      var wide = [];
      for (var c = 0; c < grid[r].length; c++) {
        for (var k = 0; k < scale; k++) {
          wide.push(grid[r][c]);
        }
      }
      for (var v = 0; v < scale; v++) {
        out.push(wide);
      }
    }
    return out;
  }

  function isOn(grid, r, c) {
    if (r < 0 || r >= grid.length) return false;
    if (c < 0 || c >= grid[r].length) return false;
    return grid[r][c];
  }

  function renderGrid(grid, style) {
    var conf = STYLES[style] || STYLES.classic;
    var lines = [];
    var width = grid.length ? grid[0].length : 0;
    for (var r = 0; r < grid.length; r++) {
      var line = "";
      for (var c = 0; c < width; c++) {
        var on = grid[r][c];
        if (conf.outline) {
          var edge = on && (!isOn(grid, r - 1, c) || !isOn(grid, r + 1, c) ||
                            !isOn(grid, r, c - 1) || !isOn(grid, r, c + 1));
          line += edge ? conf.fill : " ";
        } else if (on) {
          line += conf.fill;
        } else if (conf.shadow && isOn(grid, r - 1, c - 1)) {
          line += conf.shadow;
        } else {
          line += " ";
        }
      }
      lines.push(line.replace(/\s+$/, ""));
    }
    while (lines.length && lines[lines.length - 1] === "") {
      lines.pop();
    }
    return lines.join("\n");
  }

  function drawChart(artWidth) {
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 640;
    var cssH = 150;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padLeft = 8;
    var padRight = 8;
    var axisY = cssH - 30;
    var maxValue = Math.max(artWidth, 120) * 1.12;
    var scaleX = function (v) {
      return padLeft + (v / maxValue) * (cssW - padLeft - padRight);
    };

    ctx.strokeStyle = "#e6dfef";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, axisY + 0.5);
    ctx.lineTo(cssW - padRight, axisY + 0.5);
    ctx.stroke();

    // Your art bar
    var barH = 34;
    var barY = axisY - barH - 10;
    var barW = Math.max(scaleX(artWidth) - padLeft, 2);
    ctx.fillStyle = "#60089c";
    ctx.fillRect(padLeft, barY, barW, barH);

    ctx.fillStyle = "#ffffff";
    ctx.font = "600 12px Inter, sans-serif";
    ctx.textBaseline = "middle";
    if (barW > 70) {
      ctx.fillText(artWidth + " cols", padLeft + 8, barY + barH / 2);
    } else {
      ctx.fillStyle = "#4a0678";
      ctx.fillText(artWidth + " cols", padLeft + barW + 8, barY + barH / 2);
    }

    // Limit markers
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "center";
    for (var i = 0; i < LIMITS.length; i++) {
      var x = Math.round(scaleX(LIMITS[i].value)) + 0.5;
      ctx.strokeStyle = "#b98ee0";
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, 14);
      ctx.lineTo(x, axisY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = artWidth <= LIMITS[i].value ? "#4a0678" : "#8d8798";
      ctx.fillText(LIMITS[i].label, x, axisY + 14);
    }
    ctx.textAlign = "left";
    ctx.fillStyle = "#5f5a68";
    ctx.fillText("columns", padLeft, 12);
  }

  function setStatus(message) {
    statusEl.textContent = message || "";
  }

  function showError(message) {
    textInput.classList.add("is-invalid");
    errorEl.textContent = message;
    setStatus("");
  }

  function clearError() {
    textInput.classList.remove("is-invalid");
    errorEl.textContent = "";
  }

  function generate() {
    var raw = textInput.value;
    if (!raw || !raw.trim()) {
      showError("Enter at least one character to draw.");
      outputEl.textContent = "Generate to see your art.";
      badgeEl.textContent = "—";
      copyBtn.disabled = true;
      downloadBtn.disabled = true;
      lastArt = "";
      drawChart(0);
      return;
    }

    var normalized = normalize(raw);
    if (!normalized.text) {
      showError("That input has no characters this font can draw. Try letters, digits or basic punctuation.");
      return;
    }
    clearError();

    var scale = parseInt(scaleSelect.value, 10) || 1;
    var spacing = parseInt(spacingSelect.value, 10);
    if (isNaN(spacing)) spacing = 1;

    var grid = scaleGrid(buildGrid(normalized.text, spacing), scale);
    var art = renderGrid(grid, styleSelect.value);
    if (!art.trim()) {
      showError("Nothing to draw — try a different character or style.");
      return;
    }

    lastArt = art;
    outputEl.textContent = art;

    var lines = art.split("\n");
    var width = 0;
    for (var i = 0; i < lines.length; i++) {
      width = Math.max(width, lines[i].length);
    }
    var chars = art.replace(/\s/g, "").length;

    badgeEl.textContent = width + " cols · " + lines.length + " lines · " + chars + " marks";
    copyBtn.disabled = false;
    downloadBtn.disabled = false;

    var notes = [];
    if (normalized.replaced > 0) {
      notes.push(normalized.replaced + " unsupported character(s) shown as ?");
    }
    if (width > 80) {
      notes.push("Wider than 80 columns — it will wrap in a classic terminal.");
    }
    setStatus(notes.join(" "));

    drawChart(width);
  }

  function copyArt() {
    if (!lastArt) return;
    var done = function () { setStatus("Copied to clipboard."); };
    var fail = function () { setStatus("Copy failed — select the art and copy it manually."); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastArt).then(done).catch(fail);
    } else {
      var area = document.createElement("textarea");
      area.value = lastArt;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? done() : fail();
      } catch (e) {
        fail();
      }
      document.body.removeChild(area);
    }
  }

  function downloadArt() {
    if (!lastArt) return;
    var blob = new Blob([lastArt + "\n"], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "ascii-art.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setStatus("Downloaded ascii-art.txt.");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    generate();
  });

  styleSelect.addEventListener("change", generate);
  scaleSelect.addEventListener("change", generate);
  spacingSelect.addEventListener("change", generate);
  copyBtn.addEventListener("click", copyArt);
  downloadBtn.addEventListener("click", downloadArt);
  textInput.addEventListener("input", clearError);

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      var current = lastArt ? lastArt.split("\n")[0].length : 0;
      drawChart(current);
    }, 150);
  });

  generate();
})();
