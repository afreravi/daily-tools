(function () {
  "use strict";

  var form = document.getElementById("ltvForm");
  var results = document.getElementById("results");
  var insightBox = document.getElementById("insightBox");
  var insightText = document.getElementById("insightText");

  var money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  var money2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });

  function readValidated() {
    var avg = parseFloat(document.getElementById("avgOrder").value);
    var freq = parseFloat(document.getElementById("purchaseFreq").value);
    var margin = parseFloat(document.getElementById("grossMargin").value);
    var retention = parseFloat(document.getElementById("retentionRate").value);

    if ([avg, freq, margin, retention].some(function (v) { return isNaN(v); })) {
      showError("Please enter all four values before calculating.");
      return null;
    }

    var errs = [];
    if (avg <=  0) { errs.push("Average order value must be greater than 0."); }
    if (freq <=  0) { errs.push("Purchases per year must be greater than 0."); }
    if (margin <=  0 || margin >  100) { errs.push("Gross margin must be between 0 and 100."); }
    if (retention <=  0 || retention >=  100) { errs.push("Retention rate must be between 0 and 99.9."); }

    if (errs.length >  0) {
      showError(errs.join(" "));
      return null;
    }

    return { avg: avg, freq: freq, margin: margin, retention: retention };
  }

  function setBox(className, message) {
    insightBox.className = className;
    insightText.textContent = message;
    insightBox.classList.remove("d-none");
  }

  function showError(msg) {
    results.classList.remove("d-none");
    document.querySelector("#results .row").classList.add("d-none");
    document.getElementById("ltvValue").textContent = "";
    setBox("alert alert-danger small mt-2", msg);
  }

  function render(inputs) {
    var avg = inputs.avg;
    var freq = inputs.freq;
    var margin = inputs.margin;
    var retention = inputs.retention;

    var annualProfit = avg * freq * (margin / 100);
    var churn =  1 - (retention /  100);
    var lifespan =  1 / churn;
    var ltv = annualProfit * lifespan;

    results.classList.remove("d-none");
    document.querySelector("#results .row").classList.remove("d-none");
    document.getElementById("ltvValue").textContent = money.format(ltv);
    document.getElementById("gpvValue").textContent = money.format(annualProfit);
    document.getElementById("lifespanValue").textContent = lifespan.toFixed(1) + " yr";
    document.getElementById("cacValue").textContent = money.format(ltv);

    setBox("alert alert-info small mt-2",
      "At a retention rate of " + retention + "%, the average customer stays " + lifespan.toFixed(1) +
      " years. Annual profit per customer is " + money2.format(annualProfit) +
      ", so each customer is worth roughly " + money.format(ltv) +
      " over their lifetime. Keep customer acquisition cost (CAC) well below " + money.format(ltv) +
      " to protect margin  a healthy LTV:CAC ratio is typically 3:1 or higher.");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var inputs = readValidated();
    if (inputs) { render(inputs); }
  });

  form.addEventListener("input", function () {
    if (!results.classList.contains("d-none")) {
      var inputs = readValidated();
      if (inputs) { render(inputs); }
    }
  });

  document.getElementById("avgOrder").focus();
})();