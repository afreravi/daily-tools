/* QR Code Generator — vanilla JS, no dependencies.
   Implements QR encoding (byte mode, versions 1-10, EC levels L/M/Q/H)
   directly from the ISO/IEC 18004 symbol structure. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     GF(256) arithmetic for Reed-Solomon error correction
     ------------------------------------------------------------------ */
  var EXP = new Uint8Array(512);
  var LOG = new Uint8Array(256);
  (function initTables() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function gfMul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function rsGeneratorPoly(degree) {
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1).fill(0);
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMul(poly[j], EXP[i]);
      }
      poly = next;
    }
    return poly;
  }

  function rsEncode(data, ecCount) {
    var gen = rsGeneratorPoly(ecCount);
    var remainder = new Array(ecCount).fill(0);
    for (var i = 0; i < data.length; i++) {
      var factor = data[i] ^ remainder[0];
      remainder.shift();
      remainder.push(0);
      for (var j = 0; j < ecCount; j++) {
        remainder[j] ^= gfMul(gen[j + 1], factor);
      }
    }
    return remainder;
  }

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

  var EC_CODEWORDS_PER_BLOCK = { L: 0, M: 0, Q: 0, H: 0 };
  var EC_INDEX = { L: 0, M: 1, Q: 2, H: 3 };
  var EC_FORMAT_BITS = { L: 1, M: 0, Q: 3, H: 2 }; // per spec format info

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

  function pickVersion(byteLength, level) {
    for (var v = 1; v <= MAX_VERSION; v++) {
      if (byteCapacity(v, level) >= byteLength) return v;
    }
    return null;
  }

  /* ------------------------------------------------------------------
     Bit buffer
     ------------------------------------------------------------------ */
  function BitBuffer() {
    this.bits = [];
  }
  BitBuffer.prototype.put = function (value, length) {
    for (var i = length - 1; i >= 0; i--) {
      this.bits.push((value >>> i) & 1);
    }
  };

  function utf8Bytes(str) {
    var out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c < 0x80) {
        out.push(c);
      } else if (c < 0x800) {
        out.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f));
      } else if (c >= 0xd800 && c <= 0xdbff && i + 1 < str.length) {
        var lo = str.charCodeAt(i + 1);
        if (lo >= 0xdc00 && lo <= 0xdfff) {
          var cp = 0x10000 + ((c - 0xd800) << 10) + (lo - 0xdc00);
          out.push(0xf0 | (cp >> 18), 0x80 | ((cp >> 12) & 0x3f),
                   0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
          i++;
        } else {
          out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
        }
      } else {
        out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f));
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------
     Symbol construction
     ------------------------------------------------------------------ */
  function buildCodewords(bytes, version, level) {
    var buffer = new BitBuffer();
    buffer.put(0x4, 4); // byte mode indicator
    buffer.put(bytes.length, version < 10 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) buffer.put(bytes[i], 8);

    var totalDataBits = dataCodewordCount(version, level) * 8;
    var terminator = Math.min(4, totalDataBits - buffer.bits.length);
    buffer.put(0, terminator);

    while (buffer.bits.length % 8 !== 0) buffer.bits.push(0);

    var padBytes = [0xec, 0x11];
    var padIndex = 0;
    while (buffer.bits.length < totalDataBits) {
      buffer.put(padBytes[padIndex % 2], 8);
      padIndex++;
    }

    var codewords = [];
    for (var b = 0; b < buffer.bits.length; b += 8) {
      var value = 0;
      for (var k = 0; k < 8; k++) value = (value << 1) | buffer.bits[b + k];
      codewords.push(value);
    }
    return codewords;
  }

  function interleaveWithEC(dataCodewords, version, level) {
    var spec = EC_BLOCKS[level][version - 1];
    var ecPerBlock = spec[0];
    var group1Blocks = spec[1];
    var group2Blocks = spec[2];
    var totalBlocks = group1Blocks + group2Blocks;
    var totalCodewords = TOTAL_CODEWORDS[version - 1];
    var totalData = totalCodewords - ecPerBlock * totalBlocks;

    var shortBlockLen = Math.floor(totalData / totalBlocks);
    var longBlockCount = totalData % totalBlocks;

    var blocks = [];
    var ecBlocks = [];
    var offset = 0;
    for (var i = 0; i < totalBlocks; i++) {
      var len = shortBlockLen + (i >= totalBlocks - longBlockCount ? 1 : 0);
      var blockData = dataCodewords.slice(offset, offset + len);
      offset += len;
      blocks.push(blockData);
      ecBlocks.push(rsEncode(blockData, ecPerBlock));
    }

    var result = [];
    var maxLen = shortBlockLen + (longBlockCount > 0 ? 1 : 0);
    for (var p = 0; p < maxLen; p++) {
      for (var bIdx = 0; bIdx < blocks.length; bIdx++) {
        if (p < blocks[bIdx].length) result.push(blocks[bIdx][p]);
      }
    }
    for (var q = 0; q < ecPerBlock; q++) {
      for (var e = 0; e < ecBlocks.length; e++) result.push(ecBlocks[e][q]);
    }
    return result;
  }

  function blankMatrix(size) {
    var m = [];
    for (var r = 0; r < size; r++) {
      m.push(new Array(size).fill(null));
    }
    return m;
  }

  function placeFinder(m, row, col) {
    for (var r = -1; r <= 7; r++) {
      for (var c = -1; c <= 7; c++) {
        var rr = row + r;
        var cc = col + c;
        if (rr < 0 || cc < 0 || rr >= m.length || cc >= m.length) continue;
        var inRing = (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
                     (c >= 0 && c <= 6 && (r === 0 || r === 6));
        var inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        m[rr][cc] = (inRing || inCore) ? 1 : 0;
      }
    }
  }

  function placeAlignment(m, version) {
    if (version === 1) return;
    var coords = ALIGNMENT[version - 1];
    for (var i = 0; i < coords.length; i++) {
      for (var j = 0; j < coords.length; j++) {
        var row = coords[i];
        var col = coords[j];
        if (m[row][col] !== null) continue; // overlaps a finder pattern
        for (var r = -2; r <= 2; r++) {
          for (var c = -2; c <= 2; c++) {
            // dark outer ring and dark centre dot, light ring in between
            m[row + r][col + c] = Math.max(Math.abs(r), Math.abs(c)) === 1 ? 0 : 1;
          }
        }
      }
    }
  }

  var ALIGNMENT = [
    [6, 18], [6, 22], [6, 26], [6, 30], [6, 34],
    [6, 22, 38], [6, 24, 42], [6, 26, 46], [6, 28, 50], [6, 30, 54]
  ];

  function placeTiming(m) {
    var size = m.length;
    for (var i = 8; i < size - 8; i++) {
      var bit = i % 2 === 0 ? 1 : 0;
      if (m[6][i] === null) m[6][i] = bit;
      if (m[i][6] === null) m[i][6] = bit;
    }
  }

  function reserveFormatAreas(m) {
    var size = m.length;
    for (var i = 0; i < 9; i++) {
      if (m[8][i] === null) m[8][i] = 'F';
      if (m[i][8] === null) m[i][8] = 'F';
    }
    for (var j = 0; j < 8; j++) {
      if (m[8][size - 1 - j] === null) m[8][size - 1 - j] = 'F';
      if (m[size - 1 - j][8] === null) m[size - 1 - j][8] = 'F';
    }
    m[size - 8][8] = 1; // dark module
  }

  function placeData(m, codewords, version) {
    var size = m.length;
    var bitIndex = 0;
    var totalBits = codewords.length * 8;
    var upward = true;

    for (var col = size - 1; col > 0; col -= 2) {
      if (col === 6) col--; // skip vertical timing column
      for (var i = 0; i < size; i++) {
        var row = upward ? size - 1 - i : i;
        for (var c = 0; c < 2; c++) {
          var cc = col - c;
          if (m[row][cc] !== null) continue;
          var bit = 0;
          if (bitIndex < totalBits) {
            var byteVal = codewords[bitIndex >> 3];
            bit = (byteVal >>> (7 - (bitIndex & 7))) & 1;
          }
          m[row][cc] = bit;
          bitIndex++;
        }
      }
      upward = !upward;
    }
    return bitIndex;
  }

  /* ------------------------------------------------------------------
     Masking
     ------------------------------------------------------------------ */
  var MASK_FUNCS = [
    function (r, c) { return (r + c) % 2 === 0; },
    function (r) { return r % 2 === 0; },
    function (r, c) { return c % 3 === 0; },
    function (r, c) { return (r + c) % 3 === 0; },
    function (r, c) { return (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0; },
    function (r, c) { return ((r * c) % 2) + ((r * c) % 3) === 0; },
    function (r, c) { return (((r * c) % 2) + ((r * c) % 3)) % 2 === 0; },
    function (r, c) { return (((r + c) % 2) + ((r * c) % 3)) % 2 === 0; }
  ];

  function applyMask(modules, isFunction, maskId) {
    var size = modules.length;
    var out = [];
    for (var r = 0; r < size; r++) {
      out.push(modules[r].slice());
      for (var c = 0; c < size; c++) {
        if (isFunction[r][c]) continue;
        if (MASK_FUNCS[maskId](r, c)) out[r][c] ^= 1;
      }
    }
    return out;
  }

  function penaltyScore(m) {
    var size = m.length;
    var score = 0;
    var r, c, i;

    // Rule 1: runs of five or more identical modules in a row or column
    for (r = 0; r < size; r++) {
      var runRow = 1;
      for (c = 1; c < size; c++) {
        if (m[r][c] === m[r][c - 1]) {
          runRow++;
        } else {
          if (runRow >= 5) score += 3 + (runRow - 5);
          runRow = 1;
        }
      }
      if (runRow >= 5) score += 3 + (runRow - 5);
    }
    for (c = 0; c < size; c++) {
      var runCol = 1;
      for (r = 1; r < size; r++) {
        if (m[r][c] === m[r - 1][c]) {
          runCol++;
        } else {
          if (runCol >= 5) score += 3 + (runCol - 5);
          runCol = 1;
        }
      }
      if (runCol >= 5) score += 3 + (runCol - 5);
    }

    // Rule 2: 2x2 blocks of the same colour
    for (r = 0; r < size - 1; r++) {
      for (c = 0; c < size - 1; c++) {
        var v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) {
          score += 3;
        }
      }
    }

    // Rule 3: finder-like patterns 1:1:3:1:1 with four light modules on a side
    var patternA = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
    var patternB = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
    function matchesAt(getter, start, pattern) {
      for (var k = 0; k < pattern.length; k++) {
        if (getter(start + k) !== pattern[k]) return false;
      }
      return true;
    }
    for (r = 0; r < size; r++) {
      for (c = 0; c + 11 <= size; c++) {
        var rowGet = (function (rr) {
          return function (idx) { return m[rr][idx]; };
        })(r);
        if (matchesAt(rowGet, c, patternA) || matchesAt(rowGet, c, patternB)) score += 40;
      }
    }
    for (c = 0; c < size; c++) {
      for (r = 0; r + 11 <= size; r++) {
        var colGet = (function (cc) {
          return function (idx) { return m[idx][cc]; };
        })(c);
        if (matchesAt(colGet, r, patternA) || matchesAt(colGet, r, patternB)) score += 40;
      }
    }

    // Rule 4: proportion of dark modules
    var dark = 0;
    for (r = 0; r < size; r++) {
      for (c = 0; c < size; c++) if (m[r][c]) dark++;
    }
    var percent = (dark * 100) / (size * size);
    var prevMultiple = Math.floor(percent / 5) * 5;
    var nextMultiple = prevMultiple + 5;
    score += Math.min(Math.abs(prevMultiple - 50) / 5, Math.abs(nextMultiple - 50) / 5) * 10;

    return score;
  }

  /* ------------------------------------------------------------------
     Format information
     ------------------------------------------------------------------ */
  function formatBits(level, maskId) {
    var data = (EC_FORMAT_BITS[level] << 3) | maskId;
    var value = data << 10;
    for (var i = 14; i >= 10; i--) {
      if ((value >>> i) & 1) value ^= 0x537 << (i - 10);
    }
    return ((data << 10) | value) ^ 0x5412;
  }

  function placeFormat(m, level, maskId) {
    var size = m.length;
    var bits = formatBits(level, maskId);
    var get = function (i) { return (bits >>> i) & 1; };
    var i;

    // Copy 1, wrapped around the top-left finder. Row/column 6 carry the timing
    // pattern, so both strips jump from index 5 straight to 7.
    for (i = 0; i < 8; i++) {
      var skip = i < 6 ? i : i + 1;
      m[skip][8] = get(i);        // vertical strip: bits 0-7, top to bottom
      m[8][skip] = get(14 - i);   // horizontal strip: bits 14-7, left to right
    }

    // Copy 2, split between the bottom-left and top-right corners.
    for (i = 0; i < 8; i++) {
      m[size - 1 - i][8] = get(14 - i); // bits 14-7, bottom to top
      m[8][size - 1 - i] = get(i);      // bits 0-7, right to left
    }

    m[size - 8][8] = 1; // dark module, always set after the format bits
  }

  function versionBits(version) {
    var rem = version;
    for (var i = 0; i < 12; i++) {
      rem = (rem << 1) ^ ((rem >> 11) * 0x1f25);
    }
    return (version << 12) | (rem & 0xfff);
  }

  function placeVersionInfo(m, version) {
    if (version < 7) return; // versions 1-6 carry no version information
    var size = m.length;
    var bits = versionBits(version);
    var get = function (i) { return (bits >>> i) & 1; };
    for (var i = 0; i < 6; i++) {
      // Lower-left block: three rows, six columns
      m[size - 11][i] = get(i * 3);
      m[size - 10][i] = get(i * 3 + 1);
      m[size - 9][i] = get(i * 3 + 2);
      // Upper-right block: the same three bits transposed
      m[i][size - 11] = get(i * 3);
      m[i][size - 10] = get(i * 3 + 1);
      m[i][size - 9] = get(i * 3 + 2);
    }
  }

  function buildMatrix(bytes, version, level, maskId) {
    var size = version * 4 + 17;
    var m = blankMatrix(size);
    placeFinder(m, 0, 0);
    placeFinder(m, 0, size - 7);
    placeFinder(m, size - 7, 0);
    placeAlignment(m, version);
    placeTiming(m);
    placeVersionInfo(m, version);
    m[size - 8][8] = 1;

    var isFunction = [];
    reserveFormatAreas(m);
    for (var r = 0; r < size; r++) {
      isFunction.push(m[r].map(function (v) { return v !== null; }));
    }

    var data = buildCodewords(bytes, version, level);
    var codewords = interleaveWithEC(data, version, level);
    placeData(m, codewords, version);

    var masked = applyMask(m, isFunction, maskId);
    placeFormat(masked, level, maskId);
    return masked;
  }

  function encode(text, level) {
    var bytes = utf8Bytes(text);
    var version = pickVersion(bytes.length, level);
    if (version === null) return null;

    var bestMask = 0;
    var bestScore = Infinity;
    var bestMatrix = null;
    for (var maskId = 0; maskId < 8; maskId++) {
      var candidate = buildMatrix(bytes, version, level, maskId);
      var score = penaltyScore(candidate);
      if (score < bestScore) {
        bestScore = score;
        bestMask = maskId;
        bestMatrix = candidate;
      }
    }
    return {
      matrix: bestMatrix,
      version: version,
      mask: bestMask,
      byteLength: bytes.length,
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
