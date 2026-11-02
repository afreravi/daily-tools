(function () {
  "use strict";

  var form = document.getElementById("fontForm");
  var errorBox = document.getElementById("formError");
  var previewBox = document.getElementById("previewBox");
  var previewText = document.getElementById("previewText");
  var chartEl = document.getElementById("chart");
  var cssOut = document.getElementById("cssOut");
  var copyNote = document.getElementById("copyNote");

  var textEl = document.getElementById("textInput");
  var familyEl = document.getElementById("familySelect");
  var weightEl = document.getElementById("weightSelect");
  var transformEl = document.getElementById("transformSelect");
  var alignEl = document.getElementById("alignSelect");
  var sizeEl = document.getElementById("sizeRange");
  var spaceEl = document.getElementById("spaceRange");
  var lineEl = document.getElementById("lineRange");
  var colorEl = document.getElementById("colorInput");
  var colorTextEl = document.getElementById("colorText");
  var shadowEl = document.getElementById("shadowCheck");
  var italicEl = document.getElementById("italicCheck");

  var sizeOut = document.getElementById("sizeOut");
  var spaceOut = document.getElementById("spaceOut");
  var lineOut = document.getElementById("lineOut");

  var FALLBACKS = {
    "Inter": "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif",
    "Roboto": "Helvetica, Arial, sans-serif",
    "Montserrat": "\"Helvetica Neue\", Arial, sans-serif",
    "Poppins": "\"Segoe UI\", Arial, sans-serif",
    "Open Sans": "\"Segoe UI\", Helvetica, Arial, sans-serif",
    "Lora": "Georgia, \"Times New Roman\", serif",
    "Merriweather": "Georgia, \"Times New Roman\", serif",
    "Playfair Display": "\"Times New Roman\", Times, serif",
    "Source Code Pro": "\"SF Mono\", Menlo, Consolas, \"Liberation Mono\", monospace",
    "system": null
  };

  var SYSTEM_STACK = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif";
  var MEASURE_FAMILIES = [
    "Inter", "Roboto", "Montserrat", "Poppins", "Open Sans",
    "Lora", "Merriweather", "Playfair Display", "Source Code Pro"
  ];

  var HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
  var currentState = null;

  function buildStack(family) {
    if (family === "system") return SYSTEM_STACK;
    var fallback = FALLBACKS[family];
    return "\"" + family + "\", " + fallback;
  }

  function expandHex(hex) {
    var h = hex.replace("#", "");
    if (h.length === 3) {
      h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2);
    }
    return "#" + h.toLowerCase();
  }

  function relativeLuminance(hex) {
    var h = expandHex(hex).slice(1);
    var channels = [0, 2, 4].map(function (i) {
      var c = parseInt(h.substr(i, 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastRatio(a, b) {
    var la = relativeLuminance(a);
    var lb = relativeLuminance(b);
    var light = Math.max(la, lb);
    var dark = Math.min(la, lb);
    return (light + 0.05) / (dark + 0.05);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function readState() {
    var text = String(textEl.value);
    if (text.trim() === "") {
      showError("Enter some text to style.");
      textEl.focus();
      return null;
    }

    var size = Number(sizeEl.value);
    if (!isFinite(size) || size < 12 || size > 120) {
      showError("Font size must be between 12 and 120 pixels.");
      sizeEl.focus();
      return null;
    }

    var spacing = Number(spaceEl.value);
    if (!isFinite(spacing) || spacing < -2 || spacing > 12) {
      showError("Letter spacing must be between -2 and 12 pixels.");
      spaceEl.focus();
      return null;
    }

    var lineHeight = Number(lineEl.value);
    if (!isFinite(lineHeight) || lineHeight < 1 || lineHeight > 2.5) {
      showError("Line height must be between 1.0 and 2.5.");
      lineEl.focus();
      return null;
    }

    var color = String(colorTextEl.value).trim();
    if (!HEX_RE.test(color)) {
      showError("Text colour must be a hex value such as #241d2c or #333.");
      colorTextEl.focus();
      return null;
    }
    color = expandHex(color);

    return {
      text: text,
      family: familyEl.value,
      weight: Number(weightEl.value),
      transform: transformEl.value,
      align: alignEl.value,
      size: size,
      spacing: spacing,
      lineHeight: lineHeight,
      color: color,
      shadow: shadowEl.checked,
      italic: italicEl.checked
    };
  }

  function applyPreview(state) {
    previewText.textContent = state.text;
    var style = previewText.style;
    style.fontFamily = buildStack(state.family);
    style.fontWeight = String(state.weight);
    style.fontStyle = state.italic ? "italic" : "normal";
    style.fontSize = state.size + "px";
    style.letterSpacing = state.spacing + "px";
    style.lineHeight = String(state.lineHeight);
    style.color = state.color;
    style.textTransform = state.transform;
    style.textAlign = state.align;
    style.textShadow = state.shadow ? "0 2px 6px rgba(36, 29, 44, .35)" : "none";
  }

  function measureWidth(state, family) {
    var canvas = measureWidth.canvas || (measureWidth.canvas = document.createElement("canvas"));
    var ctx = canvas.getContext("2d");
    if (!ctx) return 0;
    ctx.font = (state.italic ? "italic " : "") + state.weight + " " + state.size + "px " + buildStack(family);
    var lines = state.text.split("\n");
    var max = 0;
    for (var i = 0; i < lines.length; i++) {
      var w = ctx.measureText(lines[i] || " ").width;
      if (w > max) max = w;
    }
    return max + state.spacing * Math.max(1, state.text.length - 1);
  }

  function renderChart(state, currentWidth) {
    chartEl.innerHTML = "";
    var frag = document.createDocumentFragment();
    var widths = MEASURE_FAMILIES.map(function (family) {
      return { family: family, width: measureWidth(state, family) };
    });
    var max = widths.reduce(function (m, item) { return Math.max(m, item.width); }, 1);
    if (max <= 0) return;

    widths.forEach(function (item) {
      var row = document.createElement("div");
      row.className = "chart-row" + (item.family === state.family ? " is-current" : "");

      var name = document.createElement("span");
      name.className = "chart-name";
      name.textContent = item.family;

      var track = document.createElement("span");
      track.className = "chart-track";
      var fill = document.createElement("span");
      fill.className = "chart-fill";
      fill.style.width = Math.max(4, Math.round((item.width / max) * 100)) + "%";
      track.appendChild(fill);

      var label = document.createElement("span");
      label.className = "chart-count";
      label.textContent = Math.round(item.width) + "px";

      row.appendChild(name);
      row.appendChild(track);
      row.appendChild(label);
      frag.appendChild(row);
    });

    chartEl.appendChild(frag);
    if (currentWidth) {
      document.getElementById("widthNote").textContent = "vs widest: " + Math.round((currentWidth / max) * 100) + "%";
    }
  }

  function buildCss(state) {
    var selector = ".styled-text";
    var lines = [];
    lines.push(selector + " {");
    lines.push("  font-family: " + buildStack(state.family) + ";");
    lines.push("  font-weight: " + state.weight + ";");
    if (state.italic) lines.push("  font-style: italic;");
    lines.push("  font-size: " + state.size + "px;");
    lines.push("  letter-spacing: " + state.spacing + "px;");
    lines.push("  line-height: " + state.lineHeight + ";");
    lines.push("  color: " + state.color + ";");
    if (state.transform !== "none") lines.push("  text-transform: " + state.transform + ";");
    if (state.align !== "left") lines.push("  text-align: " + state.align + ";");
    if (state.shadow) lines.push("  text-shadow: 0 2px 6px rgba(36, 29, 44, .35);");
    lines.push("}");
    return lines.join("\n");
  }

  function render(state) {
    applyPreview(state);

    var width = measureWidth(state, state.family);
    var chars = state.text.replace(/\n/g, "").length;
    var words = state.text.split(/\s+/).filter(function (w) { return w.length > 0; }).length;

    document.getElementById("charValue").textContent = String(chars);
    document.getElementById("charNote").textContent = state.text.split("\n").length > 1
      ? state.text.split("\n").length + " lines"
      : "Single line";
    document.getElementById("wordValue").textContent = String(words);
    document.getElementById("wordNote").textContent = "Whitespace separated.";
    document.getElementById("widthValue").textContent = Math.round(width) + "px";
    document.getElementById("widthNote").textContent = "";
    document.getElementById("stackValue").textContent = state.family === "system" ? "System UI" : state.family;
    document.getElementById("stackNote").textContent = "Weight " + state.weight + " at " + state.size + "px";

    renderChart(state, width);
    cssOut.textContent = buildCss(state);
    currentState = state;
  }

  function syncColorFromPicker() {
    colorTextEl.value = colorEl.value;
  }

  function copyText(text, message) {
    function done() { copyNote.textContent = message; }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch (e) {
        copyNote.textContent = "Copy failed \u2014 select the CSS manually.";
      }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    copyNote.textContent = "";
    var state = readState();
    if (!state) return;
    render(state);
    var ratio = contrastRatio(state.color, "#ffffff");
    if (ratio < 3) {
      showError("Heads up: that text colour has a contrast ratio of " + ratio.toFixed(1) +
        ":1 on white, below the 3:1 minimum for large text. Consider a darker shade.");
    }
  });

  ["input", "change"].forEach(function (evt) {
    form.addEventListener(evt, function (e) {
      if (e.target === form) return;
      if (e.target === colorTextEl) return;
      if (e.target === colorEl) syncColorFromPicker();
      sizeOut.textContent = sizeEl.value;
      spaceOut.textContent = spaceEl.value;
      lineOut.textContent = lineEl.value;
      clearError();
      var state = readState();
      if (state) render(state);
    });
  });

  colorEl.addEventListener("input", function () {
    colorTextEl.value = colorEl.value;
  });

  colorTextEl.addEventListener("input", function () {
    var value = String(colorTextEl.value).trim();
    if (HEX_RE.test(value)) colorEl.value = expandHex(value);
  });

  document.querySelectorAll("[data-bg]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-bg]").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      previewBox.style.background = btn.getAttribute("data-bg");
    });
  });

  document.getElementById("copyCssBtn").addEventListener("click", function () {
    if (!currentState) return;
    copyText(buildCss(currentState), "CSS copied to your clipboard.");
  });

  document.getElementById("downloadCssBtn").addEventListener("click", function () {
    if (!currentState) return;
    var blob = new Blob([buildCss(currentState) + "\n"], { type: "text/css;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "font-style.css";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    copyNote.textContent = "Downloaded font-style.css";
  });

  document.getElementById("resetBtn").addEventListener("click", function () {
    window.setTimeout(function () {
      colorEl.value = "#241d2c";
      colorTextEl.value = "#241d2c";
      clearError();
      copyNote.textContent = "";
      sizeOut.textContent = sizeEl.value;
      spaceOut.textContent = spaceEl.value;
      lineOut.textContent = lineEl.value;
      var state = readState();
      if (state) render(state);
    }, 0);
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());

  var state0 = readState();
  if (state0) render(state0);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      var state = readState();
      if (state) render(state);
    });
  }
})();
