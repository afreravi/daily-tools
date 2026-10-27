(function () {
  "use strict";

  var MAX_PERIODS = 30;
  var form = document.getElementById("npvForm");
  var rateInput = document.getElementById("rateInput");
  var initialInput = document.getElementById("initialInput");
  var yearsInput = document.getElementById("yearsInput");
  var grid = document.getElementById("cashFlowGrid");
  var errorBox = document.getElementById("formError");
  var results = document.getElementById("resultsSection");
  var presetSelect = document.getElementById("presetSelect");

  var PRESETS = {
    simple:    { rate: 10, initial: 10000, flows: [3000, 3500, 4000, 3500, 2500] },
    solar:     { rate: 7,  initial: 24000, flows: [1800, 2400, 3000, 3400, 3600, 3700, 3700, 3600, 3500, 3400, 3200, 3000] },
    software:  { rate: 15, initial: 60000, flows: [12000, 20000, 26000, 28000, 24000] },
    equipment: { rate: 9,  initial: 45000, flows: [11000, 13000, 14000, 13000, 9000] }
  };

  function money(value) {
    var neg = value < 0;
    var abs = Math.abs(value);
    var formatted = abs.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return (neg ? "-$" : "$") + formatted;
  }

  function compact(value) {
    var abs = Math.abs(value);
    if (abs >= 1000000) return (value / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1000) return (value / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return value.toFixed(0);
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("d-none");
    results.classList.add("d-none");
  }

  function clearError() {
    errorBox.classList.add("d-none");
    errorBox.textContent = "";
  }

  function collectValues() {
    var inputs = grid.querySelectorAll("input");
    var out = [];
    for (var i = 0; i < inputs.length; i++) {
      out.push(inputs[i].value.trim());
    }
    return out;
  }

  function buildFields(count, values) {
    var seed = values || collectValues();
    grid.innerHTML = "";
    for (var i = 0; i < count; i++) {
      var col = document.createElement("div");
      col.className = "col-6 col-md-4 col-lg-3 period-field";

      var id = "flow" + i;
      var label = document.createElement("label");
      label.setAttribute("for", id);
      label.textContent = "Period " + (i + 1);

      var input = document.createElement("input");
      input.type = "number";
      input.step = "0.01";
      input.className = "form-control mb-3";
      input.id = id;
      input.setAttribute("inputmode", "decimal");
      input.setAttribute("aria-label", "Cash flow for period " + (i + 1));
      if (seed && typeof seed[i] !== "undefined" && seed[i] !== "") {
        input.value = seed[i];
      }

      col.appendChild(label);
      col.appendChild(input);
      grid.appendChild(col);
    }
  }

  function parseNumber(raw, label, allowBlank) {
    if (raw === "" || raw === null || typeof raw === "undefined") {
      if (allowBlank) return 0;
      throw new Error("Please enter a value for " + label + ".");
    }
    var n = Number(raw);
    if (!isFinite(n)) throw new Error(label + " must be a number.");
    return n;
  }

  function renderChart(rows) {
    var chart = document.getElementById("chart");
    chart.innerHTML = "";
    var maxAbs = 0;
    rows.forEach(function (row) {
      maxAbs = Math.max(maxAbs, Math.abs(row.pv));
    });
    if (maxAbs === 0) maxAbs = 1;

    rows.forEach(function (row, idx) {
      var col = document.createElement("div");
      col.className = "chart-col";

      var val = document.createElement("span");
      val.className = "chart-val";
      val.textContent = compact(row.pv);

      var bar = document.createElement("div");
      bar.className = "chart-bar" + (row.pv < 0 ? " negative" : "");
      bar.style.height = Math.max(2, (Math.abs(row.pv) / maxAbs) * 175) + "px";

      var lbl = document.createElement("span");
      lbl.className = "chart-lbl";
      lbl.textContent = "P" + (idx + 1);

      col.appendChild(val);
      col.appendChild(bar);
      col.appendChild(lbl);
      chart.appendChild(col);
    });
  }

  function renderTable(rows, initial) {
    var body = document.getElementById("breakdownBody");
    body.innerHTML = "";

    var cum = -initial;
    var totalFlow = 0;
    var totalPv = 0;

    var initialRow = document.createElement("tr");
    initialRow.innerHTML = '<th scope="row" class="text-muted">0 (initial)</th>' +
      '<td class="text-right">' + money(-initial) + '</td>' +
      '<td class="text-right">1.0000</td>' +
      '<td class="text-right">' + money(-initial) + '</td>' +
      '<td class="text-right cum-neg">' + money(cum) + '</td>';
    body.appendChild(initialRow);

    rows.forEach(function (row, idx) {
      cum += row.pv;
      totalFlow += row.flow;
      totalPv += row.pv;

      var tr = document.createElement("tr");
      tr.innerHTML = '<th scope="row">' + (idx + 1) + '</th>' +
        '<td class="text-right">' + money(row.flow) + '</td>' +
        '<td class="text-right">' + row.factor.toFixed(4) + '</td>' +
        '<td class="text-right">' + money(row.pv) + '</td>' +
        '<td class="text-right ' + (cum < 0 ? "cum-neg" : "") + '">' + money(cum) + '</td>';
      body.appendChild(tr);
    });

    document.getElementById("totalFlow").textContent = money(totalFlow);
    document.getElementById("totalPv").textContent = money(totalPv);
    document.getElementById("totalCum").textContent = money(totalPv - initial);
  }

  function calculate(event) {
    if (event) event.preventDefault();
    clearError();

    var rate, initial, years;
    try {
      rate = parseNumber(rateInput.value.trim(), "the discount rate", false);
      initial = parseNumber(initialInput.value.trim(), "the initial investment", false);
      years = parseNumber(yearsInput.value.trim(), "the number of periods", false);
    } catch (err) {
      showError(err.message);
      return;
    }

    if (rate <= -100) {
      showError("The discount rate must be greater than -100%.");
      return;
    }
    if (!Number.isInteger(years) || years < 1 || years > MAX_PERIODS) {
      showError("Number of periods must be a whole number between 1 and " + MAX_PERIODS + ".");
      return;
    }
    if (initial < 0) {
      showError("The initial investment should be entered as a positive number.");
      return;
    }

    var rawFlows = collectValues();
    var flows = [];
    for (var i = 0; i < years; i++) {
      try {
        flows.push(parseNumber(rawFlows[i], "period " + (i + 1) + " cash flow", true));
      } catch (err) {
        showError(err.message);
        return;
      }
    }

    var r = rate / 100;
    var rows = [];
    var pvInflows = 0;

    flows.forEach(function (flow, idx) {
      var factor = 1 / Math.pow(1 + r, idx + 1);
      var pv = flow * factor;
      pvInflows += pv;
      rows.push({ flow: flow, factor: factor, pv: pv });
    });

    var npv = pvInflows - initial;

    var npvEl = document.getElementById("npvValue");
    npvEl.textContent = money(npv);
    npvEl.className = "display-4 mb-2 " + (npv >= 0 ? "npv-pos" : "npv-neg");

    var verdictEl = document.getElementById("npvVerdict");
    if (Math.abs(npv) < 0.005) {
      verdictEl.innerHTML = '<span class="verdict verdict-pos">Break-even &mdash; returns exactly your hurdle rate</span>';
    } else if (npv > 0) {
      verdictEl.innerHTML = '<span class="verdict verdict-pos">Positive NPV &mdash; adds value, consider accepting</span>';
    } else {
      verdictEl.innerHTML = '<span class="verdict verdict-neg">Negative NPV &mdash; destroys value at this rate</span>';
    }

    document.getElementById("pvInflows").textContent = money(pvInflows);
    document.getElementById("pvInitial").textContent = money(-initial);
    document.getElementById("piValue").textContent = initial === 0
      ? "n/a"
      : (pvInflows / initial).toFixed(3);

    var payback = "Not recovered";
    var running = -initial;
    for (var j = 0; j < rows.length; j++) {
      running += rows[j].flow;
      if (running >= 0) {
        payback = "Period " + (j + 1);
        break;
      }
    }
    document.getElementById("paybackValue").textContent = payback;

    renderChart(rows);
    renderTable(rows, initial);
    results.classList.remove("d-none");
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("addPeriodBtn").addEventListener("click", function () {
    var current = grid.querySelectorAll("input").length;
    if (current >= MAX_PERIODS) {
      showError("Maximum of " + MAX_PERIODS + " periods.");
      return;
    }
    clearError();
    yearsInput.value = current + 1;
    buildFields(current + 1);
  });

  document.getElementById("removePeriodBtn").addEventListener("click", function () {
    var current = grid.querySelectorAll("input").length;
    if (current <= 1) return;
    yearsInput.value = current - 1;
    buildFields(current - 1);
  });

  document.getElementById("evenBtn").addEventListener("click", function () {
    var inputs = grid.querySelectorAll("input");
    if (!inputs.length) return;
    var seed = window.prompt("Value to fill into every period:", inputs[0].value || "1000");
    if (seed === null) return;
    if (!isFinite(Number(seed))) {
      showError("Please enter a valid number to fill.");
      return;
    }
    clearError();
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = seed;
    }
  });

  yearsInput.addEventListener("change", function () {
    var n = parseInt(yearsInput.value, 10);
    if (isNaN(n)) return;
    n = Math.min(MAX_PERIODS, Math.max(1, n));
    yearsInput.value = n;
    buildFields(n);
  });

  presetSelect.addEventListener("change", function () {
    var preset = PRESETS[presetSelect.value];
    if (!preset) return;
    rateInput.value = preset.rate;
    initialInput.value = preset.initial;
    yearsInput.value = preset.flows.length;
    buildFields(preset.flows.length, preset.flows);
    calculate();
  });

  form.addEventListener("submit", calculate);

  buildFields(5, ["3000", "3500", "4000", "3500", "2500"]);
  document.getElementById("year").textContent = new Date().getFullYear();
})();
