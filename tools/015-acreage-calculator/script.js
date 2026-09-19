/* Acreage Calculator — vanilla JS, no framework */
(function () {
  "use strict";

  var SQFT_PER_ACRE = 43560;          // exact, international acre
  var SQFT_PER_SQM = 10.7639104167097; // 1 m^2 in ft^2
  var SQFT_PER_SQMI = 27878400;        // 1 mi^2 in ft^2
  var SQFT_PER_SQYD = 9;               // 1 yd^2 in ft^2

  var LENGTH_TO_FT = { ft: 1, m: 3.28083989501312, yd: 3, mi: 5280 };
  var AREA_TO_ACRES = {
    ac: 1,
    sqft: 1 / SQFT_PER_ACRE,
    sqm: SQFT_PER_SQM / SQFT_PER_ACRE,
    ha: 2.47105381467165,
    sqmi: 640,
    sqyd: 1 / 4840
  };

  var AREA_LABEL = {
    ac: "acres", sqft: "sq ft", sqm: "sq m",
    ha: "hectares", sqmi: "sq mi", sqyd: "sq yd"
  };

  function $(id) { return document.getElementById(id); }

  function num(el) {
    if (!el) return NaN;
    var raw = String(el.value == null ? "" : el.value).trim();
    if (raw === "") return NaN;
    return Number(raw);
  }

  function fmt(value, dp) {
    if (!isFinite(value)) return "—";
    var decimals = (dp === null || dp === undefined) ? 2 : dp;
    try {
      return Number(value).toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    } catch (e) {
      return Number(value).toFixed(decimals);
    }
  }

  function roundForDisplay(value, dp) {
    var f = Math.pow(10, dp);
    return Math.round(value * f) / f;
  }

  /* ----------------------------- state ----------------------------- */
  var state = { mode: "dims", parcels: [] };

  /* ----------------------------- errors ---------------------------- */
  function showError(msg) {
    var box = $("errorBox");
    if (!box) return;
    box.textContent = msg;
    box.classList.remove("d-none");
  }

  function clearError() {
    var box = $("errorBox");
    if (!box) return;
    box.textContent = "";
    box.classList.add("d-none");
  }

  /* --------------------------- validation -------------------------- */
  // Returns {acres, sqft} or null (after showing an error).
  function computeFromDimensions(quiet) {
    var lenEl = $("lengthVal");
    var widEl = $("widthVal");
    var L = num(lenEl);
    var W = num(widEl);

    if (isNaN(L) || isNaN(W)) {
      if (quiet) return null;
      showError("Please enter both a length and a width before calculating.");
      if (isNaN(L) && lenEl) lenEl.focus();
      else if (widEl) widEl.focus();
      return null;
    }
    if (L < 0 || W < 0) {
      if (quiet) return null;
      showError("Length and width cannot be negative. Enter positive numbers in a single unit.");
      (L < 0 ? lenEl : widEl).focus();
      return null;
    }
    if (L === 0 || W === 0) {
      if (quiet) return null;
      showError("A length or width of zero gives an area of zero. Enter a value greater than zero.");
      (L === 0 ? lenEl : widEl).focus();
      return null;
    }
    var unit = $("dimsUnit") ? $("dimsUnit").value : "ft";
    var factor = LENGTH_TO_FT[unit];
    if (!factor) {
      if (!quiet) showError("That measurement unit is not supported. Choose feet, meters, yards, or miles.");
      return null;
    }

    var sqft = (L * factor) * (W * factor);
    if (!isFinite(sqft) || sqft <= 0) {
      if (!quiet) showError("Those dimensions are out of range. Please use smaller, positive values.");
      return null;
    }
    // Guard against absurd magnitudes produced by mile-scale input typos.
    var acres = sqft / SQFT_PER_ACRE;
    if (acres > 1e9) {
      if (!quiet) showError("That works out to more than a billion acres. Check your unit selection and values.");
      return null;
    }
    return { acres: acres, sqft: sqft };
  }

  function computeFromArea(quiet) {
    var areaEl = $("areaVal");
    var A = num(areaEl);

    if (isNaN(A)) {
      if (quiet) return null;
      showError("Enter an area value to convert, or switch to length and width mode.");
      if (areaEl) areaEl.focus();
      return null;
    }
    if (A < 0) {
      if (quiet) return null;
      showError("Area cannot be negative. Enter a positive value.");
      if (areaEl) areaEl.focus();
      return null;
    }
    if (A === 0) {
      if (quiet) return null;
      showError("An area of zero has nothing to convert. Enter a value greater than zero.");
      if (areaEl) areaEl.focus();
      return null;
    }
    var unit = $("areaUnit") ? $("areaUnit").value : "ac";
    var factor = AREA_TO_ACRES[unit];
    if (!factor) {
      if (!quiet) showError("That area unit is not recognised. Pick one from the list.");
      return null;
    }
    var acres = A * factor;
    if (!isFinite(acres) || acres <= 0 || acres > 1e9) {
      if (!quiet) showError("That area is out of range. Please use a smaller positive value.");
      return null;
    }
    return { acres: acres, sqft: acres * SQFT_PER_ACRE };
  }

  /* ---------------------------- results ---------------------------- */
  function renderResults(res, dp) {
    var acres = res.acres;
    var sqft = res.sqft;

    $("outAcres").textContent = fmt(roundForDisplay(acres, dp), dp);
    $("outSqft").textContent = fmt(roundForDisplay(sqft, dp), dp);
    $("outSqm").textContent = fmt(roundForDisplay(sqft / SQFT_PER_SQM, dp), dp);
    $("outHa").textContent = fmt(roundForDisplay(acres / 2.47105381467165, Math.min(dp, 6)), dp);
    $("outSqmi").textContent = fmt(roundForDisplay(sqft / SQFT_PER_SQMI, Math.min(dp, 6)), dp);
    $("outSqyd").textContent = fmt(roundForDisplay(sqft / SQFT_PER_SQYD, dp), dp);
    $("outSections").textContent = fmt(roundForDisplay(acres / 640, Math.min(dp, 6)), dp);

    var f = $("factFootball");
    if (f) {
      var fields = acres / 1.32;
      if (fields >= 0.01) {
        f.textContent = "About " + fmt(roundForDisplay(fields, 2), 2) + " American football fields.";
      } else {
        f.textContent = "Smaller than a single football field.";
      }
    }

    var side = Math.sqrt(sqft);
    var sideEl = $("factSide");
    if (sideEl) {
      sideEl.textContent = "A square of the same area would be about " +
        fmt(roundForDisplay(side, 1), 1) + " ft (or " +
        fmt(roundForDisplay(side / 3, 1), 1) + " yd) on each side.";
    }

    var perAcre = state.mode === "dims"
      ? num($("pricePerAcre"))
      : num($("pricePerAcreArea"));

    var valueEl = $("factValue");
    if (valueEl) {
      if (!isNaN(perAcre) && perAcre > 0) {
        valueEl.textContent = "Estimated land value: $" +
          fmt(roundForDisplay(acres * perAcre, 2), 2) + " at $" +
          fmt(perAcre, 2) + " per acre.";
      } else if (!isNaN(perAcre) && perAcre === 0) {
        valueEl.textContent = "Land value per acre is zero — no value estimate shown.";
      } else {
        valueEl.textContent = "Add a price per acre to see an estimated land value.";
      }
    }

    $("resultCard").classList.remove("d-none");
    drawChart(acres);
    updateParcelTotals();
  }

  /* ----------------------------- chart ----------------------------- */
  function drawChart(acres) {
    var canvas = $("areaChart");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width;
    var H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    var data = [
      { label: "0.25 acre", value: 0.25 },
      { label: "1 acre", value: 1 },
      { label: "5 acres", value: 5 },
      { label: "Your parcel", value: acres, highlight: true }
    ];

    var padL = 46;
    var padR = 16;
    var padT = 26;
    var padB = 46;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var max = Math.max(0.25, 1, 5, acres) * 1.15;
    if (!isFinite(max) || max <= 0) max = 1;

    // gridlines
    ctx.strokeStyle = "#eae3f4";
    ctx.lineWidth = 1;
    ctx.fillStyle = "#8a8394";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var g = 0; g <= 4; g++) {
      var val = (max / 4) * g;
      var y = padT + plotH - (plotH * (g / 4));
      ctx.beginPath();
      ctx.moveTo(padL, Math.round(y) + 0.5);
      ctx.lineTo(padL + plotW, Math.round(y) + 0.5);
      ctx.stroke();
      ctx.fillText(shortNum(val), padL - 8, y);
    }

    var slot = plotW / data.length;
    var barW = Math.min(74, slot * 0.6);

    ctx.textAlign = "center";
    for (var i = 0; i < data.length; i++) {
      var d = data[i];
      var h = Math.max(1, (d.value / max) * plotH);
      var x = padL + slot * i + (slot - barW) / 2;
      var yTop = padT + plotH - h;

      var grad = ctx.createLinearGradient(0, yTop, 0, padT + plotH);
      if (d.highlight) {
        grad.addColorStop(0, "#60089c");
        grad.addColorStop(1, "#9a52cf");
      } else {
        grad.addColorStop(0, "#d9c6ec");
        grad.addColorStop(1, "#efe6f8");
      }
      ctx.fillStyle = grad;
      roundRect(ctx, x, yTop, barW, h, 5);
      ctx.fill();

      ctx.fillStyle = d.highlight ? "#37045a" : "#6b6473";
      ctx.font = (d.highlight ? "bold " : "") + "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textBaseline = "bottom";
      ctx.fillText(shortNum(d.value), x + barW / 2, yTop - 6);

      ctx.fillStyle = "#544d5e";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textBaseline = "top";
      var words = d.label.split(" ");
      if (words.length > 1 && slot < 110) {
        ctx.fillText(words[0], x + barW / 2, padT + plotH + 8);
        ctx.fillText(words.slice(1).join(" "), x + barW / 2, padT + plotH + 22);
      } else {
        ctx.fillText(d.label, x + barW / 2, padT + plotH + 12);
      }
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, w / 2, Math.max(h / 2, 0));
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  function shortNum(v) {
    if (!isFinite(v)) return "—";
    if (v >= 1000) return Math.round(v).toLocaleString("en-US");
    if (v >= 10) return String(Math.round(v * 10) / 10);
    if (v >= 1) return String(Math.round(v * 100) / 100);
    return String(Math.round(v * 10000) / 10000);
  }

  /* ---------------------------- parcels ---------------------------- */
  function addParcel() {
    var nameEl = $("parcelName");
    var acresEl = $("parcelAcres");
    var val = num(acresEl);
    var name = nameEl ? String(nameEl.value || "").trim() : "";

    if (isNaN(val)) {
      showError("Enter an area in acres for the parcel you want to add.");
      if (acresEl) acresEl.focus();
      return;
    }
    if (val <= 0) {
      showError("A parcel must be larger than zero acres.");
      if (acresEl) acresEl.focus();
      return;
    }
    if (val > 1e9) {
      showError("That parcel area is unrealistically large. Check the value.");
      return;
    }
    clearError();
    state.parcels.push({ name: name || ("Parcel " + (state.parcels.length + 1)), acres: val });
    if (nameEl) nameEl.value = "";
    if (acresEl) acresEl.value = "";
    updateParcelTotals();
    if (nameEl) nameEl.focus();
  }

  function removeParcel(index) {
    state.parcels.splice(index, 1);
    updateParcelTotals();
  }

  function updateParcelTotals() {
    var body = $("parcelBody");
    if (!body) return;
    body.innerHTML = "";

    var totalAcres = 0;
    for (var i = 0; i < state.parcels.length; i++) {
      totalAcres += state.parcels[i].acres;
    }

    for (var j = 0; j < state.parcels.length; j++) {
      var p = state.parcels[j];
      var tr = document.createElement("tr");

      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.className = "font-weight-normal";
      th.textContent = p.name;

      var tdA = document.createElement("td");
      tdA.className = "text-right";
      tdA.textContent = fmt(roundForDisplay(p.acres, 2), 2);

      var tdS = document.createElement("td");
      tdS.className = "text-right";
      tdS.textContent = fmt(roundForDisplay(p.acres * SQFT_PER_ACRE, 0), 0);

      var tdBtn = document.createElement("td");
      tdBtn.className = "text-right";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "parcel-remove";
      btn.setAttribute("aria-label", "Remove " + p.name);
      btn.textContent = "\u00d7";
      btn.addEventListener("click", makeRemoveHandler(j));
      tdBtn.appendChild(btn);

      tr.appendChild(th);
      tr.appendChild(tdA);
      tr.appendChild(tdS);
      tr.appendChild(tdBtn);
      body.appendChild(tr);
    }

    $("parcelTotalAcres").textContent = fmt(roundForDisplay(totalAcres, 2), 2);
    $("parcelTotalSqft").textContent = fmt(roundForDisplay(totalAcres * SQFT_PER_ACRE, 0), 0);
  }

  function makeRemoveHandler(index) {
    return function () { removeParcel(index); };
  }

  /* ----------------------------- modes ----------------------------- */
  function setMode(mode) {
    state.mode = mode === "area" ? "area" : "dims";
    var dimsPanel = $("dimsPanel");
    var areaPanel = $("areaPanel");
    if (state.mode === "dims") {
      dimsPanel.classList.remove("d-none");
      areaPanel.classList.add("d-none");
    } else {
      dimsPanel.classList.add("d-none");
      areaPanel.classList.remove("d-none");
    }
    clearError();
  }

  /* ---------------------------- run calc --------------------------- */
  function calculate() {
    clearError();
    var dp = parseInt($("roundTo") ? $("roundTo").value : "2", 10);
    if (isNaN(dp)) dp = 2;

    var res = state.mode === "dims" ? computeFromDimensions() : computeFromArea();
    if (!res) {
      $("resultCard").classList.add("d-none");
      return;
    }
    renderResults(res, dp);
  }

  function resetForm() {
    $("lengthVal").value = "660";
    $("widthVal").value = "66";
    $("dimsUnit").value = "ft";
    $("pricePerAcre").value = "";
    $("areaVal").value = "1";
    $("areaUnit").value = "ac";
    $("pricePerAcreArea").value = "";
    $("roundTo").value = "2";
    $("parcelName").value = "";
    $("parcelAcres").value = "";
    state.parcels = [];
    clearError();
    $("resultCard").classList.add("d-none");
    setMode("dims");
    $("modeDims").checked = true;
    $("modeDimsWrap").classList.add("active");
    $("modeAreaWrap").classList.remove("active");
    updateParcelTotals();
  }

  /* ----------------------------- wiring ---------------------------- */
  function bind() {
    $("calcBtn").addEventListener("click", calculate);
    $("resetBtn").addEventListener("click", resetForm);
    $("addParcelBtn").addEventListener("click", addParcel);

    $("modeDims").addEventListener("change", function () { setMode("dims"); });
    $("modeArea").addEventListener("change", function () { setMode("area"); });

    // Live recalculation once a result exists.
    ["lengthVal", "widthVal", "dimsUnit", "pricePerAcre",
     "areaVal", "areaUnit", "pricePerAcreArea", "roundTo"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", maybeLiveUpdate);
      el.addEventListener("change", maybeLiveUpdate);
    });

    // Enter key on inputs triggers calculation.
    ["lengthVal", "widthVal", "areaVal", "pricePerAcre", "pricePerAcreArea"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); calculate(); }
      });
    });

    var acresEl = $("parcelAcres");
    if (acresEl) {
      acresEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); addParcel(); }
      });
    }

    var y = $("year");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function maybeLiveUpdate() {
    var card = $("resultCard");
    if (!card || card.classList.contains("d-none")) return;
    // Keep live updates silent: only refresh when inputs are currently valid.
    var res = state.mode === "dims"
      ? computeFromDimensions(true)
      : computeFromArea(true);
    if (res) {
      var dp = parseInt($("roundTo").value, 10);
      renderResults(res, isNaN(dp) ? 2 : dp);
    }
  }

  var bound = false;
  function bindOnce() {
    if (bound) return;
    bound = true;
    bind();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindOnce);
  } else {
    bindOnce();
  }
})();
