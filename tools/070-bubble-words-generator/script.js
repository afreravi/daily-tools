(function () {
  "use strict";

  var MAX_LEN = 40;

  var DECORATIONS = {
    none: { left: "", right: "" },
    sparkle: { left: "\u2727 ", right: " \u2727" },
    heart: { left: "\u2661 ", right: " \u2661" },
    cloud: { left: "\u2601 ", right: " \u2601" },
    star: { left: "\u2605 ", right: " \u2605" }
  };

  var ENCLOSING = {
    circle: "\u20DD",
    square: "\u20DE",
    diamond: "\u20DF"
  };

  function mapRange(ch, upperBase, lowerBase, upperOnlyBase) {
    var code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCodePoint(upperOnlyBase !== null && upperOnlyBase !== undefined ? upperOnlyBase + (code - 65) : upperBase + (code - 65));
    }
    if (code >= 97 && code <= 122) {
      if (lowerBase === null) {
        return String.fromCodePoint(upperOnlyBase + (code - 97));
      }
      return String.fromCodePoint(lowerBase + (code - 97));
    }
    return null;
  }

  function enclose(ch, mark) {
    if (/\s/.test(ch)) return ch;
    return ch + mark;
  }

  var STYLES = [
    {
      key: "circled",
      name: "Circled",
      group: "round",
      convert: function (ch) { return mapRange(ch, 0x24B6, 0x24D0, null); }
    },
    {
      key: "circled-solid",
      name: "Solid circle",
      group: "round",
      convert: function (ch) { return mapRange(ch, 0x1F150, null, 0x1F150); }
    },
    {
      key: "enclosed-circle",
      name: "Ringed letters",
      group: "round",
      convert: function (ch) { return enclose(ch, ENCLOSING.circle); }
    },
    {
      key: "enclosed-diamond",
      name: "Diamond frame",
      group: "round",
      convert: function (ch) { return enclose(ch, ENCLOSING.diamond); }
    },
    {
      key: "parenthesized",
      name: "Parenthesised",
      group: "round",
      convert: function (ch) { return mapRange(ch, 0x249C, 0x249C, 0x249C); }
    },
    {
      key: "squared",
      name: "Squared",
      group: "blocky",
      convert: function (ch) { return mapRange(ch, 0x1F130, null, 0x1F130); }
    },
    {
      key: "enclosed-square",
      name: "Boxed letters",
      group: "blocky",
      convert: function (ch) { return enclose(ch, ENCLOSING.square); }
    },
    {
      key: "fullwidth",
      name: "Full width",
      group: "blocky",
      convert: function (ch) {
        var code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) return String.fromCharCode(0xFF21 + code - 65);
        if (code >= 97 && code <= 122) return String.fromCharCode(0xFF41 + code - 97);
        if (code >= 48 && code <= 57) return String.fromCharCode(0xFF10 + code - 48);
        if (code === 32) return "\u3000";
        return null;
      }
    },
    {
      key: "wide-spaced",
      name: "Wide spaced",
      group: "wide",
      join: " ",
      passthrough: true,
      convert: function (ch) { return ch; }
    },
    {
      key: "loose-spaced",
      name: "Loose spaced",
      group: "wide",
      join: "  ",
      passthrough: true,
      convert: function (ch) { return ch; }
    }
  ];

  var SAMPLES = [
    "Happy Birthday",
    "Bubble Pop",
    "Party Time",
    "Sweet Dreams",
    "Good Vibes",
    "Hello Sunshine"
  ];

  var els = {
    form: document.getElementById("bubbleForm"),
    input: document.getElementById("textInput"),
    charCount: document.getElementById("charCount"),
    styleFilter: document.getElementById("styleFilter"),
    sparklePick: document.getElementById("sparklePick"),
    sampleBtn: document.getElementById("sampleBtn"),
    randomBtn: document.getElementById("randomBtn"),
    clearBtn: document.getElementById("clearBtn"),
    errorBox: document.getElementById("errorBox"),
    infoBox: document.getElementById("infoBox"),
    preview: document.getElementById("bubblePreview"),
    results: document.getElementById("results"),
    resultSummary: document.getElementById("resultSummary"),
    canvas: document.getElementById("coverageChart"),
    statIn: document.getElementById("statIn"),
    statBest: document.getElementById("statBest"),
    statStyles: document.getElementById("statStyles"),
    sortDefault: document.getElementById("sortDefault"),
    sortAlpha: document.getElementById("sortAlpha")
  };

  var state = {
    sort: "default",
    timer: null
  };

  function showError(msg) {
    els.errorBox.textContent = msg;
    els.errorBox.classList.remove("d-none");
  }

  function clearError() {
    els.errorBox.textContent = "";
    els.errorBox.classList.add("d-none");
  }

  function showInfo(msg) {
    els.infoBox.textContent = msg;
    els.infoBox.classList.remove("d-none");
  }

  function clearInfo() {
    els.infoBox.textContent = "";
    els.infoBox.classList.add("d-none");
  }

  function decorate(text) {
    var deco = DECORATIONS[els.sparklePick.value] || DECORATIONS.none;
    if (!deco.left) return text;
    return deco.left + text + deco.right;
  }

  function convertStyle(style, text) {
    var out = "";
    var converted = 0;
    var countable = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      var mapped = style.convert(ch);
      if (mapped === null || mapped === undefined) {
        mapped = ch;
      } else if (!/\s/.test(ch) && mapped !== ch) {
        converted++;
      }
      if (!/\s/.test(ch)) countable++;
      out += mapped;
    }
    if (style.join) {
      var parts = [];
      for (var j = 0; j < text.length; j++) {
        parts.push(style.convert(text.charAt(j)) || text.charAt(j));
      }
      out = parts.join(style.join);
    }
    var coverage = countable === 0 ? 0 : Math.round((converted / countable) * 100);
    if (style.passthrough && countable > 0) coverage = 100;
    return { text: decorate(out), coverage: coverage };
  }

  function activeStyles() {
    var group = els.styleFilter.value;
    var list = STYLES.filter(function (s) {
      return group === "all" || s.group === group;
    });
    if (state.sort === "alpha") {
      list = list.slice().sort(function (a, b) {
        return a.name.localeCompare(b.name);
      });
    }
    return list;
  }

  function buildPreview(text) {
    els.preview.innerHTML = "";
    if (!text) {
      var empty = document.createElement("p");
      empty.className = "text-muted small mb-0";
      empty.textContent = "Your bubble letters will appear here.";
      els.preview.appendChild(empty);
      return;
    }

    var deco = DECORATIONS[els.sparklePick.value] || DECORATIONS.none;
    if (deco.left) {
      els.preview.appendChild(makeBadge(deco.left.trim(), "is-deco"));
    }

    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      if (ch === " ") {
        els.preview.appendChild(makeBadge("\u00b7", "is-space"));
      } else {
        els.preview.appendChild(makeBadge(ch, ""));
      }
    }

    if (deco.right) {
      els.preview.appendChild(makeBadge(deco.right.trim(), "is-deco"));
    }
  }

  function makeBadge(content, extraClass) {
    var span = document.createElement("span");
    span.className = "bubble-letter" + (extraClass ? " " + extraClass : "");
    span.textContent = content;
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function buildResults(text) {
    els.results.innerHTML = "";
    var styles = activeStyles();
    var best = 0;

    if (!text) {
      els.resultSummary.textContent = "Type a word above to see bubble styles.";
      els.statStyles.textContent = "0";
      els.statBest.textContent = "\u2014";
      drawChart([], 0);
      return;
    }

    styles.forEach(function (style) {
      var result = convertStyle(style, text);
      if (result.coverage > best) best = result.coverage;

      var col = document.createElement("div");
      col.className = "col-12 col-md-6 mb-3";

      var card = document.createElement("div");
      card.className = "style-card";

      var body = document.createElement("div");
      body.className = "card-body d-flex flex-column";

      var title = document.createElement("div");
      title.className = "style-name";
      title.textContent = style.name;

      var output = document.createElement("div");
      output.className = "style-output";
      output.textContent = result.text;

      var footer = document.createElement("div");
      footer.className = "d-flex justify-content-between align-items-center mt-auto";

      var meta = document.createElement("span");
      meta.className = "style-meta";
      meta.textContent = result.coverage + "% converted";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-outline-primary btn-copy";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy the " + style.name + " version");
      btn.addEventListener("click", function () {
        copyText(result.text, btn);
      });

      footer.appendChild(meta);
      footer.appendChild(btn);
      body.appendChild(title);
      body.appendChild(output);
      body.appendChild(footer);
      card.appendChild(body);
      col.appendChild(card);
      els.results.appendChild(col);
    });

    els.resultSummary.textContent = styles.length + " bubble styles ready — tap Copy on any of them.";
    els.statStyles.textContent = String(styles.length);
    els.statBest.textContent = best + "%";
    drawChart(styles.map(function (s) {
      return { name: s.name, coverage: convertStyle(s, text).coverage };
    }), best);
  }

  function copyText(text, btn) {
    var done = function () {
      var original = "Copy";
      btn.textContent = "Copied";
      btn.classList.add("copied");
      window.setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("copied");
      }, 1400);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () {
        legacyCopy(text);
        done();
      });
    } else {
      legacyCopy(text);
      done();
    }
  }

  function legacyCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (e) {
      showError("Copying is blocked by your browser. Select the text and copy it manually.");
    }
    document.body.removeChild(area);
  }

  function drawChart(rows, best) {
    var canvas = els.canvas;
    if (!canvas || !canvas.getContext) return;

    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.parentNode.clientWidth || 640;
    var cssHeight = 280;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = cssWidth + "px";
    canvas.style.height = cssHeight + "px";

    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    if (!rows.length) {
      ctx.fillStyle = "#9c93a8";
      ctx.font = "14px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Type something to see coverage per style", cssWidth / 2, cssHeight / 2);
      return;
    }

    var labelWidth = Math.min(140, cssWidth * 0.34);
    var padTop = 14;
    var padBottom = 26;
    var chartWidth = cssWidth - labelWidth - 44;
    var rowHeight = Math.min(26, (cssHeight - padTop - padBottom) / rows.length);
    var barHeight = Math.max(10, rowHeight - 8);

    ctx.strokeStyle = "#eee6f6";
    ctx.lineWidth = 1;
    [0, 50, 100].forEach(function (pct) {
      var x = labelWidth + (chartWidth * pct) / 100;
      ctx.beginPath();
      ctx.moveTo(x, padTop - 4);
      ctx.lineTo(x, padTop + rowHeight * rows.length);
      ctx.stroke();
      ctx.fillStyle = "#a79fb3";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(pct + "%", x, padTop + rowHeight * rows.length + 16);
    });

    rows.forEach(function (row, i) {
      var y = padTop + i * rowHeight + (rowHeight - barHeight) / 2;
      var w = Math.max(2, (chartWidth * row.coverage) / 100);

      ctx.fillStyle = "#e9dcf7";
      roundRect(ctx, labelWidth, y, chartWidth, barHeight, 4);
      ctx.fill();

      var grad = ctx.createLinearGradient(labelWidth, 0, labelWidth + chartWidth, 0);
      grad.addColorStop(0, "#7d1fc0");
      grad.addColorStop(1, "#b06ce0");
      ctx.fillStyle = grad;
      roundRect(ctx, labelWidth, y, w, barHeight, 4);
      ctx.fill();

      ctx.fillStyle = "#3d0563";
      ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(row.name, labelWidth - 8, y + barHeight / 2 + 4);

      ctx.textAlign = "left";
      ctx.fillStyle = "#5b5468";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(row.coverage + "%", labelWidth + w + 6, y + barHeight / 2 + 4);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function update() {
    clearError();
    clearInfo();

    var raw = els.input.value;
    if (raw.length > MAX_LEN) {
      raw = raw.slice(0, MAX_LEN);
      els.input.value = raw;
      showInfo("Trimmed to the first " + MAX_LEN + " characters.");
    }

    els.charCount.textContent = String(raw.length);

    var text = raw.trim();

    if (raw.length > 0 && text.length === 0) {
      showError("That is only whitespace. Type at least one visible character.");
      els.statIn.textContent = "0";
      buildPreview("");
      buildResults("");
      return;
    }

    els.statIn.textContent = String(text.length);
    buildPreview(text);
    buildResults(text);
  }

  function scheduleUpdate() {
    window.clearTimeout(state.timer);
    state.timer = window.setTimeout(update, 90);
  }

  els.input.addEventListener("input", scheduleUpdate);
  els.input.addEventListener("change", update);
  els.styleFilter.addEventListener("change", update);
  els.sparklePick.addEventListener("change", update);
  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    update();
  });

  els.sampleBtn.addEventListener("click", function () {
    els.input.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    update();
    els.input.focus();
  });

  els.randomBtn.addEventListener("click", function () {
    var pick = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    els.input.value = pick;
    update();
    els.input.focus();
  });

  els.clearBtn.addEventListener("click", function () {
    els.input.value = "";
    update();
    els.input.focus();
  });

  els.sortDefault.addEventListener("click", function () {
    state.sort = "default";
    els.sortDefault.classList.add("active");
    els.sortAlpha.classList.remove("active");
    update();
  });

  els.sortAlpha.addEventListener("click", function () {
    state.sort = "alpha";
    els.sortAlpha.classList.add("active");
    els.sortDefault.classList.remove("active");
    update();
  });

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var text = els.input.value.trim();
      if (text) buildResults(text);
      else drawChart([], 0);
    }, 160);
  });

  els.input.value = "Bubble Pop";
  update();
})();
