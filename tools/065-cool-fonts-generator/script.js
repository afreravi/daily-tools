(function () {
  "use strict";

  var UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var LOWER = "abcdefghijklmnopqrstuvwxyz";
  var DIGITS = "0123456789";

  function seq(start, len) {
    var out = "";
    for (var i = 0; i < len; i++) out += String.fromCodePoint(start + i);
    return out;
  }

  function setChar(str, index, ch) {
    var arr = str.split("");
    arr[index] = ch;
    return arr.join("");
  }

  function buildMap(upper, lower, digits, extra) {
    var map = {};
    for (var i = 0; i < 26; i++) {
      map[UPPER[i]] = upper[i];
      map[LOWER[i]] = lower ? lower[i] : upper[i];
    }
    if (digits) for (var d = 0; d < 10; d++) map[DIGITS[d]] = digits[d];
    if (extra) for (var k in extra) if (extra.hasOwnProperty(k)) map[k] = extra[k];
    return map;
  }

  function applyMap(map, text) {
    var out = "";
    Array.from(text).forEach(function (ch) {
      out += Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    });
    return out;
  }

  function combine(mark, text) {
    var out = "";
    Array.from(text).forEach(function (ch) {
      out += ch + mark;
    });
    return out;
  }

  function wrap(text, before, after) {
    return before + text + (after === undefined ? before : after);
  }

  function spaced(text, gap) {
    return Array.from(text).join(gap);
  }

  function upsideDown(text) {
    var map = {
      a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183",
      h: "\u0265", i: "\u1D09", j: "\u027E", k: "\u029E", l: "l", m: "\u026F", n: "u",
      o: "o", p: "d", q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n", v: "\u028C",
      w: "\u028D", x: "x", y: "\u028E", z: "z",
      A: "\u2200", B: "\u0411", C: "\u0186", D: "\u15E1", E: "\u018E", F: "\u2132",
      G: "\u2141", H: "H", I: "I", J: "\u017F", K: "\u029E", L: "\u02E5", M: "W",
      N: "N", O: "O", P: "\u0500", Q: "\u00D2", R: "\u1D1A", S: "S", T: "\u22A5",
      U: "\u2229", V: "\u039B", W: "M", X: "X", Y: "\u2144", Z: "Z",
      "0": "0", "1": "\u0196", "2": "\u1105", "3": "\u0190", "4": "\u3123",
      "5": "\u03DB", "6": "9", "7": "\u3125", "8": "8", "9": "6"
    };
    var out = Array.from(text).map(function (ch) {
      return Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    });
    return out.reverse().join("");
  }

  function leet(text) {
    var map = { a: "4", A: "4", e: "3", E: "3", i: "1", I: "1", o: "0", O: "0", s: "5", S: "5", t: "7", T: "7", b: "8", B: "8", g: "9", G: "9", l: "1", L: "1" };
    return applyMap(map, text);
  }

  var SMALL_CAPS_LOWER = "\u1D00\u0299\u1D04\u1D05\u1D07\uA730\u0262\u029C\u026A\u1D0A\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18q\u0280\uA731\u1D1B\u1D1C\u1D20\u1D21x\u028F\u1D22";
  var SMALL_CAPS_UPPER = "\u1D00\u0299\u1D04\u1D05\u1D07\uA730\u0262\u029C\u026A\u1D0A\u1D0B\u029F\u1D0D\u0274\u1D0F\u1D18Q\u0280\uA731\u1D1B\u1D1C\u1D20\u1D21X\u028F\u1D22";

  var SUPER_LOWER = "\u1D43\u1D47\u1D9C\u1D48\u1D49\u1DA0\u1D4D\u02B0\u2071\u02B2\u1D4F\u02E1\u1D50\u207F\u1D52\u1D56\u0071\u02B3\u02E2\u1D57\u1D58\u1D5B\u02B7\u02E3\u02B8\u1DBB";
  var SUPER_UPPER = "\u1D2C\u1D2E\u1D9C\u1D30\u1D31\u1DA0\u1D33\u1D34\u1D35\u1D36\u1D37\u1D38\u1D39\u1D3A\u1D3C\u1D3E\u1D3F\u1D3F\u1D40\u1D41\u2C7D\u1D42\u02B7\u02E3\u1D3A\u1D22";
  var SUPER_DIGITS = "\u2070\u00B9\u00B2\u00B3\u2074\u2075\u2076\u2077\u2078\u2079";

  var SUB_LOWER = "\u2090b\u2091d\u2091\u2091\u2095\u1D62\u2C7C\u2096\u2097\u2098\u2099\u2092\u209A\u0071\u1D63\u209B\u209C\u1D64\u1D65\u0077\u2093\u0079\u007A";
  var SUB_UPPER = SUB_LOWER;
  var SUB_DIGITS = "\u2080\u2081\u2082\u2083\u2084\u2085\u2086\u2087\u2088\u2089";

  var NEG_CIRCLED_UPPER = seq(0x1F150, 26);
  var SQUARED_UPPER = seq(0x1F130, 26);
  var PAREN_LOWER = seq(0x249C, 26);

  var styles = [
    { name: "Bold Sans", category: "bold", kind: "map", map: buildMap(seq(0x1D5D4, 26), seq(0x1D5EE, 26), seq(0x1D7EC, 10)) },
    { name: "Bold Serif", category: "bold", kind: "map", map: buildMap(seq(0x1D400, 26), seq(0x1D41A, 26), seq(0x1D7CE, 10)) },
    { name: "Bold Italic Serif", category: "bold", kind: "map", map: buildMap(seq(0x1D468, 26), seq(0x1D482, 26)) },
    { name: "Bold Italic Sans", category: "bold", kind: "map", map: buildMap(seq(0x1D63C, 26), seq(0x1D656, 26)) },
    { name: "Monospace", category: "bold", kind: "map", map: buildMap(seq(0x1D670, 26), seq(0x1D68A, 26), seq(0x1D7F6, 10)) },
    { name: "Double Struck", category: "bold", kind: "map", map: buildMap(
      setChar(setChar(setChar(setChar(setChar(setChar(setChar(seq(0x1D538, 26), 2, "\u2102"), 7, "\u210D"), 13, "\u2115"), 15, "\u2119"), 16, "\u211A"), 17, "\u211D"), 25, "\u2124"),
      seq(0x1D552, 26), seq(0x1D7D8, 10)) },

    { name: "Italic Serif", category: "italic", kind: "map", map: buildMap(seq(0x1D434, 26), setChar(seq(0x1D44E, 26), 7, "\u210E")) },
    { name: "Italic Sans", category: "italic", kind: "map", map: buildMap(seq(0x1D608, 26), seq(0x1D622, 26)) },
    { name: "Script", category: "italic", kind: "map", map: buildMap(
      setChar(setChar(setChar(setChar(setChar(setChar(setChar(setChar(seq(0x1D49C, 26), 1, "\u212C"), 4, "\u2130"), 5, "\u2131"), 7, "\u210B"), 8, "\u2110"), 11, "\u2112"), 12, "\u2133"), 17, "\u211B"),
      setChar(setChar(setChar(seq(0x1D4B6, 26), 4, "\u212F"), 6, "\u210A"), 14, "\u2134")) },
    { name: "Bold Script", category: "italic", kind: "map", map: buildMap(seq(0x1D4D0, 26), seq(0x1D4EA, 26)) },
    { name: "Sans Serif", category: "italic", kind: "map", map: buildMap(seq(0x1D5A0, 26), seq(0x1D5BA, 26), seq(0x1D7E2, 10)) },

    { name: "Fraktur", category: "gothic", kind: "map", map: buildMap(
      setChar(setChar(setChar(setChar(setChar(seq(0x1D504, 26), 2, "\u212D"), 7, "\u210C"), 8, "\u2111"), 17, "\u211C"), 25, "\u2128"),
      seq(0x1D51E, 26)) },
    { name: "Bold Fraktur", category: "gothic", kind: "map", map: buildMap(seq(0x1D56C, 26), seq(0x1D586, 26)) },
    { name: "Old English", category: "gothic", kind: "map", map: buildMap(
      setChar(setChar(setChar(setChar(setChar(seq(0x1D504, 26), 2, "\u212D"), 7, "\u210C"), 8, "\u2111"), 17, "\u211C"), 25, "\u2128"),
      seq(0x1D51E, 26)) },

    { name: "Circled", category: "bubble", kind: "map", map: buildMap(seq(0x24B6, 26), seq(0x24D0, 26), "\u24EA\u2460\u2461\u2462\u2463\u2464\u2465\u2466\u2467\u2468") },
    { name: "Negative Circled", category: "bubble", kind: "map", map: buildMap(NEG_CIRCLED_UPPER, NEG_CIRCLED_UPPER) },
    { name: "Squared", category: "bubble", kind: "map", map: buildMap(SQUARED_UPPER, SQUARED_UPPER) },
    { name: "Parenthesized", category: "bubble", kind: "map", map: buildMap(PAREN_LOWER, PAREN_LOWER) },
    { name: "Flag Letters", category: "bubble", kind: "map", map: buildMap(seq(0x1F1E6, 26), seq(0x1F1E6, 26)) },

    { name: "Fullwidth Wide", category: "wide", kind: "map", map: buildMap(seq(0xFF21, 26), seq(0xFF41, 26), seq(0xFF10, 10)) },
    { name: "Airy Spaced", category: "wide", kind: "fn", fn: function (t) { return spaced(t, "\u2009"); } },
    { name: "Small Caps", category: "wide", kind: "map", map: buildMap(SMALL_CAPS_UPPER, SMALL_CAPS_LOWER) },
    { name: "Superscript", category: "wide", kind: "map", map: buildMap(SUPER_UPPER, SUPER_LOWER, SUPER_DIGITS) },
    { name: "Subscript", category: "wide", kind: "map", map: buildMap(SUB_UPPER, SUB_LOWER, SUB_DIGITS) },

    { name: "Strikethrough", category: "decor", kind: "fn", fn: function (t) { return combine("\u0336", t); } },
    { name: "Underlined", category: "decor", kind: "fn", fn: function (t) { return combine("\u0332", t); } },
    { name: "Double Underline", category: "decor", kind: "fn", fn: function (t) { return combine("\u0333", t); } },
    { name: "Slashed", category: "decor", kind: "fn", fn: function (t) { return combine("\u0338", t); } },
    { name: "Upside Down", category: "decor", kind: "fn", fn: upsideDown },
    { name: "Star Framed", category: "decor", kind: "fn", fn: function (t) { return wrap(t, "\u2726 "); } },
    { name: "Heart Framed", category: "decor", kind: "fn", fn: function (t) { return wrap(t, "\u2665 "); } },
    { name: "Moon Framed", category: "decor", kind: "fn", fn: function (t) { return wrap(t, "\u263E ", " \u263D"); } },
    { name: "Leetspeak", category: "decor", kind: "fn", fn: leet }
  ];

  var els = {
    form: document.getElementById("fontForm"),
    text: document.getElementById("textInput"),
    category: document.getElementById("categoryFilter"),
    search: document.getElementById("searchFilter"),
    generate: document.getElementById("generateBtn"),
    random: document.getElementById("randomBtn"),
    reset: document.getElementById("resetBtn"),
    grid: document.getElementById("resultsGrid"),
    count: document.getElementById("countBadge"),
    empty: document.getElementById("emptyState"),
    errorBox: document.getElementById("errorBox"),
    chart: document.getElementById("widthChart"),
    widestName: document.getElementById("widestName"),
    widestCount: document.getElementById("widestCount")
  };

  var state = { text: "", results: [] };

  function renderText(style, text) {
    return style.kind === "map" ? applyMap(style.map, text) : style.fn(text);
  }

  function charCount(str) {
    return Array.from(str).length;
  }

  function showError(message) {
    els.errorBox.textContent = message;
    els.errorBox.classList.remove("d-none");
    els.text.classList.add("is-invalid");
  }

  function clearError() {
    els.errorBox.classList.add("d-none");
    els.text.classList.remove("is-invalid");
  }

  function passesFilters(style) {
    var category = els.category.value;
    var query = els.search.value.trim().toLowerCase();
    if (category !== "all" && style.category !== category) return false;
    if (query && style.name.toLowerCase().indexOf(query) === -1) return false;
    return true;
  }

  function copyText(value, button) {
    var done = function () {
      var original = button.textContent;
      button.textContent = "Copied!";
      button.classList.add("btn-success");
      button.classList.remove("btn-primary");
      window.setTimeout(function () {
        button.textContent = original;
        button.classList.remove("btn-success");
        button.classList.add("btn-primary");
      }, 1200);
    };
    var fallback = function () {
      var area = document.createElement("textarea");
      area.value = value;
      area.setAttribute("readonly", "");
      area.style.position = "absolute";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      try { document.execCommand("copy"); done(); } catch (e) { /* clipboard unavailable */ }
      document.body.removeChild(area);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(fallback);
    } else {
      fallback();
    }
  }

  function buildCard(style, output) {
    var col = document.createElement("div");
    col.className = "col-md-6 col-lg-4 mb-3";

    var card = document.createElement("div");
    card.className = "card font-card";

    var body = document.createElement("div");
    body.className = "card-body p-3";

    var name = document.createElement("p");
    name.className = "style-name";
    name.textContent = style.name;

    var preview = document.createElement("div");
    preview.className = "font-preview";
    preview.textContent = output;

    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-sm btn-primary copy-btn";
    button.textContent = "Copy";
    button.setAttribute("aria-label", "Copy " + style.name + " version of your text");
    button.addEventListener("click", function () { copyText(output, button); });

    body.appendChild(name);
    body.appendChild(preview);
    body.appendChild(button);
    card.appendChild(body);
    col.appendChild(card);
    return col;
  }

  function buildChart(results) {
    els.chart.innerHTML = "";
    if (!results.length) {
      els.widestName.textContent = "\u2014";
      els.widestCount.textContent = "0";
      return;
    }
    var sorted = results.slice().sort(function (a, b) { return b.count - a.count; });
    var max = sorted[0].count || 1;
    sorted.slice(0, 12).forEach(function (item) {
      var row = document.createElement("div");
      row.className = "width-row";

      var label = document.createElement("span");
      label.className = "label";
      label.textContent = item.style.name;
      label.title = item.style.name;

      var track = document.createElement("span");
      track.className = "track";
      var fill = document.createElement("span");
      fill.className = "fill";
      fill.style.width = Math.max(4, Math.round((item.count / max) * 100)) + "%";
      track.appendChild(fill);

      var value = document.createElement("span");
      value.className = "value";
      value.textContent = item.count;

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(value);
      els.chart.appendChild(row);
    });
    els.widestName.textContent = sorted[0].style.name;
    els.widestCount.textContent = sorted[0].count;
  }

  function render() {
    var text = state.text;
    els.grid.innerHTML = "";

    if (!text) {
      els.count.textContent = "0 styles";
      els.empty.classList.remove("d-none");
      buildChart([]);
      return;
    }
    els.empty.classList.add("d-none");

    var results = [];
    styles.forEach(function (style) {
      if (!passesFilters(style)) return;
      var output = renderText(style, text);
      results.push({ style: style, output: output, count: charCount(output) });
    });

    state.results = results;
    els.count.textContent = results.length + (results.length === 1 ? " style" : " styles");

    if (!results.length) {
      var note = document.createElement("div");
      note.className = "col-12";
      note.innerHTML = '<p class="text-muted mb-0">No styles match that filter. Try a different family or clear the name filter.</p>';
      els.grid.appendChild(note);
      buildChart([]);
      return;
    }

    results.forEach(function (item) {
      els.grid.appendChild(buildCard(item.style, item.output));
    });
    buildChart(results);
  }

  function generate() {
    clearError();
    var raw = els.text.value;
    if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw)) {
      raw = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
      els.text.value = raw;
    }
    var trimmed = raw.trim();
    if (!trimmed) {
      state.text = "";
      showError("Please type at least one letter or number.");
      render();
      return;
    }
    if (charCount(trimmed) > 60) {
      showError("Please keep your text to 60 characters or fewer.");
      return;
    }
    if (!/[A-Za-z0-9]/.test(trimmed)) {
      showError("Please include at least one letter or number so a style can be built.");
      return;
    }
    state.text = trimmed;
    render();
  }

  els.form.addEventListener("submit", function (event) {
    event.preventDefault();
    generate();
  });
  els.generate.addEventListener("click", generate);
  els.text.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      generate();
    }
  });
  els.category.addEventListener("change", function () { if (state.text) render(); });
  els.search.addEventListener("input", function () { if (state.text) render(); });

  els.random.addEventListener("click", function () {
    var samples = ["Cool fonts", "Your Name", "Level Up", "Stay Weird", "Hello World", "Nice Vibes", "Dream Big"];
    els.text.value = samples[Math.floor(Math.random() * samples.length)];
    generate();
  });

  els.reset.addEventListener("click", function () {
    window.setTimeout(function () {
      els.text.value = "";
      els.search.value = "";
      els.category.value = "all";
      state.text = "";
      state.results = [];
      clearError();
      render();
    }, 0);
  });

  render();
})();
