/* QR Code Generator — vanilla JS. Symbol construction is delegated to the
   qrcode-generator library (CDN); capacity maths, validation, rendering,
   colour-contrast checks and PNG export live in this file. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     QR capacity / block structure tables
     ------------------------------------------------------------------ */
  // total codewords (data + EC) per symbol version
  var TOTAL_CODEWORDS = [26, 44, 70, 100, 134, 172, 196, 242, 292, 346];

  // [EC codewords per block, blocks in group 1, blocks in group 2]
  var EC_BLOCKS = {
    L: [[7, 1, 0], [10, 1, 0], [15, 1, 0], [20, 1, 0], [26, 1, 0],
        [18, 2, 0], [20, 2, 0], [24, 2, 0], [30, 2, 0], [18, 2, 2]],
    M: [[10, 1, 0], [16, 1, 0], [26, 1, 0], [18, 2, 0], [24, 2, 0],
        [16, 4, 0], [18, 4, 0], [22, 2, 2], [22, 3, 2], [26, 4, 1]],
    Q: [[13, 1, 0], [22, 1, 0], [18, 2, 0], [26, 2, 0], [18, 2, 2],
        [24, 4, 0], [18, 2, 4], [22, 4, 2], [20, 4, 4], [24, 6, 2]],
    H: [[17, 1, 0], [28, 1, 0], [22, 2, 0], [16, 4, 0], [22, 2, 2],
        [28, 4, 0], [26, 4, 1], [26, 4, 2], [24, 4, 4], [28, 6, 2]]
  };

  function dataCodewordCount(version, level) {
    var spec = EC_BLOCKS[level][version - 1];
    return TOTAL_CODEWORDS[version - 1] - spec[0] * (spec[1] + spec[2]);
  }

  function byteCapacity(version, level) {
    var dataBits = dataCodewordCount(version, level) * 8;
    var lengthBits = version < 10 ? 8 : 16;
    return Math.floor((dataBits - 4 - lengthBits) / 8);
  }

  var MAX_VERSION = 10;

  /* ----------------------------------------------------------------
     Encoder bridge

     Symbol construction (Reed-Solomon, module placement, mask selection)
     is delegated to the well-tested qrcode-generator library loaded from
     jsDelivr. This file owns everything user-facing: capacity maths,
     validation, rendering, colour contrast checks and PNG export.
     ---------------------------------------------------------------- */
  function utf8Bytes(str) {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);
      if (code < 0x80) {
        bytes.push(code);
      } else if (code < 0x800) {
        bytes.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
      } else if (code >= 0xd800 && code <= 0xdbff && i + 1 < str.length) {
        var next = str.charCodeAt(i + 1);
        if (next >= 0xdc00 && next <= 0xdfff) {
          var point = 0x10000 + ((code - 0xd800) << 10) + (next - 0xdc00);
          bytes.push(0xf0 | (point >> 18), 0x80 | ((point >> 12) & 0x3f),
                     0x80 | ((point >> 6) & 0x3f), 0x80 | (point & 0x3f));
          i++;
        } else {
          bytes.push(0xef, 0xbf, 0xbd);
        }
      } else {
        bytes.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f),
                   0x80 | (code & 0x3f));
      }
    }
    return bytes;
  }

  function newQrModel(text, level) {
    if (typeof qrcode !== 'function') return null;
    if (typeof qrcode.stringToBytesFuncs !== 'undefined') {
      // The library defaults to ISO-8859-1; switch it to real UTF-8 so
      // accented characters and emoji survive instead of becoming '?'.
      qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
    }
    try {
      var model = qrcode(0, level); // type 0 = auto-select the smallest version
      model.addData(text, 'Byte');
      model.make();
      return model;
    } catch (err) {
      return null; // over capacity for the chosen level
    }
  }

  function encode(text, level) {
    var model = newQrModel(text, level);
    if (model === null) return null;

    var count = model.getModuleCount();
    var version = (count - 17) / 4;
    var matrix = [];
    for (var r = 0; r < count; r++) {
      var row = [];
      for (var c = 0; c < count; c++) row.push(model.isDark(r, c) ? 1 : 0);
      matrix.push(row);
    }

    var byteLength = utf8Bytes(text).length;
    return {
      matrix: matrix,
      version: version,
      mask: typeof model._maskPattern === 'number' ? model._maskPattern : 0,
      byteLength: byteLength,
      capacity: byteCapacity(version, level)
    };
  }

  /* ------------------------------------------------------------------
     Canvas rendering
     ------------------------------------------------------------------ */
  function drawQR(canvas, matrix, options) {
    var size = matrix.length;
    var quiet = 4;
    var total = size + quiet * 2;
    var scale = options.size / total;
    var ctx = canvas.getContext('2d');

    canvas.width = options.size;
    canvas.height = options.size;
    ctx.fillStyle = options.bg;
    ctx.fillRect(0, 0, options.size, options.size);
    ctx.fillStyle = options.fg;

    for (var r = 0; r < size; r++) {
      for (var c = 0; c < size; c++) {
        if (!matrix[r][c]) continue;
        var x = Math.round((c + quiet) * scale);
        var y = Math.round((r + quiet) * scale);
        var w = Math.round((c + quiet + 1) * scale) - x;
        var h = Math.round((r + quiet + 1) * scale) - y;
        ctx.fillRect(x, y, w, h);
      }
    }
  }

  function toHex(rgb) {
    return '#' + rgb.slice(1);
  }
  function hexToRgb(hex) {
    var h = hex.replace('#', '');
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16)
    };
  }
  function luminance(rgb) {
    var f = function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(rgb.r) + 0.7152 * f(rgb.g) + 0.0722 * f(rgb.b);
  }
  function contrastRatio(a, b) {
    var l1 = luminance(hexToRgb(a));
    var l2 = luminance(hexToRgb(b));
    var hi = Math.max(l1, l2);
    var lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  }

  /* ------------------------------------------------------------------
     Capacity chart
     ------------------------------------------------------------------ */
  function drawCapacityChart(canvas, byteLength, version, level) {
    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 520;
    var cssHeight = 190;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.height = cssHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var levels = ['L', 'M', 'Q', 'H'];
    var padLeft = 34;
    var padBottom = 34;
    var padTop = 22;
    var plotW = cssWidth - padLeft - 14;
    var plotH = cssHeight - padTop - padBottom;
    var maxCap = byteCapacity(MAX_VERSION, 'L');
    var barGap = 16;
    var barW = (plotW - barGap * (levels.length + 1)) / levels.length;

    ctx.strokeStyle = '#e7e0ef';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var gy = padTop + (plotH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();
    }

    ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle = '#756d7e';
    ctx.textAlign = 'right';
    for (var t = 0; t <= 4; t++) {
      var val = Math.round(maxCap - (maxCap / 4) * t);
      var ty = padTop + (plotH / 4) * t + 4;
      ctx.fillText(String(val), padLeft - 8, ty);
    }

    for (var i = 0; i < levels.length; i++) {
      var lv = levels[i];
      var cap = byteCapacity(MAX_VERSION, lv);
      var barH = Math.max(2, (cap / maxCap) * plotH);
      var x = padLeft + barGap + i * (barW + barGap);
      var y = padTop + plotH - barH;

      ctx.fillStyle = lv === level ? '#60089c' : '#c9b0e3';
      ctx.fillRect(x, y, barW, barH);

      var usedH = Math.min(barH, (Math.min(byteLength, cap) / maxCap) * plotH);
      if (byteLength > 0) {
        ctx.fillStyle = lv === level ? '#2f0450' : '#a98cc9';
        ctx.fillRect(x, padTop + plotH - usedH, barW, usedH);
      }

      ctx.fillStyle = '#4d4655';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillText(lv, x + barW / 2, padTop + plotH + 16);
      ctx.font = '10px -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.fillStyle = '#756d7e';
      ctx.fillText(cap + ' B', x + barW / 2, padTop + plotH + 29);
    }
  }

  /* ------------------------------------------------------------------
     UI wiring
     ------------------------------------------------------------------ */
  var qrText = document.getElementById('qrText');
  var charCount = document.getElementById('charCount');
  var errText = document.getElementById('errText');
  var alertBox = document.getElementById('alertBox');
  var qrCanvas = document.getElementById('qrCanvas');
  var qrFrame = document.getElementById('qrFrame');
  var qrPlaceholder = document.getElementById('qrPlaceholder');
  var capChart = document.getElementById('capChart');
  var chartCaption = document.getElementById('chartCaption');
  var downloadBtn = document.getElementById('downloadBtn');
  var fgColor = document.getElementById('fgColor');
  var bgColor = document.getElementById('bgColor');
  var sizeSelect = document.getElementById('sizeSelect');
  var labelInput = document.getElementById('labelInput');
  var presetSelect = document.getElementById('presetSelect');

  var field = {
    status: document.getElementById('dStatus'),
    version: document.getElementById('dVersion'),
    modules: document.getElementById('dModules'),
    ecc: document.getElementById('dEcc'),
    bytes: document.getElementById('dBytes'),
    capacity: document.getElementById('dCapacity'),
    mask: document.getElementById('dMask')
  };

  var state = {
    matrix: null,
    version: null,
    level: 'M',
    mask: null,
    byteLength: 0,
    text: ''
  };

  function currentLevel() {
    var checked = document.querySelector('input[name="ecc"]:checked');
    return checked ? checked.value : 'M';
  }

  function setAlert(message, kind) {
    if (!message) {
      alertBox.innerHTML = '';
      return;
    }
    alertBox.innerHTML = '';
    var div = document.createElement('div');
    div.className = 'form-alert ' + (kind || 'is-ok');
    div.textContent = message;
    alertBox.appendChild(div);
  }

  function updateCharCount() {
    var n = qrText.value.length;
    charCount.textContent = n + (n === 1 ? ' character' : ' characters');
  }

  function resetDetails() {
    field.status.textContent = 'Waiting for input';
    field.version.textContent = '—';
    field.modules.textContent = '—';
    field.ecc.textContent = '—';
    field.bytes.textContent = '0';
    field.capacity.textContent = '0%';
    field.mask.textContent = '—';
  }

  function showEmptyPreview() {
    qrFrame.classList.add('is-empty');
    qrFrame.style.background = '#fff';
    qrPlaceholder.textContent = 'Your code will appear here after you press Generate.';
    downloadBtn.disabled = true;
    state.matrix = null;
  }

  function updatePresets() {
    var preset = presetSelect.value;
    if (!preset) return;
    var templates = {
      url: 'https://example.com/your-page',
      wifi: 'WIFI:T:WPA;S:MyNetwork;P:my-password;H:false;;',
      email: 'mailto:hello@example.com',
      phone: 'tel:+15551234567',
      sms: 'SMSTO:+15551234567:Hello, I would like to know more.',
      vcard: 'BEGIN:VCARD\nVERSION:3.0\nN:Smith;Alex\nFN:Alex Smith\nORG:A Free Tools\nTEL:+15551234567\nEMAIL:alex@example.com\nEND:VCARD'
    };
    qrText.value = templates[preset] || '';
    updateCharCount();
    qrText.focus();
  }

  function generate() {
    var text = qrText.value;
    var level = currentLevel();
    errText.textContent = '';

    if (!text) {
      qrFrame.classList.add('is-empty');
      setAlert('Enter some content to encode — a link, a block of text, or a preset.', 'is-error');
      errText.textContent = 'Content cannot be empty.';
      resetDetails();
      state.matrix = null;
      downloadBtn.disabled = true;
      qrText.focus();
      return false;
    }

    var trimmed = text.replace(/\s+/g, ' ').trim();
    if (trimmed.length === 0) {
      qrPlaceholder.textContent = 'Whitespace-only input cannot be encoded.';
      setAlert('Your input is only whitespace. Add some real content first.', 'is-error');
      errText.textContent = 'Only whitespace characters were entered.';
      resetDetails();
      state.matrix = null;
      downloadBtn.disabled = true;
      return false;
    }

    var bytes = utf8Bytes(text);
    var maxForLevel = byteCapacity(MAX_VERSION, level);
    if (bytes.length > maxForLevel) {
      setAlert('That is too long for level ' + level + '. This tool supports up to ' +
        maxForLevel + ' bytes at level ' + level + ' (you entered ' + bytes.length +
        ' bytes). Shorten the content or switch to a lower error correction level.', 'is-error');
      errText.textContent = 'Content exceeds the maximum of ' + maxForLevel +
        ' bytes at level ' + level + '.';
      field.status.textContent = 'Content too long';
      state.matrix = null;
      downloadBtn.disabled = true;
      return false;
    }

    var result = encode(text, level);
    if (!result) {
      setAlert('The code could not be generated. Try shortening the content.', 'is-error');
      return false;
    }

    var fg = fgColor.value;
    var bg = bgColor.value;
    var ratio = contrastRatio(fg, bg);

    if (luminance(hexToRgb(fg)) >= luminance(hexToRgb(bg))) {
      setAlert('Warning: your code colour is not darker than the background. Many scanners ' +
        'will fail on inverted or low-contrast codes — test on a real phone before printing.', 'is-warn');
    } else if (ratio < 4) {
      setAlert('Warning: contrast is only ' + ratio.toFixed(1) + ':1. QR codes scan most ' +
        'reliably at 7:1 or higher. Consider a darker code colour or a lighter background.', 'is-warn');
    } else if (contrastRatio(fg, '#ffffff') < 7) {
      setAlert('Generated successfully. Contrast is ' + ratio.toFixed(1) +
        ':1 — acceptable, though near-black on white scans best.', 'is-ok');
    } else {
      setAlert('QR code generated successfully. Contrast ' + ratio.toFixed(1) + ':1.', 'is-ok');
    }

    var exportSize = parseInt(sizeSelect.value, 10);
    drawQR(qrCanvas, result.matrix, { size: exportSize, fg: fg, bg: bg });

    qrFrame.classList.remove('is-empty');
    qrFrame.style.background = 'transparent';

    var caption = labelInput.value.trim();
    if (caption) {
      qrPlaceholder.textContent = caption;
    } else {
      qrPlaceholder.textContent = 'Right-click the code to copy the image, or use Download PNG.';
    }

    var capacityPercent = Math.round((result.byteLength / result.capacity) * 100);
    field.status.textContent = 'Ready';
    field.version.textContent = 'v' + result.version;
    field.modules.textContent = result.matrix.length + ' × ' + result.matrix.length;
    field.ecc.textContent = level;
    field.bytes.textContent = result.byteLength;
    field.capacity.textContent = capacityPercent + '%';
    field.mask.textContent = 'Pattern ' + result.mask;

    state.matrix = result.matrix;
    state.version = result.version;
    state.level = level;
    state.mask = result.mask;
    state.byteLength = result.byteLength;
    state.text = text;

    downloadBtn.disabled = false;
    drawCapacityChart(capChart, result.byteLength, result.version, level);
    chartCaption.textContent = 'Your ' + result.byteLength + ' bytes use ' + capacityPercent +
      '% of the level ' + level + ' capacity at version ' + result.version +
      ' (' + result.capacity + ' bytes). The highlighted bar is your selected level.';
    return true;
  }

  function downloadPNG() {
    if (!state.matrix) return;
    var canvas = document.createElement('canvas');
    var exportSize = parseInt(sizeSelect.value, 10);
    var matrixSize = state.matrix.length;
    var quiet = 4;
    var moduleScale = Math.max(1, Math.floor(exportSize / (matrixSize + quiet * 2)));
    var totalModules = matrixSize + quiet * 2;
    var pixelSize = moduleScale * totalModules;
    var caption = labelInput.value.trim();
    var captionBand = caption ? Math.round(pixelSize * 0.09) : 0;

    canvas.width = pixelSize;
    canvas.height = pixelSize + captionBand;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = fgColor.value;
    for (var r = 0; r < matrixSize; r++) {
      for (var c = 0; c < matrixSize; c++) {
        if (!state.matrix[r][c]) continue;
        ctx.fillRect((c + quiet) * moduleScale, (r + quiet) * moduleScale,
          moduleScale, moduleScale);
      }
    }

    if (caption) {
      ctx.font = 'bold ' + Math.max(11, Math.round(captionBand * 0.42)) +
        'px -apple-system, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(caption.slice(0, 60), pixelSize / 2,
        pixelSize + captionBand * 0.5, pixelSize * 0.94);
    }

    var filenameBase = state.text
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'qr-code';

    if (canvas.toBlob) {
      canvas.toBlob(function (blob) {
        triggerDownload(URL.createObjectURL(blob), filenameBase + '.png', true);
      }, 'image/png');
    } else {
      triggerDownload(canvas.toDataURL('image/png'), filenameBase + '.png', false);
    }
  }

  function triggerDownload(href, filename, revoke) {
    var link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (revoke) setTimeout(function () { URL.revokeObjectURL(href); }, 2000);
    setAlert('Downloaded ' + filename + '.', 'is-ok');
  }

  function resetAll() {
    qrText.value = '';
    labelInput.value = '';
    presetSelect.value = '';
    document.getElementById('eccM').checked = true;
    fgColor.value = '#1b1b1b';
    bgColor.value = '#ffffff';
    sizeSelect.value = '512';
    errText.textContent = '';
    setAlert('', '');
    updateCharCount();
    resetDetails();
    showEmptyPreview();
    drawCapacityChart(capChart, 0, 1, 'M');
    chartCaption.textContent = 'Bars show how much of each level\u2019s available capacity your content consumes. Shorter bars at the same content length mean a lighter, easier-to-scan code.';
    qrText.focus();
  }

  document.getElementById('qrForm').addEventListener('submit', function (e) {
    e.preventDefault();
    generate();
  });
  document.getElementById('clearBtn').addEventListener('click', resetAll);
  downloadBtn.addEventListener('click', downloadPNG);
  qrText.addEventListener('input', function () {
    updateCharCount();
    if (errText.textContent) errText.textContent = '';
  });
  presetSelect.addEventListener('change', updatePresets);
  sizeSelect.addEventListener('change', function () {
    if (state.matrix) generate();
  });
  fgColor.addEventListener('input', function () {
    if (state.matrix) generate();
  });
  bgColor.addEventListener('input', function () {
    if (state.matrix) generate();
  });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="ecc"]'), function (radio) {
    radio.addEventListener('change', function () {
      if (state.matrix || qrText.value.trim()) generate();
    });
  });

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Initial paint so the chart is visible before the first generation
  updateCharCount();
  resetDetails();
  showEmptyPreview();
  drawCapacityChart(capChart, 0, 1, 'M');
  window.addEventListener('resize', function () {
    drawCapacityChart(capChart, state.byteLength, state.version || 1, state.level);
  });
})();
