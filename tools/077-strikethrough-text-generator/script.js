(function () {
  'use strict';

  var MAX_CHARS = 400;
  var SAMPLE = 'Limited time offer';

  var STROKES = {
    long: '\u0336',
    short: '\u0335',
    slash: '\u0338',
    shortSlash: '\u0337',
    wave: '\u0334',
    underline: '\u0332'
  };

  function buildMathMap(upperStart, lowerStart, digitStart, exceptions) {
    var map = {};
    var i, code;
    for (i = 0; i < 26; i++) {
      map[String.fromCharCode(65 + i)] = String.fromCodePoint(upperStart + i);
      map[String.fromCharCode(97 + i)] = String.fromCodePoint(lowerStart + i);
    }
    if (digitStart) {
      for (i = 0; i < 10; i++) {
        map[String.fromCharCode(48 + i)] = String.fromCodePoint(digitStart + i);
      }
    }
    if (exceptions) {
      Object.keys(exceptions).forEach(function (key) {
        map[key] = String.fromCodePoint(exceptions[key]);
      });
    }
    return map;
  }

  var BOLD = buildMathMap(0x1d400, 0x1d41a, 0x1d7ce, null);
  var ITALIC = buildMathMap(0x1d434, 0x1d44e, null, { h: 0x210e });

  function mapChars(text, map) {
    return Array.from(text).map(function (ch) {
      return map[ch] || ch;
    }).join('');
  }

  function isWhitespace(ch) {
    return /^\s$/.test(ch);
  }

  function strike(text, mark, keepSpace) {
    return Array.from(text).map(function (ch) {
      if (keepSpace !== false && isWhitespace(ch)) {
        return ch;
      }
      // Pictographs have no combining-mark anchor: the stroke lands beside the glyph.
      if (isPictograph(ch)) {
        return ch;
      }
      return ch + mark;
    }).join('');
  }

  var PICTO = /[\p{Extended_Pictographic}\p{Emoji_Presentation}]/u;

  function isPictograph(ch) {
    try {
      return PICTO.test(ch);
    } catch (err) {
      return false;
    }
  }

  var STYLES = [
    {
      id: 'standard',
      name: 'Standard strikethrough',
      note: 'One continuous line, U+0336',
      apply: function (t) { return strike(t, STROKES.long); }
    },
    {
      id: 'short',
      name: 'Short strikethrough',
      note: 'Dashed stroke, U+0335',
      apply: function (t) { return strike(t, STROKES.short); }
    },
    {
      id: 'double',
      name: 'Double strikethrough',
      note: 'Two stacked strokes',
      apply: function (t) { return strike(t, STROKES.long + STROKES.long); }
    },
    {
      id: 'slash',
      name: 'Slash through',
      note: 'Diagonal rule, U+0338',
      apply: function (t) { return strike(t, STROKES.slash); }
    },
    {
      id: 'short-slash',
      name: 'Short slash',
      note: 'Light diagonal, U+0337',
      apply: function (t) { return strike(t, STROKES.shortSlash); }
    },
    {
      id: 'wave',
      name: 'Wavy strike',
      note: 'Tilde overlay, U+0334',
      apply: function (t) { return strike(t, STROKES.wave); }
    },
    {
      id: 'bold',
      name: 'Bold strikethrough',
      note: 'Math bold letters + stroke',
      apply: function (t) { return strike(mapChars(t, BOLD), STROKES.long); }
    },
    {
      id: 'italic',
      name: 'Italic strikethrough',
      note: 'Math italic letters + stroke',
      apply: function (t) { return strike(mapChars(t, ITALIC), STROKES.long); }
    },
    {
      id: 'underline',
      name: 'Strike plus underline',
      note: 'Stroke over, rule under',
      apply: function (t) { return strike(t, STROKES.long + STROKES.underline); }
    },
    {
      id: 'heavy',
      name: 'Bold slash through',
      note: 'Math bold letters + slash',
      apply: function (t) { return strike(mapChars(t, BOLD), STROKES.slash); }
    }
  ];

  var els = {
    input: document.getElementById('sourceText'),
    sample: document.getElementById('sampleBtn'),
    clear: document.getElementById('clearBtn'),
    download: document.getElementById('downloadBtn'),
    count: document.getElementById('charCount'),
    preview: document.getElementById('previewText'),
    previewMeta: document.getElementById('previewMeta'),
    results: document.getElementById('results'),
    empty: document.getElementById('emptyState'),
    chart: document.getElementById('coverageChart'),
    chartSummary: document.getElementById('chartSummary'),
    htmlOut: document.getElementById('htmlOut'),
    copyHtml: document.getElementById('copyHtmlBtn'),
    status: document.getElementById('status')
  };

  var visibleChars = [];

  function analyseVisibleChars(text) {
    return Array.from(text).filter(function (ch) {
      return !isWhitespace(ch);
    });
  }

  function coverage(style) {
    if (!visibleChars.length) { return 0; }
    var supported = 0;
    visibleChars.forEach(function (ch) {
      var ok;
      if (style.id === 'bold' || style.id === 'italic' || style.id === 'heavy') {
        ok = Object.prototype.hasOwnProperty.call(style.id === 'italic' ? ITALIC : BOLD, ch);
      } else {
        ok = !isPictograph(ch);
      }
      if (ok) { supported++; }
    });
    return Math.round((supported / visibleChars.length) * 100);
  }

  function setStatus(message) {
    els.status.textContent = message;
  }

  function copyText(value, label) {
    if (!value) { return; }
    function done() {
      setStatus('Copied: ' + label);
    }
    function fallback() {
      var helper = document.createElement('textarea');
      helper.value = value;
      helper.setAttribute('readonly', 'readonly');
      helper.style.position = 'fixed';
      helper.style.top = '-1000px';
      document.body.appendChild(helper);
      helper.select();
      try {
        document.execCommand('copy');
        done();
      } catch (err) {
        setStatus('Copy failed - select the text and press Ctrl/Cmd + C.');
      }
      document.body.removeChild(helper);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, fallback);
    } else {
      fallback();
    }
  }

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildResultCard(style, text) {
    var col = document.createElement('div');
    col.className = 'col-md-6 mb-3';

    var card = document.createElement('div');
    card.className = 'card style-card h-100';

    var body = document.createElement('div');
    body.className = 'card-body d-flex flex-column';

    var head = document.createElement('div');
    head.className = 'd-flex align-items-center justify-content-between mb-1';

    var name = document.createElement('span');
    name.className = 'style-name';
    name.textContent = style.name;

    var pill = document.createElement('span');
    pill.className = 'coverage-pill';
    pill.textContent = coverage(style) + '% coverage';

    head.appendChild(name);
    head.appendChild(pill);

    var note = document.createElement('p');
    note.className = 'style-note mb-2';
    note.textContent = style.note;

    var output = document.createElement('textarea');
    output.className = 'style-output';
    output.readOnly = true;
    output.rows = 2;
    output.value = style.apply(text);
    output.setAttribute('aria-label', style.name + ' output');
    output.setAttribute('spellcheck', 'false');

    var actions = document.createElement('div');
    actions.className = 'mt-2';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-theme';
    btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      copyText(output.value, style.name);
    });

    actions.appendChild(btn);

    body.appendChild(head);
    body.appendChild(note);
    body.appendChild(output);
    body.appendChild(actions);
    card.appendChild(body);
    col.appendChild(card);

    return col;
  }

  function drawChart() {
    var canvas = els.chart;
    if (!canvas || !canvas.getContext) { return; }

    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 600;
    var cssHeight = 320;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);

    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var labelWidth = 150;
    var chartWidth = Math.max(60, cssWidth - labelWidth - 46);
    var rowHeight = (cssHeight - 16) / STYLES.length;

    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textBaseline = 'middle';

    STYLES.forEach(function (style, index) {
      var value = coverage(style);
      var y = 8 + index * rowHeight;
      var barHeight = Math.min(16, rowHeight - 8);
      var barY = y + (rowHeight - barHeight) / 2 - 3;

      ctx.fillStyle = '#6b5f77';
      ctx.textAlign = 'right';
      var label = style.name.length > 22 ? style.name.slice(0, 21) + '\u2026' : style.name;
      ctx.fillText(label, labelWidth - 10, y + rowHeight / 2 - 3);

      ctx.fillStyle = '#f2e9fb';
      ctx.fillRect(labelWidth, barY, chartWidth, barHeight);

      var gradient = ctx.createLinearGradient(labelWidth, 0, labelWidth + chartWidth, 0);
      gradient.addColorStop(0, '#9a4dd0');
      gradient.addColorStop(1, '#60089c');
      ctx.fillStyle = gradient;
      ctx.fillRect(labelWidth, barY, Math.max(2, (chartWidth * value) / 100), barHeight);

      ctx.fillStyle = '#4b0779';
      ctx.textAlign = 'left';
      ctx.fillText(value + '%', labelWidth + chartWidth + 6, y + rowHeight / 2 - 3);
    });
  }

  function updateSummary() {
    if (!visibleChars.length) {
      els.chartSummary.textContent = 'Type something to measure coverage.';
      return;
    }
    var best = STYLES.slice().sort(function (a, b) { return coverage(b) - coverage(a); })[0];
    var worst = STYLES.slice().sort(function (a, b) { return coverage(a) - coverage(b); })[0];
    els.chartSummary.textContent =
      visibleChars.length + ' visible characters measured. Best fit: ' + best.name +
      ' (' + coverage(best) + '%). Lowest: ' + worst.name + ' (' + coverage(worst) + '%).';
  }

  function render() {
    var text = els.input.value.slice(0, MAX_CHARS);
    if (els.input.value.length > MAX_CHARS) {
      els.input.value = text;
    }

    els.count.textContent = text.length + ' / ' + MAX_CHARS + ' characters';
    visibleChars = analyseVisibleChars(text);

    var trimmed = text.trim();

    if (trimmed) {
      els.preview.textContent = STYLES[0].apply(text);
      els.previewMeta.textContent =
        'Standard strikethrough \u00b7 ' + trimmed.length + ' characters, ' +
        visibleChars.length + ' visible.';
    } else {
      els.preview.textContent = 'Nothing to strike yet';
      els.previewMeta.textContent = 'Start typing to see the standard strikethrough.';
    }

    els.results.innerHTML = '';
    if (trimmed) {
      els.empty.classList.add('d-none');
      STYLES.forEach(function (style) {
        els.results.appendChild(buildResultCard(style, text));
      });
    } else {
      els.empty.classList.remove('d-none');
    }

    els.htmlOut.textContent = trimmed
      ? '<del>' + escapeHtml(text) + '</del>'
      : '<del>your text</del>';

    drawChart();
    updateSummary();
  }

  function downloadAll() {
    var text = els.input.value.trim();
    if (!text) {
      setStatus('Type something first, then download.');
      els.input.focus();
      return;
    }
    var lines = ['Strikethrough styles for: ' + text, ''];
    STYLES.forEach(function (style) {
      lines.push(style.name + ':');
      lines.push(style.apply(text));
      lines.push('');
    });
    var blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = 'strikethrough-styles.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    setStatus('Downloaded strikethrough-styles.txt');
  }

  els.input.addEventListener('input', render);

  els.sample.addEventListener('click', function () {
    els.input.value = SAMPLE;
    render();
    els.input.focus();
    setStatus('Sample loaded - copy any style you like.');
  });

  els.clear.addEventListener('click', function () {
    els.input.value = '';
    render();
    els.input.focus();
    setStatus('Cleared.');
  });

  els.download.addEventListener('click', downloadAll);

  els.copyHtml.addEventListener('click', function () {
    copyText(els.htmlOut.textContent, 'HTML <del> snippet');
  });

  window.addEventListener('resize', drawChart);

  render();
})();
