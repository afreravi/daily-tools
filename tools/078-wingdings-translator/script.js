(function () {
  'use strict';

  var LETTERS = {
    a: '\u2600', b: '\u2601', c: '\u2602', d: '\u2603', e: '\u2604', f: '\u2605',
    g: '\u2606', h: '\u260E', i: '\u260F', j: '\u2610', k: '\u2611', l: '\u2612',
    m: '\u2615', n: '\u2618', o: '\u2619', p: '\u261A', q: '\u261B', r: '\u261C',
    s: '\u261D', t: '\u261E', u: '\u261F', v: '\u2620', w: '\u2622', x: '\u2623',
    y: '\u262E', z: '\u262F'
  };

  var DIGITS = {
    '0': '\u24FF', '1': '\u2776', '2': '\u2777', '3': '\u2778', '4': '\u2779',
    '5': '\u277A', '6': '\u277B', '7': '\u277C', '8': '\u277D', '9': '\u277E'
  };

  var PUNCT_CHARS = '.,!?\'"\-:;()&@#$%/*+<=>';
  var PUNCT_GLYPHS = [
    '\u2701', '\u2702', '\u2703', '\u2704', '\u2706', '\u2707', '\u2708', '\u2709',
    '\u270B', '\u270C', '\u270D', '\u270E', '\u270F', '\u2710', '\u2711', '\u2712',
    '\u2713', '\u2714', '\u2715', '\u2716', '\u2717', '\u2718'
  ];

  var PUNCT = {};
  PUNCT_CHARS.split('').forEach(function (ch, i) {
    PUNCT[ch] = PUNCT_GLYPHS[i];
  });

  var REVERSE = {};
  [LETTERS, DIGITS, PUNCT].forEach(function (table) {
    Object.keys(table).forEach(function (key) {
      REVERSE[table[key]] = key;
    });
  });

  var MAX_LEN = 500;
  var SAMPLES = ['Meet me at eight', 'Pizza on Friday?', 'Secret code 42'];

  var sourceText = document.getElementById('sourceText');
  var encodedText = document.getElementById('encodedText');
  var charCount = document.getElementById('charCount');
  var resultOut = document.getElementById('resultOut');
  var resultNote = document.getElementById('resultNote');
  var resultWarn = document.getElementById('resultWarn');
  var optDigits = document.getElementById('optDigits');
  var optPunct = document.getElementById('optPunct');
  var keyTable = document.getElementById('keyTable');
  var fontPreview = document.getElementById('fontPreview');
  var fontStatus = document.getElementById('fontStatus');
  var chart = document.getElementById('coverageChart');
  var chartCaption = document.getElementById('chartCaption');

  var lastCopyText = '';
  var lastMode = 'encode';

  function isSpace(ch) {
    return /\s/.test(ch);
  }

  function activeTable() {
    var table = {};
    Object.keys(LETTERS).forEach(function (k) { table[k] = LETTERS[k]; });
    if (optDigits.checked) {
      Object.keys(DIGITS).forEach(function (k) { table[k] = DIGITS[k]; });
    }
    if (optPunct.checked) {
      Object.keys(PUNCT).forEach(function (k) { table[k] = PUNCT[k]; });
    }
    return table;
  }

  function encode(text) {
    var table = activeTable();
    var out = '';
    var mapped = 0;
    var missed = [];

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (isSpace(ch)) {
        out += ch;
        continue;
      }
      var key = ch.toLowerCase();
      if (table[key]) {
        out += table[key];
        mapped++;
      } else {
        out += ch;
        missed.push(ch);
      }
    }

    return { out: out, mapped: mapped, missed: missed };
  }

  function decode(text) {
    var out = '';
    var mapped = 0;
    var missed = [];

    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (isSpace(ch)) {
        out += ch;
        continue;
      }
      if (REVERSE[ch]) {
        out += REVERSE[ch];
        mapped++;
      } else {
        out += ch;
        missed.push(ch);
      }
    }

    return { out: out, mapped: mapped, missed: missed };
  }

  function uniqueChars(list) {
    var seen = {};
    var out = [];
    list.forEach(function (ch) {
      if (!seen[ch]) {
        seen[ch] = true;
        out.push(ch);
      }
    });
    return out;
  }

  function render(mode, res, inputLength) {
    lastMode = mode;
    var trimmed = res.out.trim();

    resultOut.classList.remove('is-plain', 'is-empty');
    if (!trimmed) {
      resultOut.classList.add('is-empty');
      resultOut.textContent = 'Your translation will appear here.';
      lastCopyText = '';
    } else {
      if (mode === 'decode') {
        resultOut.classList.add('is-plain');
      }
      resultOut.textContent = res.out;
      lastCopyText = res.out;
    }

    if (!inputLength) {
      resultNote.textContent = 'Waiting for input';
    } else if (res.mapped === 0) {
      resultNote.textContent = 'No characters matched the key';
    } else {
      resultNote.textContent = res.mapped + ' of ' + (res.mapped + res.missed.length) +
        ' characters translated';
    }

    if (res.missed.length) {
      var sample = uniqueChars(res.missed).slice(0, 12).join(' ');
      resultWarn.classList.remove('d-none');
      resultWarn.textContent = mode === 'encode'
        ? 'Left as-is (not in the key): ' + sample
        : 'Could not read these symbols: ' + sample;
    } else {
      resultWarn.classList.add('d-none');
      resultWarn.textContent = '';
    }

    drawChart(res.mapped, res.missed.length);
  }

  function drawChart(mapped, missed) {
    var ctx = chart.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssW = chart.clientWidth || 320;
    var cssH = 200;

    chart.width = Math.round(cssW * dpr);
    chart.height = Math.round(cssH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var total = mapped + missed;
    if (!total) {
      chartCaption.textContent = 'Nothing to chart yet.';
      ctx.strokeStyle = '#e6dcf2';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(cssW / 2, 92, 60, 0, Math.PI * 2);
      ctx.stroke();
      return;
    }

    var cx = cssW / 2;
    var cy = 88;
    var r = 60;
    var start = -Math.PI / 2;

    var slices = [
      { value: mapped, color: '#60089c' },
      { value: missed, color: '#c9b6de' }
    ];

    slices.forEach(function (slice) {
      if (!slice.value) { return; }
      var angle = (slice.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, start + angle);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      start += angle;
    });

    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.fillStyle = '#241a2e';
    ctx.font = '600 18px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(Math.round((mapped / total) * 100) + '%', cx, cy + 2);

    ctx.font = '11px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillStyle = '#6b5f77';
    ctx.fillText('mapped', cx, cy + 18);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#60089c';
    ctx.fillRect(12, 168, 10, 10);
    ctx.fillStyle = '#352b41';
    ctx.font = '12px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.fillText('Translated: ' + mapped, 28, 178);

    ctx.fillStyle = '#c9b6de';
    ctx.fillRect(12, 186, 10, 10);
    ctx.fillStyle = '#352b41';
    ctx.fillText('Left as-is: ' + missed, 28, 196);

    chartCaption.textContent = 'Percent of characters this key could translate.';
  }

  function updateEncode() {
    var text = sourceText.value.slice(0, MAX_LEN);
    charCount.textContent = text.length + ' / ' + MAX_LEN + ' characters';
    var res = encode(text);
    render('encode', res, text.length);
    fontPreview.textContent = text.trim() || 'Sample text';
  }

  function updateDecode() {
    var text = encodedText.value.slice(0, MAX_LEN);
    var res = decode(text);
    render('decode', res, text.length);
  }

  function buildKeyTable() {
    var order = Object.keys(LETTERS).concat(Object.keys(DIGITS), Object.keys(PUNCT));
    var html = order.map(function (key) {
      var glyph = LETTERS[key] || DIGITS[key] || PUNCT[key];
      var on = LETTERS[key] || (DIGITS[key] && optDigits.checked) || (PUNCT[key] && optPunct.checked);
      var label = key === '"' ? '&quot;' : key;
      return '<div class="key-cell' + (on ? '' : ' is-off') + '">' +
        '<span class="k-char">' + label + '</span>' +
        '<span class="k-glyph">' + glyph + '</span>' +
        '</div>';
    });
    keyTable.innerHTML = html.join('');
  }

  function copyText(text) {
    if (!text) {
      resultNote.textContent = 'Nothing to copy yet';
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        resultNote.textContent = 'Copied to clipboard';
      }, function () {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand('copy');
      resultNote.textContent = 'Copied to clipboard';
    } catch (err) {
      resultNote.textContent = 'Copy failed - select the result and copy manually';
    }
    document.body.removeChild(area);
  }

  function download() {
    if (!lastCopyText) {
      resultNote.textContent = 'Nothing to download yet';
      return;
    }
    var blob = new Blob([lastCopyText], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = lastMode === 'decode' ? 'decoded-text.txt' : 'wingdings-symbols.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  function detectFonts() {
    var probe = 'Wingdings';
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    ctx.font = '32px monospace';
    var base = ctx.measureText('abcdefg').width;
    ctx.font = '32px "' + probe + '", monospace';
    var test = ctx.measureText('abcdefg').width;

    if (Math.abs(base - test) > 0.5) {
      fontStatus.textContent = 'Wingdings detected on this device - the preview above uses the real typeface. ' +
        'The symbol output still works everywhere.';
    } else {
      fontStatus.textContent = 'Wingdings is not installed here, so the preview falls back to a normal font. ' +
        'The symbol output above needs no font and works everywhere.';
    }
  }

  sourceText.addEventListener('input', updateEncode);
  encodedText.addEventListener('input', updateDecode);
  optDigits.addEventListener('change', function () {
    buildKeyTable();
    updateEncode();
  });
  optPunct.addEventListener('change', function () {
    buildKeyTable();
    updateEncode();
  });

  document.getElementById('sampleBtn').addEventListener('click', function () {
    sourceText.value = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    updateEncode();
    sourceText.focus();
  });

  document.getElementById('clearBtn').addEventListener('click', function () {
    sourceText.value = '';
    updateEncode();
    sourceText.focus();
  });

  document.getElementById('copyBtn').addEventListener('click', function () {
    copyText(lastCopyText);
  });

  document.getElementById('downloadBtn').addEventListener('click', download);

  document.getElementById('decodeBtn').addEventListener('click', function () {
    updateDecode();
    if (!encodedText.value.trim()) {
      resultNote.textContent = 'Paste some symbols first';
    }
  });

  document.getElementById('decodeClearBtn').addEventListener('click', function () {
    encodedText.value = '';
    updateDecode();
    encodedText.focus();
  });

  document.getElementById('decodeCopyBtn').addEventListener('click', function () {
    copyText(lastCopyText);
  });

  window.addEventListener('resize', function () {
    var res = lastMode === 'decode'
      ? decode(encodedText.value)
      : encode(sourceText.value);
    drawChart(res.mapped, res.missed.length);
  });

  buildKeyTable();
  detectFonts();
  updateEncode();
})();
