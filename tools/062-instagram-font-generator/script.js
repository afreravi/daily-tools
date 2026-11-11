(function () {
  "use strict";

  var MAX_INPUT = 120;
  var CAPTION_LIMIT = 2200;

  /* ---------------- mapping helpers ---------------- */

  function blockMap(lowerStart, upperStart, digitStart) {
    return function (ch) {
      var c = ch.charCodeAt(0);
      if (c >= 97 && c <= 122) return String.fromCodePoint(lowerStart + (c - 97));
      if (c >= 65 && c <= 90) {
        return String.fromCodePoint((upperStart === null ? lowerStart : upperStart) + (c - 65));
      }
      if (digitStart && c >= 48 && c <= 57) return String.fromCodePoint(digitStart + (c - 48));
      return ch;
    };
  }

  function tableMap(upper, lower, digits) {
    return function (ch) {
      if (upper && Object.prototype.hasOwnProperty.call(upper, ch)) return upper[ch];
      if (lower && Object.prototype.hasOwnProperty.call(lower, ch)) return lower[ch];
      if (digits && Object.prototype.hasOwnProperty.call(digits, ch)) return digits[ch];
      return ch;
    };
  }

  function combiningMap(mark) {
    return function (ch) {
      if (ch === " " || ch === "\n" || ch === "\t") return ch;
      return ch + mark;
    };
  }

  function spacedMap(ch) {
    if (ch === " " || ch === "\n" || ch === "\t") return ch;
    return ch + " ";
  }

  function codePointArray(str) {
    return Array.from(str);
  }

  /* ---------------- tables for gapped blocks ---------------- */

  var SCRIPT_UPPER = {
    A: "\u{1D49C}", B: "\u212C", C: "\u{1D49E}", D: "\u{1D49F}", E: "\u2130",
    F: "\u2131", G: "\u{1D4A2}", H: "\u210B", I: "\u2110", J: "\u{1D4A5}",
    K: "\u{1D4A6}", L: "\u2112", M: "\u2133", N: "\u{1D4A9}", O: "\u{1D4AA}",
    P: "\u{1D4AB}", Q: "\u{1D4AC}", R: "\u211B", S: "\u{1D4AE}", T: "\u{1D4AF}",
    U: "\u{1D4B0}", V: "\u{1D4B1}", W: "\u{1D4B2}", X: "\u{1D4B3}", Y: "\u{1D4B4}",
    Z: "\u{1D4B5}"
  };

  var FRAKTUR_UPPER = {
    A: "\u{1D504}", B: "\u{1D505}", C: "\u212D", D: "\u{1D507}", E: "\u{1D508}",
    F: "\u{1D509}", G: "\u{1D50A}", H: "\u210C", I: "\u2111", J: "\u{1D50D}",
    K: "\u{1D50E}", L: "\u{1D50F}", M: "\u{1D510}", N: "\u{1D511}", O: "\u{1D512}",
    P: "\u{1D513}", Q: "\u{1D514}", R: "\u211C", S: "\u{1D516}", T: "\u{1D517}",
    U: "\u{1D518}", V: "\u{1D519}", W: "\u{1D51A}", X: "\u{1D51B}", Y: "\u{1D51C}",
    Z: "\u2128"
  };

  var DOUBLESTRUCK_UPPER = {
    A: "\u{1D538}", B: "\u{1D539}", C: "\u2102", D: "\u{1D53B}", E: "\u{1D53C}",
    F: "\u{1D53D}", G: "\u{1D53E}", H: "\u210D", I: "\u{1D540}", J: "\u{1D541}",
    K: "\u{1D542}", L: "\u{1D543}", M: "\u{1D544}", N: "\u2115", O: "\u{1D546}",
    P: "\u2119", Q: "\u211A", R: "\u211D", S: "\u{1D54A}", T: "\u{1D54B}",
    U: "\u{1D54C}", V: "\u{1D54D}", W: "\u{1D54E}", X: "\u{1D54F}", Y: "\u{1D550}",
    Z: "\u2124"
  };

  function scriptLower(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D4B6 + (c - 97));
    return ch;
  }

  function frakturLower(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D51E + (c - 97));
    return ch;
  }

  function doublestruckLower(ch) {
    var c = ch.charCodeAt(0);
    if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D552 + (c - 97));
    return ch;
  }

  /* ---------------- small tables ---------------- */

  var SMALL_CAPS = {
    a: "\u1D00", b: "\u0299", c: "\u1D04", d: "\u1D05", e: "\u1D07", f: "\uA730",
    g: "\u0262", h: "\u029C", i: "\u026A", j: "\u1D0A", k: "\u1D0B", l: "\u029F",
    m: "\u1D0D", n: "\u0274", o: "\u1D0F", p: "\u1D18", q: "\u01EB", r: "\u0280",
    s: "\uA731", t: "\u1D1B", u: "\u1D1C", v: "\u1D20", w: "\u1D21", x: "x",
    y: "\u028F", z: "\u1D22"
  };

  var SUPERSCRIPT = {
    a: "\u1D43", b: "\u1D47", c: "\u1D9C", d: "\u1D48", e: "\u1D49", f: "\u1DA0",
    g: "\u1D4D", h: "\u02B0", i: "\u2071", j: "\u02B2", k: "\u1D4F", l: "\u02E1",
    m: "\u1D50", n: "\u207F", o: "\u1D52", p: "\u1D56", q: "q", r: "\u02B3",
    s: "\u02E2", t: "\u1D57", u: "\u1D58", v: "\u1D5B", w: "\u02B7", x: "\u02E3",
    y: "\u02B8", z: "\u1DBB"
  };
  var SUPERSCRIPT_DIGITS = {
    "0": "\u2070", "1": "\u00B9", "2": "\u00B2", "3": "\u00B3", "4": "\u2074",
    "5": "\u2075", "6": "\u2076", "7": "\u2077", "8": "\u2078", "9": "\u2079"
  };

  var SUBSCRIPT = {
    a: "\u2090", e: "\u2091", h: "\u2095", i: "\u1D62", j: "\u2C7C", k: "\u2096",
    l: "\u2097", m: "\u2098", n: "\u2099", o: "\u2092", p: "\u209A", r: "\u1D63",
    s: "\u209B", t: "\u209C", u: "\u1D64", v: "\u1D65", x: "\u2093"
  };
  var SUBSCRIPT_DIGITS = {
    "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083", "4": "\u2084",
    "5": "\u2085", "6": "\u2086", "7": "\u2087", "8": "\u2088", "9": "\u2089"
  };

  var FLIP = {
    a: "\u0250", b: "q", c: "\u0254", d: "p", e: "\u01DD", f: "\u025F", g: "\u0183",
    h: "\u0265", i: "\u1D09", j: "\u027E", k: "\u029E", l: "l", m: "\u026F",
    n: "u", o: "o", p: "d", q: "b", r: "\u0279", s: "s", t: "\u0287", u: "n",
    v: "\u028C", w: "\u028D", x: "x", y: "\u028E", z: "z",
    A: "\u2200", B: "B", C: "\u0186", D: "D", E: "\u018E", F: "\u2132", G: "\u2141",
    H: "H", I: "I", J: "\u017F", K: "\u029E", L: "\u2142", M: "W", N: "N", O: "O",
    P: "\u0500", Q: "\u038C", R: "\u1D1A", S: "S", T: "\u22A5", U: "\u2229",
    V: "\u039B", W: "M", X: "X", Y: "\u2144", Z: "Z",
    ".": "\u02D9", ",": "'", "?": "\u00BF", "!": "\u00A1", "'": ",", "\"": "\u201E",
    "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<",
    "&": "\u214B", "_": "\u203E", ";": "\u061B", "0": "0", "1": "\u0196",
    "2": "\u1614", "3": "\u0190", "4": "\u3123", "5": "\u1515", "6": "9", "7": "\u3125",
    "8": "8", "9": "6"
  };

  function flipMap(ch) {
    var key = ch;
    if (Object.prototype.hasOwnProperty.call(FLIP, key)) return FLIP[key];
    return ch;
  }

  function upsideDown(str) {
    return codePointArray(str).reverse().map(flipMap).join("");
  }

  /* ---------------- style library ---------------- */

  var STYLES = [
    { name: "Cursive", cat: "cursive", map: tableMap(SCRIPT_UPPER, null, null), lower: scriptLower },
    { name: "Bold Cursive", cat: "cursive", map: blockMap(0x1D4EA, 0x1D4D0, null) },
    { name: "Italic Serif", cat: "italic", map: blockMap(0x1D44E, 0x1D434, null) },
    { name: "Italic Sans", cat: "italic", map: blockMap(0x1D622, 0x1D608, null) },
    { name: "Bold Italic", cat: "italic", map: blockMap(0x1D482, 0x1D468, null) },
    { name: "Bold Serif", cat: "bold", map: blockMap(0x1D41A, 0x1D400, 0x1D7CE) },
    { name: "Bold Sans", cat: "bold", map: blockMap(0x1D5EE, 0x1D5D4, 0x1D7EC) },
    { name: "Sans Serif", cat: "aesthetic", map: blockMap(0x1D5BA, 0x1D5A0, 0x1D7E2) },
    { name: "Gothic", cat: "aesthetic", map: tableMap(FRAKTUR_UPPER, null, null), lower: frakturLower },
    { name: "Bold Gothic", cat: "aesthetic", map: blockMap(0x1D586, 0x1D56C, null) },
    { name: "Double Struck", cat: "aesthetic", map: tableMap(DOUBLESTRUCK_UPPER, null, null), lower: doublestruckLower },
    { name: "Monospace", cat: "aesthetic", map: blockMap(0x1D68A, 0x1D670, 0x1D7F6) },
    { name: "Small Caps", cat: "tiny", map: tableMap(null, null, null), lower: function (ch) {
        var l = ch.toLowerCase();
        return Object.prototype.hasOwnProperty.call(SMALL_CAPS, l) ? SMALL_CAPS[l] : ch;
      } },
    { name: "Superscript", cat: "tiny", map: tableMap(null, null, SUPERSCRIPT_DIGITS), lower: function (ch) {
        var l = ch.toLowerCase();
        return Object.prototype.hasOwnProperty.call(SUPERSCRIPT, l) ? SUPERSCRIPT[l] : ch;
      } },
    { name: "Subscript", cat: "tiny", map: tableMap(null, null, SUBSCRIPT_DIGITS), lower: function (ch) {
        var l = ch.toLowerCase();
        return Object.prototype.hasOwnProperty.call(SUBSCRIPT, l) ? SUBSCRIPT[l] : ch;
      } },
    { name: "Circled", cat: "enclosed", map: blockMap(0x24D0, 0x24B6, null), digits: {
        "0": "\u24EA", "1": "\u2460", "2": "\u2461", "3": "\u2462", "4": "\u2463",
        "5": "\u2464", "6": "\u2465", "7": "\u2466", "8": "\u2467", "9": "\u2468"
      } },
    { name: "Circled Bold", cat: "enclosed", map: blockMap(0x1F150, null, null) },
    { name: "Squared", cat: "enclosed", map: blockMap(0x1F130, null, null) },
    { name: "Squared Bold", cat: "enclosed", map: blockMap(0x1F170, null, null) },
    { name: "Fullwidth", cat: "wide", map: blockMap(0xFF41, 0xFF21, 0xFF10) },
    { name: "Spaced Out", cat: "wide", map: spacedMap },
    { name: "Strikethrough", cat: "aesthetic", map: combiningMap("\u0336") },
    { name: "Underline", cat: "aesthetic", map: combiningMap("\u0332") },
    { name: "Upside Down", cat: "aesthetic", map: flipMap, whole: upsideDown }
  ];

  /* ---------------- dom ---------------- */

  var form = document.getElementById("fontForm");
  var input = document.getElementById("textInput");
  var charCount = document.getElementById("charCount");
  var styleFilter = document.getElementById("styleFilter");
  var results = document.getElementById("results");
  var previewText = document.getElementById("igPreviewText");
  var captionInput = document.getElementById("captionCheck");
  var captionResult = document.getElementById("captionResult");
  var formMessage = document.getElementById("formMessage");
  var statStyles = document.getElementById("statStyles");
  var statChars = document.getElementById("statChars");
  var statBest = document.getElementById("statBest");
  var chart = document.getElementById("coverageChart");

  var currentStyles = [];

  function isEligible(ch) {
    return /[A-Za-z0-9]/.test(ch);
  }

  function convert(style, text) {
    if (style.whole) return style.whole(text);
    return codePointArray(text).map(function (ch) {
      var out = style.map(ch);
      if (style.lower) out = style.lower(out);
      if (style.digits && Object.prototype.hasOwnProperty.call(style.digits, ch)) {
        out = style.digits[ch];
      }
      return out;
    }).join("");
  }

  function coverage(style, text) {
    var chars = codePointArray(text);
    var eligible = 0;
    var converted = 0;
    chars.forEach(function (ch) {
      if (!isEligible(ch)) return;
      eligible++;
      var out = convert(style, ch);
      if (out !== ch) converted++;
    });
    return eligible === 0 ? 0 : Math.round((converted / eligible) * 100);
  }

  function showMessage(text, type) {
    formMessage.textContent = text;
    formMessage.className = "alert mt-3 mb-0 alert-" + type;
    formMessage.classList.remove("d-none");
  }

  function hideMessage() {
    formMessage.classList.add("d-none");
  }

  /* ---------------- rendering ---------------- */

  function renderResults() {
    var text = input.value.trim();
    var filter = styleFilter.value;

    if (!text) {
      results.innerHTML = '<p class="text-muted mb-0">Your styled text will appear here.</p>';
      previewText.textContent = "Your styled text will appear here.";
      statStyles.textContent = "0";
      statChars.textContent = "0";
      statBest.textContent = "\u2014";
      currentStyles = [];
      drawChart([]);
      return;
    }

    if (text.length > MAX_INPUT) {
      showMessage("Please keep your text to " + MAX_INPUT + " characters or fewer.", "danger");
      return;
    }
    hideMessage();

    var filtered = STYLES.filter(function (s) {
      return filter === "all" || s.cat === filter;
    });

    currentStyles = filtered.map(function (style) {
      return {
        name: style.name,
        output: convert(style, text),
        coverage: coverage(style, text)
      };
    });

    results.innerHTML = "";
    currentStyles.forEach(function (item, index) {
      var wrapper = document.createElement("div");
      wrapper.className = "style-item";
      wrapper.tabIndex = 0;
      wrapper.setAttribute("role", "button");
      wrapper.setAttribute("aria-label", "Preview " + item.name + " style");
      wrapper.dataset.index = String(index);

      var head = document.createElement("div");
      head.className = "style-item__head";

      var label = document.createElement("span");
      label.className = "style-item__name";
      label.textContent = item.name;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.textContent = "Copy";
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        copyText(item.output, btn);
      });

      head.appendChild(label);
      head.appendChild(btn);

      var out = document.createElement("div");
      out.className = "style-item__output";
      out.textContent = item.output || "(no convertible characters)";
      if (!item.output) out.classList.add("is-empty");

      wrapper.appendChild(head);
      wrapper.appendChild(out);
      results.appendChild(wrapper);

      wrapper.addEventListener("click", function () { selectStyle(index); });
      wrapper.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectStyle(index);
        }
      });
    });

    var charTotal = codePointArray(text).filter(isEligible).length * currentStyles.length;
    statStyles.textContent = String(currentStyles.length);
    statChars.textContent = String(charTotal);
    var best = currentStyles.reduce(function (acc, s) {
      return s.coverage > acc.coverage ? s : acc;
    }, currentStyles[0]);
    statBest.textContent = best ? best.name + " (" + best.coverage + "%)" : "\u2014";

    if (currentStyles.length) selectStyle(0);
    drawChart(currentStyles);
  }

  function selectStyle(index) {
    var nodes = results.querySelectorAll(".style-item");
    nodes.forEach(function (n) { n.classList.remove("is-active"); });
    if (nodes[index]) nodes[index].classList.add("is-active");
    var item = currentStyles[index];
    if (item) previewText.textContent = item.output || "(no convertible characters)";
  }

  function copyText(text, btn) {
    if (!text) return;
    var done = function () {
      if (!btn) return;
      var original = btn.textContent;
      btn.textContent = "Copied";
      btn.classList.add("is-copied");
      window.setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove("is-copied");
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
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  /* ---------------- chart ---------------- */

  function drawChart(items) {
    if (!chart || !chart.getContext) return;
    var ctx = chart.getContext("2d");
    var w = chart.width;
    var h = chart.height;
    ctx.clearRect(0, 0, w, h);

    var padLeft = 8;
    var padBottom = 26;
    var padTop = 14;
    var plotH = h - padBottom - padTop;

    ctx.strokeStyle = "#ece5f4";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(w - padLeft, y);
      ctx.stroke();
    }

    if (!items.length) {
      ctx.fillStyle = "#8b8299";
      ctx.font = "13px Segoe UI, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Coverage appears once you enter text", w / 2, h / 2);
      return;
    }

    var shown = items.slice(0, 14);
    var n = shown.length;
    var gap = 6;
    var barW = (w - padLeft * 2 - gap * (n - 1)) / n;

    shown.forEach(function (item, i) {
      var ratio = item.coverage / 100;
      var barH = Math.max(2, ratio * plotH);
      var x = padLeft + i * (barW + gap);
      var y = padTop + plotH - barH;

      var grad = ctx.createLinearGradient(0, y, 0, padTop + plotH);
      grad.addColorStop(0, "#8326c9");
      grad.addColorStop(1, "#60089c");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = "#6d6579";
      ctx.font = "9px Segoe UI, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.save();
      ctx.translate(x + barW / 2, h - 16);
      ctx.rotate(-Math.PI / 3.2);
      ctx.fillText(item.name, 0, 0);
      ctx.restore();
    });
  }

  /* ---------------- caption check ---------------- */

  function checkCaption() {
    var val = captionInput.value;
    var len = codePointArray(val).length;
    if (!val) {
      captionResult.classList.add("d-none");
      return;
    }
    captionResult.classList.remove("d-none");
    var remaining = CAPTION_LIMIT - len;
    if (remaining < 0) {
      captionResult.className = "small mt-3 is-over";
      captionResult.textContent = len + " characters - " + Math.abs(remaining) + " over the 2,200 limit.";
    } else {
      captionResult.className = "small mt-3 is-ok";
      captionResult.textContent = len + " characters - " + remaining + " left of the 2,200 limit.";
    }
  }

  /* ---------------- events ---------------- */

  input.addEventListener("input", function () {
    charCount.textContent = String(codePointArray(input.value).length);
    renderResults();
  });

  styleFilter.addEventListener("change", renderResults);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!input.value.trim()) {
      showMessage("Type a word or phrase first, then generate.", "danger");
      input.focus();
      return;
    }
    renderResults();
    showMessage("Done - " + currentStyles.length + " styles generated. Pick one and copy it.", "success");
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    input.value = "";
    charCount.textContent = "0";
    hideMessage();
    renderResults();
    input.focus();
  });

  document.getElementById("copyAllBtn").addEventListener("click", function () {
    if (!currentStyles.length) {
      showMessage("Nothing to copy yet - generate some styles first.", "danger");
      return;
    }
    var text = currentStyles.map(function (s) {
      return s.name + ": " + s.output;
    }).join("\n");
    copyText(text);
    showMessage("All " + currentStyles.length + " styles copied to your clipboard.", "success");
  });

  captionInput.addEventListener("input", checkCaption);

  drawChart([]);
})();
