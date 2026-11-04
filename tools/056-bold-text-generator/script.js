(function () {
  "use strict";

  var ALNUM = /[A-Za-z0-9]/;

  /* Build a 26/26/10 character map from three Unicode block start points.
     lowerStart may equal upperStart when a style has no separate lowercase
     glyphs (e.g. the squared and negative-circled blocks). */
  function buildMap(upperStart, lowerStart, digitStart) {
    var map = {};
    var i;
    if (upperStart) {
      for (i = 0; i < 26; i++) {
        map[String.fromCharCode(65 + i)] = String.fromCodePoint(upperStart + i);
      }
    }
    if (lowerStart) {
      for (i = 0; i < 26; i++) {
        map[String.fromCharCode(97 + i)] = String.fromCodePoint(lowerStart + i);
      }
    }
    if (digitStart) {
      for (i = 0; i < 10; i++) {
        map[String.fromCharCode(48 + i)] = String.fromCodePoint(digitStart + i);
      }
    }
    return map;
  }

  /* Small caps has no contiguous block, so it is spelled out. */
  function smallCapsMap() {
    var upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var small = "\u1D00\u0299\u1D04\u1D05\u1D07\uA730\u0262\u029C\u026A\u1D0A\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18\u01EB\u0280\uA731\u1D1B\u1D1C\u1D20\u1D21\u02E3\u028F\u1D22";
    var map = {};
    for (var i = 0; i < 26; i++) {
      map[upper[i]] = small[i];
      map[upper[i].toLowerCase()] = small[i];
    }
    return map;
  }

  var STYLES = [
    {
      id: "serif-bold",
      name: "Serif Bold",
      keywords: "serif math bold heavy strong",
      map: buildMap(0x1D400, 0x1D41A, 0x1D7CE)
    },
    {
      id: "sans-bold",
      name: "Sans Bold",
      keywords: "sans sans-serif math bold heavy",
      map: buildMap(0x1D5D4, 0x1D5EE, 0x1D7EC)
    },
    {
      id: "bold-italic",
      name: "Bold Italic",
      keywords: "italic oblique slanted emphasis serif",
      map: buildMap(0x1D468, 0x1D482, null)
    },
    {
      id: "sans-bold-italic",
      name: "Sans Bold Italic",
      keywords: "italic oblique slanted emphasis sans",
      map: buildMap(0x1D63C, 0x1D656, null)
    },
    {
      id: "bold-script",
      name: "Bold Script",
      keywords: "script cursive handwriting fancy calligraphy",
      map: buildMap(0x1D4D0, 0x1D4EA, null)
    },
    {
      id: "bold-fraktur",
      name: "Bold Fraktur",
      keywords: "fraktur gothic blackletter old english",
      map: buildMap(0x1D56C, 0x1D586, null)
    },
    {
      id: "bold-fullwidth",
      name: "Bold Fullwidth",
      keywords: "fullwidth wide double byte cjk",
      map: buildMap(0xFF21, 0xFF41, 0xFF10)
    },
    {
      id: "bold-monospace",
      name: "Monospace Bold",
      keywords: "monospace typewriter code terminal",
      map: buildMap(0x1D670, 0x1D68A, 0x1D7F6)
    },
    {
      id: "squared",
      name: "Squared",
      keywords: "squared box square block framed",
      map: buildMap(0x1F130, 0x1F130, null)
    },
    {
      id: "negative-circled",
      name: "Negative Circled",
      keywords: "circle round filled disc",
      map: buildMap(0x1F150, 0x1F150, null)
    },
    {
      id: "negative-squared",
      name: "Negative Squared",
      keywords: "square box filled block",
      map: buildMap(0x1F170, 0x1F170, null)
    },
    {
      id: "small-caps",
      name: "Small Caps",
      keywords: "small caps capital caps tiny uppercase",
      map: smallCapsMap()
    }
  ];

  /* ---- DOM refs ---- */
  var form = document.getElementById("boldForm");
  var input = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var searchStyle = document.getElementById("searchStyle");
  var trimToggle = document.getElementById("trimToggle");
  var keepLineToggle = document.getElementById("keepLineToggle");
  var formError = document.getElementById("formError");
  var results = document.getElementById("results");
  var resultList = document.getElementById("resultList");
  var coverageNote = document.getElementById("coverageNote");
  var chartCard = document.getElementById("chartCard");
  var canvas = document.getElementById("coverageChart");
  var chartTable = document.getElementById("chartTable");
  var copyAllBtn = document.getElementById("copyAllBtn");

  var lastOutputs = [];

  function normalise(raw) {
    var text = raw;
    if (trimToggle.checked) text = text.trim();
    if (!keepLineToggle.checked) text = text.replace(/[\r\n]+/g, " ");
    return text;
  }

  function applyMap(text, map) {
    var chars = Array.from(text);
    var out = "";
    var converted = 0;
    var total = 0;
    for (var i = 0; i < chars.length; i++) {
      var ch = chars[i];
      var isAlnum = ALNUM.test(ch);
      if (isAlnum) total++;
      if (map[ch] !== undefined) {
        out += map[ch];
        if (isAlnum) converted++;
      } else {
        out += ch;
      }
    }
    var pct = total === 0 ? 100 : Math.round((converted / total) * 100);
    return { text: out, converted: converted, total: total, pct: pct };
  }

  function showError(msg) {
    formError.textContent = msg;
    formError.classList.remove("d-none");
  }

  function clearError() {
    formError.textContent = "";
    formError.classList.add("d-none");
  }

  function copyText(text, btn) {
    var done = function () {
      if (!btn) return;
      var original = btn.dataset.label || btn.textContent;
      btn.dataset.label = original;
      btn.textContent = "Copied!";
      btn.classList.add("btn-brand");
      btn.classList.remove("btn-outline-brand");
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("btn-brand");
        btn.classList.add("btn-outline-brand");
      }, 1400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text);
        done();
      });
    } else {
      fallbackCopy(text);
      done();
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function render(payload) {
    var filter = searchStyle.value.trim().toLowerCase();
    var outputs = [];
    var html = "";

    STYLES.forEach(function (style) {
      if (filter && style.name.toLowerCase().indexOf(filter) === -1 &&
          style.keywords.indexOf(filter) === -1) {
        return;
      }
      var res = applyMap(payload, style.map);
      outputs.push({ name: style.name, text: res.text, pct: res.pct });
      var warn = res.pct < 100 ? " warn" : "";
      html +=
        '<div class="col-12 col-md-6 col-lg-4 mb-3">' +
          '<div class="style-card"><div class="card-body">' +
            '<div class="d-flex justify-content-between align-items-center">' +
              '<div class="style-name">' + style.name + "</div>" +
              '<span class="badge-pct' + warn + '">' + res.pct + "%</span>" +
            "</div>" +
            '<div class="style-output">' + escapeHtml(res.text) + "</div>" +
            '<button type="button" class="btn btn-sm btn-outline-brand copy-btn" ' +
              'data-index="' + (outputs.length - 1) + '">Copy</button>' +
          "</div></div>" +
        "</div>";
    });

    if (!html) {
      results.classList.add("d-none");
      chartCard.classList.add("d-none");
      coverageNote.textContent = "";
      return;
    }

    resultList.innerHTML = html;
    results.classList.remove("d-none");
    lastOutputs = outputs;

    var partial = outputs.filter(function (o) { return o.pct < 100; }).length;
    coverageNote.textContent = partial === 0
      ? "All " + outputs.length + " shown styles converted every letter and digit in your text."
      : partial + " of " + outputs.length + " shown styles could not convert every character - see the chart for the details.";

    drawChart(outputs);
    chartCard.classList.remove("d-none");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---- Canvas bar chart ---- */
  function drawChart(outputs) {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement.clientWidth || 900;
    cssW = Math.min(cssW, 900);
    var rowH = 30;
    var padTop = 16;
    var padBottom = 30;
    var cssH = padTop + padBottom + outputs.length * rowH;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var labelW = Math.min(150, Math.max(96, cssW * 0.22));
    var chartW = cssW - labelW - 54;
    var baseY = padTop;

    ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textBaseline = "middle";

    // axis grid at 0/25/50/75/100
    ctx.strokeStyle = "#ece3f7";
    ctx.fillStyle = "#6c6577";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 100; g += 25) {
      var x = labelW + (chartW * g) / 100;
      ctx.beginPath();
      ctx.moveTo(x, padTop - 6);
      ctx.lineTo(x, padTop + outputs.length * rowH + 4);
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillText(g + "%", x, cssH - padBottom / 2);
    }

    outputs.forEach(function (o, i) {
      var y = baseY + i * rowH;
      var barH = rowH - 12;
      ctx.fillStyle = "#201b27";
      ctx.textAlign = "right";
      ctx.fillText(trimLabel(o.name, labelW - 8), labelW - 8, y + rowH / 2);

      var w = Math.max(2, (chartW * o.pct) / 100);
      ctx.fillStyle = o.pct === 100 ? "#60089c" : "#c05cf0";
      roundRect(ctx, labelW, y + 6, w, barH, 4);
      ctx.fill();

      ctx.fillStyle = "#40006b";
      ctx.textAlign = "left";
      ctx.fillText(o.pct + "%", labelW + w + 6, y + rowH / 2);
    });

    buildTable(outputs);
  }

  function trimLabel(label, maxW) {
    if (label.length * 7 <= maxW) return label;
    return label.slice(0, Math.max(4, Math.floor(maxW / 7) - 1)) + "\u2026";
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function buildTable(outputs) {
    var html = '<table class="table table-sm mb-0"><caption class="sr-only">Conversion coverage by style</caption>' +
      '<thead><tr><th scope="col">Style</th><th scope="col" class="text-right">Coverage</th></tr></thead><tbody>';
    outputs.forEach(function (o) {
      html += '<tr><td>' + o.name + '</td><td class="text-right">' + o.pct + "%</td></tr>";
    });
    html += "</tbody></table>";
    chartTable.innerHTML = html;
  }

  /* ---- events ---- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();
    var text = normalise(input.value);
    if (!text) {
      showError("Enter some text first - the generator needs something to convert.");
      input.focus();
      return;
    }
    render(text);
  });

  input.addEventListener("input", function () {
    charCount.textContent = String(input.value.length);
  });

  form.addEventListener("reset", function () {
    clearError();
    charCount.textContent = "0";
    results.classList.add("d-none");
    chartCard.classList.add("d-none");
    lastOutputs = [];
    setTimeout(function () { input.focus(); }, 0);
  });

  resultList.addEventListener("click", function (e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var item = lastOutputs[Number(btn.dataset.index)];
    if (item) copyText(item.text, btn);
  });

  copyAllBtn.addEventListener("click", function () {
    if (!lastOutputs.length) return;
    var body = lastOutputs.map(function (o) {
      return o.name + ": " + o.text;
    }).join("\n");
    copyText(body, copyAllBtn);
  });

  // Re-render live when the filter or options change, if we already have output.
  [searchStyle, trimToggle, keepLineToggle].forEach(function (el) {
    el.addEventListener("change", function () {
      if (results.classList.contains("d-none")) return;
      var text = normalise(input.value);
      if (text) render(text);
    });
  });
  searchStyle.addEventListener("input", function () {
    if (results.classList.contains("d-none")) return;
    var text = normalise(input.value);
    if (text) render(text);
  });

  window.addEventListener("resize", function () {
    if (!results.classList.contains("d-none") && lastOutputs.length) {
      drawChart(lastOutputs);
    }
  });

  charCount.textContent = "0";
})();
