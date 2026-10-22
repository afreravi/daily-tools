/* UTM Link Builder — vanilla JS, no build step. */
(function () {
  'use strict';

  var MAX_LINK = 2000;
  var SOFT_LINK = 300;
  var MAX_VALUE = 500;

  var PARAMS = [
    { id: 'utmSource', name: 'utm_source', required: true },
    { id: 'utmMedium', name: 'utm_medium', required: true },
    { id: 'utmCampaign', name: 'utm_campaign', required: true },
    { id: 'utmId', name: 'utm_id', required: false },
    { id: 'utmTerm', name: 'utm_term', required: false },
    { id: 'utmContent', name: 'utm_content', required: false }
  ];

  var PRESETS = {
    'google-cpc': { source: 'google', medium: 'cpc' },
    'facebook-paid': { source: 'facebook', medium: 'paid_social' },
    'newsletter': { source: 'newsletter', medium: 'email' },
    'linkedin-organic': { source: 'linkedin', medium: 'social' },
    'youtube-video': { source: 'youtube', medium: 'video' },
    'affiliate': { source: 'partner', medium: 'affiliate' }
  };

  var CHART_COLORS = ['#60089c', '#7a1fbd', '#9d5ad4', '#b57fe0', '#cba3ea', '#e0c7f4'];

  var el = {};
  var lastUrl = '';

  function $(id) { return document.getElementById(id); }

  function cacheEls() {
    el.baseUrl = $('baseUrl');
    el.presetSelect = $('presetSelect');
    el.caseMode = $('caseMode');
    el.chkSpaces = $('chkSpaces');
    el.buildBtn = $('buildBtn');
    el.resetBtn = $('resetBtn');
    el.copyBtn = $('copyBtn');
    el.openBtn = $('openBtn');
    el.copyNote = $('copyNote');
    el.outputUrl = $('outputUrl');
    el.emptyState = $('emptyState');
    el.resultWrap = $('resultWrap');
    el.statLength = $('statLength');
    el.statParams = $('statParams');
    el.statStatus = $('statStatus');
    el.statTags = $('statTags');
    el.breakdownBody = $('breakdownBody');
    el.warnBox = $('warnBox');
    el.chartFallback = $('chartFallback');
    el.urlChart = $('urlChart');
    PARAMS.forEach(function (p) { el[p.id] = $(p.id); });
  }

  /* ---------- input helpers ---------- */

  function normalise(raw, forceLower, spacesToUnderscore) {
    var v = String(raw == null ? '' : raw).trim();
    if (spacesToUnderscore) {
      v = v.replace(/\s+/g, '_');
    }
    if (forceLower) {
      v = v.toLowerCase();
    }
    return v;
  }

  function setFieldState(input, errorId, message) {
    var err = $(errorId);
    if (message) {
      input.classList.add('is-invalid');
      if (err) { err.textContent = message; }
      return false;
    }
    input.classList.remove('is-invalid');
    return true;
  }

  function clearFieldStates() {
    PARAMS.forEach(function (p) { el[p.id].classList.remove('is-invalid'); });
    el.baseUrl.classList.remove('is-invalid');
  }

  /* ---------- URL parsing ---------- */

  function parseBase(raw) {
    var text = String(raw || '').trim();
    if (!text) {
      return { error: 'Enter a landing page URL, for example https://example.com/pricing' };
    }
    var candidate = text;
    if (!/^[a-zA-Z][a-zA-Z0-9+.\-]*:\/\//.test(candidate)) {
      candidate = 'https://' + candidate;
    }
    var parsed;
    try {
      parsed = new URL(candidate);
    } catch (e) {
      return { error: 'That does not look like a valid URL. Check for typos.' };
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { error: 'Only http:// and https:// addresses can be tagged.' };
    }
    if (!parsed.hostname || parsed.hostname.indexOf('.') === -1) {
      return { error: 'The address needs a full domain, for example example.com/page' };
    }

    var hash = '';
    var hashIndex = candidate.indexOf('#');
    if (hashIndex !== -1) {
      hash = candidate.slice(hashIndex);
      candidate = candidate.slice(0, hashIndex);
    }
    var qIndex = candidate.indexOf('?');
    var pathPart = qIndex === -1 ? candidate : candidate.slice(0, qIndex);
    var query = qIndex === -1 ? '' : candidate.slice(qIndex + 1);

    var pairs = [];
    if (query) {
      query.split('&').forEach(function (chunk) {
        if (chunk) { pairs.push(chunk); }
      });
    }

    return {
      origin: parsed.hostname,
      pathPart: pathPart,
      pairs: pairs,
      hash: hash
    };
  }

  function keyOf(pair) {
    var eq = pair.indexOf('=');
    var raw = eq === -1 ? pair : pair.slice(0, eq);
    try { return decodeURIComponent(raw).toLowerCase(); } catch (e) { return raw.toLowerCase(); }
  }

  /* ---------- build ---------- */

  function collectValues(showErrors) {
    var forceLower = el.caseMode.value === 'lower';
    var spaces = el.chkSpaces.checked;
    var ok = true;

    PARAMS.forEach(function (p) {
      var value = normalise(el[p.id].value, forceLower, spaces);
      var message = '';
      if (!value && p.required) {
        message = 'This field is required for a trackable link.';
      } else if (value && /\s/.test(value)) {
        message = 'Remove the spaces, or tick "replace spaces with underscores".';
      } else if (value.length > MAX_VALUE) {
        message = 'Keep this under ' + MAX_VALUE + ' characters.';
      }
      if (showErrors) {
        setFieldState(el[p.id], p.id + 'Error', message);
      }
      if (message) { ok = false; }
      p.value = value;
    });

    return ok;
  }

  function build(showErrors) {
    if (showErrors) {
      clearFieldStates();
      el.copyNote.textContent = '';
    }

    var base = parseBase(el.baseUrl.value);
    if (base.error) {
      if (showErrors) {
        setFieldState(el.baseUrl, 'baseUrlError', base.error);
        el.resultWrap.classList.add('d-none');
        el.emptyState.classList.remove('d-none');
      }
      return false;
    }
    if (showErrors) {
      setFieldState(el.baseUrl, 'baseUrlError', '');
    }

    var fieldsOk = collectValues(showErrors);
    if (!fieldsOk) {
      if (showErrors) {
        el.resultWrap.classList.add('d-none');
        el.emptyState.classList.remove('d-none');
      }
      return false;
    }

    var active = PARAMS.filter(function (p) { return p.value; });
    var activeKeys = active.map(function (p) { return p.name; });

    var kept = base.pairs.filter(function (pair) {
      return activeKeys.indexOf(keyOf(pair)) === -1;
    });

    var current = base.pathPart + (kept.length ? '?' + kept.join('&') : '');
    var rows = [{ param: 'Base URL', value: base.pathPart, chars: current.length, base: true }];

    active.forEach(function (p) {
      var separator = current.indexOf('?') === -1 ? '?' : '&';
      var addition = separator + p.name + '=' + encodeURIComponent(p.value);
      current += addition;
      rows.push({ param: p.name, value: p.value, chars: addition.length });
    });

    var finalUrl = current + base.hash;
    render(finalUrl, rows, base, active.length, fieldsOk);
    return true;
  }

  function render(finalUrl, rows, base, tagCount, fieldsOk) {
    lastUrl = finalUrl;

    el.emptyState.classList.add('d-none');
    el.resultWrap.classList.remove('d-none');
    el.outputUrl.value = finalUrl;
    el.openBtn.setAttribute('href', finalUrl);

    el.statLength.textContent = String(finalUrl.length);
    el.statLength.className = 'stat-value';
    var statusText = 'Good';
    var statusClass = 'stat-value is-good';
    if (finalUrl.length > MAX_LINK) {
      statusText = 'Too long';
      statusClass = 'stat-value is-bad';
    } else if (finalUrl.length > SOFT_LINK) {
      statusText = 'Long';
      statusClass = 'stat-value is-warn';
    }
    el.statStatus.textContent = statusText;
    el.statStatus.className = statusClass;
    el.statParams.textContent = String(rows.length - 1);
    el.statTags.textContent = String(tagCount);

    var body = '';
    rows.forEach(function (row) {
      body += '<tr' + (row.base ? ' class="table-light"' : '') + '>' +
        '<td class="mono">' + escapeHtml(row.param) + '</td>' +
        '<td class="mono">' + escapeHtml(shorten(row.value)) + '</td>' +
        '<td>' + row.chars + '</td>' +
        '</tr>';
    });
    el.breakdownBody.innerHTML = body;

    var notes = [];
    if (finalUrl.length > MAX_LINK) {
      notes.push('This link is longer than ' + MAX_LINK + ' characters and may be truncated by some platforms. Trim the campaign name or drop the optional tags.');
    } else if (finalUrl.length > SOFT_LINK) {
      notes.push('At ' + finalUrl.length + ' characters this link is getting long. Email clients and chat apps can wrap or cut links past roughly 300 characters.');
    }
    if (el.caseMode.value === 'keep') {
      var upper = rows.some(function (r) {
        return !r.base && /[A-Z]/.test(r.value);
      });
      if (upper) {
        notes.push('Some values contain capitals. Analytics tools treat Email and email as two different values, which splits your report.');
      }
    }
    if (base.origin && window.location.hostname && base.origin.toLowerCase() === window.location.hostname.toLowerCase()) {
      notes.push('This address points at the same site you are browsing. Tagging internal links starts a new session and overwrites the original source, so tag outbound placements only.');
    }
    if (!fieldsOk) {
      notes.push('Some fields still need attention before the link is ready to share.');
    }

    if (notes.length) {
      el.warnBox.innerHTML = '<strong>Heads up:</strong><ul class="mb-0 pl-3">' +
        notes.map(function (n) { return '<li>' + escapeHtml(n) + '</li>'; }).join('') +
        '</ul>';
      el.warnBox.classList.remove('d-none');
    } else {
      el.warnBox.classList.add('d-none');
      el.warnBox.innerHTML = '';
    }

    drawChart(rows);
  }

  function shorten(value) {
    var text = String(value);
    if (text.length <= 64) { return text; }
    return text.slice(0, 61) + '...';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- chart ---------- */

  function drawChart(rows) {
    var canvas = el.urlChart;
    if (!canvas || !canvas.getContext) {
      if (el.chartFallback) { el.chartFallback.classList.remove('d-none'); }
      return;
    }
    var ctx = canvas.getContext('2d');
    if (!ctx) {
      if (el.chartFallback) { el.chartFallback.classList.remove('d-none'); }
      return;
    }
    if (el.chartFallback) { el.chartFallback.classList.add('d-none'); }

    var items = rows.map(function (row, i) {
      return {
        label: row.base ? 'Base URL' : row.param,
        chars: Math.max(row.chars, 0),
        color: row.base ? '#43006d' : CHART_COLORS[(i % (CHART_COLORS.length - 1)) + 1]
      };
    });

    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement ? canvas.parentElement.clientWidth : 720;
    if (!cssW || cssW < 240) { cssW = 720; }
    var rowH = 30;
    var padTop = 6;
    var padBottom = 22;
    var labelW = 118;
    var valueW = 46;
    var cssH = items.length * rowH + padTop + padBottom;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = '100%';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var max = 1;
    items.forEach(function (item) { if (item.chars > max) { max = item.chars; } });
    var barMax = Math.max(cssW - labelW - valueW - 8, 40);
    var axisX = labelW;

    ctx.strokeStyle = '#e6ddf1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX + 0.5, padTop - 4);
    ctx.lineTo(axisX + 0.5, cssH - padBottom + 4);
    ctx.stroke();

    ctx.font = '12px "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textBaseline = 'middle';

    items.forEach(function (item, i) {
      var y = padTop + i * rowH;
      var barH = 16;
      var barY = y + (rowH - barH) / 2;

      ctx.fillStyle = '#6b6277';
      ctx.textAlign = 'right';
      ctx.fillText(fitLabel(ctx, item.label, labelW - 10), axisX - 8, y + rowH / 2);

      var w = Math.round((item.chars / max) * barMax);
      if (w < 2) { w = 2; }
      ctx.fillStyle = item.color;
      ctx.fillRect(axisX + 1, barY, w, barH);

      ctx.fillStyle = '#241a2e';
      ctx.textAlign = 'left';
      ctx.fillText(String(item.chars), axisX + w + 7, y + rowH / 2);
    });

    ctx.strokeStyle = '#cbbde0';
    ctx.beginPath();
    ctx.moveTo(axisX, cssH - padBottom + 4.5);
    ctx.lineTo(cssW - 4, cssH - padBottom + 4.5);
    ctx.stroke();

    ctx.fillStyle = '#6b6277';
    ctx.textAlign = 'left';
    ctx.fillText('characters', axisX + 1, cssH - padBottom + 14);
  }

  function fitLabel(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) { return text; }
    var cut = text;
    while (cut.length > 3 && ctx.measureText(cut + '...').width > maxWidth) {
      cut = cut.slice(0, -1);
    }
    return cut + '...';
  }

  /* ---------- actions ---------- */

  function copyLink() {
    if (!lastUrl) { return; }
    var done = function (ok) {
      el.copyNote.textContent = ok
        ? 'Tracking link copied to your clipboard.'
        : 'Copy failed in this browser. Select the text above and copy it manually.';
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastUrl).then(function () {
        done(true);
      }).catch(function () {
        done(fallbackCopy());
      });
    } else {
      done(fallbackCopy());
    }
  }

  function fallbackCopy() {
    try {
      el.outputUrl.focus();
      el.outputUrl.select();
      var ok = document.execCommand('copy');
      window.getSelection().removeAllRanges();
      return ok;
    } catch (e) {
      return false;
    }
  }

  function applyPreset() {
    var key = el.presetSelect.value;
    var preset = PRESETS[key];
    if (!preset) { return; }
    if (!el.utmSource.value.trim()) { el.utmSource.value = preset.source; }
    if (!el.utmMedium.value.trim()) { el.utmMedium.value = preset.medium; }
    if (!el.utmCampaign.value.trim()) { el.utmCampaign.focus(); }
    softBuild();
  }

  function resetForm() {
    el.baseUrl.value = '';
    PARAMS.forEach(function (p) { el[p.id].value = ''; });
    el.presetSelect.value = '';
    el.caseMode.value = 'lower';
    el.chkSpaces.checked = true;
    clearFieldStates();
    el.copyNote.textContent = '';
    lastUrl = '';
    el.resultWrap.classList.add('d-none');
    el.emptyState.classList.remove('d-none');
  }

  function softBuild() {
    var base = parseBase(el.baseUrl.value);
    if (base.error) { return; }
    PARAMS.forEach(function (p) {
      p.value = normalise(el[p.id].value, el.caseMode.value === 'lower', el.chkSpaces.checked);
    });
    var missing = PARAMS.some(function (p) { return p.required && !p.value; });
    if (missing) { return; }
    build(false);
  }

  /* ---------- init ---------- */

  function init() {
    cacheEls();
    if (!el.buildBtn) { return; }

    el.buildBtn.addEventListener('click', function () { build(true); });
    el.resetBtn.addEventListener('click', resetForm);
    el.copyBtn.addEventListener('click', copyLink);
    el.presetSelect.addEventListener('change', applyPreset);

    [el.baseUrl, el.caseMode, el.chkSpaces].concat(PARAMS.map(function (p) { return el[p.id]; }))
      .forEach(function (node) {
        node.addEventListener('input', softBuild);
        node.addEventListener('change', softBuild);
      });

    el.outputUrl.addEventListener('focus', function () { el.outputUrl.select(); });

    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (resizeTimer) { window.clearTimeout(resizeTimer); }
      resizeTimer = window.setTimeout(function () {
        if (lastUrl && el.breakdownBody.rows.length) {
          build(false);
        }
      }, 150);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
