(function () {
  'use strict';

  var STYLES = [
    { key: 'classic', name: 'Classic Script', family: '"Pacifico", cursive', weight: '400', sample: 'Barbie' },
    { key: 'dream', name: 'Dream Script', family: '"Dancing Script", cursive', weight: '700', sample: 'Barbie' },
    { key: 'dollhouse', name: 'Dollhouse Serif', family: '"Playfair Display", Georgia, serif', weight: '700', sample: 'Barbie', italic: true },
    { key: 'y2k', name: 'Y2K Bubble', family: '"Baloo 2", "Trebuchet MS", sans-serif', weight: '800', sample: 'Barbie' }
  ];

  var PALETTES = [
    { name: 'Classic Pink', from: '#ff5fa2', to: '#e0218a' },
    { name: 'Hot Pink', from: '#ff6ec7', to: '#ff1493' },
    { name: 'Dream Purple', from: '#a45bd8', to: '#60089c' },
    { name: 'Bubblegum', from: '#ffb3d9', to: '#ff69b4' },
    { name: 'Sunset Coral', from: '#ff9a8b', to: '#ff6f91' },
    { name: 'Berry', from: '#e35d8f', to: '#c2185b' }
  ];

  var SMALL_CAPS = {
    a: '\u1D00', b: '\u0299', c: '\u1D04', d: '\u1D05', e: '\u1D07', f: '\uA730',
    g: '\u0262', h: '\u029C', i: '\u026A', j: '\u1D0A', k: '\u1D0B', l: '\u029F',
    m: '\u1D0D', n: '\u0274', o: '\u1D0F', p: '\u1D18', q: '\u01EB', r: '\u0280',
    s: '\uA731', t: '\u1D1B', u: '\u1D1C', v: '\u1D20', w: '\u1D21', x: 'x',
    y: '\u028F', z: '\u1D22'
  };

  var nameInput = document.getElementById('barbie-name');
  var plaqueName = document.getElementById('plaque-name');
  var styleGrid = document.getElementById('style-grid');
  var swatchGrid = document.getElementById('swatch-grid');
  var variantsEl = document.getElementById('variants');
  var errorEl = document.getElementById('form-error');
  var canvas = document.getElementById('contrast-chart');
  var downloadBtn = document.getElementById('download-btn');
  var resetBtn = document.getElementById('reset-btn');
  var form = document.getElementById('barbie-form');

  var state = { text: 'Barbie', style: 0, palette: 0 };
  var barRects = [];

  function mapChars(str, upperBase, lowerBase, digits) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      var ch = str[i];
      if (code >= 65 && code <= 90) {
        out += String.fromCodePoint(upperBase + (code - 65));
      } else if (code >= 97 && code <= 122) {
        out += String.fromCodePoint(lowerBase + (code - 97));
      } else if (digits && code >= 48 && code <= 57) {
        out += String.fromCodePoint(digits + (code - 48));
      } else {
        out += ch;
      }
    }
    return out;
  }

  function boldScript(str) {
    return mapChars(str, 0x1D4D0, 0x1D4EA, null);
  }

  function circled(str) {
    return mapChars(str, 0x24B6, 0x24D0, 0x2460 - 1);
  }

  function fullWidth(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      out += (code >= 33 && code <= 126) ? String.fromCharCode(0xFF01 + (code - 33)) : str[i];
    }
    return out;
  }

  function smallCaps(str) {
    var out = '';
    for (var i = 0; i < str.length; i++) {
      var ch = str[i];
      var mapped = SMALL_CAPS[ch.toLowerCase()];
      out += mapped ? mapped : ch;
    }
    return out;
  }

  function spaced(str) {
    return str.split('').join('\u2009');
  }

  var BUILDERS = [
    { name: 'Barbie Script', build: boldScript },
    { name: 'Barbie Bubble', build: circled },
    { name: 'Wide Glam', build: fullWidth },
    { name: 'Small Caps', build: smallCaps },
    { name: 'Heart Frame', build: function (s) { return '\u2661 ' + spaced(s) + ' \u2661'; } },
    { name: 'Sparkle', build: function (s) { return '\u2728 ' + spaced(s) + ' \u2728'; } }
  ];

  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }

  function luminance(hex) {
    var rgb = hexToRgb(hex);
    var channels = [rgb.r, rgb.g, rgb.b].map(function (v) {
      var c = v / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  function contrastOnWhite(hex) {
    return 1.05 / (luminance(hex) + 0.05);
  }

  function buildStyleOptions() {
    styleGrid.innerHTML = '';
    STYLES.forEach(function (style, index) {
      var label = document.createElement('label');
      label.className = 'style-option' + (index === state.style ? ' is-active' : '');

      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'lettering';
      input.value = String(index);
      input.checked = index === state.style;

      var sample = document.createElement('span');
      sample.className = 'style-option__sample';
      sample.textContent = style.sample;
      sample.style.fontFamily = style.family;
      sample.style.fontWeight = style.weight;
      if (style.italic) sample.style.fontStyle = 'italic';

      var name = document.createElement('span');
      name.className = 'style-option__name';
      name.textContent = style.name;

      label.appendChild(input);
      label.appendChild(sample);
      label.appendChild(name);
      styleGrid.appendChild(label);

      input.addEventListener('change', function () {
        selectStyle(index);
      });
    });
  }

  function buildSwatches() {
    swatchGrid.innerHTML = '';
    PALETTES.forEach(function (palette, index) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch' + (index === state.palette ? ' is-active' : '');
      btn.style.background = 'linear-gradient(135deg, ' + palette.from + ', ' + palette.to + ')';
      btn.setAttribute('aria-pressed', index === state.palette ? 'true' : 'false');
      btn.setAttribute('aria-label', palette.name + ' palette');

      var sr = document.createElement('span');
      sr.className = 'swatch__label';
      sr.textContent = palette.name;
      btn.appendChild(sr);

      btn.addEventListener('click', function () {
        selectPalette(index);
      });
      swatchGrid.appendChild(btn);
    });
  }

  function selectPalette(index) {
    state.palette = index;
    Array.prototype.forEach.call(swatchGrid.children, function (child, i) {
      var on = i === index;
      child.classList.toggle('is-active', on);
      child.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    render();
    drawChart();
  }

  function selectStyle(index) {
    state.style = index;
    Array.prototype.forEach.call(styleGrid.children, function (child, i) {
      var on = i === index;
      child.classList.toggle('is-active', on);
      var input = child.querySelector('input');
      if (input) input.checked = on;
    });
    render();
  }

  function render() {
    var style = STYLES[state.style];
    var palette = PALETTES[state.palette];

    plaqueName.textContent = state.text;
    plaqueName.style.fontFamily = style.family;
    plaqueName.style.fontWeight = style.weight;
    plaqueName.style.fontStyle = style.italic ? 'italic' : 'normal';
    plaqueName.style.backgroundImage = 'linear-gradient(135deg, ' + palette.from + ', ' + palette.to + ')';
    plaqueName.classList.add('plaque__name--gradient');
    plaqueName.style.color = palette.to;

    renderVariants();
  }

  function renderVariants() {
    variantsEl.innerHTML = '';
    BUILDERS.forEach(function (builder) {
      var value = builder.build(state.text);

      var row = document.createElement('div');
      row.className = 'variant';

      var body = document.createElement('div');
      body.className = 'variant__body';

      var name = document.createElement('span');
      name.className = 'variant__name';
      name.textContent = builder.name;

      var text = document.createElement('span');
      text.className = 'variant__text';
      text.textContent = value;

      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'variant__copy';
      copy.textContent = 'Copy';
      copy.setAttribute('aria-label', 'Copy ' + builder.name + ' text');

      copy.addEventListener('click', function () {
        copyText(value, copy);
      });

      body.appendChild(name);
      body.appendChild(text);
      row.appendChild(body);
      row.appendChild(copy);
      variantsEl.appendChild(row);
    });
  }

  function copyText(value, button) {
    var done = function () {
      button.textContent = 'Copied';
      button.classList.add('is-copied');
      setTimeout(function () {
        button.textContent = 'Copy';
        button.classList.remove('is-copied');
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () {
        legacyCopy(value, done);
      });
    } else {
      legacyCopy(value, done);
    }
  }

  function legacyCopy(value, done) {
    var area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(area);
  }

  function drawChart() {
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 520;
    var cssHeight = 300;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var width = cssWidth;
    var height = cssHeight;
    var padLeft = 96;
    var padRight = 16;
    var padTop = 22;
    var padBottom = 30;
    var plotWidth = width - padLeft - padRight;
    var maxRatio = 7;

    ctx.clearRect(0, 0, width, height);
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    ctx.textBaseline = 'middle';

    var rowHeight = (height - padTop - padBottom) / PALETTES.length;
    barRects = [];

    [3, 4.5].forEach(function (threshold) {
      var x = padLeft + (threshold / maxRatio) * plotWidth;
      ctx.strokeStyle = threshold === 4.5 ? '#60089c' : '#c9a6e4';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(x, padTop - 6);
      ctx.lineTo(x, height - padBottom + 4);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#8a3ec4';
      ctx.textAlign = 'center';
      ctx.fillText(threshold + ':1', x, height - padBottom + 16);
    });

    PALETTES.forEach(function (palette, index) {
      var ratio = contrastOnWhite(palette.to);
      var y = padTop + index * rowHeight;
      var barHeight = Math.min(20, rowHeight - 12);
      var barY = y + (rowHeight - barHeight) / 2;
      var barWidth = Math.max(3, (ratio / maxRatio) * plotWidth);

      ctx.fillStyle = '#4b3a58';
      ctx.textAlign = 'right';
      ctx.fillText(palette.name, padLeft - 10, barY + barHeight / 2);

      var gradient = ctx.createLinearGradient(padLeft, 0, padLeft + barWidth, 0);
      gradient.addColorStop(0, palette.from);
      gradient.addColorStop(1, palette.to);
      ctx.fillStyle = gradient;
      roundedRect(ctx, padLeft, barY, barWidth, barHeight, 6);
      ctx.fill();

      if (index === state.palette) {
        ctx.strokeStyle = '#3d0563';
        ctx.lineWidth = 2;
        roundedRect(ctx, padLeft - 2, barY - 2, barWidth + 4, barHeight + 4, 8);
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      ctx.fillStyle = '#241a2e';
      ctx.textAlign = 'left';
      ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
      ctx.fillText(ratio.toFixed(1), padLeft + barWidth + 8, barY + barHeight / 2);
      ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

      barRects.push({ index: index, x: padLeft, y: barY - 4, w: barWidth + 60, h: barHeight + 8 });
    });
  }

  function roundedRect(ctx, x, y, w, h, r) {
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

  function sanitize(raw) {
    var cleaned = raw.replace(/[\u0000-\u001F\u007F]/g, '');
    return cleaned.replace(/\s+/g, ' ').replace(/^ | $/g, '');
  }

  function setError(message) {
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      nameInput.setAttribute('aria-invalid', 'true');
    } else {
      errorEl.hidden = true;
      errorEl.textContent = '';
      nameInput.removeAttribute('aria-invalid');
    }
  }

  function applyInput() {
    var cleaned = sanitize(nameInput.value);
    if (!cleaned) {
      setError('Type at least one letter or number to build your logo.');
      return;
    }
    if (!/[A-Za-z0-9\u00C0-\u024F]/.test(cleaned)) {
      setError('Add at least one letter or number — symbols alone cannot be lettered.');
      return;
    }
    setError('');
    state.text = cleaned;
    nameInput.value = cleaned;
    render();
  }

  function escapeXml(value) {
    return value.replace(/[<>&"']/g, function (ch) {
      return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch];
    });
  }

  function buildSvg() {
    var style = STYLES[state.style];
    var palette = PALETTES[state.palette];
    var text = escapeXml(state.text);
    var fontStack = style.family.replace(/"/g, "'");
    var italic = style.italic ? ' font-style="italic"' : '';
    var size = state.text.length > 14 ? 64 : 84;

    return [
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="300" viewBox="0 0 800 300">',
      '<defs><linearGradient id="barbieFill" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="' + palette.from + '"/>',
      '<stop offset="100%" stop-color="' + palette.to + '"/>',
      '</linearGradient></defs>',
      '<rect width="800" height="300" fill="#fff7fb"/>',
      '<text x="40" y="52" font-size="22" fill="#ff8ec7">\u2726</text>',
      '<text x="738" y="258" font-size="18" fill="#ff8ec7">\u2726</text>',
      '<text x="400" y="160" text-anchor="middle" font-family="' + fontStack + '" font-weight="' + style.weight + '"' + italic +
        ' font-size="' + size + '" fill="url(#barbieFill)" stroke="#ffffff" stroke-width="6" paint-order="stroke fill">' + text + '</text>',
      '<text x="400" y="216" text-anchor="middle" font-family="Verdana, sans-serif" font-size="12" letter-spacing="4" fill="#8a3ec4">YOUR NAME, DOLLED UP</text>',
      '</svg>'
    ].join('');
  }

  function downloadSvg() {
    var blob = new Blob([buildSvg()], { type: 'image/svg+xml;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'barbie-' + state.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  nameInput.addEventListener('input', function () {
    if (nameInput.value.length > 0) setError('');
  });

  nameInput.addEventListener('blur', applyInput);
  nameInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyInput();
    }
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    applyInput();
  });

  downloadBtn.addEventListener('click', function () {
    applyInput();
    if (errorEl.hidden) downloadSvg();
  });

  resetBtn.addEventListener('click', function () {
    nameInput.value = 'Barbie';
    state.text = 'Barbie';
    state.style = 0;
    state.palette = 0;
    setError('');
    selectStyle(0);
    selectPalette(0);
    nameInput.focus();
  });

  canvas.addEventListener('click', function (event) {
    var rect = canvas.getBoundingClientRect();
    var x = (event.clientX - rect.left) * (canvas.clientWidth / rect.width);
    var y = (event.clientY - rect.top) * (canvas.clientHeight / rect.height);
    for (var i = 0; i < barRects.length; i++) {
      var bar = barRects[i];
      if (x >= bar.x && x <= bar.x + bar.w && y >= bar.y && y <= bar.y + bar.h) {
        selectPalette(bar.index);
        break;
      }
    }
  });

  canvas.addEventListener('keydown', function (event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      selectPalette((state.palette + 1) % PALETTES.length);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      selectPalette((state.palette + PALETTES.length - 1) % PALETTES.length);
    }
  });

  window.addEventListener('resize', function () {
    drawChart();
  });

  buildStyleOptions();
  buildSwatches();
  render();
  drawChart();
})();
