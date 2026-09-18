(function () {
  'use strict';

  var NAMED = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
    copy: '\u00a9', reg: '\u00ae', trade: '\u2122', hellip: '\u2026',
    mdash: '\u2014', ndash: '\u2013', lsquo: '\u2018', rsquo: '\u2019',
    ldquo: '\u201c', rdquo: '\u201d', deg: '\u00b0', middot: '\u00b7',
    bull: '\u2022', euro: '\u20ac', pound: '\u00a3', yen: '\u00a5',
    sect: '\u00a7', para: '\u00b6', dagger: '\u2020', laquo: '\u00ab',
    raquo: '\u00bb', times: '\u00d7', divide: '\u00f7', plusmn: '\u00b1',
    frac12: '\u00bd', frac14: '\u00bc', frac34: '\u00be', sup2: '\u00b2',
    sup3: '\u00b3', micro: '\u00b5', cent: '\u00a2', curren: '\u00a4',
    larr: '\u2190', rarr: '\u2192', harr: '\u2194', infin: '\u221e',
    ne: '\u2260', le: '\u2264', ge: '\u2265', star: '\u2605'
  };

  var el = {
    modeEncode: document.getElementById('modeEncode'),
    modeDecode: document.getElementById('modeDecode'),
    input: document.getElementById('inputText'),
    output: document.getElementById('outputText'),
    error: document.getElementById('errorAlert'),
    copy: document.getElementById('copyBtn'),
    swap: document.getElementById('swapBtn'),
    clear: document.getElementById('clearBtn'),
    encodeQuotes: document.getElementById('encodeQuotes'),
    encodeNonAscii: document.getElementById('encodeNonAscii'),
    statChars: document.getElementById('statChars'),
    statEntities: document.getElementById('statEntities'),
    statSaved: document.getElementById('statSaved'),
    canvas: document.getElementById('charChart'),
    caption: document.getElementById('chartCaption')
  };

  if (!el.input || !el.output) { return; }

  var lastStats = { input: 0, escaped: 0, output: 0, mode: 'encode' };

  function escapeHtml(str, escapeQuotes, escapeNonAscii) {
    var escapedCount = 0;
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str.charAt(i);
      var code = str.charCodeAt(i);
      var replacement = null;

      if (ch === '&') { replacement = '&amp;'; }
      else if (ch === '<') { replacement = '&lt;'; }
      else if (ch === '>') { replacement = '&gt;'; }
      else if (ch === '"') { replacement = '&quot;'; }
      else if (ch === "'" && escapeQuotes) { replacement = '&#39;'; }
      else if (escapeNonAscii && code > 127) { replacement = '&#' + code + ';'; }

      if (replacement !== null) {
        out += replacement;
        escapedCount++;
      } else {
        out += ch;
      }
    }
    return { text: out, escaped: escapedCount };
  }

  function decodeEntities(str) {
    var escapedCount = 0;
    var out = str.replace(/&(#[xX][0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g, function (match, body) {
      var value = null;

      if (body.charAt(0) === '#') {
        var digits = body.slice(1);
        var num = (digits.charAt(0) === 'x' || digits.charAt(0) === 'X')
          ? parseInt(digits.slice(1), 16)
          : parseInt(digits, 10);
        if (!isNaN(num) && num >= 0 && num <= 0x10ffff) {
          try {
            value = String.fromCodePoint(num);
          } catch (e) {
            value = null;
          }
        }
      } else if (Object.prototype.hasOwnProperty.call(NAMED, body)) {
        value = NAMED[body];
      }

      if (value === null) { return match; }
      escapedCount++;
      return value;
    });

    return { text: out, escaped: escapedCount };
  }

  function update() {
    var value = el.input.value;
    var isEncode = el.modeEncode.checked;

    if (value === '') {
      el.output.value = '';
      lastStats = { input: 0, escaped: 0, output: 0, mode: isEncode ? 'encode' : 'decode' };
      renderStats();
      hideError();
      return;
    }

    if (!isEncode && /&(#?[a-zA-Z0-9]+);/.test(value) === false) {
      showError('No HTML entities found in the input. Switch to Encode mode, or check that the entities end with a semicolon.');
    } else {
      hideError();
    }

    var result = isEncode
      ? escapeHtml(value, el.encodeQuotes.checked, el.encodeNonAscii.checked)
      : decodeEntities(value);

    el.output.value = result.text;
    lastStats = {
      input: value.length,
      escaped: result.escaped,
      output: result.text.length,
      mode: isEncode ? 'encode' : 'decode'
    };
    renderStats();
  }

  function renderStats() {
    el.statChars.textContent = lastStats.input.toLocaleString();
    el.statEntities.textContent = lastStats.escaped.toLocaleString();
    el.statSaved.textContent = lastStats.output.toLocaleString();
    el.caption.textContent = lastStats.mode === 'encode'
      ? 'Bar chart: input length vs. characters escaped vs. encoded output length.'
      : 'Bar chart: encoded input length vs. entities decoded vs. decoded output length.';
    drawChart();
  }

  function showError(message) {
    el.error.textContent = message;
    el.error.classList.remove('d-none');
  }

  function hideError() {
    el.error.classList.add('d-none');
  }

  function drawChart() {
    var canvas = el.canvas;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext('2d');
    if (!ctx) { return; }
    var w = canvas.width;
    var h = canvas.height;
    var padding = { top: 14, right: 12, bottom: 26, left: 12 };

    ctx.clearRect(0, 0, w, h);

    var labels = ['Input', 'Converted chars', 'Output'];
    var values = [lastStats.input, lastStats.escaped, lastStats.output];
    var colors = ['#c9a6e6', '#60089c', '#7b21bd'];
    var max = Math.max.apply(null, values.concat([1]));

    var plotW = w - padding.left - padding.right;
    var plotH = h - padding.top - padding.bottom;
    var slot = plotW / values.length;
    var barW = Math.min(slot * 0.5, 62);

    ctx.strokeStyle = '#ece3f7';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotH + .5);
    ctx.lineTo(w - padding.right, padding.top + plotH + .5);
    ctx.stroke();

    ctx.font = '11px -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';

    for (var i = 0; i < values.length; i++) {
      var barH = values[i] === 0 ? 0 : Math.max(3, (values[i] / max) * plotH);
      var x = padding.left + slot * i + (slot - barW) / 2;
      var y = padding.top + plotH - barH;

      ctx.fillStyle = colors[i];
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#4b4b4b';
      ctx.fillText(String(values[i]), x + barW / 2, y - 4 > 10 ? y - 4 : padding.top + 9);
      ctx.fillStyle = '#6c757d';
      ctx.fillText(labels[i], x + barW / 2, h - 8);
    }
  }

  function copyResult() {
    var text = el.output.value;
    if (!text) { return; }
    var done = function () {
      var original = el.copy.textContent;
      el.copy.textContent = 'Copied!';
      setTimeout(function () { el.copy.textContent = original; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    el.output.removeAttribute('readonly');
    el.output.select();
    try { document.execCommand('copy'); done(); } catch (e) { showError('Copy failed — select the result and copy it manually.'); }
    el.output.setAttribute('readonly', 'readonly');
    el.output.setSelectionRange(0, 0);
  }

  el.input.addEventListener('input', update);
  el.modeEncode.addEventListener('change', update);
  el.modeDecode.addEventListener('change', update);
  el.encodeQuotes.addEventListener('change', update);
  el.encodeNonAscii.addEventListener('change', update);

  el.copy.addEventListener('click', copyResult);
  el.clear.addEventListener('click', function () {
    el.input.value = '';
    el.input.focus();
    update();
  });
  el.swap.addEventListener('click', function () {
    el.input.value = el.output.value;
    if (lastStats.mode === 'encode') {
      el.modeDecode.checked = true;
    } else {
      el.modeEncode.checked = true;
    }
    update();
  });

  update();
})();
