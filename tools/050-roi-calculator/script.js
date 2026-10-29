(function () {
  "use strict";

  var form = document.getElementById("roiForm");
  var results = document.getElementById("results");
  var errorBox = document.getElementById("formError");

  var initialEl = document.getElementById("initialInput");
  var returnEl = document.getElementById("returnInput");
  var costEl = document.getElementById("costInput");
  var periodEl = document.getElementById("periodInput");
  var unitEl = document.getElementById("periodUnit");

  var DAYS_PER_YEAR = 365;

  function toNumber(el) {
    var raw = String(el.value).trim();
    if (raw === "") return NaN;
    var n = Number(raw);
    return isFinite(n) ? n : NaN;
  }

  function money(n) {
    var abs = Math.abs(n);
    var str = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? "-$" : "$") + str;
  }

  function compact(n) {
    var abs = Math.abs(n);
    if (abs >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return String(Math.round(n));
  }

  function pct(n) {
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
  }

  function yearsFromPeriod(value, unit) {
    if (unit === "years") return value;
    if (unit === "days") return value / DAYS_PER_YEAR;
    return value / 12;
  }

  function periodLabel(value, unit) {
    var v = value === 1 ? value : value;
    return v + " " + (value === 1 ? unit.replace(/s$/, "") : unit);
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
    results.classList.add("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function render(initial, ret, cost, period, unit) {
    var totalCost = initial + cost;
    var netProfit = ret - totalCost;
    var roi = totalCost > 0 ? (netProfit / totalCost) * 100 : NaN;

    var years = yearsFromPeriod(period, unit);
    var ratio = totalCost > 0 ? ret / totalCost : NaN;
    var annualized = NaN;

    if (isFinite(years) && years > 0 && isFinite(ratio)) {
      if (ratio > 0) {
        annualized = (Math.pow(ratio, 1 / years) - 1) * 100;
      } else {
        annualized = -100;
      }
    }

    // Headline ROI
    var roiValue = document.getElementById("roiValue");
    roiValue.textContent = isFinite(roi) ? pct(roi) : "n/a";
    roiValue.className = "stat-value" + (isFinite(roi) ? (roi < 0 ? " negative" : roi > 0 ? " positive" : "") : "");
    document.getElementById("roiNote").textContent =
      isFinite(roi) ? (roi < 0 ? "You lost money on this investment." : "Return on total cost of " + money(totalCost) + ".") : "Enter a positive investment.";

    // Net profit
    var profitValue = document.getElementById("profitValue");
    profitValue.textContent = money(netProfit);
    profitValue.className = "stat-value" + (netProfit < 0 ? " negative" : netProfit > 0 ? " positive" : "");
    document.getElementById("profitNote").textContent =
      netProfit < 0 ? "Loss after costs." : "Return minus everything you put in.";

    // Annualized
    var annualValue = document.getElementById("annualValue");
    var annualNote = document.getElementById("annualNote");
    if (isFinite(annualized)) {
      annualValue.textContent = pct(annualized);
      annualValue.className = "stat-value" + (annualized < 0 ? " negative" : annualized > 0 ? " positive" : "");
      annualNote.textContent = "Equivalent yearly rate over " + periodLabel(period, unit) + ".";
    } else {
      annualValue.textContent = "n/a";
      annualValue.className = "stat-value";
      annualNote.textContent = "Add a holding period above 0 to annualize.";
    }

    renderChart(totalCost, ret, netProfit);
    renderTable(initial, cost, totalCost, ret, netProfit, roi, annualized, period, unit, years);

    results.classList.remove("d-none");
    results.focus();
  }

  function renderChart(totalCost, ret, netProfit) {
    var chart = document.getElementById("chart");
    chart.innerHTML = "";
    var maxAbs = Math.max(Math.abs(totalCost), Math.abs(ret), Math.abs(netProfit), 1);

    var series = [
      { label: "Invested", value: totalCost, cls: "" },
      { label: "Returned", value: ret, cls: "" },
      { label: "Net profit", value: netProfit, cls: netProfit < 0 ? "negative" : "profit" }
    ];

    series.forEach(function (s) {
      var col = document.createElement("div");
      col.className = "chart-col";

      var val = document.createElement("span");
      val.className = "chart-val";
      val.textContent = compact(s.value);

      var bar = document.createElement("div");
      bar.className = "chart-bar " + s.cls;
      bar.style.height = Math.max(3, (Math.abs(s.value) / maxAbs) * 150) + "px";

      var lbl = document.createElement("span");
      lbl.className = "chart-lbl";
      lbl.textContent = s.label;

      col.appendChild(val);
      col.appendChild(bar);
      col.appendChild(lbl);
      chart.appendChild(col);
    });
  }

  function renderTable(initial, cost, totalCost, ret, netProfit, roi, annualized, period, unit, years) {
    var body = document.getElementById("breakdownBody");
    body.innerHTML = "";

    function row(label, value, isTotal) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = label;
      th.className = "font-weight-normal";
      var td = document.createElement("td");
      td.className = "num";
      td.textContent = value;
      tr.appendChild(th);
      tr.appendChild(td);
      body.appendChild(tr);
    }

    row("Initial investment", money(initial));
    row("Additional costs", money(cost));
    row("Total invested", money(totalCost));
    row("Total return received", money(ret));
    row("Net profit", money(netProfit));
    row("Return on investment", isFinite(roi) ? pct(roi) : "n/a");
    row("Holding period", periodLabel(period, unit) + (isFinite(years) ? " (" + years.toFixed(2) + " yr)" : ""));
    row("Annualized ROI", isFinite(annualized) ? pct(annualized) : "n/a");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var initial = toNumber(initialEl);
    var ret = toNumber(returnEl);
    var cost = costEl.value.trim() === "" ? 0 : toNumber(costEl);
    var period = toNumber(periodEl);
    var unit = unitEl.value;

    if (!isFinite(initial) || initial <= 0) {
      return showError("Enter an initial investment greater than 0.");
    }
    if (!isFinite(ret) || ret < 0) {
      return showError("Enter a total return of 0 or more.");
    }
    if (!isFinite(cost) || cost < 0) {
      return showError("Additional costs cannot be negative.");
    }
    if (!isFinite(period) || period < 0) {
      return showError("Enter a holding period of 0 or more.");
    }
    if (initial + cost > 1e12) {
      return showError("Those figures are unrealistically large — please check your inputs.");
    }

    render(initial, ret, cost, period, unit);
  });

  form.addEventListener("reset", function () {
    clearError();
    results.classList.add("d-none");
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Calculate once on load so the page is never blank.
  form.dispatchEvent(new Event("submit", { cancelable: true }));
})();
