(function () {
  'use strict';

  var CANVAS_W = 1800;
  var CANVAS_H = 840;

  var STYLES = [
    { id: 'bubble', label: 'Bubble', font: 'Bungee', base: 360, tracking: 0.03 },
    { id: 'wildstyle', label: 'Wildstyle', font: 'Bangers', base: 430, tracking: -0.02 },
    { id: 'throwup', label: 'Throw-up', font: 'Permanent Marker', base: 380, tracking: 0.01 },
    { id: 'blockbuster', label: 'Blockbuster', font: 'Rubik Mono One', base: 320, tracking: 0 }
  ];

  var PALETTES = [
    { id: 'ultraviolet', label: 'Ultraviolet', fill: '#8b2fd6', fillDark: '#4d0a7d', outline: '#25043b', accent: '#e2c6fb' },
    { id: 'bubblegum', label: 'Bubblegum', fill: '#ff5fa2', fillDark: '#a81657', outline: '#4a0726', accent: '#ffe0ee' },
    { id: 'toxic', label: 'Toxic lime', fill: '#8ede3a', fillDark: '#3f7f12', outline: '#153006', accent: '#ecffd1' },
    { id: 'blaze', label: 'Sunset blaze', fill: '#ff8a2b', fillDark: '#b23c05', outline: '#40120a', accent: '#ffe2bd' },
    { id: 'ice', label: 'Ice blue', fill: '#4fb7f0', fillDark: '#1363a1', outline: '#052a45', accent: '#d7f0ff' }
  ];

  var DEFAULTS = { text: 'AFRE', style: 'bubble', palette: 'ultraviolet', spray: 40, bg: '#ffffff', drips: true };

  var canvas = document.getElementById('tag-canvas');
  var ctx = canvas.getContext('2d');
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;

  var layer = document.createElement('canvas');
  layer.width = CANVAS_W;
  layer.height = CANVAS_H;
  var lctx = layer.getContext('2d');

  var form = document.getElementById('tag-form');
  var textInput = document.getElementById('tag-text');
  var styleGrid = document.getElementById('style-grid');
  var swatchGrid = document.getElementById('swatch-grid');
  var sprayRange = document.getElementById('spray-range');
  var sprayValue = document.getElementById('spray-value');
  var bgSelect = document.getElementById('bg-select');
  var dripsCheck = document.getElementById('drips-check');
  var errorEl = document.getElementById('form-error');
  var chartEl = document.getElementById('coverage-chart');
  var metaEl = document.getElementById('result-meta');
  var statCoverage = document.getElementById('stat-coverage');
  var statLetters = document.getElementById('stat-letters');
  var statStyle = document.getElementById('stat-style');
  var downloadBtn = document.getElementById('download-btn');
  var randomizeBtn = document.getElementById('randomize-btn');
  var resetBtn = document.getElementById('reset-btn');

  var state = { style: DEFAULTS.style, palette: DEFAULTS.palette };

  function getStyle(id) {
    for (var i = 0; i < STYLES.length; i++) if (STYLES[i].id === id) return STYLES[i];
    return STYLES[0];
  }

  function getPalette(id) {
    for (var i = 0; i < PALETTES.length; i++) if (PALETTES[i].id === id) return PALETTES[i];
    return PALETTES[0];
  }

  function hexToRgba(hex, alpha) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + alpha + ')';
  }

  function makeRandom(seedText) {
    var h = 2166136261;
    for (var i = 0; i < seedText.length; i++) {
      h ^= seedText.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
    return function () {
      h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
      return h / 4294967296;
    };
  }

  function buildLayout(g, text, style) {
    var size = style.base;
    var letters = [];
    var total = 0;
    var maxW = CANVAS_W - 170;
    var maxH = CANVAS_H - 190;
    var guard = 0;

    while (guard < 60) {
      g.font = '400 ' + size + 'px "' + style.font + '", sans-serif';
      letters = [];
      total = 0;
      for (var i = 0; i < text.length; i++) {
        var ch = text.charAt(i);
        var w = g.measureText(ch).width;
        letters.push({ ch: ch, w: w });
        total += w * (1 + style.tracking);
      }
      if (total <= maxW && size * 1.15 <= maxH) break;
      size *= 0.94;
      if (size < 26) break;
      guard++;
    }

    var rand = makeRandom(text + '|' + style.id);
    var x = (CANVAS_W - total) / 2;
    var baseline = CANVAS_H / 2 + size * 0.36;

    for (var j = 0; j < letters.length; j++) {
      var L = letters[j];
      var step = L.w * (1 + style.tracking);
      var jitterY = 0;
      var rot = 0;
      var scaleY = 1;

      if (style.id === 'wildstyle') {
        rot = (rand() - 0.5) * 0.30;
        scaleY = 1.04 + rand() * 0.16;
        jitterY = (rand() - 0.5) * size * 0.10;
      } else if (style.id === 'bubble') {
        rot = (rand() - 0.5) * 0.06;
        scaleY = 0.98 + rand() * 0.08;
        jitterY = (rand() - 0.5) * size * 0.05;
      } else if (style.id === 'throwup') {
        rot = (rand() - 0.5) * 0.14;
        scaleY = 1 + (rand() - 0.5) * 0.08;
        jitterY = (rand() - 0.5) * size * 0.06;
      } else {
        rot = (rand() - 0.5) * 0.015;
        scaleY = 1;
        jitterY = 0;
      }

      L.x = x + step / 2;
      L.y = baseline + jitterY;
      L.rot = rot;
      L.scaleY = scaleY;
      L.size = size;
      L.font = g.font;
      x += step;
    }

    return { letters: letters, size: size, width: total };
  }

  function paintLetter(g, L, style, pal) {
    var s = L.size;

    if (style.id === 'bubble') {
      g.lineWidth = s * 0.22;
      g.strokeStyle = pal.outline;
      g.strokeText(L.ch, 0, 0);
      var grad = g.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
      grad.addColorStop(0, pal.accent);
      grad.addColorStop(0.4, pal.fill);
      grad.addColorStop(1, pal.fillDark);
      g.fillStyle = grad;
      g.fillText(L.ch, 0, 0);
      g.lineWidth = s * 0.03;
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.strokeText(L.ch, 0, 0);
    } else if (style.id === 'wildstyle') {
      g.lineWidth = s * 0.24;
      g.strokeStyle = pal.accent;
      g.strokeText(L.ch, 0, 0);
      g.lineWidth = s * 0.14;
      g.strokeStyle = pal.outline;
      g.strokeText(L.ch, 0, 0);
      g.fillStyle = pal.fill;
      g.fillText(L.ch, 0, 0);
      g.save();
      g.beginPath();
      g.rect(-L.w, s * 0.06, L.w * 2, s);
      g.clip();
      g.fillStyle = pal.fillDark;
      g.fillText(L.ch, 0, 0);
      g.restore();
    } else if (style.id === 'throwup') {
      g.fillStyle = pal.fill;
      g.fillText(L.ch, 0, 0);
      g.save();
      g.beginPath();
      g.rect(-L.w, 0, L.w * 2, s);
      g.clip();
      g.fillStyle = pal.fillDark;
      g.fillText(L.ch, 0, 0);
      g.restore();
      g.lineWidth = s * 0.10;
      g.strokeStyle = pal.outline;
      g.strokeText(L.ch, 0, 0);
    } else {
      var ext = Math.max(8, s * 0.10);
      for (var i = 6; i >= 1; i--) {
        g.fillStyle = pal.outline;
        g.fillText(L.ch, (ext * i) / 6, (ext * i) / 6);
      }
      var block = g.createLinearGradient(0, -s * 0.5, 0, s * 0.5);
      block.addColorStop(0, pal.fill);
      block.addColorStop(1, pal.fillDark);
      g.fillStyle = block;
      g.fillText(L.ch, 0, 0);
      g.lineWidth = s * 0.025;
      g.strokeStyle = pal.outline;
      g.strokeText(L.ch, 0, 0);
    }
  }

  function drawLetters(g, layout, style, pal) {
    g.clearRect(0, 0, CANVAS_W, CANVAS_H);
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.lineJoin = 'round';
    g.lineCap = 'round';

    for (var i = 0; i < layout.letters.length; i++) {
      var L = layout.letters[i];
      g.save();
      g.translate(L.x, L.y);
      g.rotate(L.rot);
      g.scale(1, L.scaleY);
      g.font = L.font;
      paintLetter(g, L, style, pal);
      g.restore();
    }
  }

  function drawDrips(g, data, pal, rand) {
    var columns = [];
    for (var x = 12; x < CANVAS_W - 12; x += 7) {
      for (var y = CANVAS_H - 1; y >= 0; y -= 3) {
        if (data[(y * CANVAS_W + x) * 4 + 3] > 90) {
          if (y < CANVAS_H - 30) columns.push({ x: x, y: y });
          break;
        }
      }
    }
    if (!columns.length) return;

    var count = Math.min(9, Math.max(3, Math.round(columns.length / 14)));
    g.lineCap = 'round';
    for (var i = 0; i < count; i++) {
      var c = columns[Math.floor(rand() * columns.length)];
      var len = 30 + rand() * 120;
      var width = 5 + rand() * 9;
      var grad = g.createLinearGradient(0, c.y, 0, c.y + len);
      grad.addColorStop(0, pal.fillDark);
      grad.addColorStop(0.7, hexToRgba(pal.fill, 0.85));
      grad.addColorStop(1, hexToRgba(pal.fill, 0));
      g.strokeStyle = grad;
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(c.x, c.y);
      g.lineTo(c.x + (rand() - 0.5) * 6, c.y + len);
      g.stroke();
      g.fillStyle = hexToRgba(pal.fillDark, 0.85);
      g.beginPath();
      g.arc(c.x + (rand() - 0.5) * 6, c.y + len, width * 0.6, 0, Math.PI * 2);
      g.fill();
    }
  }

  function addSpeckle(g, density, rand) {
    if (density <= 0) return;
    var dots = Math.round(density * 90);
    g.save();
    g.globalCompositeOperation = 'source-atop';
    for (var i = 0; i < dots; i++) {
      var x = rand() * CANVAS_W;
      var y = rand() * CANVAS_H;
      var r = 1 + rand() * 5;
      g.fillStyle = rand() < 0.5 ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.28)';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();
  }

  function measureCoverage(data, bands) {
    var bandW = CANVAS_W / bands;
    var counts = new Array(bands);
    for (var b = 0; b < bands; b++) counts[b] = 0;
    var painted = 0;

    for (var y = 0; y < CANVAS_H; y += 2) {
      for (var x = 0; x < CANVAS_W; x += 2) {
        if (data[(y * CANVAS_W + x) * 4 + 3] > 60) {
          counts[Math.min(bands - 1, Math.floor(x / bandW))]++;
          painted++;
        }
      }
    }

    var sampledPerBand = (bandW / 2) * (CANVAS_H / 2);
    var fractions = counts.map(function (c) { return c / sampledPerBand; });
    var totalSampled = (CANVAS_W / 2) * (CANVAS_H / 2);
    return { fractions: fractions, coverage: painted / totalSampled };
  }

  function renderChart(fractions) {
    var peak = 0;
    for (var i = 0; i < fractions.length; i++) peak = Math.max(peak, fractions[i]);
    if (peak <= 0) peak = 1;

    var html = '';
    for (var j = 0; j < fractions.length; j++) {
      var pct = Math.max(2, Math.round((fractions[j] / peak) * 100));
      var label = Math.round(fractions[j] * 100);
      html += '<div class="coverage-chart__bar" style="height:' + pct + '%" title="Band ' + (j + 1) + ': ' + label + '% painted"></div>';
    }
    chartEl.innerHTML = html;
    chartEl.setAttribute('aria-label',
      'Ink coverage chart with ' + fractions.length + ' vertical bands; peak band is ' + Math.round(peak * 100) + ' percent painted.');
  }

  function showError(message) {
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      textInput.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.textContent = '';
      errorEl.hidden = true;
      textInput.removeAttribute('aria-invalid');
    }
  }

  function render() {
    var raw = textInput.value.replace(/\s+/g, ' ').trim();
    if (raw.length > 16) raw = raw.slice(0, 16);
    if (!raw) {
      showError('Enter at least one character (letters, numbers or a space between words).');
      return;
    }
    showError('');

    var style = getStyle(state.style);
    var pal = getPalette(state.palette);
    var spray = Number(sprayRange.value);
    var drips = dripsCheck.checked;
    var bg = bgSelect.value;

    var layout = buildLayout(lctx, raw, style);
    drawLetters(lctx, layout, style, pal);

    var image = lctx.getImageData(0, 0, CANVAS_W, CANVAS_H);
    var rand = makeRandom(raw + '|' + style.id + '|' + pal.id + '|' + spray + '|' + drips);

    if (drips) drawDrips(lctx, image.data, pal, rand);
    addSpeckle(lctx, spray / 100, rand);

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (bg !== 'transparent') {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      var vignette = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H / 2, CANVAS_H * 0.2, CANVAS_W / 2, CANVAS_H / 2, CANVAS_W * 0.75);
      vignette.addColorStop(0, 'rgba(96,8,156,0)');
      vignette.addColorStop(1, 'rgba(96,8,156,0.06)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    }
    ctx.drawImage(layer, 0, 0);

    var stats = measureCoverage(image.data, 24);
    renderChart(stats.fractions);

    statCoverage.textContent = Math.round(stats.coverage * 100) + '%';
    statLetters.textContent = String(raw.replace(/ /g, '').length);
    statStyle.textContent = style.label;
    metaEl.textContent = style.label + ' · ' + pal.label + ' · 1800 × 840 px';
  }

  function buildControls() {
    STYLES.forEach(function (style) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'chip';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', String(style.id === state.style));
      btn.textContent = style.label;
      btn.addEventListener('click', function () {
        state.style = style.id;
        syncControls();
        render();
      });
      styleGrid.appendChild(btn);
    });

    PALETTES.forEach(function (pal) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-label', pal.label + ' palette');
      btn.setAttribute('aria-checked', String(pal.id === state.palette));
      btn.setAttribute('data-palette', pal.id);
      btn.style.background = 'linear-gradient(140deg, ' + pal.fill + ' 0%, ' + pal.fillDark + ' 100%)';
      btn.addEventListener('click', function () {
        state.palette = pal.id;
        syncControls();
        render();
      });
      swatchGrid.appendChild(btn);
    });
  }

  function syncControls() {
    Array.prototype.forEach.call(styleGrid.children, function (child, index) {
      child.setAttribute('aria-checked', String(STYLES[index].id === state.style));
    });
    Array.prototype.forEach.call(swatchGrid.children, function (child) {
      child.setAttribute('aria-checked', String(child.getAttribute('data-palette') === state.palette));
    });
    sprayValue.textContent = sprayRange.value + '%';
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
  });

  textInput.addEventListener('input', render);
  sprayRange.addEventListener('input', function () {
    syncControls();
    render();
  });
  bgSelect.addEventListener('change', render);
  dripsCheck.addEventListener('change', render);

  randomizeBtn.addEventListener('click', function () {
    state.style = STYLES[Math.floor(Math.random() * STYLES.length)].id;
    state.palette = PALETTES[Math.floor(Math.random() * PALETTES.length)].id;
    sprayRange.value = String(10 + Math.floor(Math.random() * 12) * 5);
    syncControls();
    render();
  });

  resetBtn.addEventListener('click', function () {
    textInput.value = DEFAULTS.text;
    state.style = DEFAULTS.style;
    state.palette = DEFAULTS.palette;
    sprayRange.value = String(DEFAULTS.spray);
    bgSelect.value = DEFAULTS.bg;
    dripsCheck.checked = DEFAULTS.drips;
    syncControls();
    showError('');
    render();
  });

  downloadBtn.addEventListener('click', function (event) {
    event.preventDefault();
    if (typeof canvas.toBlob !== 'function') {
      var link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'graffiti-tag.png';
      link.click();
      return;
    }
    canvas.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'graffiti-tag.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    }, 'image/png');
  });

  buildControls();
  syncControls();
  render();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      render();
    });
  }
})();
