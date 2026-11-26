(function () {
  'use strict';

  var MAX_CHARS = 80;
  var THIN_SPACE = '\u2009';
  var LETTERLIKE = { C: '\u212D', H: '\u210C', I: '\u2111', R: '\u211C', Z: '\u2128' };

  var input = document.getElementById('gothic-input');
  var spacing = document.getElementById('gothic-space');
  var clearBtn = document.getElementById('gothic-clear');
  var countEl = document.getElementById('gothic-count');
  var statusEl = document.getElementById('copy-status');
  var caption = document.getElementById('chart-caption');
  var scaleInput = document.getElementById('chart-scale');
  var canvas = document.getElementById('coverage-chart');

  var outputs = {
    fraktur: document.getElementById('out-fraktur'),
    bold: document.getElementById('out-bold'),
    caps: document.getElementById('out-caps'),
    maguntia: document.getElementById('out-maguntia'),
    pirata: document.getElementById('out-pirata')
  };

  var STYLES = [
    { key: 'fraktur', label: 'Fraktur' },
    { key: 'bold', label: 'Bold fraktur' },
    { key: 'caps', label: 'Gothic caps' },
    { key: 'maguntia', label: 'Unifraktur' },
    { key: 'pirata', label: 'Pirata One' }
  ];

  function fromCode(code) {
    if (code < 0 || code > 0x10FFFF) { return null; }
    if (code >= 0xD800 && code <= 0xDFFF) { return null; }
    return String.fromCodePoint(code);
  }

  function mapFrakturUpper(ch) {
    if (LETTERLIKE[ch]) { return LETTERLIKE[ch]; }
    return fromCode(0x1D504 + (ch.charCodeAt(0) - 65));
  }

  function mapFrakturLower(ch) {
    return fromCode(0x1D51E + (ch.charCodeAt(0) - 97));
  }

  function mapBoldUpper(ch) {
    return fromCode(0x1D56C + (ch.charCodeAt(0) - 65));
  }

  function mapBoldLower(ch) {
    return fromCode(0x1D586 + (ch.charCodeAt(0) - 97));
  }

  function mapBoldDigit(ch) {
    return fromCode(0x1D7CE + (ch.charCodeAt(0) - 48));
  }

  function mapSansDigit(ch) {
    return fromCode(0x1D7E2 + (ch.charCodeAt(0) - 48));
  }

  /* Returns the converted glyph, or the original character when the style has no form for it. */
  function convertChar(ch, style) {
    var code = ch.charCodeAt(0);
    var isUpper = code >= 65 && code <= 90;
    var isLower = code >= 97 && code <= 122;
    var isDigit = code >= 48 && code <= 57;

    if (style === 'fraktur') {
      if (isUpper) { return mapFrakturUpper(ch); }
      if (isLower) { return mapFrakturLower(ch); }
      if (isDigit) { return mapSansDigit(ch); }
      return ch;
    }
    if (style === 'bold') {
      if (isUpper) { return mapBoldUpper(ch); }
      if (isLower) { return mapBoldLower(ch); }
      if (isDigit) { return mapBoldDigit(ch); }
      return ch;
    }
    if (style === 'caps') {
      if (isUpper) { return mapFrakturUpper(ch); }
      if (isLower) { return mapFrakturUpper(ch.toUpperCase()); }
      if (isDigit) { return mapBoldDigit(ch); }
      return ch;
    }
    return ch;
  }

  function convert(text, style) {
    var out = '';
    for (var i = 0; i < text.length; i += 1) {
      var ch = text.charAt(i);
      out += convertChar(ch, style);
    }
    return out;
  }

  function spaced(text, mode) {
    if (mode !== 'wide' || !text) { return text; }
    var out = '';
    for (var i = 0; i < text.length; i += 1) {
      var ch = text.charAt(i);
      if (ch === ' ' || ch === '\n') {
        out += ch;
        continue;
      }
      out += ch + (i === text.length - 1 ? '' : THIN_SPACE);
    }
    return out.replace(new RegExp(THIN_SPACE + '+$'), '');
  }

  function isBasicLatinLetterOrDigit(ch) {
    var code = ch.charCodeAt(0);
    return (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
  }

  function coverage(text, style) {
    var total = 0;
    var covered = 0;
    for (var i = 0; i < text.length; i += 1) {
      var ch = text.charAt(i);
      if (/\s/.test(ch)) { continue; }
      total += 1;
      if (style === 'maguntia' || style === 'pirata') {
        if (isBasicLatinLetterOrDigit(ch)) { covered += 1; }
      } else if (convertChar(ch, style) !== ch) {
        covered += 1;
      }
    }
    return { total: total, covered: covered, pct: total ? Math.round((covered / total) * 100) : 0 };
  }

  function setPreview(el, value, emptyLabel) {
    if (!value) {
      el.textContent = emptyLabel;
      el.classList.add('is-empty');
      return;
    }
    el.textContent = value;
    el.classList.remove('is-empty');
  }

  function renderChart(data) {
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    var ratio = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 520;
    var cssHeight = 190;
    canvas.width = Math.round(cssWidth * ratio);
    canvas.height = Math.round(cssHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 92;
    var padRight = 44;
    var top = 12;
    var rowH = (cssHeight - top - 8) / data.length;
    var barH = Math.min(16, rowH - 10);
    var trackW = Math.max(60, cssWidth - padLeft - padRight);

    ctx.font = '12px Inter, system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    [0, 50, 100].forEach(function (tick) {
      var x = padLeft + (trackW * tick) / 100;
      ctx.strokeStyle = tick === 0 ? '#d8cbe4' : '#efe7f6';
      ctx.beginPath();
      ctx.moveTo(x, top - 4);
      ctx.lineTo(x, cssHeight - 6);
      ctx.stroke();
      ctx.fillStyle = '#8b8199';
      ctx.textAlign = 'center';
      ctx.fillText(tick + '%', x, cssHeight - 2);
    });

    data.forEach(function (row, index) {
      var y = top + index * rowH + rowH / 2 - 6;
      ctx.fillStyle = '#4b4055';
      ctx.textAlign = 'right';
      ctx.fillText(row.label, padLeft - 10, y);

      ctx.fillStyle = '#f1e9f8';
      roundRect(ctx, padLeft, y - barH / 2, trackW, barH, barH / 2);
      ctx.fill();

      var width = Math.max(row.pct > 0 ? 6 : 0, (trackW * row.pct) / 100);
      if (width > 0) {
        var grad = ctx.createLinearGradient(padLeft, 0, padLeft + width, 0);
        grad.addColorStop(0, '#7a1cbb');
        grad.addColorStop(1, '#a864d6');
        ctx.fillStyle = grad;
        roundRect(ctx, padLeft, y - barH / 2, width, barH, barH / 2);
        ctx.fill();
      }

      ctx.fillStyle = '#470572';
      ctx.textAlign = 'left';
      ctx.fillText(row.pct + '%', padLeft + trackW + 8, y);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.arcTo(x + w, y, x + w, y + radius, radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
    ctx.lineTo(x + radius, y + h);
    ctx.arcTo(x, y + h, x, y + h - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  }

  function update() {
    var raw = input.value;
    if (raw.length > MAX_CHARS) {
      raw = raw.slice(0, MAX_CHARS);
      input.value = raw;
    }
    var mode = spacing.value;

    setPreview(outputs.fraktur, spaced(convert(raw, 'fraktur'), mode), 'Your fraktur text appears here');
    setPreview(outputs.bold, spaced(convert(raw, 'bold'), mode), 'Your bold fraktur text appears here');
    setPreview(outputs.caps, spaced(convert(raw, 'caps'), mode), 'Your gothic capitals appear here');
    setPreview(outputs.maguntia, raw, 'Type something to preview the typeface');
    setPreview(outputs.pirata, raw, 'Type something to preview the typeface');

    var trimmed = raw.trim();
    countEl.textContent = trimmed.length
      ? trimmed.length + ' character' + (trimmed.length === 1 ? '' : 's')
      : 'Nothing typed yet';

    var rows = STYLES.map(function (style) {
      var cov = coverage(raw, style.key);
      return { label: style.label, pct: cov.pct, covered: cov.covered, total: cov.total };
    });

    renderChart(rows);

    var first = rows[0];
    if (!trimmed) {
      caption.textContent = 'Type a word to see how much of it each style can convert.';
    } else if (first.total === 0) {
      caption.textContent = 'Only spaces so far — add letters to see coverage.';
    } else {
      caption.textContent = 'Fraktur converted ' + first.covered + ' of ' + first.total +
        ' visible characters. Symbols without a blackletter form pass through unchanged.';
    }
  }

  function applyScale() {
    var size = parseInt(scaleInput.value, 10);
    if (isNaN(size)) { return; }
    [outputs.fraktur, outputs.bold, outputs.caps].forEach(function (el) {
      el.style.fontSize = size + 'px';
    });
    outputs.maguntia.style.fontSize = Math.round(size * 1.32) + 'px';
    outputs.pirata.style.fontSize = Math.round(size * 1.16) + 'px';
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (err) {
      ok = false;
    }
    document.body.removeChild(area);
    return ok;
  }

  function copyTarget(button) {
    var target = document.getElementById(button.getAttribute('data-copy'));
    if (!target) { return; }
    var text = target.textContent || '';
    if (!text || target.classList.contains('is-empty')) {
      statusEl.textContent = 'Nothing to copy yet — type some words first.';
      return;
    }
    var done = function (ok) {
      if (ok) {
        button.classList.add('is-copied');
        var original = button.textContent;
        button.textContent = 'Copied';
        statusEl.textContent = 'Copied ' + text + ' to the clipboard.';
        window.setTimeout(function () {
          button.classList.remove('is-copied');
          button.textContent = original;
        }, 1600);
      } else {
        statusEl.textContent = 'Copy failed. Select the text and press Ctrl or Cmd + C instead.';
      }
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        done(true);
      }).catch(function () {
        done(fallbackCopy(text));
      });
    } else {
      done(fallbackCopy(text));
    }
  }

  document.querySelectorAll('.copy-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      copyTarget(button);
    });
  });

  input.addEventListener('input', update);
  spacing.addEventListener('change', update);
  scaleInput.addEventListener('input', applyScale);
  clearBtn.addEventListener('click', function () {
    input.value = '';
    input.focus();
    update();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(update, 140);
  });

  applyScale();
  update();
}());
