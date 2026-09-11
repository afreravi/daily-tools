(function() {
  "use strict";

  var form = document.getElementById("waccForm");
  var errorAlert = document.getElementById("errorAlert");
  var resultsCard = document.getElementById("resultsCard");
  var waccOut = document.getElementById("waccOut");
  var equityWeightOut = document.getElementById("equityWeightOut");
  var debtWeightOut = document.getElementById("debtWeightOut");
  var debtAfterTaxOut = document.getElementById("debtAfterTaxOut");
  var equityCompOut = document.getElementById("equityCompOut");
  var debtCompOut = document.getElementById("debtCompOut");
  var rawWaccOut = document.getElementById("rawWaccOut");
  function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.classList.remove("d-none");
    resultsCard.classList.add("d-none");
  }

  function hideError() {
    errorAlert.classList.add("d-none");
  }

  function parseNum(input) {
    var v = input.value.trim();
    if (v === "") { return null; }
    var n = Number(v);
    if (!isFinite(n)) { return null; }
    return n;
  }

  function fmtPct(v) {
    return (v * 100).toFixed(2) + "%";
  }

  function fmtPct4(v) {
    return (v * 100).toFixed(4) + "%";
  }

  function fmtPct1(v) {
    return (v * 100).toFixed(1) + "%";
  }
  function drawBars(equity, debt, compE, compD) {
    var canvas = document.getElementById("waccCanvas");
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || canvas.width;
    var cssH = canvas.clientHeight || canvas.height;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.scale(dpr, dpr);
    var left = 0;
    var top =  24;
    var right = cssW - 8;
    var width = right - left;
    ctx.font = "12px -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif";
    var labelH = 14;
    var barH = 36;
    var gap =  12;
    var y1 = top + labelH;
    var y2 = y1 + barH + gap;
    ctx.fillStyle = "#e9ecef";
    ctx.fillRect(left, y1, width, barH);
    if (equity > 0) {
      ctx.fillStyle = "#28a745";
      ctx.fillRect(left, y1, width * equity, barH);
    }
    if (debt > 0) {
      ctx.fillStyle = "#17a2b8";
      ctx.fillRect(left + width * equity, y1, width * debt, barH);
    }
    ctx.fillStyle = "#343a40";
    var eqLabel = "Equity " + fmtPct1(equity);
    var dLabel = "Debt " + fmtPct1(debt);
    ctx.fillText(eqLabel, left +  10, y1 + 22);
    ctx.textAlign = "right";
    ctx.fillText(dLabel, right -  8, y1 + 22);
    ctx.textAlign = "left";
    var yTop = y2 +  12;
    var label2H =  14;
    var bar2H =  22;
    ctx.fillStyle = "#e9ecef";
    ctx.fillRect(left, yTop, width, bar2H);
    if (compE > 0) {
      ctx.fillStyle = "#ffc107";
      ctx.fillRect(left, yTop, width * compE, bar2H);
    }
    if (compD > 0) {
      ctx.fillStyle = "#fd7e14";
      ctx.fillRect(left + width * compE, yTop, width * compD, bar2H);
    }
    ctx.fillStyle = "#343a40";
    var compLabel = "Equity contribution " + fmtPct4(compE) + " | Debt contribution " + fmtPct4(compD);
    ctx.fillText(compLabel, left +  8, yTop +  17);
  }


  function computeWacc() {
    var equity = parseNum(document.getElementById("equityInput"));
    var debt = parseNum(document.getElementById("debtInput"));
    var ke = parseNum(document.getElementById("keInput"));
    var kd = parseNum(document.getElementById("kdInput"));
    var tax = parseNum(document.getElementById("taxInput"));
    if (equity === null || debt === null || ke === null || kd === null || tax === null || equity < 0 || debt < 0 || ke < 0 || kd < 0 || tax < 0) {
      showError("Please enter valid non-negative numbers for all fields.");
      return;
    }
    if (equity === 0 && debt === 0) {
      showError("Total capital cannot be zero. Enter at least one source of capital.");
      return;
    }
    var vs = equity + debt;
    var kePct = ke /  100;
    var kdPct = kd /  100;
    var taxPct = tax /  100;
    var eW = equity / vs;
    var dW = debt / vs;
    var kdAfter = kdPct * (1 - taxPct);
    var wacc = (eW * kePct) + (dW * kdAfter);
    var debtAfterPct = kdAfter * 100;

    waccOut.textContent = fmtPct(wacc);
    equityWeightOut.textContent = fmtPct1(eW);
    debtWeightOut.textContent = fmtPct1(dW);
    debtAfterTaxOut.textContent = fmtPct(debtAfterPct /  100);
    equityCompOut.textContent = fmtPct(eW * kePct);
    debtCompOut.textContent = fmtPct(dW * kdAfter);
    rawWaccOut.textContent = (wacc * 100).toFixed(4) + "%";
    resultsCard.classList.remove("d-none");
    hideError();
    window.setTimeout(function() {
      drawBars(eW, dW, eW * kePct / wacc, dW * kdAfter / wacc);
    },  50);
  }

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    computeWacc();
  });

  var equityInput = document.getElementById("equityInput");
  var debtInput = document.getElementById("debtInput");
  var keInput = document.getElementById("keInput");
  var kdInput = document.getElementById("kdInput");
  var taxInput = document.getElementById("taxInput");
  [equityInput, debtInput, keInput, kdInput, taxInput].forEach(function(el) {
    el.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        e.preventDefault();
        computeWacc();
      }
    });
    el.addEventListener("blur", function() {
      var v = parseNum(el);
      if (v !== null && (el.id.indexOf("Input") !== -1 || el.id === "equityInput" || el.id === "debtInput") && el.id !== "keInput" && el.id !== "kdInput" && el.id !== "taxInput") {
        // no-op sanity guard; inputs are validated wholenumbers where required
      }
    });
  });
})();
