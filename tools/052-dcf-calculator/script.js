(function () {
  "use strict";

  var form = document.getElementById("dcfForm");
  var results = document.getElementById("results");
  var errorBox = document.getElementById("formError");

  var yearsEl = document.getElementById("yearsInput");
  var rateEl = document.getElementById("rateInput");
  var growthEl = document.getElementById("growthInput");
  var netDebtEl = document.getElementById("netDebtInput");
  var sharesEl = document.getElementById("sharesInput");
  var terminalEl = document.getElementById("terminalSelect");
  var multipleGroup = document.getElementById("multipleGroup");
  var ebitdaGroup = document.getElementById("ebitdaGroup");
  var multipleEl = document.getElementById("multipleInput");
  var ebitdaEl = document.getElementById("ebitdaInput");
  var grid = document.getElementById("cashflowGrid");

  var current = null;

  function toNumber(el) {
    var raw = String(el.value).trim();
    if (raw === "") return NaN;
    var n = Number(raw);
    return isFinite(n) ? n : NaN;
  }

  function money(n) {
    if (!isFinite(n)) return "n/a";
    var abs = Math.abs(n);
    var str = abs.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return (n < 0 ? "-$" : "$") + str;
  }

  function compact(n) {
    var abs = Math.abs(n);
    var sign = n < 0 ? "-" : "";
    if (abs >= 1000000) return sign + (abs / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (abs >= 1000) return sign + (abs / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    return sign + Math.round(abs);
  }

  function pct(n) {
    return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
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

  function years() {
    var n = parseInt(String(yearsEl.value).trim(), 10);
    if (!isFinite(n) || n < 1) return 1;
    return Math.min(n, 15);
  }

  function defaultSeries(n) {
    var out = [];
    var base = 10;
    for (var i = 0; i < n; i++) {
      out.push(Math.round(base * Math.pow(1.1, i) * 10) / 10);
    }
    return out;
  }

  function buildGrid(values) {
    var n = years();
    var existing = values || readGrid();
    grid.innerHTML = "";
    for (var i = 0; i < n; i++) {
      var cell = document.createElement("div");
      cell.className = "cf-cell";

      var label = document.createElement("label");
      label.setAttribute("for", "cf" + i);
      label.textContent = "Year " + (i + 1);

      var input = document.createElement("input");
      input.type = "number";
      input.className = "form-control form-control-sm";
      input.id = "cf" + i;
      input.step = "any";
      input.setAttribute("inputmode", "decimal");
      input.setAttribute("aria-label", "Free cash flow for year " + (i + 1));
      input.value = existing[i] !== undefined && existing[i] !== "" ? existing[i] : "";

      cell.appendChild(label);
      cell.appendChild(input);
      grid.appendChild(cell);
    }
  }

  function readGrid() {
    var inputs = grid.querySelectorAll("input");
    var out = [];
    for (var i = 0; i < inputs.length; i++) out.push(inputs[i].value);
    return out;
  }

  function readFlows() {
    var inputs = grid.querySelectorAll("input");
    var out = [];
    for (var i = 0; i < inputs.length; i++) {
      var raw = String(inputs[i].value).trim();
      if (raw === "") {
        out.push(0);
      } else {
        var n = Number(raw);
        if (!isFinite(n)) return null;
        out.push(n);
      }
    }
    return out;
  }

  function terminalValue(lastFcf, rate, growth, method, multiple, ebitda) {
    if (method === "multiple") {
      return ebitda * multiple;
    }
    return (lastFcf * (1 + growth)) / (rate - growth);
  }

  function computeModel(flows, rate, growth, method, multiple, ebitda) {
    var n = flows.length;
    var pv = [];
    var factors = [];
    var sumPv = 0;
    for (var i = 0; i < n; i++) {
      var t = i + 1;
      var df = 1 / Math.pow(1 + rate, t);
      var p = flows[i] * df;
      factors.push(df);
      pv.push(p);
      sumPv += p;
    }
    var tv = terminalValue(flows[n - 1], rate, growth, method, multiple, ebitda);
    var dfN = factors[n - 1];
    var pvTV = tv * dfN;
    var ev = sumPv + pvTV;
    return { flows: flows, pv: pv, factors: factors, sumPv: sumPv, tv: tv, pvTV: pvTV, ev: ev, dfN: dfN };
  }

  function renderChart(model) {
    var chart = document.getElementById("chart");
    chart.innerHTML = "";
    var n = model.flows.length;

    var points = [];
    for (var i = 0; i < n; i++) {
      points.push({ label: "Y" + (i + 1), nominal: model.flows[i], present: model.pv[i] });
    }
    points.push({ label: "TV", nominal: model.tv, present: model.pvTV });

    var maxAbs = 1;
    points.forEach(function (p) {
      maxAbs = Math.max(maxAbs, Math.abs(p.nominal), Math.abs(p.present));
    });

    points.forEach(function (p) {
      var group = document.createElement("div");
      group.className = "chart-group";

      var val = document.createElement("span");
      val.className = "chart-val";
      val.textContent = compact(p.present);

      var bars = document.createElement("div");
      bars.className = "chart-bars";

      var nominal = document.createElement("div");
      nominal.className = "chart-bar " + (p.nominal < 0 ? "neg" : "nominal");
      nominal.style.height = Math.max(3, (Math.abs(p.nominal) / maxAbs) * 155) + "px";
      nominal.title = "Nominal: " + money(p.nominal);

      var present = document.createElement("div");
      present.className = "chart-bar " + (p.present < 0 ? "neg" : (p.label === "TV" ? "terminal" : "present"));
      present.style.height = Math.max(3, (Math.abs(p.present) / maxAbs) * 155) + "px";
      present.title = "Present value: " + money(p.present);

      bars.appendChild(nominal);
      bars.appendChild(present);

      var lbl = document.createElement("span");
      lbl.className = "chart-lbl";
      lbl.textContent = p.label;

      group.appendChild(val);
      group.appendChild(bars);
      group.appendChild(lbl);
      chart.appendChild(group);
    });
  }

  function renderTable(model) {
    var body = document.getElementById("breakdownBody");
    body.innerHTML = "";
    var n = model.flows.length;

    function row(cls, cells) {
      var tr = document.createElement("tr");
      if (cls) tr.className = cls;
      cells.forEach(function (c, idx) {
        var el = document.createElement(idx === 0 ? "th" : "td");
        if (idx === 0) el.setAttribute("scope", "row");
        if (idx > 0) el.className = "num";
        el.textContent = c;
        tr.appendChild(el);
      });
      body.appendChild(tr);
    }

    for (var i = 0; i < n; i++) {
      var share = model.ev !== 0 ? (model.pv[i] / model.ev) * 100 : 0;
      row("", [
        "Year " + (i + 1),
        money(model.flows[i]),
        model.factors[i].toFixed(4),
        money(model.pv[i]),
        share.toFixed(1) + "%"
      ]);
    }

    var tvShare = model.ev !== 0 ? (model.pvTV / model.ev) * 100 : 0;
    row("terminal-row", [
      "Terminal value",
      money(model.tv),
      model.dfN.toFixed(4),
      money(model.pvTV),
      tvShare.toFixed(1) + "%"
    ]);

    row("total-row", [
      "Enterprise value",
      "",
      "",
      money(model.ev),
      "100%"
    ]);
  }

  function sensitivityTable(flows, rate, growth, method, multiple, ebitda) {
    var table = document.getElementById("sensitivityTable");
    table.innerHTML = "";
    var thead = document.createElement("thead");
    var headRow = document.createElement("tr");

    var rowHeader = document.createElement("th");
    rowHeader.setAttribute("scope", "col");
    rowHeader.textContent = method === "multiple" ? "Rate \\ Multiple" : "Rate \\ Growth";
    headRow.appendChild(rowHeader);

    var colValues = method === "multiple"
      ? [multiple - 2, multiple - 1, multiple, multiple + 1, multiple + 2]
      : [growth - 1, growth - 0.5, growth, growth + 0.5, growth + 1];

    colValues.forEach(function (cv) {
      var th = document.createElement("th");
      th.setAttribute("scope", "col");
      th.className = "num";
      th.textContent = method === "multiple" ? cv.toFixed(1) + "x" : cv.toFixed(2) + "%";
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    var tbody = document.createElement("tbody");
    var rowRates = [rate - 2, rate - 1, rate, rate + 1, rate + 2];
    var cellsGrid = [];
    var minEv = Infinity;
    var maxEv = -Infinity;

    rowRates.forEach(function (rv) {
      var row = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = rv.toFixed(2) + "%";
      row.appendChild(th);
      var rowCells = [];

      colValues.forEach(function (cv) {
        var td = document.createElement("td");
        td.className = "num";
        var valid = rv > 0 && (method === "multiple" || rv > cv);
        if (valid) {
          var m = computeModel(flows, rv / 100, method === "multiple" ? growth : cv / 100, method, cv, ebitda);
          var ev = m.ev;
          td.textContent = compact(ev);
          td.setAttribute("data-ev", String(ev));
          if (isFinite(ev)) {
            minEv = Math.min(minEv, ev);
            maxEv = Math.max(maxEv, ev);
          }
          rowCells.push({ td: td, ev: ev });
        } else {
          td.textContent = "n/a";
          td.classList.add("text-muted");
          rowCells.push({ td: td, ev: NaN });
        }
        row.appendChild(td);
      });

      cellsGrid.push({ row: row, rate: rv, cells: rowCells });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);

    // Shade cells and mark the base cell.
    cellsGrid.forEach(function (r) {
      r.cells.forEach(function (c) {
        if (isFinite(c.ev) && maxEv > minEv) {
          var t = (c.ev - minEv) / (maxEv - minEv);
          c.td.style.backgroundColor = "rgba(96, 8, 156, " + (0.06 + t * 0.34).toFixed(3) + ")";
        }
      });
    });

    // Highlight the centre cell (our exact assumptions).
    var midRow = Math.floor(rowRates.length / 2);
    var midCol = Math.floor(colValues.length / 2);
    if (cellsGrid[midRow] && cellsGrid[midRow].cells[midCol]) {
      cellsGrid[midRow].cells[midCol].td.classList.add("base");
    }
  }

  function render(model, rate, growth, method, multiple, ebitda, netDebt, shares) {
    current = model;

    var equity = model.ev - netDebt;

    document.getElementById("evValue").textContent = money(model.ev);
    document.getElementById("evNote").textContent =
      "Present value of the forecast plus the terminal value.";

    var equityEl = document.getElementById("equityValue");
    equityEl.textContent = money(equity);
    equityEl.className = "stat-value" + (equity < 0 ? " negative" : "");
    document.getElementById("equityNote").textContent =
      netDebt === 0 ? "Enterprise value (no net debt entered)." : "Enterprise value less net debt of " + money(netDebt) + ".";

    var shareEl = document.getElementById("shareValue");
    var shareNote = document.getElementById("shareNote");
    if (isFinite(shares) && shares > 0) {
      var perShare = equity / shares;
      shareEl.textContent = money(perShare);
      shareEl.className = "stat-value" + (perShare < 0 ? " negative" : "");
      shareNote.textContent = "Equity value divided by " + shares.toLocaleString() + " shares.";
    } else {
      shareEl.textContent = "n/a";
      shareEl.className = "stat-value";
      shareNote.textContent = "Add shares outstanding to see a per-share value.";
    }

    renderChart(model);
    renderTable(model);
    sensitivityTable(model.flows, rate, growth, method, multiple, ebitda);

    results.classList.remove("d-none");
    results.focus();
  }

  function updateTerminalUI() {
    var isMultiple = terminalEl.value === "multiple";
    multipleGroup.hidden = !isMultiple;
    ebitdaGroup.hidden = !isMultiple;
  }

  yearsEl.addEventListener("change", function () {
    buildGrid(defaultSeries(years()));
  });

  terminalEl.addEventListener("change", updateTerminalUI);

  document.getElementById("fillBtn").addEventListener("click", function () {
    var inputs = grid.querySelectorAll("input");
    var first = inputs.length ? Number(String(inputs[0].value).trim()) : NaN;
    if (!isFinite(first) || first === 0) first = 10;
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].value = String(Math.round(first * Math.pow(1.1, i) * 100) / 100);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    var n = years();
    if (!isFinite(n) || n < 1) return showError("Enter a forecast length of at least 1 year.");

    var ratePct = toNumber(rateEl);
    if (!isFinite(ratePct) || ratePct <= 0) return showError("Enter a discount rate greater than 0%.");
    if (ratePct > 100) return showError("A discount rate above 100% is not realistic — please check it.");

    var growthPct = toNumber(growthEl);
    if (!isFinite(growthPct)) return showError("Enter a terminal growth rate (0 is fine).");

    var method = terminalEl.value;
    var multiple = toNumber(multipleEl);
    var ebitda = toNumber(ebitdaEl);

    if (method === "multiple") {
      if (!isFinite(multiple) || multiple <= 0) return showError("Enter an exit multiple greater than 0.");
      if (!isFinite(ebitda) || ebitda < 0) return showError("Enter a final-year EBITDA of 0 or more.");
    } else if (growthPct >= ratePct) {
      return showError("Terminal growth (" + growthPct + "%) must be lower than the discount rate (" + ratePct + "%). Lower the growth rate or raise the discount rate.");
    }

    var netDebt = netDebtEl.value.trim() === "" ? 0 : toNumber(netDebtEl);
    if (!isFinite(netDebt)) return showError("Enter net debt as a number (use 0 if there is none).");

    var shares = sharesEl.value.trim() === "" ? NaN : toNumber(sharesEl);
    if (sharesEl.value.trim() !== "" && (!isFinite(shares) || shares < 0)) {
      return showError("Shares outstanding must be 0 or more, or left blank.");
    }

    var flows = readFlows();
    if (flows === null) return showError("Every cash flow must be a number. Leave a year blank to treat it as 0.");

    var rate = ratePct / 100;
    var growth = growthPct / 100;
    var model = computeModel(flows, rate, growth, method, multiple, ebitda);

    if (!isFinite(model.ev)) {
      return showError("Those assumptions produce an undefined value. Check the discount rate and growth rate.");
    }
    if (Math.abs(model.ev) > 1e15) {
      return showError("Those figures are unrealistically large — please check your inputs.");
    }

    render(model, ratePct, growthPct, method, multiple, ebitda, netDebt, shares);
  });

  form.addEventListener("reset", function () {
    clearError();
    results.classList.add("d-none");
    current = null;
    updateTerminalUI();
    window.setTimeout(function () {
      buildGrid(defaultSeries(years()));
    }, 0);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // Build defaults and calculate once so the page is never empty.
  updateTerminalUI();
  buildGrid(defaultSeries(years()));
  form.dispatchEvent(new Event("submit", { cancelable: true }));
})();
