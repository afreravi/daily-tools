(function () {
  'use strict';

  var MAX_LEN = 60;

  var EXCEPTIONS = {
    script: {
      upper: { 66: 0x212C, 69: 0x2130, 70: 0x2131, 72: 0x210B, 73: 0x2110, 76: 0x2112, 77: 0x2133, 82: 0x211B },
      lower: { 101: 0x212F, 103: 0x210A, 111: 0x2134 }
    },
    italic: { upper: {}, lower: { 104: 0x210E } },
    fraktur: { upper: { 67: 0x212D, 72: 0x210C, 73: 0x2111, 82: 0x211C, 90: 0x2128 }, lower: {} },
    doubleStruck: {
      upper: { 67: 0x2102, 72: 0x210D, 78: 0x2115, 80: 0x2119, 81: 0x211A, 82: 0x211D, 90: 0x2124 },
      lower: {}
    }
  };

  var SMALL_CAPS = {
    65: 0x1D00, 66: 0x0299, 67: 0x1D04, 68: 0x1D05, 69: 0x1D07, 70: 0xA730, 71: 0x0262, 72: 0x029C,
    73: 0x026A, 74: 0x1D0A, 75: 0x1D0B, 76: 0x029F, 77: 0x1D0D, 78: 0x0274, 79: 0x1D0F, 80: 0x1D18,
    81: 0x01EB, 82: 0x0280, 83: 0xA731, 84: 0x1D1B, 85: 0x1D1C, 86: 0x1D20, 87: 0x1D21, 88: 0x0078,
    89: 0x028F, 90: 0x1D22
  };

  var STYLES = [
    { key: 'boldScript', label: 'Bold script', upper: 0x1D4D0, lower: 0x1D4EA },
    { key: 'script', label: 'Light script', upper: 0x1D49C, lower: 0x1D4B6, exceptions: 'script' },
    { key: 'boldItalic', label: 'Bold italic', upper: 0x1D468, lower: 0x1D482 },
    { key: 'italic', label: 'Upright italic', upper: 0x1D434, lower: 0x1D44E, exceptions: 'italic' },
    { key: 'fraktur', label: 'Blackletter', upper: 0x1D504, lower: 0x1D51E, exceptions: 'fraktur' },
    { key: 'boldFraktur', label: 'Bold blackletter', upper: 0x1D56C, lower: 0x1D586 },
    { key: 'doubleStruck', label: 'Double-struck', upper: 0x1D538, lower: 0x1D552, digits: 0x1D7D8, exceptions: 'doubleStruck' },
    { key: 'smallCaps', label: 'Small caps', custom: SMALL_CAPS }
  ];

  var ORNAMENTS = [
    { key: 'none', label: 'None', open: '', close: '' },
    { key: 'sparkle', label: 'Sparkle', open: '\u2726 ', close: ' \u2726' },
    { key: 'fleuron', label: 'Fleuron', open: '\u2766 ', close: ' \u2766' },
    { key: 'quotes', label: 'Quotes', open: '\u201C', close: '\u201D' },
    { key: 'constellation', label: 'Stars', open: '\u22C6\uFF61\u00B0\u2729 ', close: ' \u2729\u00B0\uFF61\u22C6' }
  ];

  var els = {
    input: document.getElementById('font-text'),
    grid: document.getElementById('style-grid'),
    ornamentRow: document.getElementById('ornament-row'),
    caseSelect: document.getElementById('font-case'),
    spacing: document.getElementById('font-spacing'),
    count: document.getElementById('char-count'),
    status: document.getElementById('status'),
    canvas: document.getElementById('width-chart'),
    chartNote: document.getElementById('chart-note')
  };

  var state = { ornament: 'none' };

  function fromCodePoint(code) {
    return String.fromCodePoint(code);
  }

  function buildMap(style) {
    if (style.map) return style.map;
    var map = {};
    var i, code;

    if (style.custom) {
      for (code in style.custom) {
        if (Object.prototype.hasOwnProperty.call(style.custom, code)) {
          map[String.fromCharCode(Number(code))] = fromCodePoint(style.custom[code]);
        }
      }
      style.map = map;
      return map;
    }

    var exc = style.exceptions ? EXCEPTIONS[style.exceptions] : null;

    for (i = 0; i < 26; i++) {
      code = 65 + i;
      map[String.fromCharCode(code)] = fromCodePoint(
        exc && exc.upper[code] ? exc.upper[code] : style.upper + i
      );
      code = 97 + i;
      map[String.fromCharCode(code)] = fromCodePoint(
        exc && exc.lower[code] ? exc.lower[code] : style.lower + i
      );
    }

    if (style.digits) {
      for (i = 0; i < 10; i++) {
        map[String.fromCharCode(48 + i)] = fromCodePoint(style.digits + i);
      }
    }

    style.map = map;
    return map;
  }

  function applyCase(text, mode) {
    if (mode === 'upper') return text.toUpperCase();
    if (mode === 'lower') return text.toLowerCase();
    if (mode === 'title') {
      return text.replace(/\S+/g, function (word) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      });
    }
    return text;
  }

  function ornamentFor(key) {
    for (var i = 0; i < ORNAMENTS.length; i++) {
      if (ORNAMENTS[i].key === key) return ORNAMENTS[i];
    }
    return ORNAMENTS[0];
  }

  function convert(text, style, ornament) {
    var map = buildMap(style);
    var out = '';
    for (var i = 0; i < text.length; i++) {
      var ch = text.charAt(i);
      out += Object.prototype.hasOwnProperty.call(map, ch) ? map[ch] : ch;
    }
    return ornament.open + out + ornament.close;
  }

  function readText() {
    var raw = els.input.value || '';
    if (raw.length > MAX_LEN) {
      raw = raw.slice(0, MAX_LEN);
      els.input.value = raw;
    }
    return applyCase(raw, els.caseSelect.value).replace(/\s+/g, ' ').trim();
  }

  function say(message) {
    els.status.textContent = '';
    window.setTimeout(function () { els.status.textContent = message; }, 30);
  }

  function renderCards(text, ornament) {
    els.grid.innerHTML = '';
    var spacingClass = els.spacing.value === 'wide' ? ' style-card--wide'
      : els.spacing.value === 'wider' ? ' style-card--wider' : '';

    STYLES.forEach(function (style) {
      var card = document.createElement('div');
      card.className = 'style-card' + spacingClass;

      var name = document.createElement('p');
      name.className = 'style-card__name';
      name.textContent = style.label;

      var out = document.createElement('div');
      out.className = 'style-card__text';
      if (text) {
        out.textContent = convert(text, style, ornament);
      } else {
        out.textContent = 'Type something to preview';
        out.classList.add('is-empty');
      }

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.disabled = !text;
      btn.setAttribute('aria-label', 'Copy ' + style.label + ' text');
      btn.addEventListener('click', function () {
        copyText(convert(text, style, ornament), btn, style.label);
      });

      card.appendChild(name);
      card.appendChild(out);
      card.appendChild(btn);
      els.grid.appendChild(card);
    });
  }

  function copyText(value, btn, label) {
    var done = function () {
      btn.textContent = 'Copied';
      btn.setAttribute('data-copied', 'true');
      say(label + ' text copied to clipboard.');
      window.setTimeout(function () {
        btn.textContent = 'Copy';
        btn.removeAttribute('data-copied');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(function () {
        fallbackCopy(value, done, btn, label);
      });
    } else {
      fallbackCopy(value, done, btn, label);
    }
  }

  function fallbackCopy(value, done, btn, label) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    if (ok) {
      done();
    } else {
      btn.textContent = 'Press Ctrl+C';
      say('Copy was blocked. Select the ' + label + ' text and copy it manually.');
      window.setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
    }
  }

  function drawChart(text, ornament) {
    var canvas = els.canvas;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 640;
    var cssHeight = 300;

    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 118;
    var padRight = 16;
    var padTop = 14;
    var padBottom = 12;
    var plotWidth = Math.max(40, cssWidth - padLeft - padRight);

    ctx.font = '18px "Cormorant Garamond", Georgia, serif';
    ctx.textBaseline = 'middle';

    if (!text) {
      ctx.fillStyle = '#6d6380';
      ctx.font = '14px "Jost", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Type some text to compare style widths', cssWidth / 2, cssHeight / 2);
      els.chartNote.textContent = '';
      return;
    }

    var rows = STYLES.map(function (style) {
      return {
        label: style.label,
        width: ctx.measureText(convert(text, style, ornament)).width
      };
    });

    var max = Math.max.apply(null, rows.map(function (r) { return r.width; }));
    max = Math.max(max, 1);
    var rowHeight = (cssHeight - padTop - padBottom) / rows.length;
    var barHeight = Math.max(10, Math.min(20, rowHeight - 8));

    rows.forEach(function (row, index) {
      var y = padTop + index * rowHeight + rowHeight / 2;
      var barWidth = Math.max(2, (row.width / max) * plotWidth);

      ctx.textAlign = 'right';
      ctx.fillStyle = '#40036b';
      ctx.font = '12px "Jost", Arial, sans-serif';
      ctx.fillText(row.label, padLeft - 10, y);

      var grad = ctx.createLinearGradient(padLeft, 0, padLeft + barWidth, 0);
      grad.addColorStop(0, '#a765d6');
      grad.addColorStop(1, '#60089c');
      ctx.fillStyle = grad;
      ctx.fillRect(padLeft, y - barHeight / 2, barWidth, barHeight);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#40036b';
      ctx.font = '11px "Jost", Arial, sans-serif';
      ctx.fillText(Math.round(row.width) + 'px', padLeft + barWidth + 6, y);
    });

    var narrowest = rows.reduce(function (a, b) { return b.width < a.width ? b : a; });
    var widest = rows.reduce(function (a, b) { return b.width > a.width ? b : a; });
    els.chartNote.textContent = 'Most compact: ' + narrowest.label + ' (' +
      Math.round(narrowest.width) + 'px). Widest: ' + widest.label + ' (' +
      Math.round(widest.width) + 'px).';
  }

  function buildOrnaments() {
    ORNAMENTS.forEach(function (orn) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'ornament';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', orn.key === state.ornament ? 'true' : 'false');
      btn.textContent = orn.key === 'none' ? 'None' : orn.open.trim() + ' ' + orn.label;
      btn.addEventListener('click', function () {
        state.ornament = orn.key;
        Array.prototype.forEach.call(els.ornamentRow.children, function (child) {
          child.setAttribute('aria-checked', child === btn ? 'true' : 'false');
        });
        update();
      });
      els.ornamentRow.appendChild(btn);
    });
  }

  function update() {
    var text = readText();
    var ornament = ornamentFor(state.ornament);
    els.count.textContent = text.length + (text.length === 1 ? ' character' : ' characters');
    renderCards(text, ornament);
    drawChart(text, ornament);
  }

  var debounceId;
  function scheduleUpdate() {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(update, 120);
  }

  els.input.addEventListener('input', scheduleUpdate);
  els.caseSelect.addEventListener('change', update);
  els.spacing.addEventListener('change', update);
  els.input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      update();
    }
  });

  window.addEventListener('resize', function () {
    window.clearTimeout(debounceId);
    debounceId = window.setTimeout(function () {
      drawChart(readText(), ornamentFor(state.ornament));
    }, 150);
  });

  buildOrnaments();
  update();
})();
