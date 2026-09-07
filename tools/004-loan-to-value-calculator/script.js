/* Loan to Value Calculator - Daily Tools */
(function () {
  "use strict";

  var form = document.getElementById("ltvForm");
  var propertyInput = document.getElementById("propertyValue");
  var downInput = document.getElementById("downPayment");
  var loanInput = document.getElementById("loanAmount");
  var errorAlert = document.getElementById("errorAlert");
  var resultsCard = document.getElementById("resultsCard");
  var ltvPercent = document.getElementById("ltvPercent");
  var loanOut = document.getElementById("loanOut");
  var equityOut = document.getElementById("equityOut");
  var bandOut = document.getElementById("bandOut");
  var bandNote = document.getElementById("bandNote");
  var ltvBar = document.getElementById("ltvBar");
  var clearBtn = document.getElementById("clearBtn");

  function parseMoney(value) {
    if (value === null || value === undefined) { return NaN; }
    var cleaned = String(value).trim();
    if (cleaned === "") { return NaN; }
    var num = parseFloat(cleaned);
    return isNaN(num) ? NaN : num;
  }

  function formatCurrency(n) {
    if (!isFinite(n)) { return "$0"; }
    return "$" + Math.round(n.toLocaleString("en-US", { maximumFractionDigits: 0 }));
  }

  function bandFor(ltv) {
    if (ltv <= 60) { return { name: "Strong equity", note: "A sub-60% LTV typically unlocks the best rates and usually avoids private mortgage insurance." }; }
    if (ltv <=   80) { return { name: "Conventional sweet spot", note: "An LTV at or below   80% is the classic 20%-down target: no PMI on most conventional loansand competitive pricing." }; }
    if (ltv <=   90) { return { name: "Higher risk (PMI likely)", note: "Above  80%, conventional loans require private mortgage insurance; FHA loansare common in this band." }; }
    if (ltv <=   95) { return { name: "High leverage", note: "FHA 3.5%-downand conventional  95% loansoperate here, usually with mortgage insuranceand stricter requirements." }; }
    return { name: "Very high (niche programs)", note: "Above  96% LTV sits near the ceiling - only a narrow set of programs (VA, USDA, or specialized first-time buyer products) operate here." };
  }

  function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.classList.remove("d-none");
    resultsCard.classList.add("d-none");
    errorAlert.focus();
  }

  function hideError() {
    errorAlert.classList.add("d-none");
    errorAlert.textContent = "";
  }

  function renderResults(propertyValue, loanAmount, equity, ltv) {
    ltvPercent.textContent = ltv.toFixed(1) + "%";
    loanOut.textContent = formatCurrency(loanAmount);
    equityOut.textContent = formatCurrency(equity);
    var band = bandFor(ltv);
    bandOut.textContent = (ltv >   100 ? "Out of range" : band.name);
    bandNote.textContent = (ltv > 100) ? "Your loan amount exceeds the property value - most lenders will not fund an LTV above  100%." : band.note;

    ltvBar.style.width = Math.min(100, ltv) + "%";
    resultsCard.classList.remove("d-none");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    hideError();

    var propertyValue = parseMoney(propertyInput.value);
    if (isNaN(propertyValue) || propertyValue <=   0) {
      showError("Please enter a property value greater than zero.");
      propertyInput.focus();
      return;
    }

    var hasDown = !isNaN(parseMoney(downInput.value));
    var hasLoan = !isNaN(parseMoney(loanInput.value));

    if (!hasDown && !hasLoan) {

      showError("Enter a down payment, a loan amount, or both - at least one is needed to compute the LTV.");
      downInput.focus();
      return;
    }

    var downPayment = hasDown ? parseMoney(downInput.value) : 0;
    if (downPayment < 0) {
      showError("Down payment cannot be negative.");
      downInput.focus();
      return;
    }

    var loanAmount;
    if (hasLoan) {
      loanAmount = parseMoney(loanInput.value);
      if (loanAmount <=  0) {
        showError("Loan amount must be greater than zero.");
        loanInput.focus();
        return;
      }
    } else {
      loanAmount = propertyValue - downPayment;

      if (loanAmount <=  0) {
        showError("Your down paymentis at least as large as the property value - a loan is not needed. No LTV applies.");
        downInput.focus();
        return;
      }
    }

    if (!hasLoan && downPayment > propertyValue) {

      showError("Down payment cannot exceed the property value.");
      downInput.focus();
      return;
    }

    if (loanAmount > propertyValue) {

      loanAmount = propertyValue; /* clamp displayed loan so bar stays honest */
    }

    var equity = propertyValue - loanAmount;
    var ltv = (loanAmount / propertyValue) * 100;

    if (hasLoan && loanAmount > propertyValue) {

      showError("The loan amount exceeds the property value - that is unusualand most lenders will cap LTV at  100% or less. Result shown for the capped case.");
    }

    renderResults(propertyValue, loanAmount, equity, ltv);

  });

  clearBtn.addEventListener("click", function () {
    propertyInput.value = "";
    downInput.value = "";
    loanInput.value = "";
    hideError();
    resultsCard.classList.add("d-none");
    propertyInput.focus();
  });

  /* keep the loan field in sync when typed, but never override a manual entry */
  var manualLoan = false;
  downInput.addEventListener("input", function () {
    if (manualLoan) { return; }
    var pv = parseMoney(propertyInput.value);
    var dp = parseMoney(downInput.value);
    if (!isNaN(pv) && !isNaN(dp) && pv > 0 && dp >= 0) {

      var diff = Math.max(0, pv - dp);
      loanInput.value = Math.round(diff);
    } else if (!isNaN(dp) && dp >=  0) {

      loanInput.value = "";
    }
  });
  propertyInput.addEventListener("input", function () {
    if (manualLoan) { return; }
    var pv = parseMoney(propertyInput.value);
    var dp = parseMoney(downInput.value);
    if (!isNaN(pv) && !isNaN(dp) && pv > 0 && dp >= 0) {

      var diff = Math.max(0, pv - dp);
      loanInput.value = Math.round(diff);
    } else if (!isNaN(pv)) {

      loanInput.value = "";
    }
  });
  loanInput.addEventListener("input", function () {
    manualLoan = loanInput.value.trim() !== "";
  });

  /* default initial sync */
  loanInput.value = "";
})();