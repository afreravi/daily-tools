(function () {
  'use strict';

  var SQRT3 = Math.sqrt(3);
  var STD_BREAKERS = [5, 10, 15, 16, 20, 25, 30, 32, 35, 40, 45, 50, 60, 63, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 500, 600];

  var el = function (id) { return document.getElementById(id); };

  var wattsInput = el('watts');
  var voltsInput = el('volts');
  var pfInput = el('pf');
  var pfHelp = el('pfHelp');
  var voltsLabel = el('voltsLabel');
  var voltsHelp = el('voltsHelp');
  var errorBox = el('errorBox');
  var resultPanel = el('resultPanel');

  var statAmps = el('statAmps');
  var statAmpsNote = el('statAmpsNote');
  var statFormula = el('statFormula');
  var statWorking = el('statWorking');
  var statMilli = el('statMilli');
  var statAt120 = el('statAt120');
  var statBreaker = el('statBreaker');
  var statBreakerNote = el('statBreakerNote');
  var chartCaption = el('chartCaption');
  var refBody = el('refBody');

  var canvas = el('ampsChart');
  var ctx = canvas.getContext('2d');

  var currentType = 'dc';

  function num(input) {
    var raw = String(input.value).trim();
    if (raw === '') return { value: null, empty: true };
    var v = Number(raw);
    if (!isFinite(v)) return { value: null, invalid: true };
    return { value: v };
  }

  function fmt(value, decimals) {
    if (!isFinite(value)) return '--';
    var d = typeof decimals === 'number' ? decimals : (Math.abs(value) >= 100 ? 1 : 2);
    var rounded = Number(value.toFixed(d));
    return rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d });
  }

  function nextBreaker(amps) {
    for (var i = 0; i < STD_BREAKERS.length; i++) {
      if (STD_BREAKERS[i] >= amps) return STD_BREAKERS[i];
    }
    return null;
  }

  function updateFieldState() {
    var isDc = currentType === 'dc';
    pfInput.disabled = isDc;
    pfInput.setAttribute('aria-disabled', isDc ? 'true' : 'false');
    pfHelp.textContent = isDc
      ? 'Not used for DC circuits.'
      : 'Use 1.0 for resistive loads, about 0.8 for motors.';
    var isThree = currentType === 'ac3';
    voltsLabel.textContent = isThree ? 'Line-to-line voltage (volts)' : 'Voltage (volts)';
    voltsHelp.textContent = isThree
      ? 'Line-to-line value, e.g. 208, 400 or 480 V.'
      : 'Supply voltage across the load.';
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove('d-none');
    resultPanel.classList.add('d-none');
  }

  function clearError() {
    errorBox.textContent = '';
    errorBox.classList.add('d-none');
  }

  function ampsFor(power, volts, pf, type) {
    if (type === 'dc') return power / volts;
    if (type === 'ac1') return power / (volts * pf);
    return power / (SQRT3 * volts * pf);
  }

  function formulaText(type) {
    if (type === 'dc') return 'I = P / V';
    if (type === 'ac1') return 'I = P / (V x PF)';
    return 'I = P / (1.732 x V x PF)';
  }

  function workingText(type, power, volts, pf) {
    if (type === 'dc') {
      return fmt(power, 2) + ' W / ' + fmt(volts, 2) + ' V';
    }
    if (type === 'ac1') {
      return fmt(power, 2) + ' W / (' + fmt(volts, 2) + ' V x ' + fmt(pf, 2) + ')';
    }
    return fmt(power, 2) + ' W / (1.732 x ' + fmt(volts, 2) + ' V x ' + fmt(pf, 2) + ')';
  }

  function referenceVoltages(type) {
    if (type === 'dc') return [12, 24, 48, 120, 240];
    if (type === 'ac3') return [208, 240, 400, 415, 480];
    return [110, 120, 220, 230, 240];
  }

  function usageFor(v, type) {
    if (type === 'dc') {
      if (v <= 24) return 'Low-voltage battery and solar runs';
      if (v <= 48) return 'Telecom and off-grid DC banks';
      if (v <= 120) return 'DC distribution and controls';
      return 'High-voltage DC equipment';
    }
    if (type === 'ac3') {
      if (v <= 240) return 'Light industrial and HVAC plant';
      if (v <= 415) return 'European and Asian industrial mains';
      return 'North American industrial mains';
    }
    if (v <= 120) return 'North American household circuits';
    if (v <= 230) return 'European and UK household circuits';
    return 'Heavy domestic appliances';
  }

  function drawChart(power, pf, type, activeVolts) {
    var w = canvas.width;
    var h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    var padLeft = 58;
    var padRight = 18;
    var padTop = 18;
    var padBottom = 38;
    var plotW = w - padLeft - padRight;
    var plotH = h - padTop - padBottom;

    var vMax = activeVolts * 3;
    var vMin = activeVolts / 3;
    if (vMax <= vMin) { vMax = activeVolts + 1; vMin = Math.max(0.5, activeVolts - 1); }

    var samples = [];
    var steps = 60;
    var i;
    for (i = 0; i <= steps; i++) {
      var v = vMin + (vMax - vMin) * (i / steps);
      samples.push({ v: v, a: ampsFor(power, v, pf, type) });
    }

    var aMax = 0;
    for (i = 0; i < samples.length; i++) {
      if (samples[i].a > aMax) aMax = samples[i].a;
    }
    if (!isFinite(aMax) || aMax <= 0) aMax = 1;
    aMax = aMax * 1.08;

    function px(v) { return padLeft + ((v - vMin) / (vMax - vMin)) * plotW; }
    function py(a) { return padTop + plotH - (a / aMax) * plotH; }

    // grid
    ctx.strokeStyle = '#e7e1ef';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#6b6b73';
    ctx.font = '12px -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (i = 0; i <= 4; i++) {
      var aVal = (aMax / 4) * i;
      var y = py(aVal);
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
      ctx.fillText(fmt(aVal, aVal >= 100 ? 0 : 1), padLeft - 8, y);
    }

    // x axis ticks
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (i = 0; i <= 4; i++) {
      var vVal = vMin + (vMax - vMin) * (i / 4);
      var x = px(vVal);
      ctx.beginPath();
      ctx.moveTo(x, padTop + plotH);
      ctx.lineTo(x, padTop + plotH + 5);
      ctx.stroke();
      ctx.fillText(fmt(vVal, 0) + ' V', x, padTop + plotH + 9);
    }

    // axis titles
    ctx.textAlign = 'left';
    ctx.fillStyle = '#47056f';
    ctx.font = 'bold 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    ctx.fillText('Amps', 6, padTop + 6);
    ctx.textAlign = 'right';
    ctx.fillText('Supply voltage', padLeft + plotW, padTop + plotH + 24);

    // curve
    ctx.strokeStyle = '#60089c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (i = 0; i < samples.length; i++) {
      var cx = px(samples[i].v);
      var cy = py(samples[i].a);
      if (i === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);
    }
    ctx.stroke();

    // fill under curve
    ctx.lineTo(px(samples[samples.length - 1].v), padTop + plotH);
    ctx.lineTo(px(samples[0].v), padTop + plotH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(96, 8, 156, .08)';
    ctx.fill();

    // active point
    var activeAmps = ampsFor(power, activeVolts, pf, type);
    var ax = px(activeVolts);
    var ay = py(activeAmps);
    ctx.beginPath();
    ctx.arc(ax, ay, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#60089c';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(96, 8, 156, .35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(ax, padTop + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#47056f';
    ctx.font = 'bold 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(fmt(activeAmps, 2) + ' A at ' + fmt(activeVolts, 0) + ' V', Math.min(ax + 8, padLeft + plotW - 90), ay - 6);
  }

  function fillReferenceTable(power, pf, type) {
    var volts = referenceVoltages(type);
    var rows = '';
    for (var i = 0; i < volts.length; i++) {
      var a = ampsFor(power, volts[i], pf, type);
      rows += '<tr><td>' + fmt(volts[i], 0) + ' V</td><td><strong>' + fmt(a, 2) + ' A</strong></td><td>' + usageFor(volts[i], type) + '</td></tr>';
    }
    refBody.innerHTML = rows;
  }

  function calculate() {
    var wRes = num(wattsInput);
    var vRes = num(voltsInput);
    var pfRes = num(pfInput);

    var power = wRes.value;
    var volts = vRes.value;
    var pf = currentType === 'dc' ? 1 : pfRes.value;

    if (wRes.empty || vRes.empty) {
      showError('Enter both power in watts and voltage in volts to calculate current.');
      return;
    }
    if (wRes.invalid || vRes.invalid || (currentType !== 'dc' && pfRes.invalid)) {
      showError('Please enter valid numbers only.');
      return;
    }
    if (power <= 0) {
      showError('Power must be greater than zero watts.');
      return;
    }
    if (volts <= 0) {
      showError('Voltage must be greater than zero volts.');
      return;
    }
    if (currentType !== 'dc') {
      if (pf === null || pf <= 0) {
        showError('Power factor must be greater than zero.');
        return;
      }
      if (pf > 1) {
        showError('Power factor cannot exceed 1.0. Use a value between 0.1 and 1.');
        return;
      }
    }
    if (power > 1e9) {
      showError('That power value is too large for a meaningful result. Enter watts below 1,000,000,000.');
      return;
    }

    clearError();

    var amps = ampsFor(power, volts, pf, currentType);

    statAmps.textContent = fmt(amps, amps < 10 ? 3 : 2) + ' A';
    statAmpsNote.textContent = currentType === 'dc'
      ? 'DC current at ' + fmt(volts, 0) + ' V'
      : (currentType === 'ac1' ? 'AC single-phase at PF ' + fmt(pf, 2) : 'AC three-phase, line-to-line ' + fmt(volts, 0) + ' V');
    statFormula.textContent = formulaText(currentType);
    statWorking.textContent = workingText(currentType, power, volts, pf);

    statMilli.textContent = fmt(amps * 1000, amps * 1000 < 100 ? 1 : 0) + ' mA';

    var at120 = ampsFor(power, 120, pf, currentType);
    statAt120.textContent = fmt(at120, 2) + ' A';

    var breaker = nextBreaker(amps);
    if (breaker === null) {
      statBreaker.textContent = 'Above 600 A';
      statBreakerNote.textContent = 'Use switchgear or parallel conductors';
    } else {
      statBreaker.textContent = breaker + ' A';
      var usable = breaker * 0.8;
      statBreakerNote.textContent = amps <= usable
        ? '80% continuous limit: ' + fmt(usable, 1) + ' A'
        : 'Load exceeds the 80% continuous limit of ' + fmt(usable, 1) + ' A';
    }

    fillReferenceTable(power, pf, currentType);
    drawChart(power, pf, currentType, volts);

    chartCaption.textContent = 'Current falls as voltage rises. The marked point is your ' +
      fmt(power, 0) + ' W load at ' + fmt(volts, 0) + ' V, giving ' + fmt(amps, 2) + ' A.';

    resultPanel.classList.remove('d-none');
  }

  function reset() {
    wattsInput.value = '1500';
    voltsInput.value = '120';
    pfInput.value = '1';
    document.getElementById('ctDc').checked = true;
    currentType = 'dc';
    updateFieldState();
    clearError();
    resultPanel.classList.add('d-none');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    chartCaption.textContent = 'Run a calculation and the curve appears here.';
    refBody.innerHTML = '<tr><td colspan="3" class="text-muted">Run a calculation to fill this table.</td></tr>';
  }

  document.querySelectorAll('input[name="ctype"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      currentType = radio.value;
      updateFieldState();
      if (!resultPanel.classList.contains('d-none') || errorBox.textContent) calculate();
    });
  });

  el('calcBtn').addEventListener('click', calculate);
  el('resetBtn').addEventListener('click', reset);

  [wattsInput, voltsInput, pfInput].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); calculate(); }
    });
  });

  updateFieldState();
})();
