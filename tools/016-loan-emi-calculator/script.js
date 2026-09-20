(function () {
  "use strict";

  var MAX_MONTHS = 600;
  var PREVIEW_ROWS = 12;

  var form = document.getElementById("emiForm");
  var principalEl = document.getElementById("principalInput");
  var rateEl = document.getElementById("rateInput");
  var tenureEl = document.getElementById("tenureInput");
  var unitEl = document.getElementById("tenureUnit");
  var extraEl = document.getElementById("extraInput");
  var errorBox = document.getElementById("errorBox");
  var results = document.getElementById("results");
  var toggleBtn = document.getElementById("toggleAllBtn");
  var tableNote = document.getElementById("tableNote");
  var tbody = document.getElementById("amortBody");
  var canvas = document.getElementById("breakdownChart");

  var schedule = [];
  var showAll = false;

  function money(value) {
    return "$" + value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function moneyShort(value) {
    if (value >= 1e9) return "$" + (value / 1e9).toFixed(2) + "B";
    if (value >= 1e6) return "$" + (value / 1e6).toFixed(2) + "M";
    if (value >= 1e3) return "$" + (value / 1e3).toFixed(1) + "K";
    return "$" + value.toFixed(0);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function parseNumber(el) {
    var raw = el.value.trim();
    if (raw === "") return NaN;
    var n = Number(raw);
    return isFinite(n) ? n : NaN;
  }

  /* Build the amortization schedule with the standard annuity formula, then
     walk every month so the table and totals stay internally consistent. */
  function buildSchedule(principal, annualRate, months, extra) {
    var monthlyRate = annualRate / 12 / 100;
    var baseEmi;

    if (monthlyRate === 0) {
      baseEmi = principal / months;
    } else {
      var growth = Math.pow(1 + monthlyRate, months);
      baseEmi = (principal * monthlyRate * growth) / (growth - 1);
    }

    var totalPayment = baseEmi + extra;
    var rows = [];
    var balance = principal;
    var totalInterest = 0;
    var totalPaid = 0;
    var guard = 0;

    while (balance > 0.005 && guard < 100000) {
      guard++;
      var interest = balance * monthlyRate;
      var payment = totalPayment;

      // Never overpay on the final instalment.
      if (payment > balance + interest) payment = balance + interest;

      var principalPart = payment - interest;
      if (principalPart < 0) principalPart = 0;

      balance = balance - principalPart;
      if (balance < 0.005) balance = 0;

      totalInterest += interest;
      totalPaid += payment;

      rows.push({
        month: rows.length + 1,
        payment: payment,
        principal: principalPart,
        interest: interest,
        balance: balance
      });
    }

    return {
      rows: rows,
      emi: baseEmi,
      extra: extra,
      totalInterest: totalInterest,
      totalPaid: totalPaid,
      months: rows.length
    };
  }

  function renderSummary(result, baseline) {
    document.getElementById("emiOut").textContent = money(result.emi + result.extra);
    document.getElementById("interestOut").textContent = money(result.totalInterest);
    document.getElementById("totalOut").textContent = money(result.totalPaid);
    document.getElementById("paymentsOut").textContent = result.months + " months";
    document.getElementById("shareOut").textContent =
      result.totalPaid > 0
        ? ((result.totalInterest / result.totalPaid) * 100).toFixed(1) + "%"
        : "0%";

    if (baseline && result.extra > 0) {
      var saved = baseline.totalInterest - result.totalInterest;
      var savedMonths = baseline.months - result.months;
      document.getElementById("savedOut").textContent = money(Math.max(saved, 0));
      document.getElementById("timeSavedOut").textContent =
        savedMonths > 0 ? savedMonths + " months" : "0 months";
    } else {
      document.getElementById("savedOut").textContent = "n/a";
      document.getElementById("timeSavedOut").textContent = "n/a";
    }
  }

  function formatMonths(total) {
    if (total < 12) return total + " mo";
    var years = Math.floor(total / 12);
    var rem = total % 12;
    return rem === 0 ? years + " yr" : years + " yr " + rem + " mo";
  }

  function buildTableRows() {
    var frag = document.createDocumentFragment();
    var limit = showAll ? schedule.length : Math.min(PREVIEW_ROWS, schedule.length);
    var lastYear = 0;

    for (var i = 0; i < limit; i++) {
      var row = schedule[i];
      var year = Math.floor((row.month - 1) / 12) + 1;

      if (showAll && year !== lastYear) {
        var yearRow = document.createElement("tr");
        yearRow.className = "year-row";
        var yearCell = document.createElement("td");
        yearCell.colSpan = 5;
        yearCell.textContent = "Year " + year;
        yearRow.appendChild(yearCell);
        frag.appendChild(yearRow);
        lastYear = year;
      }

      var tr = document.createElement("tr");
      var cells = [
        String(row.month),
        money(row.payment),
        money(row.principal),
        money(row.interest),
        money(row.balance)
      ];

      cells.forEach(function (text, idx) {
        var td = document.createElement("td");
        td.textContent = text;
        if (idx > 0) td.className = "text-right";
        tr.appendChild(td);
      });
      frag.appendChild(tr);
    }

    tbody.innerHTML = "";
    tbody.appendChild(frag);

    var shown = limit;
    tableNote.textContent = showAll
      ? "Showing all " + shown + " months."
      : "Showing the first " + shown + " of " + schedule.length + " months.";
  }

  function drawChart() {
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 800;
    var cssHeight = 300;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    canvas.style.height = cssHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    if (!schedule.length) return;

    // Group by calendar year of the loan.
    var years = [];
    schedule.forEach(function (row) {
      var idx = Math.floor((row.month - 1) / 12);
      if (!years[idx]) years[idx] = { principal: 0, interest: 0 };
      years[idx].principal += row.principal;
      years[idx].interest += row.interest;
    });

    var padLeft = 62;
    var padRight = 12;
    var padTop = 18;
    var padBottom = 34;
    var plotW = cssWidth - padLeft - padRight;
    var plotH = cssHeight - padTop - padBottom;

    var maxTotal = 0;
    years.forEach(function (y) {
      maxTotal = Math.max(maxTotal, y.principal + y.interest);
    });
    if (maxTotal <= 0) return;

    var axisSteps = 4;
    var gridColor = "#e6e0ee";
    var textColor = "#6b6b73";

    ctx.font = "11px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "middle";

    for (var s = 0; s <= axisSteps; s++) {
      var value = (maxTotal / axisSteps) * s;
      var y = padTop + plotH - (plotH * s) / axisSteps;
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, y + 0.5);
      ctx.lineTo(padLeft + plotW, y + 0.5);
      ctx.stroke();
      ctx.fillStyle = textColor;
      ctx.textAlign = "right";
      ctx.fillText(moneyShort(value), padLeft - 8, y);
    }

    var slot = plotW / years.length;
    var barW = Math.max(4, Math.min(48, slot * 0.62));

    years.forEach(function (y, i) {
      var cx = padLeft + slot * i + slot / 2;
      var x = cx - barW / 2;
      var total = y.principal + y.interest;
      var interestH = (y.interest / maxTotal) * plotH;
      var principalH = (y.principal / maxTotal) * plotH;

      // Interest band (light) on the bottom, principal (brand) on top.
      ctx.fillStyle = "#d9bff0";
      ctx.fillRect(x, padTop + plotH - interestH, barW, interestH);
      ctx.fillStyle = "#60089c";
      ctx.fillRect(x, padTop + plotH - interestH - principalH, barW, principalH);

      if (years.length <= 16 || i % Math.ceil(years.length / 12) === 0) {
        ctx.fillStyle = textColor;
        ctx.textAlign = "center";
        ctx.fillText("Y" + (i + 1), cx, padTop + plotH + 16);
      }
    });

    ctx.strokeStyle = gridColor;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotH + 0.5);
    ctx.lineTo(padLeft + plotW, padTop + plotH + 0.5);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = textColor;
    ctx.fillText("Total scheduled: " + moneyShort(maxTotal) + " in year 1-heavy outgo", padLeft, 10);
  }

  function calculate() {
    clearError();

    var principal = parseNumber(principalEl);
    var rate = parseNumber(rateEl);
    var tenure = parseNumber(tenureEl);
    var extra = extraEl.value.trim() === "" ? 0 : parseNumber(extraEl);
    var unit = unitEl.value;

    if (isNaN(principal) || principal <= 0) {
      showError("Please enter a loan amount greater than zero.");
      principalEl.focus();
      return;
    }
    if (isNaN(rate) || rate < 0 || rate > 100) {
      showError("Please enter an annual interest rate between 0 and 100.");
      rateEl.focus();
      return;
    }
    if (isNaN(tenure) || tenure <= 0 || tenure % 1 !== 0) {
      showError("Please enter a whole number of years or months greater than zero.");
      tenureEl.focus();
      return;
    }
    if (isNaN(extra) || extra < 0) {
      showError("The extra monthly payment must be zero or a positive number.");
      extraEl.focus();
      return;
    }

    var months = unit === "years" ? tenure * 12 : tenure;
    if (months > MAX_MONTHS) {
      showError("That tenure is longer than " + (MAX_MONTHS / 12) + " years. Please use a shorter term.");
      tenureEl.focus();
      return;
    }
    if (principal > 1e12) {
      showError("That loan amount looks too large for this calculator. Please check the figure.");
      principalEl.focus();
      return;
    }

    var result = buildSchedule(principal, rate, months, extra);
    var baseline = extra > 0 ? buildSchedule(principal, rate, months, 0) : null;

    if (!result.rows.length) {
      showError("No payment schedule could be created from those inputs.");
      return;
    }

    schedule = result.rows;
    showAll = false;
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "Show all months";
    buildTableRows();
    drawChart();

    results.classList.remove("d-none");
    renderSummary(result, baseline);
    if (unit === "years") {
      tableNote.textContent += " (" + formatMonths(months) + " term)";
    }
    results.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    calculate();
  });

  form.addEventListener("reset", function () {
    clearError();
    results.classList.add("d-none");
    schedule = [];
    showAll = false;
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.textContent = "Show all months";
  });

  toggleBtn.addEventListener("click", function () {
    if (!schedule.length) return;
    showAll = !showAll;
    toggleBtn.setAttribute("aria-expanded", showAll ? "true" : "false");
    toggleBtn.textContent = showAll ? "Show first 12 months" : "Show all months";
    buildTableRows();
  });

  window.addEventListener("resize", function () {
    if (schedule.length) drawChart();
  });
})();