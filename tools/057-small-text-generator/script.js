/* Small Text Generator - vanilla JS, no dependencies */
(function () {
  'use strict';

  var SUPER = {
    a: '\u1d43', b: '\u1d47', c: '\u1d9c', d: '\u1d48', e: '\u1d49', f: '\u1da0',
    g: '\u1d4d', h: '\u02b0', i: '\u2071', j: '\u02b2', k: '\u1d4f', l: '\u02e1',
    m: '\u1d50', n: '\u207f', o: '\u1d52', p: '\u1d56', q: 'q', r: '\u02b3',
    s: '\u02e2', t: '\u1d57', u: '\u1d58', v: '\u1d5b', w: '\u02b7', x: '\u02e3',
    y: '\u02b8', z: '\u1dbb',
    A: '\u1d2c', B: '\u1d2e', D: '\u1d30', E: '\u1d31', G: '\u1d33', H: '\u1d34',
    I: '\u1d35', J: '\u1d36', K: '\u1d37', L: '\u1d38', M: '\u1d39', N: '\u1d3a',
    O: '\u1d3c', P: '\u1d3e', R: '\u1d3f', T: '\u1d40', U: '\u1d41', V: '\u2c7d',
    W: '\u1d42',
    '0': '\u2070', '1': '\u00b9', '2': '\u00b2', '3': '\u00b3', '4': '\u2074',
    '5': '\u2075', '6': '\u2076', '7': '\u2077', '8': '\u2078', '9': '\u2079',
    '+': '\u207a', '-': '\u207b', '=': '\u207c', '(': '\u207d', ')': '\u207e'
  };

  var SUB = {
    a: '\u2090', e: '\u2091', h: '\u2095', i: '\u1d62', j: '\u2c7c', k: '\u2096',
    l: '\u2097', m: '\u2098', n: '\u2099', o: '\u2092', p: '\u209a', r: '\u1d63',
    s: '\u209b', t: '\u209c', u: '\u1d64', v: '\u1d65', x: '\u2093',
    '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083', '4': '\u2084',
    '5': '\u2085', '6': '\u2086', '7': '\u2087', '8': '\u2088', '9': '\u2089',
    '+': '\u208a', '-': '\u208b', '=': '\u208c', '(': '\u208d', ')': '\u208e'
  };

  var els = {
    form: document.getElementById('smallForm'),
    input: document.getElementById('textInput'),
    charCount: document.getElementById('charCount'),
    keepUnmapped: document.getElementById('keepUnmapped'),
    autoConvert: document.getElementById('autoConvert'),
    errorBox: document.getElementById('errorBox'),
    results: document.getElementById('results'),
    resultList: document.getElementById('resultList'),
    coverage: document.getElementById('coverageChart'),
    coverageSummary: document.getElementById('coverageSummary'),
    statTotal: document.getElementById('statTotal'),
    statConverted: document.getElementById('statConverted'),
    statUnchanged: document.getElementById('statUnchanged'),
    statCoverage: document.getElementById('statCoverage'),
    copyBtn: document.getElementById('copyBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    sampleBtn: document.getElementById('sampleBtn'),
    resetBtn: document.getElementById('resetBtn')
  };

  var lastOutput = '';
  var lastStats = null;

  function mapChar(ch, table) {
    return Object.prototype.hasOwnProperty.call(table, ch) ? table[ch] : null;
  }

  function convert(text, table, keepUnmapped) {
    var out = '';
    var converted = 0;
    var total = 0;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      total++;
      var mapped = mapChar(ch, table);
      if (mapped !== null) {
        out += mapped;
        converted++;
      } else if (keepUnmapped) {
        out += ch;
      }
    }
    return { text: out, converted: converted, total: total, unchanged: total - converted };
  }

  function selectedStyle() {
    var radios = document.querySelectorAll('input[name="smallStyle"]');
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) return radios[i].value;
    }
    return 'super';
  }

  function showError(message) {
    els.errorBox.textContent = message;
    els.errorBox.classList.remove('d-none');
  }

  function clearError() {
    els.errorBox.textContent = '';
    els.errorBox.classList.add('d-none');
  }

  function buildResultCard(label, value) {
    var card = document.createElement('div');
    card.className = 'result-card';

    var head = document.createElement('div');
    head.className = 'result-head';

    var title = document.createElement('span');
    title.className = 'result-label';
    title.textContent = label;

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-secondary';
    btn.textContent = 'Copy';
    btn.setAttribute('aria-label', 'Copy the ' + label + ' result');
    btn.addEventListener('click', function () {
      copyText(value, btn);
    });

    head.appendChild(title);
    head.appendChild(btn);

    var body = document.createElement('div');
    body.className = 'result-body';
    body.textContent = value;

    card.appendChild(head);
    card.appendChild(body);
    return card;
  }

  function copyText(value, btn) {
    var done = function () {
      var original = btn.textContent;
      btn.textContent = 'Copied';
      window.setTimeout(function () { btn.textContent = original; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value, done); });
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    var ta = document.createElement('textarea');
    ta.value = value;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* clipboard blocked */ }
    document.body.removeChild(ta);
  }

  function drawChart(converted, unchanged) {
    var canvas = els.coverage;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var padLeft = 44;
    var padBottom = 40;
    var padTop = 24;
    var chartW = w - padLeft - 24;
    var chartH = h - padBottom - padTop;
    var maxVal = Math.max(converted, unchanged, 1);
    var bars = [
      { label: 'Converted', value: converted, color: '#60089c' },
      { label: 'Unchanged', value: unchanged, color: '#c9a9e8' }
    ];
    var slot = chartW / bars.length;
    var barW = Math.min(96, slot * 0.55);

    ctx.strokeStyle = '#e8e0f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + chartH);
    ctx.lineTo(padLeft + chartW, padTop + chartH);
    ctx.stroke();

    ctx.font = '12px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#5c5468';
    ctx.textAlign = 'right';
    ctx.fillText(String(maxVal), padLeft - 8, padTop + 10);
    ctx.fillText('0', padLeft - 8, padTop + chartH + 4);

    bars.forEach(function (bar, i) {
      var barH = (bar.value / maxVal) * chartH;
      var x = padLeft + slot * i + (slot - barW) / 2;
      var y = padTop + chartH - barH;
      ctx.fillStyle = bar.color;
      ctx.fillRect(x, y, barW, barH);

      ctx.fillStyle = '#241c2e';
      ctx.textAlign = 'center';
      ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(String(bar.value), x + barW / 2, y - 6);

      ctx.fillStyle = '#5c5468';
      ctx.font = '12px "Segoe UI", Arial, sans-serif';
      ctx.fillText(bar.label, x + barW / 2, padTop + chartH + 20);
    });
  }

  function render() {
    clearError();
    var raw = els.input.value;

    if (!raw || !raw.trim()) {
      els.results.classList.add('d-none');
      showError('Enter some text first - even a single word will do.');
      return;
    }

    var text = raw.trim();
    var keep = els.keepUnmapped.checked;
    var style = selectedStyle();
    var superRes = convert(text, SUPER, keep);
    var subRes = convert(text, SUB, keep);

    if (superRes.converted === 0 && subRes.converted === 0) {
      els.results.classList.add('d-none');
      showError('None of these characters have a small form. Try adding letters or digits.');
      return;
    }

    els.resultList.innerHTML = '';
    var primary;
    if (style === 'super') {
      els.resultList.appendChild(buildResultCard('Superscript (raised)', superRes.text));
      primary = superRes.text;
      lastStats = superRes;
    } else if (style === 'sub') {
      els.resultList.appendChild(buildResultCard('Subscript (lowered)', subRes.text));
      primary = subRes.text;
      lastStats = subRes;
    } else {
      els.resultList.appendChild(buildResultCard('Superscript (raised)', superRes.text));
      els.resultList.appendChild(buildResultCard('Subscript (lowered)', subRes.text));
      primary = superRes.text;
      lastStats = superRes;
    }

    lastOutput = primary;

    var total = superRes.total;
    var converted = superRes.converted;
    var unchanged = total - converted;
    var coverage = total > 0 ? Math.round((converted / total) * 100) : 0;

    els.statTotal.textContent = total;
    els.statConverted.textContent = converted;
    els.statUnchanged.textContent = unchanged;
    els.statCoverage.textContent = coverage + '%';
    els.coverageSummary.textContent = converted + ' of ' + total +
      ' characters were converted to small text (' + coverage + '% coverage).';
    drawChart(converted, unchanged);

    els.results.classList.remove('d-none');
  }

  els.input.addEventListener('input', function () {
    els.charCount.textContent = els.input.value.length;
    if (els.autoConvert.checked) render();
  });

  els.form.addEventListener('submit', function (e) {
    e.preventDefault();
    render();
  });

  els.form.addEventListener('reset', function () {
    window.setTimeout(function () {
      els.charCount.textContent = '0';
      els.results.classList.add('d-none');
      clearError();
      lastOutput = '';
    }, 0);
  });

  els.sampleBtn.addEventListener('click', function () {
    els.input.value = 'Small text, big impact - H2O and 1st place';
    els.charCount.textContent = els.input.value.length;
    render();
  });

  els.copyBtn.addEventListener('click', function () {
    if (!lastOutput) {
      showError('Generate a result before copying.');
      return;
    }
    copyText(lastOutput, els.copyBtn);
  });

  els.downloadBtn.addEventListener('click', function () {
    if (!lastOutput) {
      showError('Generate a result before downloading.');
      return;
    }
    var blob = new Blob([lastOutput], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'small-text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
