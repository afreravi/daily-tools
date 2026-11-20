(function () {
  'use strict';

  var FONTS = [
    { id: 'baloo', label: 'Baloo 2', stack: "'Baloo 2', cursive", weight: 800, family: 'Baloo 2' },
    { id: 'fredoka', label: 'Fredoka', stack: "'Fredoka', sans-serif", weight: 600, family: 'Fredoka' },
    { id: 'bubblegum', label: 'Bubblegum Sans', stack: "'Bubblegum Sans', cursive", weight: 400, family: 'Bubblegum Sans' },
    { id: 'luckiest', label: 'Luckiest Guy', stack: "'Luckiest Guy', cursive", weight: 400, family: 'Luckiest Guy' },
    { id: 'titan', label: 'Titan One', stack: "'Titan One', cursive", weight: 400, family: 'Titan One' },
    { id: 'chango', label: 'Chango', stack: "'Chango', cursive", weight: 400, family: 'Chango' },
    { id: 'sniglet', label: 'Sniglet', stack: "'Sniglet', cursive", weight: 800, family: 'Sniglet' },
    { id: 'bungee', label: 'Bungee', stack: "'Bungee', cursive", weight: 400, family: 'Bungee' }
  ];

  var DEFAULTS = {
    text: 'Happy Birthday',
    font: 'baloo',
    size: 72,
    tracking: 2,
    fill: '#60089c',
    strokeColor: '#ffffff',
    strokeWidth: 4,
    shadow: 6,
    caps: true
  };

  var els = {
    form: document.getElementById('bubbleForm'),
    text: document.getElementById('textInput'),
    font: document.getElementById('fontSelect'),
    size: document.getElementById('sizeInput'),
    tracking: document.getElementById('trackingInput'),
    fill: document.getElementById('fillInput'),
    strokeColor: document.getElementById('strokeColorInput'),
    strokeWidth: document.getElementById('strokeInput'),
    shadow: document.getElementById('shadowInput'),
    caps: document.getElementById('capsInput'),
    strokeValue: document.getElementById('strokeValue'),
    shadowValue: document.getElementById('shadowValue'),
    charCount: document.getElementById('charCount'),
    preview: document.getElementById('previewText'),
    stage: document.getElementById('previewStage'),
    previewMeta: document.getElementById('previewMeta'),
    status: document.getElementById('statusLine'),
    copyCss: document.getElementById('copyCssBtn'),
    downloadSvg: document.getElementById('downloadSvgBtn'),
    reset: document.getElementById('resetBtn'),
    chart: document.getElementById('widthChart'),
    tableBody: document.getElementById('widthTableBody')
  };

  var measureCtx = document.createElement('canvas').getContext('2d');
  var statusTimer = null;

  function clamp(value, min, max, fallback) {
    var n = Number(value);
    if (!isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
  }

  function displayText() {
    var raw = els.text.value;
    var trimmed = raw.replace(/\s+/g, ' ').trim();
    if (!trimmed) return 'Happy Birthday';
    return els.caps.checked ? trimmed.toUpperCase() : trimmed;
  }

  function selectedFont() {
    var id = els.font.value;
    for (var i = 0; i < FONTS.length; i++) {
      if (FONTS[i].id === id) return FONTS[i];
    }
    return FONTS[0];
  }

  function readState() {
    return {
      text: els.text.value,
      font: selectedFont().id,
      size: clamp(els.size.value, 24, 140, DEFAULTS.size),
      tracking: clamp(els.tracking.value, 0, 14, DEFAULTS.tracking),
      fill: els.fill.value,
      strokeColor: els.strokeColor.value,
      strokeWidth: clamp(els.strokeWidth.value, 0, 10, DEFAULTS.strokeWidth),
      shadow: clamp(els.shadow.value, 0, 14, DEFAULTS.shadow),
      caps: els.caps.checked
    };
  }

  function setStatus(message, isError) {
    els.status.textContent = message;
    els.status.classList.toggle('is-error', !!isError);
    if (statusTimer) clearTimeout(statusTimer);
    if (message) {
      statusTimer = setTimeout(function () {
        els.status.textContent = '';
        els.status.classList.remove('is-error');
      }, 4000);
    }
  }

  function fontCss(font, size, weight) {
    return (weight || font.weight) + ' ' + size + 'px ' + font.stack;
  }

  function applyPreview(state) {
    var font = selectedFont();
    var px = state.size;
    els.preview.textContent = displayText();
    els.preview.style.fontFamily = font.stack;
    els.preview.style.fontWeight = String(font.weight);
    els.preview.style.fontSize = px + 'px';
    els.preview.style.letterSpacing = state.tracking + 'px';
    els.preview.style.color = state.fill;

    var stroke = state.strokeWidth > 0
      ? state.strokeWidth + 'px ' + state.strokeColor
      : '0 transparent';
    els.preview.style.webkitTextStroke = stroke;
    els.preview.style.textShadow = state.shadow > 0
      ? state.shadow + 'px ' + state.shadow + 'px 0 ' + hexToRgba(state.fill, 0.28)
      : 'none';

    els.strokeValue.textContent = state.strokeWidth;
    els.shadowValue.textContent = state.shadow;
    els.charCount.textContent = String(els.text.value.length);

    fitPreview(px);

    var label = displayText();
    els.previewMeta.textContent = px + 'px \u00b7 ' + label.length + ' characters';
  }

  function fitPreview(px) {
    els.preview.style.transform = 'none';
    var stageWidth = els.stage.clientWidth - 32;
    var textWidth = els.preview.scrollWidth;
    if (stageWidth > 0 && textWidth > stageWidth) {
      var scale = stageWidth / textWidth;
      els.preview.style.transform = 'scale(' + Math.max(scale, 0.25) + ')';
    }
    els.preview.style.minHeight = Math.round(px * 1.3) + 'px';
  }

  function hexToRgba(hex, alpha) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!m) return 'rgba(96, 8, 156, ' + alpha + ')';
    return 'rgba(' + parseInt(m[1], 16) + ', ' + parseInt(m[2], 16) + ', ' + parseInt(m[3], 16) + ', ' + alpha + ')';
  }

  function measureAll(state) {
    var text = displayText();
    var rows = FONTS.map(function (font) {
      measureCtx.font = fontCss(font, state.size);
      var width = Math.ceil(measureCtx.measureText(text).width + state.tracking * text.length);
      return {
        label: font.label,
        width: width,
        perChar: text.length ? Math.round(width / text.length) : 0
      };
    });
    return rows;
  }

  function renderTable(rows, activeId) {
    var activeLabel = selectedFont().label;
    var html = rows.map(function (row) {
      var isActive = row.label === activeLabel;
      return '<tr' + (isActive ? ' class="is-active"' : '') + '>' +
        '<th scope="row" class="font-weight-normal">' + row.label + '</th>' +
        '<td class="text-right">' + row.width + '</td>' +
        '<td class="text-right">' + row.perChar + '</td>' +
        '</tr>';
    }).join('');
    els.tableBody.innerHTML = html;
  }

  function renderChart(rows) {
    var canvas = els.chart;
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.parentNode.clientWidth || 600;
    var cssHeight = 300;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.height = cssHeight + 'px';

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var padLeft = 96;
    var padRight = 56;
    var padTop = 16;
    var padBottom = 34;
    var plotWidth = cssWidth - padLeft - padRight;
    var plotHeight = cssHeight - padTop - padBottom;
    var maxWidth = 1;
    rows.forEach(function (row) { if (row.width > maxWidth) maxWidth = row.width; });

    var activeLabel = selectedFont().label;

    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textBaseline = 'middle';

    var barGap = 8;
    var barHeight = (plotHeight - barGap * (rows.length - 1)) / rows.length;

    // gridlines
    ctx.strokeStyle = '#eee2f8';
    ctx.fillStyle = '#8a7b97';
    for (var g = 0; g <= 4; g++) {
      var x = padLeft + (plotWidth / 4) * g;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + plotHeight);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(Math.round((maxWidth / 4) * g) + 'px', x, cssHeight - 16);
    }

    rows.forEach(function (row, i) {
      var y = padTop + i * (barHeight + barGap);
      var w = Math.max(2, (row.width / maxWidth) * plotWidth);
      var isActive = row.label === activeLabel;

      ctx.fillStyle = isActive ? '#60089c' : '#c9a9e4';
      ctx.beginPath();
      var radius = Math.min(6, barHeight / 2);
      roundRect(ctx, padLeft, y, w, barHeight, radius);
      ctx.fill();

      ctx.fillStyle = isActive ? '#44046f' : '#5b4f68';
      ctx.textAlign = 'right';
      ctx.font = (isActive ? '600 ' : '') + '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.fillText(row.label, padLeft - 10, y + barHeight / 2);

      ctx.textAlign = 'left';
      ctx.fillStyle = isActive ? '#44046f' : '#8a7b97';
      ctx.fillText(row.width + 'px', padLeft + w + 8, y + barHeight / 2);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }

  function update() {
    var state = readState();
    applyPreview(state);
    var rows = measureAll(state);
    renderTable(rows, state.font);
    renderChart(rows);
  }

  function buildCssSnippet(state) {
    var font = selectedFont();
    var text = displayText();
    var lines = [
      '/* Bubble font style generated with the Bubble Font Generator */',
      '.bubble-text {',
      "  font-family: " + font.stack + ";",
      '  font-weight: ' + font.weight + ';',
      '  font-size: ' + state.size + 'px;',
      '  letter-spacing: ' + state.tracking + 'px;',
      '  color: ' + state.fill + ';',
      '  -webkit-text-stroke: ' + state.strokeWidth + 'px ' + state.strokeColor + ';',
      '  paint-order: stroke fill;',
      '  text-shadow: ' + (state.shadow > 0 ? state.shadow + 'px ' + state.shadow + 'px 0 ' + hexToRgba(state.fill, 0.28) : 'none') + ';',
      '}',
      '',
      '/* Load the face too, or the browser will fall back: */',
      '/* @import url("https://fonts.googleapis.com/css2?family=' + font.family.replace(/ /g, '+') + ':wght@' + font.weight + '&display=swap"); */',
      '',
      '/* Text: ' + text + ' */'
    ];
    return lines.join('\n');
  }

  function buildSvg(state) {
    var font = selectedFont();
    var text = displayText();
    var rows = measureAll(state);
    var row = rows[0];
    rows.forEach(function (r) { if (r.label === font.label) row = r; });

    var padding = Math.round(state.size * 0.35) + state.shadow;
    var width = row.width + padding * 2;
    var height = Math.round(state.size * 1.6) + padding * 2;
    var baseline = Math.round(height - padding - state.size * 0.22);
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var strokeAttr = state.strokeWidth > 0
      ? ' stroke="' + state.strokeColor + '" stroke-width="' + (state.strokeWidth * 2) + '" paint-order="stroke fill" stroke-linejoin="round"'
      : '';

    var shadowAttr = state.shadow > 0
      ? ' filter="url(#bubbleShadow)"'
      : '';

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '">',
      '  <defs>',
      '    <filter id="bubbleShadow" x="-30%" y="-30%" width="160%" height="160%">',
      '      <feDropShadow dx="' + state.shadow + '" dy="' + state.shadow + '" stdDeviation="0" flood-color="' + state.fill + '" flood-opacity="0.28"/>',
      '    </filter>',
      '  </defs>',
      '  <rect width="100%" height="100%" fill="#ffffff"/>',
      '  <text x="' + padding + '" y="' + baseline + '"',
      '        font-family="' + font.family + ', cursive"',
      '        font-weight="' + font.weight + '"',
      '        font-size="' + state.size + '"',
      '        letter-spacing="' + state.tracking + '"',
      '        fill="' + state.fill + '"' + strokeAttr + shadowAttr + '>' + escaped + '</text>',
      '</svg>'
    ].join('\n');
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  els.copyCss.addEventListener('click', function () {
    copyText(buildCssSnippet(readState()))
      .then(function () { setStatus('CSS copied to your clipboard.', false); })
      .catch(function () { setStatus('Copy was blocked by the browser. Select the CSS manually instead.', true); });
  });

  els.downloadSvg.addEventListener('click', function () {
    var state = readState();
    var svg = buildSvg(state);
    var blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var slug = displayText().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'bubble-text';
    a.href = url;
    a.download = slug + '-bubble.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    setStatus('SVG downloaded. Open it in a browser or a vector editor to check the fonts.', false);
  });

  els.reset.addEventListener('click', function () {
    els.text.value = DEFAULTS.text;
    els.font.value = DEFAULTS.font;
    els.size.value = DEFAULTS.size;
    els.tracking.value = DEFAULTS.tracking;
    els.fill.value = DEFAULTS.fill;
    els.strokeColor.value = DEFAULTS.strokeColor;
    els.strokeWidth.value = DEFAULTS.strokeWidth;
    els.shadow.value = DEFAULTS.shadow;
    els.caps.checked = DEFAULTS.caps;
    update();
    setStatus('Studio reset to defaults.', false);
  });

  els.form.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  ['input', 'change'].forEach(function (evt) {
    els.form.addEventListener(evt, function (event) {
      if (event.target === els.size || event.target === els.tracking) {
        var min = Number(event.target.min);
        var max = Number(event.target.max);
        if (event.target.value !== '' && (Number(event.target.value) < min || Number(event.target.value) > max)) {
          setStatus('Values are clamped between ' + min + ' and ' + max + '.', true);
        }
      }
      update();
    });
  });

  els.text.addEventListener('input', function () {
    if (els.text.value.length > 40) {
      els.text.value = els.text.value.slice(0, 40);
      setStatus('Trimmed to 40 characters so the preview stays readable.', true);
    }
    update();
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(update, 120);
  });

  FONTS.forEach(function (font) {
    var opt = document.createElement('option');
    opt.value = font.id;
    opt.textContent = font.label;
    opt.style.fontFamily = font.stack;
    els.font.appendChild(opt);
  });
  els.font.value = DEFAULTS.font;

  update();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(update).catch(function () {});
    document.fonts.addEventListener('loadingdone', update);
  }
})();
