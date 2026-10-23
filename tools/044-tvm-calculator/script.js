/* TVM Calculator — time value of money solver.
   Solves the five-variable financial calculator equation for any one unknown:
   FV + PV*(1+r)^N + PMT * ((1+r)^N - 1)/r * k = 0,  k = (1+r) for annuity-due. */
(function () {
  'use strict';

  var $ = function (id) { return document.getElementById(id); };

  var el = {
    solveFor: $('solveFor'),
    payPerYear: $('payPerYear'),
    compPerYear: $('compPerYear'),
    periods: $('periods'),
    rate: $('rate'),
    pv: $('pv'),
    pmt: $('pmt'),
    fv: $('fv'),
    fvOptional: $('fvOptional'),
    calcBtn: $('calcBtn'),
    resetBtn: $('resetBtn'),
    exampleBtn: $('exampleBtn'),
    formAlert: $('formAlert'),
    resultCard: $('resultCard'),
    resultLabel: $('resultLabel'),
    resultValue: $('resultValue'),
    resultNote: $('resultNote'),
    statPaid: $('statPaid'),
    statReceived: $('statReceived'),
    statGrowth: $('statGrowth'),
    statEar: $('statEar'),
    chart: $('balanceChart'),
    chartFallback: $('chartFallback'),
    chartCaption: $('chartCaption'),
    scheduleBody: $('scheduleBody'),
    scheduleNote: $('scheduleNote'),
    warnBox: $('warnBox'),
    toolCard: $('toolCard')
  };

  var MAX_ROWS = 600;
  var DEFAULTS = {
    solveFor: 'fv',
    payPerYear: '12',
    compPerYear: '12',
    periods: '10',
    rate: '7',
    pv: '-10000',
    pmt: '-500',
    fv: ''
  };

  var lastRender = null;

  /* ---------------- helpers ---------------- */

  function isFiniteNumber(v) {
    return typeof v === 'number' && isFinite(v);
  }

  function parseNum(raw) {
    if (raw === null || raw === undefined) { return NaN; }
    var s = String(raw).trim();
    if (s === '') { return NaN; }
    s = s.replace(/[\s,_]/g, '').replace(/%$/, '');
    return Number(s);
  }

  function money(v) {
    if (!isFiniteNumber(v)) { return '\u2014'; }
    var neg = v < 0;
    var abs = Math.abs(v);
    var dec = abs >= 1000 ? 0 : 2;
    var out = abs.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return (neg ? '\u2212' : '') + out;
  }

  function money2(v) {
    if (!isFiniteNumber(v)) { return '\u2014'; }
    var neg = v < 0;
    var out = Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (neg ? '\u2212' : '') + out;
  }

  function pct(v, digits) {
    if (!isFiniteNumber(v)) { return '\u2014'; }
    return (v * 100).toFixed(digits === undefined ? 4 : digits) + '%';
  }

  function clearErrors() {
    ['payPerYear', 'compPerYear', 'periods', 'rate', 'pv', 'pmt', 'fv'].forEach(function (k) {
      if (!el[k]) { return; }
      el[k].classList.remove('is-invalid');
      el[k].removeAttribute('aria-invalid');
    });
    el.formAlert.classList.add('d-none');
    el.formAlert.textContent = '';
  }

  function fieldError(key, message) {
    var input = el[key];
    if (input) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
    }
    if (!el.formAlert.textContent) {
      el.formAlert.textContent = message;
    }
    el.formAlert.classList.remove('d-none');
  }

  function warn(message) {
    if (!message) {
      el.warnBox.classList.add('d-none');
      el.warnBox.textContent = '';
      return;
    }
    el.warnBox.textContent = message;
    el.warnBox.classList.remove('d-none');
  }

  function timing() {
    var checked = document.querySelector('input[name="timing"]:checked');
    return checked && checked.value === 'begin' ? 'begin' : 'end';
  }

  /* ---------------- rate conversion ---------------- */

  // Nominal annual rate (as a decimal) -> rate applied in one payment period.
  function periodRate(annualNominal, payPerYear, compPerYear) {
    if (Math.abs(annualNominal) < 1e-12) { return 0; }
    var ear = Math.pow(1 + annualNominal / compPerYear, compPerYear) - 1;
    return Math.pow(1 + ear, 1 / payPerYear) - 1;
  }

  // Rate per payment period -> nominal annual rate for the given compounding frequency.
  function nominalFromPeriod(r, payPerYear, compPerYear) {
    var ear = Math.pow(1 + r, payPerYear) - 1;
    return compPerYear * (Math.pow(1 + ear, 1 / compPerYear) - 1);
  }

  /* ---------------- equation ---------------- */

  // Value of the TVM equation. Zero when the five variables are consistent.
  function equation(r, n, pv, pmt, fv, begin) {
    var k = begin ? (1 + r) : 1;
    if (Math.abs(r) < 1e-12) {
      return pv + pmt * k * n + fv;
    }
    var g = Math.pow(1 + r, n);
    var annuity = (g - 1) / r * k;
    return pv * g + pmt * annuity + fv;
  }

  function annuityFactor(r, n, begin) {
    var k = begin ? (1 + r) : 1;
    if (Math.abs(r) < 1e-12) { return n * k; }
    return (Math.pow(1 + r, n) - 1) / r * k;
  }

  /* ---------------- solvers ---------------- */

  function solveFV(r, n, pv, pmt, begin) {
    return -(pv * Math.pow(1 + r, n) + pmt * annuityFactor(r, n, begin));
  }

  function solvePV(r, n, pmt, fv, begin) {
    return -(fv + pmt * annuityFactor(r, n, begin)) / Math.pow(1 + r, n);
  }

  function solvePMT(r, n, pv, fv, begin) {
    var af = annuityFactor(r, n, begin);
    if (Math.abs(af) < 1e-14) { return null; }
    return -(fv + pv * Math.pow(1 + r, n)) / af;
  }

  function solveN(r, pv, pmt, fv, begin) {
    if (Math.abs(r) < 1e-12) {
      if (Math.abs(pmt) < 1e-14) { return null; }
      var nLinear = -(pv + fv) / pmt;
      return nLinear > 0 ? nLinear : null;
    }
    var k = begin ? (1 + r) : 1;
    var a = pmt * k / r;
    var denom = pv + a;
    if (Math.abs(denom) < 1e-14) { return null; }
    var x = (a - fv) / denom;
    if (!(x > 0)) { return null; }
    var n = Math.log(x) / Math.log(1 + r);
    return n > 0 && isFinite(n) ? n : null;
  }

  function solveRate(n, pv, pmt, fv, begin) {
    if (!(n > 0)) { return null; }
    var probe = [-0.999999, -0.999, -0.99, -0.95, -0.9, -0.8, -0.6, -0.4, -0.25, -0.15, -0.1,
      -0.07, -0.05, -0.03, -0.02, -0.01, -0.005, -0.001, 0, 0.0005, 0.001, 0.002, 0.005,
      0.008, 0.01, 0.015, 0.02, 0.03, 0.05, 0.08, 0.12, 0.2, 0.35, 0.6, 1, 2, 4, 8, 16, 64, 256, 1024];
    var lo = null, hi = null, prevR = null, prevV = null, i, r, v;
    for (i = 0; i < probe.length; i++) {
      r = probe[i];
      v = equation(r, n, pv, pmt, fv, begin);
      if (!isFinite(v)) { continue; }
      if (Math.abs(v) < 1e-9) { return r; }
      if (prevV !== null && (prevV < 0) !== (v < 0)) {
        lo = prevR; hi = r;
        break;
      }
      prevR = r; prevV = v;
    }
    if (lo === null) { return null; }

    var flo = equation(lo, n, pv, pmt, fv, begin);
    var mid, fmid;
    for (i = 0; i < 220; i++) {
      mid = (lo + hi) / 2;
      fmid = equation(mid, n, pv, pmt, fv, begin);
      if (!isFinite(fmid)) { hi = mid; continue; }
      if (Math.abs(fmid) < 1e-10 || (hi - lo) < 1e-13) { return mid; }
      if ((fmid < 0) === (flo < 0)) { lo = mid; flo = fmid; }
      else { hi = mid; }
    }
    return (lo + hi) / 2;
  }

  /* ---------------- schedule ---------------- */

  // Simulates the position period by period. The balance starts at PV and each
  // period adds interest plus the payment; FV is the negative of the final balance.
  function buildSchedule(r, n, pv, pmt, begin) {
    var rows = [];
    var total = Math.ceil(n - 1e-9);
    if (!(total > 0)) { total = 1; }
    var limit = Math.min(total, MAX_ROWS);
    var balance = pv;
    var paid = 0, received = 0;
    for (var t = 1; t <= limit; t++) {
      var startBalance = balance;
      var interest, principal;
      if (begin) {
        balance = balance + pmt;
        interest = balance * r;
        balance = balance + interest;
        principal = -pmt;
      } else {
        interest = startBalance * r;
        balance = startBalance + interest + pmt;
        principal = -(pmt + interest);
      }
      if (pmt < 0) { paid += -pmt; } else { received += pmt; }
      rows.push({ period: t, payment: pmt, interest: interest, principal: principal, balance: balance });
    }
    return { rows: rows, total: total, truncated: total > limit, paid: paid, received: received, endBalance: balance };
  }

  /* ---------------- chart ---------------- */

  function drawChart(rows, n) {
    var canvas = el.chart;
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

    var points = rows.map(function (row) { return { x: row.period, y: Math.abs(row.balance) }; });
    if (!points.length) { return; }

    // Down-sample long series so the line stays readable.
    var maxPoints = 140;
    if (points.length > maxPoints) {
      var stride = Math.ceil(points.length / maxPoints);
      var sampled = [];
      for (var i = 0; i < points.length; i += stride) { sampled.push(points[i]); }
      if (sampled[sampled.length - 1] !== points[points.length - 1]) { sampled.push(points[points.length - 1]); }
      points = sampled;
    }

    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentElement ? canvas.parentElement.clientWidth : 760;
    if (!cssW || cssW < 240) { cssW = 320; }
    var cssH = 260;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = '100%';
    canvas.style.height = cssH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padL = 68, padR = 14, padT = 16, padB = 34;
    var plotW = cssW - padL - padR;
    var plotH = cssH - padT - padB;
    if (plotW < 40 || plotH < 40) { return; }

    var yMax = 0, yMin = Infinity;
    points.forEach(function (p) {
      if (p.y > yMax) { yMax = p.y; }
      if (p.y < yMin) { yMin = p.y; }
    });
    if (yMin === Infinity) { yMin = 0; }
    if (yMax === yMin) { yMax = yMin + Math.max(1, Math.abs(yMin) * 0.1); }
    var headroom = (yMax - yMin) * 0.08;
    yMax += headroom;
    if (yMin > 0) { yMin = Math.max(0, yMin - headroom); }
    var xMin = points[0].x, xMax = points[points.length - 1].x;
    if (xMax === xMin) { xMax = xMin + 1; }

    function sx(x) { return padL + (x - xMin) / (xMax - xMin) * plotW; }
    function sy(y) { return padT + plotH - (y - yMin) / (yMax - yMin) * plotH; }

    // grid + y labels
    ctx.font = '11px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    var steps = 4;
    for (var s = 0; s <= steps; s++) {
      var yv = yMin + (yMax - yMin) * (s / steps);
      var yy = sy(yv);
      ctx.strokeStyle = '#eee6f6';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, yy);
      ctx.lineTo(padL + plotW, yy);
      ctx.stroke();
      ctx.fillStyle = '#6b6277';
      ctx.fillText(money(yv), padL - 8, yy);
    }

    // x labels
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    var xTicks = Math.min(6, points.length);
    for (var t = 0; t < xTicks; t++) {
      var frac = xTicks === 1 ? 0 : t / (xTicks - 1);
      var xv = xMin + (xMax - xMin) * frac;
      ctx.fillStyle = '#6b6277';
      ctx.fillText(String(Math.round(xv)), sx(xv), padT + plotH + 8);
    }
    ctx.fillText('period', padL + plotW / 2, padT + plotH + 20);

    // axes
    ctx.strokeStyle = '#d9cdea';
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // area + line
    var grad = ctx.createLinearGradient(0, padT, 0, padT + plotH);
    grad.addColorStop(0, 'rgba(96, 8, 156, 0.22)');
    grad.addColorStop(1, 'rgba(96, 8, 156, 0.02)');
    ctx.beginPath();
    points.forEach(function (p, i) {
      var px = sx(p.x), py = sy(p.y);
      if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
    });
    ctx.lineTo(sx(points[points.length - 1].x), padT + plotH);
    ctx.lineTo(sx(points[0].x), padT + plotH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    points.forEach(function (p, i) {
      var px = sx(p.x), py = sy(p.y);
      if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
    });
    ctx.strokeStyle = '#60089c';
    ctx.lineWidth = 2.4;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // endpoint marker
    var last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(sx(last.x), sy(last.y), 4, 0, Math.PI * 2);
    ctx.fillStyle = '#43006d';
    ctx.fill();

    el.chartCaption.textContent = 'Balance magnitude from period 1 to ' + Math.round(last.x) +
      ', starting at ' + money(Math.abs(rows[0].balance)) + ' and ending at ' + money(Math.abs(last.y)) + '.';
  }

  /* ---------------- render ---------------- */

  function setResult(label, value, note) {
    el.resultLabel.textContent = label;
    el.resultValue.textContent = value;
    el.resultNote.textContent = note || '';
  }

  function render(rows, stats) {
    el.statPaid.textContent = money(stats.paid);
    el.statReceived.textContent = money(stats.received);
    var growth = stats.paid - stats.received;
    el.statGrowth.textContent = (growth >= 0 ? '\u2212' : '+') + money(Math.abs(growth));
    el.statEar.textContent = stats.ear === null ? '\u2014' : pct(stats.ear, 3);
  }

  function renderSchedule(sched) {
    var body = el.scheduleBody;
    body.innerHTML = '';
    var frag = document.createDocumentFragment();
    sched.rows.forEach(function (row) {
      var tr = document.createElement('tr');
      var cells = [
        String(row.period),
        money2(row.payment),
        money2(row.interest),
        money2(row.principal),
        money2(row.balance)
      ];
      cells.forEach(function (text, idx) {
        var td = document.createElement('td');
        td.textContent = text;
        if (idx === 4 && row.balance < 0) { td.className = 'row-neg'; }
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    });
    body.appendChild(frag);

    var note = 'Interest and principal are shown per period in the currency you entered. ' +
      'A negative balance means the position has grown in your favour (a savings or investment run).';
    if (sched.truncated) {
      note += ' Showing the first ' + MAX_ROWS + ' of ' + sched.total + ' periods.';
    }
    el.scheduleNote.textContent = note;
  }

  /* ---------------- main ---------------- */

  function calculate() {
    clearErrors();
    warn('');

    var solveFor = el.solveFor.value;
    var begin = timing() === 'begin';
    var payPerYear = parseNum(el.payPerYear.value);
    var compPerYear = parseNum(el.compPerYear.value);

    var ok = true;
    if (!isFiniteNumber(payPerYear) || payPerYear < 1 || payPerYear > 365 || Math.floor(payPerYear) !== payPerYear) {
      fieldError('payPerYear', 'Payments per year must be a whole number between 1 and 365.');
      ok = false;
    }
    if (!isFiniteNumber(compPerYear) || compPerYear < 1 || compPerYear > 365 || Math.floor(compPerYear) !== compPerYear) {
      fieldError('compPerYear', 'Compounds per year must be a whole number between 1 and 365.');
      ok = false;
    }

    function readField(key, label) {
      var raw = el[key].value;
      if (raw.trim() === '') { return { value: NaN, blank: true, label: label }; }
      var v = parseNum(raw);
      if (!isFiniteNumber(v)) {
        fieldError(key, label + ' must be a number, or left blank when it is the unknown.');
        ok = false;
        return { value: NaN, blank: false, label: label };
      }
      return { value: v, blank: false, label: label };
    }

    var nIn = readField('periods', 'Number of periods');
    var rateIn = readField('rate', 'Annual interest rate');
    var pvIn = readField('pv', 'Present value');
    var pmtIn = readField('pmt', 'Payment');
    var fvIn = readField('fv', 'Future value');

    if (!ok) { return; }

    var needN = solveFor !== 'n';
    var needRate = solveFor !== 'rate';
    var needPV = solveFor !== 'pv';
    var needPMT = solveFor !== 'pmt';
    var needFV = solveFor !== 'fv';

    if (needN && nIn.blank) { fieldError('periods', 'Number of periods is required when solving for ' + labelFor(solveFor) + '.'); ok = false; }
    if (needRate && rateIn.blank) { fieldError('rate', 'Annual interest rate is required when solving for ' + labelFor(solveFor) + '.'); ok = false; }
    if (needPV && pvIn.blank) { fieldError('pv', 'Present value is required when solving for ' + labelFor(solveFor) + '. Enter 0 if there is no lump sum.'); ok = false; }
    if (needPMT && pmtIn.blank) { fieldError('pmt', 'Payment is required when solving for ' + labelFor(solveFor) + '. Enter 0 if there are no payments.'); ok = false; }
    if (needFV && fvIn.blank) { fieldError('fv', 'Future value is required when solving for ' + labelFor(solveFor) + '. Enter 0 for a loan that is fully repaid.'); ok = false; }
    if (!ok) { return; }

    if (needN && !(nIn.value > 0)) { fieldError('periods', 'Number of periods must be greater than zero.'); ok = false; }
    if (needN && nIn.value > 100000) { fieldError('periods', 'Keep the number of periods under 100,000.'); ok = false; }
    if (needRate && rateIn.value <= -100) { fieldError('rate', 'The annual rate must be greater than \u2212100%.'); ok = false; }
    if (needRate && rateIn.value > 1000) { fieldError('rate', 'The annual rate must be no more than 1,000%.'); ok = false; }
    if (needPV && Math.abs(pvIn.value) > 1e15) { fieldError('pv', 'That present value is too large to be meaningful.'); ok = false; }
    if (needPMT && Math.abs(pmtIn.value) > 1e15) { fieldError('pmt', 'That payment is too large to be meaningful.'); ok = false; }
    if (needFV && Math.abs(fvIn.value) > 1e15) { fieldError('fv', 'That future value is too large to be meaningful.'); ok = false; }
    if (!ok) { return; }

    var n = needN ? nIn.value : NaN;
    var annualRate = needRate ? rateIn.value / 100 : NaN;
    var pv = needPV ? pvIn.value : NaN;
    var pmt = needPMT ? pmtIn.value : NaN;
    var fv = needFV ? fvIn.value : NaN;

    // Resolve the unknown.
    var r = 0;
    if (solveFor === 'rate') {
      r = solveRate(n, pv, pmt, fv, begin);
      if (r === null || !isFinite(r) || r <= -1) {
        el.formAlert.textContent = 'No interest rate solves this set of cash flows. Check that at least one value is negative and one is positive.';
        el.formAlert.classList.remove('d-none');
        return;
      }
      annualRate = nominalFromPeriod(r, payPerYear, compPerYear);
    } else {
      r = periodRate(annualRate, payPerYear, compPerYear);
      if (r <= -1) {
        fieldError('rate', 'That rate and compounding frequency produce an impossible period rate.');
        return;
      }
    }

    var note = '';
    if (solveFor === 'fv') {
      fv = solveFV(r, n, pv, pmt, begin);
      setResult('Future value (FV)', money(fv) + '',
        'The balance at the end of period ' + fmtPeriods(n) + '. ' + timingNote(begin));
    } else if (solveFor === 'pv') {
      pv = solvePV(r, n, pmt, fv, begin);
      setResult('Present value (PV)', money(pv),
        'The lump sum today that makes the rest of the cash flows balance. ' + timingNote(begin));
    } else if (solveFor === 'pmt') {
      pmt = solvePMT(r, n, pv, fv, begin);
      if (pmt === null || !isFinite(pmt)) {
        el.formAlert.textContent = 'A payment cannot be solved from these inputs. Check that the number of periods and rate are not both zero.';
        el.formAlert.classList.remove('d-none');
        return;
      }
      setResult('Payment (PMT)', money2(pmt),
        'Paid every period for ' + fmtPeriods(n) + '. ' + timingNote(begin));
    } else if (solveFor === 'n') {
      n = solveN(r, pv, pmt, fv, begin);
      if (n === null || !isFinite(n)) {
        el.formAlert.textContent = 'No positive number of periods solves these cash flows. A growth or repayment path must exist for the values you entered.';
        el.formAlert.classList.remove('d-none');
        return;
      }
      if (n > 100000) {
        el.formAlert.textContent = 'The solution needs more than 100,000 periods, which is beyond the range this calculator reports.';
        el.formAlert.classList.remove('d-none');
        return;
      }
      var years = n / payPerYear;
      setResult('Number of periods (N)', fmtPeriods(n),
        'About ' + years.toFixed(2) + ' years at ' + payPerYear + ' period' + (payPerYear === 1 ? '' : 's') + ' per year. ' +
        (Math.abs(n - Math.round(n)) > 1e-6 ? 'Round up to ' + Math.ceil(n) + ' periods for a whole-period schedule. ' : '') +
        timingNote(begin));
      if (Math.abs(n - Math.round(n)) > 1e-6) {
        note = 'A fractional number of periods means the last payment would be a partial one. The schedule below uses ' + Math.ceil(n) + ' whole periods.';
      }
    } else {
      setResult('Annual interest rate (I/Y)', (annualRate * 100).toFixed(4) + '%',
        'Nominal annual rate with ' + compPerYear + ' compound' + (compPerYear === 1 ? '' : 's') + ' per year, equivalent to a period rate of ' + pct(r, 6) + '. ' + timingNote(begin));
    }

    // Effective annual rate, from the period rate actually in use.
    var ear = Math.pow(1 + r, payPerYear) - 1;

    var sched = buildSchedule(r, n, pv, pmt, begin);

    // Sanity check: does the schedule reproduce the solved future value?
    var residual = fv - (-sched.endBalance);
    if (Math.abs(residual) > Math.max(1e-6, Math.abs(fv) * 1e-6) && !sched.truncated) {
      note = (note ? note + ' ' : '') + 'Note: the equation balances, but the period-by-period simulation differs by ' +
        money2(residual) + ' because of rounding in the inputs.';
    }

    render(sched, { paid: sched.paid, received: sched.received, ear: ear });
    renderSchedule(sched);
    drawChart(sched.rows, n);
    if (note) { warn(note); }

    lastRender = true;
    el.resultCard.classList.remove('d-none');
    el.resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function fmtPeriods(n) {
    if (Math.abs(n - Math.round(n)) < 1e-6) { return String(Math.round(n)); }
    return n.toFixed(4);
  }

  function timingNote(begin) {
    return begin ? 'Payments are treated as an annuity due (start of period).' : 'Payments are treated as an ordinary annuity (end of period).';
  }

  function labelFor(v) {
    return {
      fv: 'future value', pv: 'present value', pmt: 'the payment',
      n: 'the number of periods', rate: 'the interest rate'
    }[v] || 'that variable';
  }

  /* ---------------- wiring ---------------- */

  function syncDisabled() {
    var solveFor = el.solveFor.value;
    var map = { fv: 'fv', pv: 'pv', pmt: 'pmt', n: 'periods', rate: 'rate' };
    Object.keys(map).forEach(function (key) {
      var input = el[map[key]];
      if (!input) { return; }
      var isUnknown = key === solveFor;
      input.disabled = isUnknown;
      input.placeholder = isUnknown ? 'solved for you' : '';
      input.classList.remove('is-invalid');
      input.removeAttribute('aria-invalid');
    });
    el.fvOptional.textContent = solveFor === 'fv' ? '(computed)' : '(leave blank to solve)';
  }

  function reset() {
    el.solveFor.value = DEFAULTS.solveFor;
    el.payPerYear.value = DEFAULTS.payPerYear;
    el.compPerYear.value = DEFAULTS.compPerYear;
    el.periods.value = DEFAULTS.periods;
    el.rate.value = DEFAULTS.rate;
    el.pv.value = DEFAULTS.pv;
    el.pmt.value = DEFAULTS.pmt;
    el.fv.value = DEFAULTS.fv;
    var endRadio = document.querySelector('input[name="timing"][value="end"]');
    if (endRadio) { endRadio.checked = true; }
    var labels = document.querySelectorAll('.btn-group-toggle .btn');
    labels.forEach(function (node, idx) { node.classList.toggle('active', idx === 0); });
    clearErrors();
    warn('');
    el.resultCard.classList.add('d-none');
    syncDisabled();
    el.periods.focus();
  }

  function loadExample() {
    el.solveFor.value = 'fv';
    el.payPerYear.value = '12';
    el.compPerYear.value = '12';
    el.periods.value = '120';
    el.rate.value = '7';
    el.pv.value = '-10000';
    el.pmt.value = '-500';
    el.fv.value = '';
    var endRadio = document.querySelector('input[name="timing"][value="end"]');
    if (endRadio) { endRadio.checked = true; }
    document.querySelectorAll('.btn-group-toggle .btn').forEach(function (node, idx) {
      node.classList.toggle('active', idx === 0);
    });
    syncDisabled();
    calculate();
  }

  el.calcBtn.addEventListener('click', calculate);
  el.resetBtn.addEventListener('click', reset);
  el.exampleBtn.addEventListener('click', loadExample);
  el.solveFor.addEventListener('change', syncDisabled);
  el.toolCard.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target && e.target.tagName === 'INPUT') {
      e.preventDefault();
      calculate();
    }
  });

  var resizeTimer = null;
  window.addEventListener('resize', function () {
    if (!lastRender) { return; }
    if (resizeTimer) { clearTimeout(resizeTimer); }
    resizeTimer = setTimeout(function () { calculate(); }, 180);
  });

  syncDisabled();
})();
