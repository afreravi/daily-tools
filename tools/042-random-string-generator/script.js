/* Random String Generator — vanilla JS, crypto-secure randomness */
(function () {
  'use strict';

  var LETTERS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var LETTERS_LOWER = 'abcdefghijklmnopqrstuvwxyz';
  var DIGITS = '0123456789';
  var SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/';
  var LOOKALIKES = '0Ol1I';

  var MIN_LENGTH = 1;
  var MAX_LENGTH = 512;
  var MIN_COUNT = 1;
  var MAX_COUNT = 200;

  var el = {
    length: document.getElementById('lengthInput'),
    count: document.getElementById('countInput'),
    letterCase: document.getElementById('caseSelect'),
    letters: document.getElementById('chkLetters'),
    digits: document.getElementById('chkDigits'),
    symbols: document.getElementById('chkSymbols'),
    safe: document.getElementById('chkSafe'),
    unique: document.getElementById('chkUnique'),
    prefix: document.getElementById('prefixInput'),
    suffix: document.getElementById('suffixInput'),
    custom: document.getElementById('customInput'),
    charsetError: document.getElementById('charsetError'),
    generate: document.getElementById('generateBtn'),
    copyAll: document.getElementById('copyAllBtn'),
    download: document.getElementById('downloadBtn'),
    strength: document.getElementById('strengthLine'),
    resultsCard: document.getElementById('resultsCard'),
    statCount: document.getElementById('statCount'),
    statTotal: document.getElementById('statTotal'),
    statSpace: document.getElementById('statSpace'),
    statEntropy: document.getElementById('statEntropy'),
    output: document.getElementById('outputBox'),
    copyNote: document.getElementById('copyNote'),
    chart: document.getElementById('mixChart'),
    mixSummary: document.getElementById('mixSummary'),
    year: document.getElementById('year')
  };

  if (el.year) { el.year.textContent = String(new Date().getFullYear()); }

  /* ---------- Random helpers (crypto-backed) ---------- */

  function randomInt(max) {
    // Unbiased draw in [0, max) using rejection sampling over the secure RNG.
    if (max <= 0) { return 0; }
    var range = 4294967296; // 2^32
    var limit = range - (range % max);
    var buf = new Uint32Array(1);
    var value;
    do {
      window.crypto.getRandomValues(buf);
      value = buf[0];
    } while (value >= limit);
    return value % max;
  }

  function secureAvailable() {
    return typeof window.crypto !== 'undefined' && typeof window.crypto.getRandomValues === 'function';
  }

  function randomIntFallback(max) {
    return Math.floor(Math.random() * max);
  }

  function draw(max) {
    return secureAvailable() ? randomInt(max) : randomIntFallback(max);
  }

  /* ---------- Input handling ---------- */

  function cleanText(value) {
    // Strip zero-width and control characters, drop whitespace, collapse duplicates.
    var out = '';
    var text = String(value || '').replace(/[\u200B-\u200D\uFEFF\u0000-\u001F]/g, '');
    for (var i = 0; i < text.length; i += 1) {
      var ch = text.charAt(i);
      if (/\s/.test(ch)) { continue; }
      if (out.indexOf(ch) === -1) { out += ch; }
    }
    return out;
  }

  function readInt(input, min, max) {
    var raw = String(input.value).trim();
    if (raw === '' || !/^\d+$/.test(raw)) { return null; }
    var n = parseInt(raw, 10);
    if (isNaN(n) || n < min || n > max) { return null; }
    return n;
  }

  function markInvalid(input, invalid) {
    input.classList.toggle('is-invalid', invalid);
    input.setAttribute('aria-invalid', invalid ? 'true' : 'false');
  }

  function buildPool(letterCase) {
    var pool = '';
    if (el.letters.checked) {
      if (letterCase === 'upper') { pool += LETTERS_UPPER; }
      else if (letterCase === 'lower') { pool += LETTERS_LOWER; }
      else { pool += LETTERS_UPPER + LETTERS_LOWER; }
    }
    if (el.digits.checked) { pool += DIGITS; }
    if (el.symbols.checked) { pool += SYMBOLS; }
    pool += cleanText(el.custom.value);

    var seen = '';
    var deduped = '';
    for (var i = 0; i < pool.length; i += 1) {
      var ch = pool.charAt(i);
      if (seen.indexOf(ch) === -1) { seen += ch; deduped += ch; }
    }

    if (el.safe.checked) {
      var filtered = '';
      for (var j = 0; j < deduped.length; j += 1) {
        if (LOOKALIKES.indexOf(deduped.charAt(j)) === -1) { filtered += deduped.charAt(j); }
      }
      deduped = filtered;
    }
    return deduped;
  }

  /* ---------- Generation ---------- */

  function generateString(pool, length, unique) {
    var chars = '';
    var guard = 0;
    var maxGuard = length * 500 + 1000;

    while (chars.length < length) {
      guard += 1;
      if (guard > maxGuard) { break; } // safety valve, should not be reached
      var ch = pool.charAt(draw(pool.length));
      if (unique && chars.indexOf(ch) !== -1) { continue; }
      chars += ch;
    }
    return chars;
  }

  function entropyBits(poolSize, length, unique) {
    var bits = 0;
    var i;
    if (unique) {
      for (i = 0; i < length; i += 1) {
        var remaining = poolSize - i;
        if (remaining <= 0) { break; }
        bits += Math.log(remaining) / Math.LN2;
      }
    } else {
      bits = length * (Math.log(poolSize) / Math.LN2);
    }
    return bits;
  }

  function combinationCount(poolSize, length) {
    var total = 1n;
    var base = BigInt(poolSize);
    for (var i = 0; i < length; i += 1) { total *= base; }
    return total;
  }

  function formatBig(value) {
    var s = value.toString();
    if (s.length <= 12) {
      return s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    var exp = s.length - 1;
    var mantissa = s.charAt(0) + '.' + s.slice(1, 4);
    return mantissa + ' \u00d7 10^' + exp;
  }

  function strengthLabel(bits) {
    if (bits < 40) { return { text: 'weak for secrets \u2014 good only for throwaway test data', cls: 'text-danger' }; }
    if (bits < 72) { return { text: 'moderate \u2014 fine for short-lived codes', cls: 'text-warning' }; }
    if (bits < 128) { return { text: 'strong \u2014 suitable for most tokens', cls: 'text-success' }; }
    return { text: 'very strong \u2014 comfortably beyond brute force', cls: 'text-success' };
  }

  /* ---------- Chart ---------- */

  function classify(ch) {
    if (/[A-Za-z]/.test(ch)) { return 'letters'; }
    if (/[0-9]/.test(ch)) { return 'digits'; }
    return 'symbols';
  }

  function drawChart(mix) {
    var canvas = el.chart;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.parentElement.clientWidth || 640;
    var cssHeight = 170;
    canvas.width = Math.floor(cssWidth * dpr);
    canvas.height = Math.floor(cssHeight * dpr);
    canvas.style.width = '100%';
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var series = [
      { label: 'Letters', value: mix.letters, color: '#60089c' },
      { label: 'Digits', value: mix.digits, color: '#9d5ad4' },
      { label: 'Symbols', value: mix.symbols, color: '#e9d9f8' }
    ];
    var max = Math.max(1, series[0].value, series[1].value, series[2].value);
    var padding = { top: 14, right: 12, bottom: 30, left: 12 };
    var plotW = cssWidth - padding.left - padding.right;
    var plotH = cssHeight - padding.top - padding.bottom;
    var slot = plotW / series.length;
    var barW = Math.min(96, slot * 0.6);

    ctx.font = '12px "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';

    series.forEach(function (item, index) {
      var x = padding.left + slot * index + slot / 2;
      var h = Math.round((item.value / max) * plotH);
      var y = padding.top + plotH - h;

      ctx.fillStyle = item.color;
      ctx.fillRect(x - barW / 2, y, barW, h);

      ctx.fillStyle = '#241a2e';
      ctx.fillText(String(item.value), x, y - 4 < 10 ? 10 : y - 4);

      ctx.fillStyle = '#6b6277';
      ctx.fillText(item.label, x, padding.top + plotH + 18);
    });

    ctx.strokeStyle = '#e5dcf0';
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + plotH + 0.5);
    ctx.lineTo(cssWidth - padding.right, padding.top + plotH + 0.5);
    ctx.stroke();
  }

  /* ---------- Status helpers ---------- */

  var copyTimer = null;
  function flashCopy(message) {
    if (!el.copyNote) { return; }
    el.copyNote.textContent = message;
    el.copyNote.classList.remove('d-none');
    if (copyTimer) { window.clearTimeout(copyTimer); }
    copyTimer = window.setTimeout(function () {
      el.copyNote.classList.add('d-none');
    }, 2200);
  }

  function copyText(text, message) {
    var done = function () { flashCopy(message || 'Copied to clipboard.'); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { legacyCopy(text, done); });
    } else {
      legacyCopy(text, done);
    }
  }

  function legacyCopy(text, done) {
    var helper = document.createElement('textarea');
    helper.value = text;
    helper.setAttribute('readonly', 'readonly');
    helper.style.position = 'fixed';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    try { document.execCommand('copy'); done(); } catch (err) { flashCopy('Copy failed \u2014 select the text manually.'); }
    document.body.removeChild(helper);
  }

  /* ---------- Main flow ---------- */

  var state = { strings: [], pool: '', length: 0, bits: 0 };

  function generate() {
    var length = readInt(el.length, MIN_LENGTH, MAX_LENGTH);
    var count = readInt(el.count, MIN_COUNT, MAX_COUNT);

    markInvalid(el.length, length === null);
    markInvalid(el.count, count === null);

    if (length === null || count === null) {
      el.strength.textContent = 'Check the highlighted fields \u2014 length must be 1\u2013512 and count 1\u2013200.';
      return;
    }

    var pool = buildPool(el.letterCase.value);
    var unique = el.unique.checked;

    if (pool.length < 2) {
      el.charsetError.classList.remove('d-none');
      el.strength.textContent = 'No usable characters in the pool.';
      return;
    }
    el.charsetError.classList.add('d-none');

    if (unique && length > pool.length) {
      el.charsetError.textContent = 'A unique-character string of ' + length + ' needs a pool of at least ' + length +
        ' characters, but only ' + pool.length + ' are available. Shorten the string or turn the option off.';
      el.charsetError.classList.remove('d-none');
      return;
    }

    var prefix = cleanText(el.prefix.value);
    var suffix = cleanText(el.suffix.value);
    var strings = [];
    for (var i = 0; i < count; i += 1) {
      strings.push(prefix + generateString(pool, length, unique) + suffix);
    }

    var bits = entropyBits(pool.length, length, unique);
    var combos = combinationCount(pool.length, length);

    state.strings = strings;
    state.pool = pool;
    state.length = length;
    state.bits = bits;

    el.output.value = strings.join('\n');
    el.statCount.textContent = String(count);
    el.statTotal.textContent = strings.reduce(function (sum, s) { return sum + s.length; }, 0) + ' chars';
    el.statSpace.textContent = formatBig(combos);
    el.statEntropy.textContent = bits.toFixed(1) + ' bits';

    var label = strengthLabel(bits);
    el.strength.innerHTML = 'Character pool: <strong>' + pool.length + '</strong> characters \u00b7 ' +
      bits.toFixed(1) + ' bits of entropy per random string \u2014 <span class="' + label.cls + '">' + label.text + '</span>' +
      (secureAvailable() ? '' : ' \u00b7 <span class="text-danger">Secure random source unavailable; using a weaker fallback.</span>');

    var mix = { letters: 0, digits: 0, symbols: 0 };
    var randomPart = strings.join('');
    for (var j = 0; j < randomPart.length; j += 1) { mix[classify(randomPart.charAt(j))] += 1; }
    var totalChars = Math.max(1, randomPart.length);
    el.mixSummary.textContent = 'Across the batch: ' + mix.letters + ' letters (' +
      Math.round((mix.letters / totalChars) * 100) + '%), ' + mix.digits + ' digits (' +
      Math.round((mix.digits / totalChars) * 100) + '%), ' + mix.symbols + ' symbols (' +
      Math.round((mix.symbols / totalChars) * 100) + '%).';
    drawChart(mix);

    el.resultsCard.classList.remove('d-none');
    el.copyAll.disabled = false;
    el.download.disabled = false;
  }

  /* ---------- Events ---------- */

  el.generate.addEventListener('click', generate);

  el.length.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); generate(); }
  });
  el.count.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') { event.preventDefault(); generate(); }
  });

  el.copyAll.addEventListener('click', function () {
    if (!state.strings.length) { return; }
    copyText(state.strings.join('\n'), 'All ' + state.strings.length + ' strings copied.');
  });

  el.download.addEventListener('click', function () {
    if (!state.strings.length) { return; }
    var blob = new Blob([state.strings.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'random-strings-' + state.strings.length + 'x' + state.length + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  el.output.addEventListener('mouseup', function () {
    if (!state.strings.length) { return; }
    var caret = el.output.selectionStart;
    var before = el.output.value.slice(0, caret);
    var lineIndex = before.split('\n').length - 1;
    if (lineIndex < 0 || lineIndex >= state.strings.length) { return; }
    var value = state.strings[lineIndex];
    if (!value) { return; }
    copyText(value, 'Copied: ' + (value.length > 28 ? value.slice(0, 28) + '\u2026' : value));
  });

  window.addEventListener('resize', function () {
    if (state.strings.length) {
      var mix = { letters: 0, digits: 0, symbols: 0 };
      var joined = state.strings.join('');
      for (var i = 0; i < joined.length; i += 1) { mix[classify(joined.charAt(i))] += 1; }
      drawChart(mix);
    }
  });

  if (!secureAvailable()) {
    el.strength.textContent = 'Your browser does not expose a secure random source; a weaker fallback is in use. Do not create secrets with it.';
  }
}());
