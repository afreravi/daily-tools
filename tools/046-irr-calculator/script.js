/* IRR Calculator — vanilla JS, no frameworks. */
(function () {
  'use strict';

  var DEFAULT_FLOWS = [-100000, 25000, 30000, 35000, 40000];
  var EXAMPLE_FLOWS = [-250000, 40000, 65000, 80000, 90000, 95000];

  var cfBody = document.getElementById('cfBody');
  var resultsCard = document.getElementById('resultsCard');
  var errorBox = document.getElementById('errorBox');

  var el = {
    irrValue: document.getElementById('irrValue'),
    irrAnnual: document.getElementById('irrAnnual'),
    npvValue: document.getElementById('npvValue'),
    npvSub: document.getElementById('npvSub'),
    mirrValue: document.getElementById('mirrValue'),
    paybackValue: document.getElementById('paybackValue'),
    dpaybackValue: document.getElementById('dpaybackValue'),
    piValue: document.getElementById('piValue'),
    investedValue: document.getElementById('investedValue'),
    verdict: document.getElementById('verdict'),
    pvBody: document.getElementById('pvBody'),
    profileNote: document.getElementById('profileNote')
  };

  /* ---------------- number helpers ---------------- */

  function num(v) {
    var n = parseFloat(String(v).replace(/[$,\s%]/g, ''));
    return isFinite(n) ? n : NaN;
  }

  function money(n, decimals) {
    if (!isFinite(n)) return '\u2014';
    var d = typeof decimals === 'number' ? decimals : 0;
    var sign = n < 0 ? '-' : '';
    var abs = Math.abs(n);
    var parts = abs.toFixed(d).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return sign + '$' + parts.join('.');
  }

  function pct(n, decimals) {
    if (!isFinite(n)) return '\u2014';
    var d = typeof decimals === 'number' ? decimals : 2;
    return n.toFixed(d) + '%';
  }

  /* ---------------- cash flow row management ---------------- */

  function makeRow(value) {
    var tr = document.createElement('tr');
    var tdPeriod = document.createElement('td');
    tdPeriod.className = 'period-label';

    var tdInput = document.createElement('td');
    var input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.className = 'form-control form-control-sm cf-input';
    input.setAttribute('inputmode', 'decimal');
    input.value = value;
    input.setAttribute('aria-label', 'Cash flow for this period');
    tdInput.appendChild(input);

    var tdBtn = document.createElement('td');
    tdBtn.className = 'text-right';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn-remove';
    btn.innerHTML = '&times;';
    btn.setAttribute('aria-label', 'Remove this period');
    btn.addEventListener('click', function () {
      if (cfBody.rows.length <= 2) {
        showError('Keep at least two periods so the series can change sign.');
        return;
      }
      tr.parentNode.removeChild(tr);
      renumber();
      hideError();
    });
    tdBtn.appendChild(btn);

    tr.appendChild(tdPeriod);
    tr.appendChild(tdInput);
    tr.appendChild(tdBtn);
    input.addEventListener('input', function () {
      markRow(tr, input);
      hideError();
    });
    markRow(tr, input);
    return tr;
  }

  function markRow(tr, input) {
    var n = num(input.value);
    tr.classList.remove('is-negative', 'is-positive');
    if (isFinite(n) && n < 0) tr.classList.add('is-negative');
    else if (isFinite(n) && n > 0) tr.classList.add('is-positive');
  }

  function renumber() {
    for (var i = 0; i < cfBody.rows.length; i++) {
      cfBody.rows[i].cells[0].textContent = 'Period ' + i;
    }
  }

  function setFlows(list) {
    cfBody.innerHTML = '';
    list.forEach(function (v) { cfBody.appendChild(makeRow(v)); });
    renumber();
  }

  function readFlows() {
    var flows = [];
    for (var i = 0; i < cfBody.rows.length; i++) {
      var input = cfBody.rows[i].querySelector('.cf-input');
      var raw = input.value.trim();
      if (raw === '') {
        return { error: 'Period ' + i + ' is empty. Enter a value (use 0 for no cash flow).' };
      }
      var n = num(raw);
      if (!isFinite(n)) {
        return { error: 'Period ' + i + ' is not a valid number.' };
      }
      if (Math.abs(n) > 1e15) {
        return { error: 'Period ' + i + ' is out of range. Keep values under one quadrillion.' };
      }
      flows.push(n);
    }
    return { flows: flows };
  }

  /* ---------------- core finance math ---------------- */

  function npvAt(rate, flows) {
    var total = 0;
    for (var i = 0; i < flows.length; i++) {
      total += flows[i] / Math.pow(1 + rate, i);
    }
    return total;
  }

  function findIrr(flows) {
    // Bisection over a wide bracket; robust where Newton-Raphson overshoots.
    var lo = -0.9999, hi = 10;
    var fLo = npvAt(lo, flows), fHi = npvAt(hi, flows);
    if (!isFinite(fLo) || !isFinite(fHi) || fLo * fHi > 0) {
      // Try to locate a sign change by scanning.
      var found = false;
      var step = 0.0005, prevRate = lo, prevVal = fLo;
      for (var r = lo + step; r <= hi; r += step) {
        var v = npvAt(r, flows);
        if (isFinite(v) && isFinite(prevVal) && prevVal * v <= 0) {
          lo = prevRate; hi = r; found = true; break;
        }
        prevRate = r; prevVal = v;
      }
      if (!found) return null;
    }
    for (var k = 0; k < 200; k++) {
      var mid = (lo + hi) / 2;
      var fMid = npvAt(mid, flows);
      if (fMid === 0) return mid;
      if (npvAt(lo, flows) * fMid < 0) hi = mid; else lo = mid;
      if (hi - lo < 1e-12) break;
    }
    return (lo + hi) / 2;
  }

  function signChanges(flows) {
    // Descartes-style count: each change of sign in the series can add a root.
    var changes = 0, prevSign = 0;
    for (var i = 0; i < flows.length; i++) {
      var s = flows[i] > 0 ? 1 : (flows[i] < 0 ? -1 : 0);
      if (s === 0) continue;
      if (prevSign !== 0 && s !== prevSign) changes++;
      prevSign = s;
    }
    return changes;
  }

  function mirr(flows, financeRate, reinvestRate) {
    var n = flows.length - 1;
    if (n < 1) return NaN;
    var pvNeg = 0, fvPos = 0;
    for (var i = 0; i < flows.length; i++) {
      if (flows[i] < 0) pvNeg += flows[i] / Math.pow(1 + financeRate, i);
      else fvPos += flows[i] * Math.pow(1 + reinvestRate, n - i);
    }
    if (pvNeg === 0 || fvPos === 0) return NaN;
    var ratio = fvPos / Math.abs(pvNeg);
    if (ratio <= 0) return NaN;
    return Math.pow(ratio, 1 / n) - 1;
  }

  function payback(flows, rate) {
    var cum = 0;
    for (var i = 0; i < flows.length; i++) {
      var v = rate === 0 ? flows[i] : flows[i] / Math.pow(1 + rate, i);
      var prev = cum;
      cum += v;
      if (cum >= 0 && i > 0 && prev < 0) {
        return (i - 1) + (v !== 0 ? Math.abs(prev) / v : 0);
      }
      if (i === 0 && cum >= 0) return 0;
    }
    return null;
  }

  /* ---------------- rendering ---------------- */

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('d-none');
    resultsCard.classList.add('d-none');
  }

  function hideError() {
    errorBox.classList.add('d-none');
  }

  function render() {
    hideError();
    var parsed = readFlows();
    if (parsed.error) { showError(parsed.error); return; }

    var flows = parsed.flows;
    var hasNeg = flows.some(function (v) { return v < 0; });
    var hasPos = flows.some(function (v) { return v > 0; });
    if (!hasNeg || !hasPos) {
      showError('A cash flow series needs at least one negative and one positive value for an IRR to exist. Include the initial investment as a negative period 0 value.');
      return;
    }

    var discountPct = num(document.getElementById('discountRate').value);
    var financePct = num(document.getElementById('financeRate').value);
    if (!isFinite(discountPct)) discountPct = 0;
    if (!isFinite(financePct)) financePct = 0;
    if (discountPct <= -100) { showError('The discount rate must be greater than -100%.'); return; }
    if (financePct <= -100) { showError('The finance rate must be greater than -100%.'); return; }

    var rate = discountPct / 100;
    var finRate = financePct / 100;
    var ppy = parseInt(document.getElementById('periodsPerYear').value, 10) || 1;

    var irr = findIrr(flows);
    var npv = npvAt(rate, flows);
    var mirrVal = mirr(flows, finRate, rate);
    var pb = payback(flows, 0);
    var dpb = payback(flows, rate);

    var invested = 0;
    for (var i = 0; i < flows.length; i++) if (flows[i] < 0) invested += Math.abs(flows[i]);

    var pvPos = 0;
    for (i = 0; i < flows.length; i++) {
      if (flows[i] > 0) pvPos += flows[i] / Math.pow(1 + rate, i);
    }
    var pvNegTotal = 0;
    for (i = 0; i < flows.length; i++) {
      if (flows[i] < 0) pvNegTotal += Math.abs(flows[i] / Math.pow(1 + rate, i));
    }
    var pi = pvNegTotal > 0 ? pvPos / pvNegTotal : NaN;

    // Metric tiles
    el.irrValue.textContent = irr === null ? 'No IRR' : pct(irr * 100);
    if (irr !== null && ppy > 1) {
      var annual = (Math.pow(1 + irr, ppy) - 1) * 100;
      el.irrAnnual.textContent = 'Annualised: ' + pct(annual) + ' (' + ppy + ' periods per year)';
    } else if (irr !== null) {
      el.irrAnnual.textContent = 'Annual rate over ' + (flows.length - 1) + ' periods';
    } else {
      el.irrAnnual.textContent = 'No sign change found in the series';
    }

    el.npvValue.textContent = money(npv);
    el.npvSub.textContent = 'At a ' + pct(discountPct) + ' discount rate';
    el.mirrValue.textContent = isFinite(mirrVal) ? pct(mirrVal * 100) : '\u2014';
    el.paybackValue.textContent = pb === null ? 'Never' : pb.toFixed(2) + ' periods';
    el.dpaybackValue.textContent = dpb === null ? 'Never' : dpb.toFixed(2) + ' periods';
    el.piValue.textContent = isFinite(pi) ? pi.toFixed(3) : '\u2014';
    el.investedValue.textContent = money(invested);

    // Verdict
    var verdictClass = 'verdict-warn';
    var verdictText;
    if (irr === null) {
      verdictText = 'This series has no internal rate of return, so NPV at your discount rate is the figure to decide on.';
    } else if (irr > rate) {
      verdictClass = 'verdict-good';
      verdictText = 'The IRR of ' + pct(irr * 100) + ' is above your ' + pct(discountPct) + ' discount rate, so at these cash flows the project adds value.';
    } else if (Math.abs(irr - rate) < 0.0005) {
      verdictText = 'The IRR is essentially equal to your discount rate, so the project breaks exactly even.';
    } else {
      verdictClass = 'verdict-bad';
      verdictText = 'The IRR of ' + pct(irr * 100) + ' is below your ' + pct(discountPct) + ' discount rate, so at these cash flows the project falls short of the return you require.';
    }
    var changes = signChanges(flows);
    if (changes > 1) {
      verdictClass = 'verdict-warn';
      verdictText += ' Note: this cash flow pattern changes sign more than once, which can produce multiple IRRs \u2014 check the NPV profile chart before relying on the figure.';
    }
    el.verdict.className = verdictClass;
    el.verdict.textContent = verdictText;

    // Present value table
    var rows = '';
    var cum = 0;
    for (i = 0; i < flows.length; i++) {
      var pv = flows[i] / Math.pow(1 + rate, i);
      cum += pv;
      rows += '<tr>' +
        '<td>Period ' + i + '</td>' +
        '<td class="text-right ' + (flows[i] < 0 ? 'neg' : 'pos') + '">' + money(flows[i]) + '</td>' +
        '<td class="text-right ' + (pv < 0 ? 'neg' : 'pos') + '">' + money(pv) + '</td>' +
        '<td class="text-right">' + money(cum) + '</td>' +
        '</tr>';
    }
    rows += '<tr class="cum-row"><td colspan="2" class="font-weight-bold">Net present value</td>' +
      '<td colspan="2" class="text-right font-weight-bold">' + money(npv) + '</td></tr>';
    el.pvBody.innerHTML = rows;

    // Charts
    drawProfileChart(flows, rate, irr);
    drawFlowChart(flows);

    el.profileNote.textContent = irr === null
      ? 'The curve never crosses zero on this range, which is why no IRR is reported.'
      : 'The curve crosses zero at ' + pct(irr * 100) + '. Your ' + pct(discountPct) + ' discount rate sits at the marked point, where NPV is ' + money(npv) + '.';

    resultsCard.classList.remove('d-none');
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* ---------------- canvas charts ---------------- */

  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    var w = Math.max(rect.width, 240);
    var h = Math.max(rect.height, 140);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function niceStep(range, target) {
    var raw = range / target;
    var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
    var norm = raw / mag;
    var step;
    if (norm <= 1) step = 1; else if (norm <= 2) step = 2; else if (norm <= 5) step = 5; else step = 10;
    return step * mag;
  }

  function drawProfileChart(flows, rate, irr) {
    var canvas = document.getElementById('profileChart');
    var c = setupCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 62, padR = 14, padT = 14, padB = 32;
    var plotW = w - padL - padR, plotH = h - padT - padB;

    var rMin = -0.05, rMax = 0.6;
    if (irr !== null) {
      rMax = Math.max(0.25, Math.min(1.5, irr * 2.2));
      rMin = Math.min(-0.05, irr * 0.5 - 0.05);
    }
    var pts = [], minV = Infinity, maxV = -Infinity;
    for (var i = 0; i <= 120; i++) {
      var r = rMin + (rMax - rMin) * (i / 120);
      var v = npvAt(r, flows);
      if (!isFinite(v)) continue;
      pts.push({ r: r, v: v });
      if (v < minV) minV = v;
      if (v > maxV) maxV = v;
    }
    if (!pts.length) return;
    if (minV === maxV) { minV -= 1; maxV += 1; }
    var padV = (maxV - minV) * 0.12;
    minV -= padV; maxV += padV;
    if (minV > 0) minV = 0;
    if (maxV < 0) maxV = 0;

    var x = function (r) { return padL + ((r - rMin) / (rMax - rMin)) * plotW; };
    var y = function (v) { return padT + (1 - (v - minV) / (maxV - minV)) * plotH; };

    // grid + y labels
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#6b6277';
    ctx.strokeStyle = '#eee7f5';
    ctx.lineWidth = 1;
    var stepV = niceStep(maxV - minV, 4);
    var startV = Math.ceil(minV / stepV) * stepV;
    for (var v = startV; v <= maxV + 1e-9; v += stepV) {
      var yy = y(v);
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + plotW, yy); ctx.stroke();
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(shortMoney(v), padL - 6, yy);
    }

    // zero line
    var y0 = y(0);
    ctx.strokeStyle = '#c9b6dd';
    ctx.beginPath(); ctx.moveTo(padL, y0); ctx.lineTo(padL + plotW, y0); ctx.stroke();

    // x labels
    ctx.fillStyle = '#6b6277';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    var stepR = niceStep((rMax - rMin) * 100, 5);
    for (var rp = Math.ceil((rMin * 100) / stepR) * stepR; rp <= rMax * 100 + 1e-9; rp += stepR) {
      ctx.fillText(Math.round(rp) + '%', x(rp / 100), padT + plotH + 8);
    }

    // area fill
    ctx.beginPath();
    ctx.moveTo(x(pts[0].r), y0);
    pts.forEach(function (p) { ctx.lineTo(x(p.r), y(p.v)); });
    ctx.lineTo(x(pts[pts.length - 1].r), y0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(96, 8, 156, .09)';
    ctx.fill();

    // curve
    ctx.beginPath();
    pts.forEach(function (p, idx) {
      if (idx === 0) ctx.moveTo(x(p.r), y(p.v)); else ctx.lineTo(x(p.r), y(p.v));
    });
    ctx.strokeStyle = '#60089c';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // IRR marker
    if (irr !== null && irr >= rMin && irr <= rMax) {
      var mx = x(irr), my = y(0);
      ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#0e7c66'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#0e7c66';
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.font = 'bold 11px "Segoe UI", Arial, sans-serif';
      ctx.fillText('IRR ' + pct(irr * 100), mx, my - 8);
    }

    // discount-rate marker
    if (rate >= rMin && rate <= rMax) {
      var dx = x(rate), dy = y(npvAt(rate, flows));
      ctx.beginPath(); ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#b45309'; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    }
  }

  function shortMoney(v) {
    var a = Math.abs(v);
    if (a >= 1e9) return (v / 1e9).toFixed(1) + 'B';
    if (a >= 1e6) return (v / 1e6).toFixed(1) + 'M';
    if (a >= 1e3) return (v / 1e3).toFixed(0) + 'k';
    return v.toFixed(0);
  }

  function drawFlowChart(flows) {
    var canvas = document.getElementById('flowChart');
    var c = setupCanvas(canvas);
    var ctx = c.ctx, w = c.w, h = c.h;
    var padL = 62, padR = 14, padT = 14, padB = 28;
    var plotW = w - padL - padR, plotH = h - padT - padB;

    var maxV = 0, minV = 0;
    flows.forEach(function (v) { if (v > maxV) maxV = v; if (v < minV) minV = v; });
    if (maxV === 0 && minV === 0) { maxV = 1; minV = -1; }
    var span = maxV - minV || 1;
    maxV += span * 0.08; minV -= span * 0.08;

    var y = function (v) { return padT + (1 - (v - minV) / (maxV - minV)) * plotH; };
    var y0 = y(0);

    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = '#6b6277';
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    var stepV = niceStep(maxV - minV, 4);
    for (var v = Math.ceil(minV / stepV) * stepV; v <= maxV + 1e-9; v += stepV) {
      var yy = y(v);
      ctx.strokeStyle = '#f0eaf7';
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + plotW, yy); ctx.stroke();
      ctx.fillStyle = '#6b6277';
      ctx.fillText(shortMoney(v), padL - 6, yy);
    }

    ctx.strokeStyle = '#c9b6dd';
    ctx.beginPath(); ctx.moveTo(padL, y0); ctx.lineTo(padL + plotW, y0); ctx.stroke();

    var n = flows.length;
    var slot = plotW / n;
    var barW = Math.min(slot * 0.62, 46);
    flows.forEach(function (val, i) {
      var cx = padL + slot * i + slot / 2;
      var top = val >= 0 ? y(val) : y0;
      var bot = val >= 0 ? y0 : y(val);
      ctx.fillStyle = val >= 0 ? '#7a1fbd' : '#b45309';
      ctx.fillRect(cx - barW / 2, top, barW, Math.max(bot - top, 1));
      ctx.fillStyle = '#6b6277';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.fillText(String(i), cx, padT + plotH + 6);
    });
  }

  /* ---------------- events ---------------- */

  document.getElementById('calcBtn').addEventListener('click', render);

  document.getElementById('addRowBtn').addEventListener('click', function () {
    if (cfBody.rows.length >= 60) {
      showError('Sixty periods is the practical limit for this tool.');
      return;
    }
    cfBody.appendChild(makeRow(0));
    renumber();
    hideError();
    var last = cfBody.rows[cfBody.rows.length - 1].querySelector('.cf-input');
    if (last) last.focus();
  });

  document.getElementById('removeRowBtn').addEventListener('click', function () {
    if (cfBody.rows.length <= 2) {
      showError('Keep at least two periods so the series can change sign.');
      return;
    }
    cfBody.removeChild(cfBody.rows[cfBody.rows.length - 1]);
    renumber();
    hideError();
  });

  document.getElementById('resetBtn').addEventListener('click', function () {
    setFlows(DEFAULT_FLOWS.slice());
    document.getElementById('discountRate').value = 10;
    document.getElementById('financeRate').value = 8;
    document.getElementById('periodsPerYear').value = '1';
    hideError();
    resultsCard.classList.add('d-none');
  });

  document.getElementById('exampleBtn').addEventListener('click', function () {
    setFlows(EXAMPLE_FLOWS.slice());
    document.getElementById('discountRate').value = 12;
    document.getElementById('financeRate').value = 8;
    document.getElementById('periodsPerYear').value = '1';
    render();
  });

  ['discountRate', 'financeRate', 'periodsPerYear'].forEach(function (id) {
    document.getElementById(id).addEventListener('change', function () {
      if (!resultsCard.classList.contains('d-none')) render();
    });
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (resultsCard.classList.contains('d-none')) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
  });

  // Initial state
  setFlows(DEFAULT_FLOWS.slice());
  document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
})();
