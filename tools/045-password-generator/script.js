/* Password Generator — vanilla JS, all work happens locally in the browser. */
(function () {
  'use strict';

  var SETS = {
    lower: 'abcdefghijklmnopqrstuvwxyz',
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    digits: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{};:,.<>?/'
  };
  var AMBIGUOUS = '0Oo1lI|';

  var el = {
    length: document.getElementById('length'),
    lengthOut: document.getElementById('lengthOut'),
    count: document.getElementById('count'),
    genBtn: document.getElementById('genBtn'),
    useLower: document.getElementById('useLower'),
    useUpper: document.getElementById('useUpper'),
    useDigits: document.getElementById('useDigits'),
    useSymbols: document.getElementById('useSymbols'),
    noAmbiguous: document.getElementById('noAmbiguous'),
    setError: document.getElementById('setError'),
    output: document.getElementById('output'),
    copyBtn: document.getElementById('copyBtn'),
    copyMsg: document.getElementById('copyMsg'),
    batchWrap: document.getElementById('batchWrap'),
    batchList: document.getElementById('batchList'),
    entropyOut: document.getElementById('entropyOut'),
    strengthOut: document.getElementById('strengthOut'),
    poolOut: document.getElementById('poolOut'),
    crackOut: document.getElementById('crackOut'),
    strengthBar: document.getElementById('strengthBar'),
    adviceOut: document.getElementById('adviceOut'),
    chart: document.getElementById('entropyChart'),
    year: document.getElementById('year')
  };

  if (el.year) el.year.textContent = new Date().getFullYear();

  function randomInt(max) {
    // Uniform, unbiased index in [0, max) using crypto when available.
    if (max <= 0) return 0;
    var cryptoObj = window.crypto || window.msCrypto;
    if (cryptoObj && cryptoObj.getRandomValues) {
      var limit = Math.floor(0xFFFFFFFF / max) * max;
      var arr = new Uint32Array(1);
      var value;
      do {
        cryptoObj.getRandomValues(arr);
        value = arr[0];
      } while (value >= limit);
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function buildPool() {
    var pool = '';
    if (el.useLower.checked) pool += SETS.lower;
    if (el.useUpper.checked) pool += SETS.upper;
    if (el.useDigits.checked) pool += SETS.digits;
    if (el.useSymbols.checked) pool += SETS.symbols;
    if (el.noAmbiguous.checked) {
      pool = pool.split('').filter(function (c) {
        return AMBIGUOUS.indexOf(c) === -1;
      }).join('');
    }
    return pool;
  }

  function generate(pool, length) {
    var out = '';
    for (var i = 0; i < length; i++) {
      out += pool.charAt(randomInt(pool.length));
    }
    return out;
  }

  function humanTime(seconds) {
    if (!isFinite(seconds)) return 'effectively forever';
    if (seconds < 1) return 'under a second';
    var units = [
      ['second', 1], ['minute', 60], ['hour', 3600], ['day', 86400],
      ['month', 2629800], ['year', 31557600]
    ];
    if (seconds < 31557600) {
      for (var i = units.length - 1; i >= 0; i--) {
        if (seconds >= units[i][1]) {
          var n = Math.round(seconds / units[i][1]);
          return n + ' ' + units[i][0] + (n === 1 ? '' : 's');
        }
      }
    }
    var years = seconds / 31557600;
    if (years < 1e3) return Math.round(years) + ' years';
    if (years < 1e6) return (years / 1e3).toFixed(1) + ' thousand years';
    if (years < 1e9) return (years / 1e6).toFixed(1) + ' million years';
    if (years < 1e12) return (years / 1e9).toFixed(1) + ' billion years';
    return 'over a trillion years';
  }

  function strengthLabel(bits) {
    if (bits < 40) return { label: 'Very weak', color: '#c0392b', pct: 15 };
    if (bits < 60) return { label: 'Weak', color: '#e67e22', pct: 35 };
    if (bits < 80) return { label: 'Fair', color: '#d4a017', pct: 55 };
    if (bits < 100) return { label: 'Strong', color: '#7b1fbd', pct: 78 };
    if (bits < 128) return { label: 'Very strong', color: '#60089c', pct: 92 };
    return { label: 'Excellent', color: '#45046f', pct: 100 };
  }

  function update() {
    var length = parseInt(el.length.value, 10);
    if (isNaN(length)) length = 16;
    el.lengthOut.textContent = length;

    var pool = buildPool();
    var hasSet = pool.length > 0;
    el.setError.classList.toggle('d-none', hasSet);

    var bits = hasSet ? length * Math.log2(pool.length) : 0;
    var strength = strengthLabel(bits);

    el.entropyOut.textContent = hasSet ? bits.toFixed(1) : '0';
    el.strengthOut.textContent = hasSet ? strength.label : '—';
    el.poolOut.textContent = 'pool size ' + pool.length;

    var guesses = hasSet ? Math.pow(2, bits) : 0;
    el.crackOut.textContent = hasSet ? humanTime(guesses / 1e11) : '—';

    el.strengthBar.style.width = (hasSet ? strength.pct : 0) + '%';
    el.strengthBar.style.backgroundColor = strength.color;
    el.strengthBar.setAttribute('aria-valuenow', String(hasSet ? strength.pct : 0));

    var advice = 'Choose your options, then generate a password.';
    if (!hasSet) {
      advice = 'Select at least one character set to build a pool.';
    } else if (bits < 60) {
      advice = 'That is below the 60-bit mark. Increase the length for anything important.';
    } else if (bits < 80) {
      advice = 'Usable for low-value accounts. Push toward 80 bits or more for email and banking.';
    } else {
      advice = 'Good margin. Pair it with a password manager and enable two-factor authentication.';
    }
    el.adviceOut.textContent = advice;

    el.genBtn.disabled = !hasSet;
    if (!hasSet) {
      el.output.value = '';
      el.batchWrap.classList.add('d-none');
      el.copyMsg.textContent = '';
    }

    drawChart(pool.length);
    return { pool: pool, length: length, bits: bits, hasSet: hasSet };
  }

  function drawChart(poolSize) {
    var canvas = el.chart;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var lengths = [8, 12, 16, 20, 24, 32];
    var current = parseInt(el.length.value, 10) || 16;
    if (lengths.indexOf(current) === -1) lengths.push(current);
    lengths.sort(function (a, b) { return a - b; });

    var vals = lengths.map(function (n) {
      return poolSize > 0 ? n * Math.log2(poolSize) : 0;
    });
    var max = Math.max.apply(null, vals.concat([1]));

    var padL = 42, padR = 12, padT = 16, padB = 30;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    // axis
    ctx.strokeStyle = '#e0d6ea';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // gridlines + labels
    ctx.fillStyle = '#6a5a79';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    var steps = 4;
    for (var s = 0; s <= steps; s++) {
      var v = (max / steps) * s;
      var y = padT + plotH - (plotH * s / steps);
      ctx.fillText(Math.round(v) + '', padL - 6, y + 4);
      if (s > 0) {
        ctx.strokeStyle = '#f0e9f7';
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + plotW, y);
        ctx.stroke();
      }
    }

    var barGap = 8;
    var barW = Math.max(10, (plotW - barGap * (lengths.length + 1)) / lengths.length);

    lengths.forEach(function (n, i) {
      var val = vals[i];
      var h = max > 0 ? (val / max) * plotH : 0;
      var x = padL + barGap + i * (barW + barGap);
      var y = padT + plotH - h;

      var isCurrent = n === current;
      ctx.fillStyle = isCurrent ? '#60089c' : '#c9a8e6';
      ctx.fillRect(x, y, barW, h);

      ctx.fillStyle = '#4b3d59';
      ctx.font = '11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(n + '', x + barW / 2, padT + plotH + 15);
      if (val > 0) {
        ctx.fillStyle = isCurrent ? '#45046f' : '#6a5a79';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(Math.round(val) + '', x + barW / 2, y - 3);
      }
    });

    ctx.fillStyle = '#6a5a79';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('length (characters)', padL + plotW / 2, H - 3);
  }

  function run() {
    var state = update();
    el.copyMsg.textContent = '';
    if (!state.hasSet) return;

    el.output.value = generate(state.pool, state.length);

    var count = parseInt(el.count.value, 10) || 1;
    if (count > 1) {
      el.batchList.innerHTML = '';
      for (var i = 0; i < count; i++) {
        var li = document.createElement('li');
        li.className = 'font-monospace';
        li.textContent = generate(state.pool, state.length);
        el.batchList.appendChild(li);
      }
      el.batchWrap.classList.remove('d-none');
    } else {
      el.batchWrap.classList.add('d-none');
    }
  }

  function copy() {
    if (!el.output.value) {
      el.copyMsg.className = 'small text-muted mb-3';
      el.copyMsg.textContent = 'Generate a password first.';
      return;
    }
    var done = function () {
      el.copyMsg.className = 'small text-success mb-3';
      el.copyMsg.textContent = 'Copied to clipboard.';
    };
    var fail = function () {
      el.output.select();
      el.copyMsg.className = 'small text-muted mb-3';
      el.copyMsg.textContent = 'Press Ctrl/Cmd + C to copy.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(el.output.value).then(done, fail);
    } else {
      fail();
    }
  }

  el.genBtn.addEventListener('click', run);
  el.copyBtn.addEventListener('click', copy);

  [el.length, el.count, el.useLower, el.useUpper, el.useDigits, el.useSymbols, el.noAmbiguous].forEach(function (node) {
    node.addEventListener('input', update);
    node.addEventListener('change', update);
  });

  update();
  run();
})();
