/* Facebook Ad Cost Calculator — vanilla JS, no dependencies.
   CPM = spend / impressions * 1000
   CPC = spend / clicks
   CTR = clicks / impressions * 100
   CPA = spend / conversions
   ROAS = revenue / spend
   Budget planner = conversions per day x target CPA (affordable daily ceiling). */
(function () {
  "use strict";

  var DEFAULTS = {
    spend: "1500",
    impressions: "250000",
    clicks: "3200",
    conversions: "64",
    revenue: "4800",
    days: "14",
    targetCpa: "25"
  };

  var el = {
    spend: document.getElementById("spend"),
    impressions: document.getElementById("impressions"),
    clicks: document.getElementById("clicks"),
    conversions: document.getElementById("conversions"),
    revenue: document.getElementById("revenue"),
    days: document.getElementById("days"),
    targetCpa: document.getElementById("targetCpa"),
    calcBtn: document.getElementById("calcBtn"),
    resetBtn: document.getElementById("resetBtn"),
    copyBtn: document.getElementById("copyBtn"),
    errorBox: document.getElementById("errorBox"),
    copyMsg: document.getElementById("copyMsg"),
    resultPanel: document.getElementById("resultPanel"),
    statCpm: document.getElementById("statCpm"),
    statCpc: document.getElementById("statCpc"),
    statCtr: document.getElementById("statCtr"),
    statCpa: document.getElementById("statCpa"),
    statCvr: document.getElementById("statCvr"),
    statRoas: document.getElementById("statRoas"),
    statRoasNote: document.getElementById("statRoasNote"),
    statDaily: document.getElementById("statDaily"),
    statDailyNote: document.getElementById("statDailyNote"),
    breakdownBody: document.getElementById("breakdownBody"),
    funnelChart: document.getElementById("funnelChart"),
    funnelCaption: document.getElementById("funnelCaption"),
    plannerText: document.getElementById("plannerText"),
    plannerBar: document.getElementById("plannerBar"),
    plannerNote: document.getElementById("plannerNote"),
    plannerBox: document.getElementById("plannerBox")
  };

  var lastSummary = "";
  var chartData = null;

  function num(field) {
    var raw = (field.value || "").trim();
    if (raw === "") return NaN;
    return Number(raw);
  }

  function money(n, decimals) {
    if (!isFinite(n)) return "\u2014";
    return "$" + n.toLocaleString("en-US", {
      minimumFractionDigits: decimals == null ? 2 : decimals,
      maximumFractionDigits: decimals == null ? 2 : decimals
    });
  }

  function int(n) {
    if (!isFinite(n)) return "\u2014";
    return Math.round(n).toLocaleString("en-US");
  }

  function pct(n, decimals) {
    if (!isFinite(n)) return "\u2014";
    return n.toFixed(decimals == null ? 2 : decimals) + "%";
  }

  function showError(msg) {
    el.errorBox.textContent = msg;
    el.errorBox.classList.remove("d-none");
  }

  function clearError() {
    el.errorBox.textContent = "";
    el.errorBox.classList.add("d-none");
  }

  function setStat(node, text) {
    node.textContent = text;
  }

  function calculate() {
    clearError();
    el.copyMsg.classList.add("d-none");

    var spend = num(el.spend);
    var impressions = num(el.impressions);
    var clicks = num(el.clicks);
    var conversions = num(el.conversions);
    var revenue = num(el.revenue);
    var days = num(el.days);
    var targetCpa = num(el.targetCpa);

    var problems = [];

    if (el.spend.value.trim() === "" || isNaN(spend)) {
      problems.push("Enter the amount spent on the campaign.");
    } else if (spend < 0) {
      problems.push("Ad spend cannot be negative.");
    } else if (spend === 0) {
      problems.push("Ad spend must be greater than zero to calculate costs.");
    }

    if (el.impressions.value.trim() === "" || isNaN(impressions)) {
      problems.push("Enter the number of impressions (use 0 if you have none).");
    } else if (impressions < 0) {
      problems.push("Impressions cannot be negative.");
    }

    if (el.clicks.value.trim() === "" || isNaN(clicks)) {
      problems.push("Enter the number of clicks (use 0 if you have none).");
    } else if (clicks < 0) {
      problems.push("Clicks cannot be negative.");
    }

    if (el.conversions.value.trim() === "" || isNaN(conversions)) {
      problems.push("Enter the number of conversions (use 0 if you have none).");
    } else if (conversions < 0) {
      problems.push("Conversions cannot be negative.");
    }

    if (el.days.value.trim() === "" || isNaN(days)) {
      problems.push("Enter the campaign length in days.");
    } else if (days < 1) {
      problems.push("Campaign length must be at least 1 day.");
    }

    if (el.revenue.value.trim() !== "" && (isNaN(revenue) || revenue < 0)) {
      problems.push("Revenue must be a positive number, or left blank.");
    }

    if (el.targetCpa.value.trim() !== "" && (isNaN(targetCpa) || targetCpa < 0)) {
      problems.push("Target CPA must be a positive number, or left blank.");
    }

    if (impressions > 0 && clicks > impressions) {
      problems.push("Clicks (" + int(clicks) + ") cannot exceed impressions (" + int(impressions) + "). Check your figures.");
    }

    if (clicks > 0 && conversions > clicks) {
      problems.push("Conversions (" + int(conversions) + ") cannot exceed clicks (" + int(clicks) + "). Check your figures.");
    }

    if (problems.length) {
      showError(problems[0]);
      el.resultPanel.classList.add("d-none");
      return;
    }

    var cpm = impressions > 0 ? (spend / impressions) * 1000 : NaN;
    var cpc = clicks > 0 ? spend / clicks : NaN;
    var ctr = impressions > 0 ? (clicks / impressions) * 100 : NaN;
    var cpa = conversions > 0 ? spend / conversions : NaN;
    var cvr = clicks > 0 ? (conversions / clicks) * 100 : NaN;
    var hasRevenue = el.revenue.value.trim() !== "" && revenue > 0;
    var roas = hasRevenue ? revenue / spend : NaN;
    var dailySpend = spend / days;
    var dailyConversions = conversions / days;

    setStat(el.statCpm, money(cpm));
    setStat(el.statCpc, money(cpc));
    setStat(el.statCtr, pct(ctr));
    setStat(el.statCpa, money(cpa));
    setStat(el.statCvr, pct(cvr));
    setStat(el.statRoas, hasRevenue ? roas.toFixed(2) + "x" : "\u2014");
    setStat(el.statRoasNote, hasRevenue ? "revenue per dollar spent" : "add revenue to see ROAS");
    setStat(el.statDaily, money(dailySpend));
    setStat(el.statDailyNote, int(dailyConversions * 10) / 10 + " conversions/day");

    var rows = [
      ["Ad spend", money(spend)],
      ["Impressions", int(impressions)],
      ["Clicks", int(clicks)],
      ["Conversions", int(conversions)],
      ["CPM (cost per 1,000 impressions)", money(cpm)],
      ["CPC (cost per click)", money(cpc)],
      ["CTR (click-through rate)", pct(ctr)],
      ["CPA (cost per acquisition)", money(cpa)],
      ["Conversion rate (click to action)", pct(cvr)],
      ["Daily spend", money(dailySpend)]
    ];
    if (hasRevenue) {
      rows.push(["Revenue", money(revenue)]);
      rows.push(["ROAS (return on ad spend)", roas.toFixed(2) + "x"]);
    }

    var html = "";
    for (var i = 0; i < rows.length; i++) {
      html += "<tr><td>" + rows[i][0] + "</td><td>" + rows[i][1] + "</td></tr>";
    }
    el.breakdownBody.innerHTML = html;

    chartData = [
      { label: "CPM", value: cpm, color: "#8b2fd0" },
      { label: "CPC", value: cpc, color: "#60089c" },
      { label: "CPA", value: cpa, color: "#3f0568" },
      { label: "Cost per $1 revenue", value: hasRevenue ? spend / revenue : NaN, color: "#b06a00" }
    ];
    drawChart(chartData);

    el.funnelCaption.textContent = hasRevenue
      ? "Each bar is the cost at one stage of the funnel, in dollars. The jump from CPC to CPA shows what you really pay per customer."
      : "Each bar is the cost at one stage of the funnel, in dollars. Add revenue to include the cost per dollar earned.";

    updatePlanner(spend, conversions, days, targetCpa, cpa);
    el.resultPanel.classList.remove("d-none");

    lastSummary =
      "Facebook ad cost summary\n" +
      "Spend: " + money(spend) + " over " + days + " day(s)\n" +
      "CPM: " + money(cpm) + "\n" +
      "CPC: " + money(cpc) + "\n" +
      "CTR: " + pct(ctr) + "\n" +
      "CPA: " + money(cpa) + "\n" +
      "Conversion rate: " + pct(cvr) + "\n" +
      (hasRevenue ? "ROAS: " + roas.toFixed(2) + "x\n" : "") +
      "Daily spend: " + money(dailySpend);
  }

  function updatePlanner(spend, conversions, days, targetCpa, cpa) {
    var hasTarget = el.targetCpa.value.trim() !== "" && isFinite(targetCpa) && targetCpa > 0;

    if (!hasTarget || conversions <= 0) {
      el.plannerBox.classList.add("d-none");
      return;
    }
    el.plannerBox.classList.remove("d-none");

    var dailyConversions = conversions / days;
    var ceiling = dailyConversions * targetCpa;
    var dailySpend = spend / days;
    var ratio = ceiling > 0 ? (dailySpend / ceiling) * 100 : 0;

    var barPct = Math.max(0, Math.min(100, ratio));
    el.plannerBar.style.width = barPct + "%";
    el.plannerBar.setAttribute("aria-valuenow", Math.round(barPct));
    el.plannerBar.parentNode.classList.toggle("is-over", ratio > 100);

    el.plannerText.innerHTML =
      "At a target CPA of <strong>" + money(targetCpa) + "</strong> and about <strong>" +
      (Math.round(dailyConversions * 10) / 10) + "</strong> conversions per day, your affordable daily ceiling is <strong>" +
      money(ceiling) + "</strong>. You are currently spending <strong>" + money(dailySpend) + "</strong> per day.";

    if (ratio <= 100) {
      el.plannerNote.textContent =
        "That is " + ratio.toFixed(0) + "% of the ceiling, so you have room to scale within your target. Your current CPA of " +
        money(cpa) + " is at or below target.";
    } else {
      el.plannerNote.textContent =
        "That is " + ratio.toFixed(0) + "% of the ceiling \u2014 you are paying above your target CPA of " + money(targetCpa) +
        " (actual CPA " + money(cpa) + "). Improve the conversion rate or lower CPM before increasing budget.";
    }
  }

  function drawChart(items) {
    var canvas = el.funnelChart;
    if (!canvas) return;

    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.parentNode.clientWidth - 32;
    if (cssW < 200) cssW = 200;
    var cssH = 240;

    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);
    canvas.style.width = cssW + "px";
    canvas.style.height = cssH + "px";

    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var padLeft = 108;
    var padRight = 62;
    var padTop = 8;
    var padBottom = 8;
    var areaW = cssW - padLeft - padRight;
    var rows = items.length;
    var rowH = (cssH - padTop - padBottom) / rows;
    var barH = Math.min(26, rowH * 0.55);

    var values = items.map(function (it) { return isFinite(it.value) ? it.value : 0; });
    var max = Math.max.apply(null, values.concat([0.0001]));

    ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textBaseline = "middle";

    for (var i = 0; i < rows; i++) {
      var it = items[i];
      var cy = padTop + rowH * i + rowH / 2;
      var y = cy - barH / 2;

      // label
      ctx.fillStyle = "#6a6673";
      ctx.textAlign = "left";
      ctx.fillText(it.label, 0, cy);

      // track
      ctx.fillStyle = "#f1eaf9";
      roundRect(ctx, padLeft, y, areaW, barH, 4);
      ctx.fill();

      // bar
      var val = isFinite(it.value) ? it.value : 0;
      var w = max > 0 ? (val / max) * areaW : 0;
      if (w < 2) w = val > 0 ? 2 : 0;
      ctx.fillStyle = isFinite(it.value) ? it.color : "#d8cfe4";
      if (w > 0) {
        roundRect(ctx, padLeft, y, w, barH, 4);
        ctx.fill();
      }

      // value
      ctx.fillStyle = "#3f0568";
      ctx.textAlign = "left";
      ctx.fillText(isFinite(it.value) ? money(it.value) : "n/a", padLeft + areaW + 8, cy);
    }

    // baseline
    ctx.strokeStyle = "#e8e2f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft - 4, padTop);
    ctx.lineTo(padLeft - 4, cssH - padBottom);
    ctx.stroke();
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < r * 2) r = w / 2;
    if (h < r * 2) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function reset() {
    Object.keys(DEFAULTS).forEach(function (key) {
      el[key].value = DEFAULTS[key];
    });
    clearError();
    el.copyMsg.classList.add("d-none");
    calculate();
  }

  function copySummary() {
    if (!lastSummary) {
      calculate();
    }
    if (!lastSummary) return;
    var done = function () {
      el.copyMsg.textContent = "Summary copied to the clipboard.";
      el.copyMsg.classList.remove("d-none");
      setTimeout(function () { el.copyMsg.classList.add("d-none"); }, 2500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(lastSummary).then(done, function () {
        el.copyMsg.textContent = "Could not copy automatically \u2014 select the breakdown table and copy it manually.";
        el.copyMsg.classList.remove("d-none");
      });
    } else {
      el.copyMsg.textContent = "Copy is not supported in this browser \u2014 select the breakdown table manually.";
      el.copyMsg.classList.remove("d-none");
    }
  }

  el.calcBtn.addEventListener("click", calculate);
  el.resetBtn.addEventListener("click", reset);
  el.copyBtn.addEventListener("click", copySummary);

  el.spend.addEventListener("keydown", enterToCalc);
  el.impressions.addEventListener("keydown", enterToCalc);
  el.clicks.addEventListener("keydown", enterToCalc);
  el.conversions.addEventListener("keydown", enterToCalc);
  el.revenue.addEventListener("keydown", enterToCalc);
  el.days.addEventListener("keydown", enterToCalc);
  el.targetCpa.addEventListener("keydown", enterToCalc);

  function enterToCalc(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      calculate();
    }
  }

  var resizeTimer = null;
  window.addEventListener("resize", function () {
    if (!chartData) return;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { drawChart(chartData); }, 150);
  });

  calculate();
})();
