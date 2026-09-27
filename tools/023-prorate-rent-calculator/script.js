(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var rentEl = $("rent");
  var startEl = $("startDate");
  var endEl = $("endDate");
  var methodEl = $("method");
  var countEndEl = $("countEnd");
  var calcBtn = $("calcBtn");
  var resetBtn = $("resetBtn");
  var errorBox = $("errorBox");
  var panel = $("resultPanel");
  var canvas = $("rentChart");
  var ctx = canvas.getContext("2d");

  var DAY_MS = 86400000;

  function money(n) {
    return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  function daysInYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 366 : 365;
  }

  function parseDate(value) {
    if (!value) return null;
    var parts = value.split("-");
    if (parts.length !== 3) return null;
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var d = parseInt(parts[2], 10);
    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return dt;
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
    panel.classList.add("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function defaultDates() {
    var today = new Date();
    var y = today.getFullYear();
    var m = today.getMonth();
    var last = daysInMonth(y, m);
    startEl.value = y + "-" + String(m + 1).padStart(2, "0") + "-12";
    endEl.value = y + "-" + String(m + 1).padStart(2, "0") + "-" + String(last).padStart(2, "0");
  }

  function calculate() {
    clearError();

    var rent = parseFloat(rentEl.value);
    if (rentEl.value.trim() === "" || isNaN(rent)) {
      return showError("Enter the monthly rent as a number.");
    }
    if (rent < 0) {
      return showError("Rent cannot be negative. Enter the monthly amount as a positive number.");
    }

    var start = parseDate(startEl.value);
    var end = parseDate(endEl.value);
    if (!start) return showError("Choose a valid move-in date.");
    if (!end) return showError("Choose a valid move-out date.");

    if (end < start) {
      return showError("The move-out date is before the move-in date. Check the dates and try again.");
    }

    if (start.getFullYear() !== end.getFullYear() || start.getMonth() !== end.getMonth()) {
      return showError("This calculator prorates a single calendar month. Run it once per month, or enter dates that fall within one month.");
    }

    var inclusive = countEndEl.value === "inclusive";
    var daysOccupied = Math.round((end - start) / DAY_MS) + (inclusive ? 1 : 0);

    if (daysOccupied <= 0) {
      return showError("The occupancy window must include at least one full day.");
    }

    var year = start.getFullYear();
    var monthIndex = start.getMonth();
    var dim = daysInMonth(year, monthIndex);
    var diy = daysInYear(year);

    if (daysOccupied > dim) {
      daysOccupied = dim;
    }

    var monthAmount = (rent / dim) * daysOccupied;
    var thirtyAmount = (rent / 30) * daysOccupied;
    var annualAmount = ((rent * 12) / diy) * daysOccupied;

    var method = methodEl.value;
    var headline = monthAmount;
    var headlineLabel = "days-in-month method";
    if (method === "thirty") { headline = thirtyAmount; headlineLabel = "flat 30-day method"; }
    if (method === "annual") { headline = annualAmount; headlineLabel = "days-in-year method"; }

    var dailyRate = headline / daysOccupied;
    var saved = rent - headline;
    var share = (daysOccupied / dim) * 100;

    $("statHero").textContent = money(headline);
    $("statHeroNote").textContent = headlineLabel;
    $("statDays").textContent = daysOccupied + (daysOccupied === 1 ? " day" : " days");
    $("statDaysNote").textContent = "of " + dim + " days in " + start.toLocaleString("en-US", { month: "long" }) + " " + year +
      (inclusive ? " (move-out day counted)" : " (move-out day not counted)");
    $("statDaily").textContent = money(dailyRate);
    $("statDailyNote").textContent = "per occupied day";
    $("statFull").textContent = money(rent);
    $("statSave").textContent = money(saved > 0 ? saved : 0);
    $("statShare").textContent = share.toFixed(1) + "%";

    renderBreakdown(monthAmount, thirtyAmount, annualAmount, rent, dim, diy, daysOccupied);
    drawChart(monthAmount, thirtyAmount, annualAmount, rent, method);

    panel.classList.remove("d-none");
  }

  function renderBreakdown(monthAmount, thirtyAmount, annualAmount, rent, dim, diy, days) {
    var rows = [
      ["Days in the calendar month", rent.toFixed(2) + " &divide; " + dim + " &times; " + days, monthAmount],
      ["Flat 30-day month", rent.toFixed(2) + " &divide; 30 &times; " + days, thirtyAmount],
      ["Days in the year", (rent * 12).toFixed(2) + " &divide; " + diy + " &times; " + days, annualAmount],
      ["Whole month (no proration)", rent.toFixed(2), rent]
    ];
    var html = "";
    for (var i = 0; i < rows.length; i++) {
      html += "<tr><td>" + rows[i][0] + "</td><td class=\"text-muted small\">" + rows[i][1] + "</td><td class=\"text-right font-weight-bold\">" + money(rows[i][2]) + "</td></tr>";
    }
    $("breakBody").innerHTML = html;
  }

  function drawChart(monthAmount, thirtyAmount, annualAmount, rent, method) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 840;
    var cssHeight = 270;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var bars = [
      { label: "Days in month", value: monthAmount, key: "month" },
      { label: "Flat 30-day", value: thirtyAmount, key: "thirty" },
      { label: "Days in year", value: annualAmount, key: "annual" },
      { label: "Whole month", value: rent, key: "full" }
    ];
    var max = Math.max(rent, monthAmount, thirtyAmount, annualAmount, 1);

    var padLeft = 64, padRight = 16, padTop = 22, padBottom = 44;
    var plotW = cssWidth - padLeft - padRight;
    var plotH = cssHeight - padTop - padBottom;

    // gridlines + y labels
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var gy = padTop + plotH - (plotH * g / 4);
      ctx.strokeStyle = "#eee6f6";
      ctx.beginPath();
      ctx.moveTo(padLeft, gy);
      ctx.lineTo(padLeft + plotW, gy);
      ctx.stroke();
      ctx.fillStyle = "#6a6673";
      ctx.fillText("$" + Math.round(max * g / 4).toLocaleString("en-US"), padLeft - 8, gy);
    }

    var slot = plotW / bars.length;
    var barW = Math.min(74, slot * 0.55);

    for (var i = 0; i < bars.length; i++) {
      var b = bars[i];
      var h = (b.value / max) * plotH;
      var x = padLeft + slot * i + (slot - barW) / 2;
      var y = padTop + plotH - h;

      var isActive = b.key === method;
      var grad = ctx.createLinearGradient(0, y, 0, padTop + plotH);
      if (b.key === "full") {
        grad.addColorStop(0, "#b8b2c4");
        grad.addColorStop(1, "#8f879e");
      } else if (isActive) {
        grad.addColorStop(0, "#8b2fd0");
        grad.addColorStop(1, "#60089c");
      } else {
        grad.addColorStop(0, "#c9a4ea");
        grad.addColorStop(1, "#a66adf");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, h);

      if (isActive) {
        ctx.strokeStyle = "#3f0568";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barW, h);
        ctx.lineWidth = 1;
      }

      ctx.fillStyle = "#3f0568";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.font = "600 11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText("$" + b.value.toFixed(0), x + barW / 2, y - 4);

      ctx.fillStyle = "#221f28";
      ctx.textBaseline = "top";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(b.label, x + barW / 2, padTop + plotH + 8);
    }

    ctx.strokeStyle = "#dcd3ea";
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    $("chartCaption").textContent = "The outlined bar is your selected method. In this month, the methods differ by " +
      money(Math.max(monthAmount, thirtyAmount, annualAmount) - Math.min(monthAmount, thirtyAmount, annualAmount)) + ".";
  }

  calcBtn.addEventListener("click", calculate);
  resetBtn.addEventListener("click", function () {
    rentEl.value = 1800;
    methodEl.value = "month";
    countEndEl.value = "inclusive";
    defaultDates();
    clearError();
    panel.classList.add("d-none");
    $("breakBody").innerHTML = "<tr><td colspan=\"3\" class=\"text-muted\">Run the calculation to fill this table.</td></tr>";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $("chartCaption").textContent = "Run the calculation and the bars appear here.";
  });

  [rentEl, startEl, endEl].forEach(function (el) {
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); calculate(); }
    });
    el.addEventListener("change", function () { if (!panel.classList.contains("d-none")) calculate(); });
  });
  methodEl.addEventListener("change", function () { if (!panel.classList.contains("d-none")) calculate(); });
  countEndEl.addEventListener("change", function () { if (!panel.classList.contains("d-none")) calculate(); });

  defaultDates();
})();
