(function () {
  'use strict';

  /* ---------- character maps (built from code points so the file stays plain ASCII) ---------- */
  function cps() {
    var out = '';
    for (var i = 0; i < arguments.length; i++) {
      out += String.fromCodePoint(arguments[i]);
    }
    return out;
  }
  function range(start, count) {
    var codes = [];
    for (var i = 0; i < count; i++) { codes.push(start + i); }
    return codes;
  }

  // Mathematical Fraktur (blackletter). Note the five "gap" code points.
  var FRAKTUR_UPPER = cps(0x1D504, 0x1D505, 0x212D, 0x1D507, 0x1D508, 0x1D509, 0x1D50A, 0x210C,
    0x2111, 0x1D50D, 0x1D50E, 0x1D50F, 0x1D510, 0x1D511, 0x1D512, 0x1D513, 0x1D514, 0x211C,
    0x1D516, 0x1D517, 0x1D518, 0x1D519, 0x1D51A, 0x1D51B, 0x1D51C, 0x2128);
  var FRAKTUR_LOWER = cps.apply(null, range(0x1D51E, 26));

  var CIRCLED_UPPER = cps.apply(null, range(0x24B6, 26));
  var CIRCLED_LOWER = cps.apply(null, range(0x24D0, 26));
  var CIRCLED_DIGIT = cps.apply(null, range(0x2460, 9)) + cps(0x24EA);

  var FLIP = {
    'a': '\u0250', 'b': 'q', 'c': '\u0254', 'd': 'p', 'e': '\u01DD', 'f': '\u025F', 'g': '\u0183',
    'h': '\u0265', 'i': '\u1D09', 'j': '\u027E', 'k': '\u029E', 'l': 'l', 'm': '\u026F', 'n': 'u',
    'o': 'o', 'p': 'd', 'q': 'b', 'r': '\u0279', 's': 's', 't': '\u0287', 'u': 'n', 'v': '\u028C',
    'w': '\u028D', 'x': 'x', 'y': '\u028E', 'z': 'z',
    'A': '\u2200', 'B': '\u10412', 'C': '\u0186', 'D': '\u15E1', 'E': '\u018E', 'F': '\u2132',
    'G': '\u2141', 'H': 'H', 'I': 'I', 'J': '\u017F', 'K': '\u029E', 'L': '\u02E5', 'M': 'W',
    'N': 'N', 'O': 'O', 'P': '\u0500', 'Q': '\u038C', 'R': '\u1D1A', 'S': 'S', 'T': '\u22A5',
    'U': '\u2229', 'V': '\u039B', 'W': 'M', 'X': 'X', 'Y': '\u2144', 'Z': 'Z',
    '0': '0', '1': '\u0196', '2': '\u1105', '3': '\u0190', '4': '\u3123', '5': '\u03DB',
    '6': '9', '7': '\u3125', '8': '8', '9': '6',
    '.': '\u02D9', ',': "'", '?': '\u00BF', '!': '\u00A1', "'": ',', '"': '\u201E',
    '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<',
    '&': '\u214B', '_': '\u203E', ';': '\u061B'
  };

  var ABOVE = cps.apply(null, range(0x0300, 16)).concat(cps.apply(null, range(0x0311, 12))); // grave..double-grave, etc.
  var BELOW = cps.apply(null, range(0x0316, 0x0A));
  var THROUGH = cps(0x0334, 0x0335, 0x0336, 0x0337, 0x0338);
  var NOISE = '\u2591\u2592\u2593';
  var THIN = '\u2009';
  var BLOOD = String.fromCodePoint(0x1FA78);

  var SAMPLES = ['come outside', 'we see you', 'the house is awake', 'do not turn around', 'it is already inside'];

  /* ---------- layer definitions ---------- */
  var LAYERS = [
    { key: 'gothic', label: 'Gothic letters', weight: 12, hint: 'Blackletter letterforms.' },
    { key: 'occult', label: 'Occult glyphs', weight: 10, hint: 'Circled sigil letters.' },
    { key: 'mirror', label: 'Mirror flip', weight: 14, hint: 'Upside down, right to left.' },
    { key: 'whisper', label: 'Whisper spacing', weight: 8, hint: 'Thin spaces between letters.' },
    { key: 'static', label: 'Static noise', weight: 9, hint: 'Block characters in the gaps.' },
    { key: 'shadow', label: 'Shadow marks', weight: 13, hint: 'Stacked diacritic marks.' },
    { key: 'blood', label: 'Blood accents', weight: 6, hint: 'Blood drops through the text.' }
  ];
  var DEFAULT_ON = { gothic: true, whisper: true, shadow: true };

  var els = {};
  var active = {};

  function byId(id) { return document.getElementById(id); }

  function init() {
    els.form = byId('creepyForm');
    els.text = byId('textInput');
    els.effectList = byId('effectList');
    els.sampleChips = byId('sampleChips');
    els.intensity = byId('intensity');
    els.intensityValue = byId('intensityValue');
    els.decor = byId('decorToggle');
    els.preview = byId('preview');
    els.copyBtn = byId('copyBtn');
    els.downloadBtn = byId('downloadBtn');
    els.copyMessage = byId('copyMessage');
    els.resetBtn = byId('resetBtn');
    els.formMessage = byId('formMessage');
    els.creepScore = byId('creepScore');
    els.charCount = byId('charCount');
    els.canvas = byId('creepChart');
    els.chartCaption = byId('chartCaption');

    buildEffects();
    buildSamples();

    els.form.addEventListener('submit', onSubmit);
    els.resetBtn.addEventListener('click', onReset);
    els.copyBtn.addEventListener('click', onCopy);
    els.downloadBtn.addEventListener('click', onDownload);
    els.intensity.addEventListener('input', onIntensity);
    els.text.addEventListener('input', debounce(onLiveInput, 180));

    onIntensity();
    drawChart([]);
    render('', 0, []);
  }

  function buildEffects() {
    LAYERS.forEach(function (layer) {
      active[layer.key] = !!DEFAULT_ON[layer.key];
      var wrap = document.createElement('div');
      wrap.className = 'custom-control custom-checkbox';
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'custom-control-input';
      input.id = 'fx-' + layer.key;
      input.checked = active[layer.key];
      input.setAttribute('aria-describedby', 'fxhint-' + layer.key);
      var label = document.createElement('label');
      label.className = 'custom-control-label';
      label.setAttribute('for', input.id);
      label.textContent = layer.label;
      var hint = document.createElement('span');
      hint.id = 'fxhint-' + layer.key;
      hint.className = 'sr-only';
      hint.textContent = layer.hint;
      input.addEventListener('change', function () {
        active[layer.key] = input.checked;
        if (els.text.value.trim()) { run(false); }
        else { drawChart([]); }
      });
      wrap.appendChild(input);
      wrap.appendChild(label);
      wrap.appendChild(hint);
      els.effectList.appendChild(wrap);
    });
  }

  function buildSamples() {
    SAMPLES.forEach(function (phrase) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip';
      b.textContent = phrase;
      b.addEventListener('click', function () {
        els.text.value = phrase;
        run(true);
      });
      els.sampleChips.appendChild(b);
    });
  }

  function onIntensity() {
    els.intensityValue.textContent = els.intensity.value + ' / 5';
    if (els.text.value.trim()) { run(false); }
  }

  function onLiveInput() {
    if (els.text.value.trim()) { run(false); }
  }

  /* ---------- transformations ---------- */
  function applyGothic(s) {
    return s.replace(/[A-Za-z]/g, function (ch) {
      var i = ch.charCodeAt(0);
      if (i >= 65 && i <= 90) { return FRAKTUR_UPPER.charAt(i - 65); }
      return FRAKTUR_LOWER.charAt(i - 97);
    });
  }

  function applyOccult(s) {
    return s.replace(/[A-Za-z0-9]/g, function (ch) {
      var i = ch.charCodeAt(0);
      if (i >= 65 && i <= 90) { return CIRCLED_UPPER.charAt(i - 65); }
      if (i >= 97 && i <= 122) { return CIRCLED_LOWER.charAt(i - 97); }
      return CIRCLED_DIGIT.charAt(ch === '0' ? 9 : parseInt(ch, 10) - 1);
    });
  }

  function applyMirror(s) {
    var out = '';
    var chars = Array.from(s);
    for (var i = chars.length - 1; i >= 0; i--) {
      var ch = chars[i];
      out += Object.prototype.hasOwnProperty.call(FLIP, ch) ? FLIP[ch] : ch;
    }
    return out;
  }

  function applyWhisper(s) {
    return Array.from(s).join(THIN);
  }

  function applyStatic(s, intensity) {
    var chars = Array.from(s);
    var out = '';
    var step = Math.max(1, 6 - intensity); // higher intensity inserts more often
    for (var i = 0; i < chars.length; i++) {
      out += chars[i];
      if (chars[i] !== ' ' && (i + 1) % step === 0) {
        out += NOISE.charAt(Math.floor(Math.random() * NOISE.length));
      }
    }
    return out;
  }

  function applyShadow(s, intensity) {
    var aboveN = Math.max(1, intensity - 1);
    var belowN = Math.max(0, intensity - 2);
    return Array.from(s).map(function (ch) {
      if (ch === ' ' || ch === '\n' || ch === THIN || NOISE.indexOf(ch) > -1) { return ch; }
      var extra = '';
      for (var a = 0; a < aboveN; a++) {
        extra += ABOVE.charAt(Math.floor(Math.random() * ABOVE.length));
      }
      for (var t = 0; t < (intensity > 3 ? 1 : 0); t++) {
        extra += THROUGH.charAt(Math.floor(Math.random() * THROUGH.length));
      }
      for (var b = 0; b < belowN; b++) {
        extra += BELOW.charAt(Math.floor(Math.random() * BELOW.length));
      }
      return ch + extra;
    }).join('');
  }

  function applyBlood(s, intensity) {
    var chars = Array.from(s);
    var out = '';
    var step = Math.max(3, 9 - intensity);
    for (var i = 0; i < chars.length; i++) {
      out += chars[i];
      if (chars[i] === ' ') { out += BLOOD; }
      else if ((i + 1) % step === 0) { out += BLOOD; }
    }
    return out;
  }

  function transform(text, intensity) {
    var out = text;
    // Letterform layers first, then rhythm, then decay, so later layers can decorate earlier output.
    if (active.gothic) { out = applyGothic(out); }
    if (active.occult) { out = applyOccult(out); }
    if (active.mirror) { out = applyMirror(out); }
    if (active.whisper) { out = applyWhisper(out); }
    if (active.static) { out = applyStatic(out, intensity); }
    if (active.shadow) { out = applyShadow(out, intensity); }
    if (active.blood) { out = applyBlood(out, intensity); }
    return out;
  }

  /* ---------- scoring ---------- */
  function contributions(intensity, outLength) {
    var list = [];
    LAYERS.forEach(function (layer) {
      if (!active[layer.key]) { return; }
      var value = layer.weight;
      if (layer.key === 'shadow') { value += intensity * 4; }
      if (layer.key === 'static') { value += intensity * 3; }
      list.push({ key: layer.key, label: layer.label, value: value });
    });
    if (list.length) {
      var lengthBonus = Math.min(8, Math.floor(outLength / 12));
      list[0].value += lengthBonus;
    }
    return list;
  }

  function scoreFrom(list) {
    var total = list.reduce(function (sum, item) { return sum + item.value; }, 0);
    return Math.max(0, Math.min(100, Math.round(total)));
  }

  /* ---------- rendering ---------- */
  function render(output, score, list) {
    if (output) {
      els.preview.textContent = output;
    } else {
      els.preview.innerHTML = '<span class="preview-hint">Your creepy text appears here, letter by letter.</span>';
    }
    els.creepScore.textContent = String(score);
    els.charCount.textContent = String(output ? Array.from(output).length : 0);
    drawChart(list);
  }

  function showMessage(text) {
    if (text) {
      els.formMessage.textContent = text;
      els.formMessage.classList.remove('d-none');
    } else {
      els.formMessage.classList.add('d-none');
      els.formMessage.textContent = '';
    }
  }

  function run(fromChip) {
    var raw = els.text.value;
    if (!raw.trim()) {
      showMessage('Type a few words first \u2014 even a short phrase works better than nothing.');
      render('', 0, []);
      return;
    }
    if (Array.from(raw).length > 140) {
      showMessage('That is a lot of text. Keep it under 140 characters so the marks stay readable.');
      return;
    }
    var anyLayer = LAYERS.some(function (l) { return active[l.key]; });
    if (!anyLayer) {
      showMessage('Switch on at least one effect layer to build creepy text.');
      render('', 0, []);
      return;
    }
    var letters = (raw.match(/[A-Za-z]/g) || []).length;
    var intensity = parseInt(els.intensity.value, 10) || 3;
    var output = transform(raw, intensity);
    if (els.decor.checked) { output = String.fromCodePoint(0x1F47B) + ' ' + output + ' ' + String.fromCodePoint(0x1F480); }

    var list = contributions(intensity, Array.from(output).length);
    render(output, scoreFrom(list), list);

    if (letters === 0) {
      showMessage('Heads up: there are no letters here, so letterform layers (gothic, occult, mirror) have little to work on.');
    } else if (fromChip) {
      showMessage('');
    } else {
      showMessage('');
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    run(false);
  }

  function onReset() {
    els.text.value = '';
    els.intensity.value = '3';
    onIntensity();
    els.decor.checked = true;
    LAYERS.forEach(function (layer) {
      active[layer.key] = !!DEFAULT_ON[layer.key];
      var input = byId('fx-' + layer.key);
      if (input) { input.checked = active[layer.key]; }
    });
    els.copyMessage.textContent = '';
    showMessage('');
    render('', 0, []);
    els.text.focus();
  }

  function currentOutput() {
    return els.preview.querySelector('.preview-hint') ? '' : els.preview.textContent;
  }

  function onCopy() {
    var text = currentOutput();
    if (!text) { els.copyMessage.textContent = 'Nothing to copy yet.'; return; }
    copyText(text, function (ok) {
      els.copyMessage.textContent = ok ? 'Copied to your clipboard.' : 'Copy failed \u2014 select the preview and copy manually.';
    });
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallbackCopy(text)); });
    } else {
      done(fallbackCopy(text));
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function onDownload() {
    var text = currentOutput();
    if (!text) { els.copyMessage.textContent = 'Nothing to download yet.'; return; }
    var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'creepy-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    els.copyMessage.textContent = 'Downloaded creepy-text.txt';
  }

  /* ---------- chart ---------- */
  var CHART_COLORS = {
    gothic: '#60089c', occult: '#7f22c0', mirror: '#9a44d4', whisper: '#b06fe0',
    static: '#c79ae9', shadow: '#43066e', blood: '#9d1230'
  };

  function drawChart(list) {
    var canvas = els.canvas;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext('2d');
    var cssW = canvas.clientWidth || 640;
    var cssH = 260;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    ctx.fillStyle = '#1f1826';
    ctx.font = '600 13px "Segoe UI", Roboto, Arial, sans-serif';

    if (!list.length) {
      ctx.fillStyle = '#6b6275';
      ctx.font = '13px "Segoe UI", Roboto, Arial, sans-serif';
      ctx.fillText('No active layers \u2014 turn on an effect to see its contribution.', 16, cssH / 2);
      els.chartCaption.textContent = 'Turn on an effect to see its contribution.';
      return;
    }

    var labelW = 132;
    var padTop = 18;
    var rowH = Math.min(30, (cssH - padTop - 10) / list.length);
    var barMax = cssW - labelW - 60;
    var max = Math.max.apply(null, list.map(function (i) { return i.value; }));
    var maxKey = list.filter(function (i) { return i.value === max; })[0].key;

    list.forEach(function (item, idx) {
      var y = padTop + idx * rowH + rowH / 2;
      ctx.fillStyle = '#1f1826';
      ctx.font = '600 12.5px "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(item.label, labelW - 10, y + 4);

      var w = Math.max(4, Math.round((item.value / max) * barMax));
      ctx.fillStyle = CHART_COLORS[item.key] || '#60089c';
      roundRect(ctx, labelW, y - rowH / 2 + 4, w, rowH - 10, 4);
      ctx.fill();

      if (item.key === maxKey) {
        ctx.strokeStyle = '#43066e';
        ctx.lineWidth = 2;
        roundRect(ctx, labelW, y - rowH / 2 + 4, w, rowH - 10, 4);
        ctx.stroke();
      }

      ctx.fillStyle = '#3d2f4d';
      ctx.font = '600 12px "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(String(item.value), labelW + w + 8, y + 4);
    });
    ctx.textAlign = 'left';
    els.chartCaption.textContent = 'Strongest layer: ' + (list.filter(function (i) { return i.key === maxKey; })[0].label) + '.';
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

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
