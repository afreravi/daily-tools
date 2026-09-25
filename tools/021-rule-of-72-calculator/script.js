(function () {
  'use strict';

  function el(id) { return document.getElementById(id); }

  var rateInput = el('rate');
  var yearsInput = el('years');
  var compoundsSel = el('compounds');
  var calcBtn = el('calcBtn');
  var resetBtn = el('resetBtn');
  var errorBox = el('errorBox');
  var resultPanel = el('resultPanel');

  var rateGroup = el('rateGroup');
  var yearsGroup = el('yearsGroup');

  var heroLabel = el('heroLabel');
  var statHero = el('statHero');
  var statHeroNote = el('statHeroNote');
  var statExact = el('statExact');
  var statExactNote = el('statExactNote');
  var stat72 = el('stat72');
  var stat693 = el('stat693');
  var stat70 = el('stat70');
  var statError = el('statError');
  var statErrorNote = el('statErrorNote');
  var mileBody = el('mileBody');

  var canvas = el('ruleChart');
  var ctx = canvas.getContext('2d');
  var chartCaption = el('chartCaption');

  var MAX_RATE = 1000;
  var MIN_RATE = 0.1;

  function currentMode() {
    return el('modeYears').checked ? 'years' : 'rate';
  }

  function compounds() {
    var n = parseFloat(compoundsSel.value);
    return isNaN(n) ? 12 : n; // 0 means continuous
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove('d-none');
    resultPanel.classList.add('d-none');
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.add('d-none');
  }

  function fmt(n, dp) {
    if (!isFinite(n)) return '\u2014';
    return n.toFixed(dp === undefined ? 2 : dp);
  }

  // Exact doubling time for a nominal annual rate (percent) and periods per year.
  function exactYears(ratePct, n) {
    var r = ratePct / 100;
    if (r <= 0) return NaN;
    if (n === 0) return Math.log(2) / r;
    return Math.log(2) / (n * Math.log(1 + r / n));
  }

  // Exact nominal annual rate (percent) needed to double in t years.
  function exactRatePct(t, n) {
    if (t <= 0) return NaN;
    if (n === 0) return (Math.log(2) / t) * 100;
    return (Math.pow(2, 1 / (n * t)) - 1) * n * 100;
  }

  function setModeVisibility() {
    var mode = currentMode();
    rateGroup.style.display = mode === 'rate' ? '' : 'none';
    yearsGroup.style.display = mode === 'years' ? '' : 'none';
  }

  function readNumber(input, label, min, max) {
    var raw = input.value.trim();
    if (raw === '') return { error: 'Enter a ' + label + '.' };
    var v = Number(raw);
    if (!isFinite(v)) return { error: 'Enter a valid number for the ' + label + '.' };
    if (v <= 0) return { error: 'The ' + label + ' must be greater than zero.' };
    if (v < min || v > max) {
      return { error: 'Enter a ' + label + ' between ' + min + ' and ' + max + '.' };
    }
    return { value: v };
  }

  function calculate() {
    clearError();
    var mode = currentMode();
    var n = compounds();

    var ratePct, tYears;

    if (mode === 'rate') {
      var rRes = readNumber(rateInput, 'annual rate of return', MIN_RATE, MAX_RATE);
      if (rRes.error) { showError(rRes.error); return; }
      ratePct = rRes.value;
      tYears = 72 / ratePct;
    } else {
      var yRes = readNumber(yearsInput, 'doubling time', 0.5, 200);
      if (yRes.error) { showError(yRes.error); return; }
      tYears = yRes.value;
      ratePct = 72 / tYears;
    }

    var rule72 = 72 / ratePct;
    var rule70 = 70 / ratePct;
    var rule693 = 69.3147 / ratePct;
    var exact = mode === 'rate' ? exactYears(ratePct, n) : exactRatePct(tYears, n);

    var exactLabel = mode === 'rate'
      ? fmt(exact, 2) + ' years'
      : fmt(exact, 2) + '% per year';

    var errorPct = mode === 'rate'
      ? (exact - rule72) / exact * 100
      : (exact - ratePct) / exact * 100;

    // Hero tile
    if (mode === 'rate') {
      heroLabel.textContent = 'Doubling time (rule of 72)';
      statHero.textContent = fmt(rule72, 1);
      statHeroNote.textContent = 'years for ' + fmt(ratePct, 2) + '% to double your money';
    } else {
      heroLabel.textContent = 'Rate needed (rule of 72)';
      statHero.textContent = fmt(ratePct, 1) + '%';
      statHeroNote.textContent = 'annual return to double in ' + fmt(tYears, 1) + ' years';
    }

    statExact.textContent = exactLabel;
    statExactNote.textContent = mode === 'rate'
      ? 'compounding ' + (n === 0 ? 'continuously' : n + '\u00d7 per year')
      : 'nominal rate, compounding ' + (n === 0 ? 'continuously' : n + '\u00d7 per year');

    stat72.textContent = mode === 'rate' ? fmt(rule72, 1) + ' yrs' : fmt(72 / tYears, 1) + '%';
    stat693.textContent = mode === 'rate' ? fmt(rule693, 1) + ' yrs' : fmt(69.3147 / tYears, 1) + '%';
    stat70.textContent = mode === 'rate' ? fmt(rule70, 1) + ' yrs' : fmt(70 / tYears, 1) + '%';

    statError.textContent = (errorPct >= 0 ? '+' : '') + fmt(errorPct, 1) + '%';
    statErrorNote.textContent = errorPct >= 0 ? 'rule of 72 overstates the wait' : 'rule of 72 understates the wait';
    statErrorNote.className = 'stat-note ' + (Math.abs(errorPct) <= 2 ? 'is-good' : 'is-bad');

    buildMilestones(ratePct, n);
    drawChart(ratePct, n, mode);

    resultPanel.classList.remove('d-none');
  }

  function buildMilestones(ratePct, n) {
    var perDouble = 72 / ratePct;
    var rows = '';
    for (var i = 1; i <= 5; i++) {
      var cum = perDouble * i;
      var exactValue = 1000 * Math.pow(2, i); // exact doubling by definition
      rows += '<tr><td>' + i + (i === 1 ? 'st' : i === 2 ? 'nd' : i === 3 ? 'rd' : 'th') + ' double</td>' +
        '<td>' + fmt(perDouble, 1) + '</td>' +
        '<td>' + fmt(cum, 1) + '</td>' +
        '<td>$' + exactValue.toLocaleString('en-US', { maximumFractionDigits: 0 }) + '</td></tr>';
    }
    mileBody.innerHTML = rows;
  }

  function drawChart(ratePct, n, mode) {
    var w = canvas.width;
    var h = canvas.height;
    var padL = 52, padR = 16, padT = 18, padB = 40;
    var plotW = w - padL - padR;
    var plotH = h - padT - padB;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    var maxRate = Math.max(20, Math.ceil(ratePct * 1.25));
    var minRate = 1;
    if (maxRate <= minRate) maxRate = minRate + 1;

    var maxY = 72 / minRate;
    if (maxY > 80) maxY = 80;
    maxY = Math.ceil(maxY / 10) * 10;

    function xFor(rate) { return padL + (rate - minRate) / (maxRate - minRate) * plotW; }
    function yFor(years) { return padT + plotH - Math.min(years, maxY) / maxY * plotH; }

    // grid
    ctx.strokeStyle = '#efe9f6';
    ctx.lineWidth = 1;
    ctx.font = '11px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.fillStyle = '#6a6673';
    for (var y = 0; y <= maxY; y += 10) {
      var yy = yFor(y);
      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(w - padR, yy); ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(y + 'y', padL - 8, yy + 4);
    }
    var step = Math.max(1, Math.round((maxRate - minRate) / 6));
    for (var r = minRate; r <= maxRate; r += step) {
      var xx = xFor(r);
      ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + plotH); ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(r + '%', xx, h - padB + 18);
    }

    // axes
    ctx.strokeStyle = '#c9bcdd';
    ctx.beginPath();
    ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(w - padR, padT + plotH);
    ctx.stroke();

    function plot(fn, color, dash) {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.setLineDash(dash || []);
      ctx.beginPath();
      var started = false;
      for (var rate = minRate; rate <= maxRate; rate += (maxRate - minRate) / 200) {
        var val = fn(rate);
        if (!isFinite(val) || val > maxY) { started = false; continue; }
        var px = xFor(rate), py = yFor(val);
        if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }
      }
      ctx.stroke();
      ctx.restore();
    }

    plot(function (r) { return 72 / r; }, '#60089c');
    plot(function (r) { return 70 / r; }, '#8b2fd0', [6, 4]);
    plot(function (r) { return exactYears(r, n); }, '#1c7d4d', [2, 3]);

    // marker for the user's rate
    if (mode === 'rate' && ratePct >= minRate && ratePct <= maxRate) {
      var mx = xFor(ratePct);
      var my = yFor(72 / ratePct);
      ctx.fillStyle = '#60089c';
      ctx.beginPath();
      ctx.arc(mx, my, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // legend
    ctx.font = '12px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textAlign = 'left';
    var legendY = padT + 10;
    ctx.fillStyle = '#60089c'; ctx.fillRect(padL + 8, legendY - 8, 16, 3);
    ctx.fillStyle = '#34303c'; ctx.fillText('Rule of 72', padL + 30, legendY - 3);
    ctx.fillStyle = '#8b2fd0'; ctx.fillRect(padL + 118, legendY - 8, 16, 3);
    ctx.fillStyle = '#34303c'; ctx.fillText('Rule of 70', padL + 140, legendY - 3);
    ctx.fillStyle = '#1c7d4d'; ctx.fillRect(padL + 228, legendY - 8, 16, 3);
    ctx.fillStyle = '#34303c'; ctx.fillText('Exact', padL + 250, legendY - 3);

    chartCaption.textContent = 'Years to double (vertical) against annual rate (horizontal). ' +
      'The gap between the purple shortcut line and the green exact curve is the error you accept for doing the maths in your head.';
  }

  function reset() {
    rateInput.value = '8';
    yearsInput.value = '9';
    compoundsSel.value = '12';
    el('modeRate').checked = true;
    el('modeYears').checked = false;
    var labels = document.querySelectorAll('.btn-group-toggle label');
    labels.forEach(function (l) { l.classList.remove('active'); });
    document.querySelectorAll('.btn-group-toggle').forEach(function (g) {
      var first = g.querySelector('label');
      if (first) first.classList.add('active');
    });
    setModeVisibility();
    clearError();
    resultPanel.classList.add('d-none');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chartCaption.textContent = 'Run the calculation and the curves appear here.';
  }

  calcBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', reset);

  [rateInput, yearsInput].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    });
  });

  [el('modeRate'), el('modeYears')].forEach(function (radio) {
    radio.addEventListener('change', function () {
      setModeVisibility();
      clearError();
      resultPanel.classList.add('d-none');
    });
  });

  setModeVisibility();
})();
