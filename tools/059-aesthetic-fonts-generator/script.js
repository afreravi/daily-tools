(function () {
  "use strict";

  var UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LOWER = "abcdefghijklmnopqrstuvwxyz";
  var DIGITS = "0123456789";

  function rangeMap(upperBase, lowerBase, digitBase, overrides) {
    var map = {};
    var i;
    for (i = 0; i < 26; i++) map[UPPER[i]] = String.fromCodePoint(upperBase + i);
    for (i = 0; i < 26; i++) map[LOWER[i]] = String.fromCodePoint(lowerBase + i);
    if (digitBase) {
      for (i = 0; i < 10; i++) map[DIGITS[i]] = String.fromCodePoint(digitBase + i);
    }
    if (overrides) {
      Object.keys(overrides).forEach(function (k) {
        map[k] = String.fromCodePoint(overrides[k]);
      });
    }
    return map;
  }

  var FONTS = [
    {
      id: "plain",
      label: "Plain (no font change)",
      map: null
    },
    {
      id: "bold-serif",
      label: "Bold serif",
      map: rangeMap(0x1d400, 0x1d41a, 0x1d7ce)
    },
    {
      id: "bold-italic",
      label: "Bold italic",
      map: rangeMap(0x1d468, 0x1d482, null)
    },
    {
      id: "italic",
      label: "Light italic",
      map: rangeMap(0x1d434, 0x1d44e, null, { h: 0x210e })
    },
    {
      id: "script",
      label: "Script",
      map: rangeMap(0x1d49c, 0x1d4b6, null, {
        B: 0x212c, E: 0x2130, F: 0x2131, H: 0x210b, I: 0x2110,
        L: 0x2112, M: 0x2133, R: 0x211b,
        e: 0x212f, g: 0x210a, o: 0x2134
      })
    },
    {
      id: "bold-script",
      label: "Bold script",
      map: rangeMap(0x1d4d0, 0x1d4ea, null)
    },
    {
      id: "fraktur",
      label: "Gothic (Fraktur)",
      map: rangeMap(0x1d504, 0x1d51e, null, {
        C: 0x212d, H: 0x210c, I: 0x2111, R: 0x211c, Z: 0x2128
      })
    },
    {
      id: "bold-fraktur",
      label: "Bold gothic",
      map: rangeMap(0x1d56c, 0x1d586, null)
    },
    {
      id: "double-struck",
      label: "Double-struck outline",
      map: rangeMap(0x1d538, 0x1d552, 0x1d7d8, {
        C: 0x2102, H: 0x210d, N: 0x2115, P: 0x2119,
        Q: 0x211a, R: 0x211d, Z: 0x2124
      })
    },
    {
      id: "sans",
      label: "Clean sans-serif",
      map: rangeMap(0x1d5a0, 0x1d5ba, 0x1d7e2)
    },
    {
      id: "sans-bold",
      label: "Bold sans-serif",
      map: rangeMap(0x1d5d4, 0x1d5ee, 0x1d7ec)
    },
    {
      id: "sans-italic",
      label: "Sans-serif italic",
      map: rangeMap(0x1d608, 0x1d622, null)
    },
    {
      id: "mono",
      label: "Monospace",
      map: rangeMap(0x1d670, 0x1d68a, 0x1d7f6)
    },
    {
      id: "fullwidth",
      label: "Wide fullwidth",
      map: rangeMap(0xff21, 0xff41, 0xff10)
    },
    {
      id: "small-caps",
      label: "Small caps",
      map: (function () {
        var m = {};
        var smallCaps = {
          a: "\u1d00", b: "\u0299", c: "\u1d04", d: "\u1d05", e: "\u1d07",
          f: "\ua730", g: "\u0262", h: "\u029c", i: "\u026a", j: "\u1d0a",
          k: "\u1d0b", l: "\u029f", m: "\u1d0d", n: "\u0274", o: "\u1d0f",
          p: "\u1d18", q: "\u01eb", r: "\u0280", s: "\ua731", t: "\u1d1b",
          u: "\u1d1c", v: "\u1d20", w: "\u1d21", x: "x", y: "\u028f", z: "\u1d22"
        };
        for (var i = 0; i < 26; i++) m[UPPER[i]] = smallCaps[LOWER[i]];
        return m;
      })()
    },
    {
      id: "circled",
      label: "Circled letters",
      map: (function () {
        var m = {};
        var i;
        for (i = 0; i < 26; i++) m[UPPER[i]] = String.fromCodePoint(0x24b6 + i);
        for (i = 0; i < 26; i++) m[LOWER[i]] = String.fromCodePoint(0x24d0 + i);
        for (i = 1; i <= 9; i++) m[DIGITS[i]] = String.fromCodePoint(0x2460 + (i - 1));
        m["0"] = "\u24ea";
        return m;
      })()
    },
    {
      id: "parenthesized",
      label: "Parenthesized",
      map: (function () {
        var m = {};
        for (var i = 0; i < 26; i++) m[LOWER[i]] = String.fromCodePoint(0x249c + i);
        for (var d = 1; d <= 9; d++) m[DIGITS[d]] = String.fromCodePoint(0x2474 + (d - 1));
        return m;
      })()
    },
    {
      id: "squared",
      label: "Squared letters",
      map: (function () {
        var m = {};
        for (var i = 0; i < 26; i++) m[UPPER[i]] = String.fromCodePoint(0x1f130 + i);
        return m;
      })()
    }
  ];

  var ACCENTS = [
    { id: "none", label: "No accent", left: "", right: "" },
    { id: "sparkle", label: "Sparkles ✧･ﾟ", left: "\u2727\uff65\uff9f: *", right: "*:\uff65\uff9f\u2727" },
    { id: "star", label: "Stars 彡★", left: "\u5f61\u2605", right: "\u2605\u5f61" },
    { id: "softstar", label: "Soft star \u22c6", left: "\u22c6\uff61\uff9f\u2729", right: "\u2729\uff9f\uff61\u22c6" },
    { id: "cloud", label: "Clouds \u2601", left: "\u2601\ufe0e", right: "\u2601\ufe0e" },
    { id: "heart", label: "Hearts \u2665", left: "\u2665", right: "\u2665" },
    { id: "moon", label: "Moons \u263e", left: "\u263e", right: "\u263d" },
    { id: "flower", label: "Flowers \u2740", left: "\u2740", right: "\u2740" },
    { id: "bracket", label: "Brackets \u300c\u300d", left: "\u300c", right: "\u300d" },
    { id: "butterfly", label: "Butterflies \ud83e\udd8b", left: "\ud83e\udd8b", right: "\ud83e\udd8b" }
  ];

  var PRESETS = [
    { label: "Soft script + sparkles", font: "script", accent: "sparkle" },
    { label: "Cloud serif", font: "bold-serif", accent: "cloud" },
    { label: "Starry sans", font: "sans-bold", accent: "star" },
    { label: "Cottage italic + flowers", font: "italic", accent: "flower" },
    { label: "Moonlight script", font: "bold-script", accent: "moon" },
    { label: "Gothic + hearts", font: "fraktur", accent: "heart" },
    { label: "Minimal monospace", font: "mono", accent: "none" },
    { label: "Dreamy double-struck", font: "double-struck", accent: "softstar" }
  ];

  var fontById = {};
  FONTS.forEach(function (f) { fontById[f.id] = f; });
  var accentById = {};
  ACCENTS.forEach(function (a) { accentById[a.id] = a; });

  function applyFont(text, fontId) {
    var font = fontById[fontId];
    if (!font || !font.map) return { text: text, styled: 0, plain: countVisible(text) };
    var out = "";
    var styled = 0;
    var plain = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (font.map[ch]) {
        out += font.map[ch];
        styled++;
      } else {
        out += ch;
        if (ch.trim() !== "") plain++;
      }
    }
    return { text: out, styled: styled, plain: plain };
  }

  function countVisible(text) {
    var n = 0;
    for (var i = 0; i < text.length; i++) if (text[i].trim() !== "") n++;
    return n;
  }

  function applyAccent(text, accentId) {
    var a = accentById[accentId] || accentById.none;
    if (!text) return "";
    return a.left + text + a.right;
  }

  function build(text, fontId, accentId) {
    var r = applyFont(text, fontId);
    return { text: applyAccent(r.text, accentId), styled: r.styled, plain: r.plain };
  }

  var els = {
    form: document.getElementById("aestheticForm"),
    input: document.getElementById("textInput"),
    fontSelect: document.getElementById("fontSelect"),
    accentSelect: document.getElementById("accentSelect"),
    applyBtn: document.getElementById("applyBtn"),
    copyAllBtn: document.getElementById("copyAllBtn"),
    errorBox: document.getElementById("errorBox"),
    resultsWrap: document.getElementById("resultsWrap"),
    grid: document.getElementById("presetGrid"),
    charCount: document.getElementById("charCount"),
    statTotal: document.getElementById("statTotal"),
    statStyled: document.getElementById("statStyled"),
    statPlain: document.getElementById("statPlain"),
    statCoverage: document.getElementById("statCoverage"),
    coverageNote: document.getElementById("coverageNote"),
    canvas: document.getElementById("coverageChart")
  };

  FONTS.forEach(function (f) {
    var o = document.createElement("option");
    o.value = f.id;
    o.textContent = f.label;
    els.fontSelect.appendChild(o);
  });
  ACCENTS.forEach(function (a) {
    var o = document.createElement("option");
    o.value = a.id;
    o.textContent = a.label;
    els.accentSelect.appendChild(o);
  });
  els.fontSelect.value = "script";
  els.accentSelect.value = "sparkle";

  function showError(msg) {
    els.errorBox.textContent = msg;
    els.errorBox.hidden = false;
  }
  function clearError() {
    els.errorBox.hidden = true;
    els.errorBox.textContent = "";
  }

  function copyText(text, btn) {
    var done = function () {
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = "Copied!";
      btn.disabled = true;
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
      }, 1200);
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
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  function render(text) {
    els.grid.innerHTML = "";
    PRESETS.forEach(function (p) {
      var res = build(text, p.font, p.accent);
      var col = document.createElement("div");
      col.className = "col-12 col-md-6 mb-3";

      var card = document.createElement("div");
      card.className = "preset-card";

      var body = document.createElement("div");
      body.className = "card-body";

      var label = document.createElement("div");
      label.className = "preset-label";
      label.textContent = p.label;

      var out = document.createElement("div");
      out.className = "preset-output";
      out.textContent = res.text;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-outline-secondary copy-btn";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy " + p.label + " text");
      btn.addEventListener("click", function () { copyText(res.text, btn); });

      body.appendChild(label);
      body.appendChild(out);
      body.appendChild(btn);
      card.appendChild(body);
      col.appendChild(card);
      els.grid.appendChild(col);
    });
  }

  function updateStats(styled, plain) {
    var total = styled + plain;
    var pct = total === 0 ? 0 : Math.round((styled / total) * 100);
    els.statTotal.textContent = total;
    els.statStyled.textContent = styled;
    els.statPlain.textContent = plain;
    els.statCoverage.textContent = pct + "%";
    els.coverageNote.textContent = plain === 0
      ? "Every character in your phrase has an aesthetic form in the selected style."
      : plain + " character" + (plain === 1 ? "" : "s") + " had no styled form and stayed as plain text.";
    drawChart(styled, plain);
  }

  function drawChart(styled, plain) {
    var canvas = els.canvas;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var data = [
      { label: "Styled", value: styled, color: "#60089c" },
      { label: "Left plain", value: plain, color: "#d6489b" }
    ];
    var max = Math.max(styled, plain, 1);
    var padLeft = 90;
    var padRight = 50;
    var padTop = 20;
    var barH = 34;
    var gap = 26;
    var plotW = w - padLeft - padRight;

    ctx.font = "13px 'Segoe UI', Roboto, Arial, sans-serif";
    ctx.textBaseline = "middle";

    data.forEach(function (d, i) {
      var y = padTop + i * (barH + gap);
      var barW = Math.max(2, (d.value / max) * plotW);

      ctx.fillStyle = "#6a6273";
      ctx.textAlign = "right";
      ctx.fillText(d.label, padLeft - 12, y + barH / 2);

      ctx.fillStyle = "#f1ebf8";
      ctx.fillRect(padLeft, y, plotW, barH);

      ctx.fillStyle = d.color;
      ctx.fillRect(padLeft, y, barW, barH);

      ctx.fillStyle = "#221b2b";
      ctx.textAlign = "left";
      ctx.fillText(String(d.value), padLeft + barW + 8, y + barH / 2);
    });
  }

  function run() {
    clearError();
    var text = els.input.value;
    if (text.trim() === "") {
      els.resultsWrap.hidden = true;
      showError("Enter at least one character to style.");
      return;
    }
    if (text.length > 120) {
      text = text.slice(0, 120);
      els.input.value = text;
    }
    els.resultsWrap.hidden = false;
    render(text);
    var primary = build(text, els.fontSelect.value, els.accentSelect.value);
    updateStats(primary.styled, primary.plain);
  }

  els.applyBtn.addEventListener("click", run);
  els.form.addEventListener("submit", function (e) { e.preventDefault(); run(); });

  els.input.addEventListener("input", function () {
    els.charCount.textContent = els.input.value.length;
    if (!els.resultsWrap.hidden) run();
  });

  els.copyAllBtn.addEventListener("click", function () {
    var text = els.input.value.trim();
    if (!text) return;
    var lines = PRESETS.map(function (p) {
      return p.label + ": " + build(text, p.font, p.accent).text;
    });
    copyText(lines.join("\n"), els.copyAllBtn);
  });

  els.input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      run();
    }
  });

  drawChart(0, 0);
})();
