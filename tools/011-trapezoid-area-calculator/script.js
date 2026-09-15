(function () {
  "use strict";

  var UNITS = {
    metric: { a: "cm", area: "cm²", alt: "m", altArea: "m²" },
    imperial: { a: "in", area: "in²", alt: "ft", altArea: "ft²" }
  };

  var el = {};
  [
    "trapForm", "baseA", "baseB", "height", "knownArea", "solveHeight", "isIsosceles",
    "legC", "legD", "formAlert", "calcBtn",
    "areaOut", "areaUnit", "heightOut", "medianOut", "perimOut", "legCOut", "legDOut",
    "ratioOut", "formulaOut", "trapCanvas", "barCanvas", "barNote",
    "areaRow", "legRow", "unitA", "unitB", "unitH", "unitC", "unitD", "unitArea",
    "errBaseA", "errBaseB", "errHeight", "errKnownArea", "errLegC", "errLegD",
    "lastUpdated", "year", "resetBtn", "areaOut"
  ].forEach(function (id) {
    el[id] = document.getElementById(id);
  });

  function currentUnits() {
    var checked = document.querySelector('input[name="units"]:checked');
    return checked && checked.value === "imperial" ? UNITS.imperial : UNITS.metric;
  }

  function readNumber(input) {
    var raw = String(input.value).trim();
    if (raw === "") { return { state: "empty" }; }
    var n = Number(raw);
    if (!isFinite(n)) { return { state: "invalid", msg: "Enter a valid number." }; }
    if (n < 0) { return { state: "invalid", msg: "Negative values are not allowed." }; }
    if (n === 0) { return { state: "zero" }; }
    if (n > 1e9) { return { state: "invalid", msg: "Value is too large (max 1,000,000,000)." }; }
    return { state: "ok", value: n };
  }

  function round(n, dp) {
    if (!isFinite(n)) { return "—"; }
    var f = Math.pow(10, dp == null ? 2 : dp);
    var r = Math.round(n * f) / f;
    return (Math.abs(r) >= 1e21) ? r.toExponential(3) : String(r);
  }

  function fmt(n, dp) {
    return round(n, dp).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function setError(input, box, msg) {
    if (msg) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
      box.textContent = msg;
    } else {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
      box.textContent = "";
    }
  }

  function clearErrors() {
    [
      [el.baseA, el.errBaseA], [el.baseB, el.errBaseB], [el.height, el.errHeight],
      [el.knownArea, el.errKnownArea], [el.legC, el.errLegC], [el.legD, el.errLegD]
    ].forEach(function (pair) { setError(pair[0], pair[1], ""); });
    el.formAlert.classList.add("d-none");
    el.formAlert.textContent = "";
  }

  function showAlert(msg) {
    el.formAlert.textContent = msg;
    el.formAlert.classList.remove("d-none");
  }

  function safeSet(node, text) {
    while (node.firstChild) { node.removeChild(node.firstChild); }
    node.appendChild(document.createTextNode(text));
  }

  /**
   * Compute everything, write results to the DOM, and return the model so the
   * canvas renderers can reuse it. Never throws: invalid input returns null and
   * the UI shows validation messages instead.
   */
  function compute() {
    clearErrors();
    var units = currentUnits();
    var mode = el.solveHeight.checked ? "height" : "area";
    var isIso = el.isIsosceles.checked;

    var ra = readNumber(el.baseA);
    var rb = readNumber(el.baseB);
    var rh = readNumber(el.height);
    var rArea = readNumber(el.knownArea);
    var rc = readNumber(el.legC);
    var rd = readNumber(el.legD);

    var errors = [];
    var a = null, b = null, h = null, area = null;

    // --- Parallel sides (always required) ---
    [["a", ra, el.baseA, el.errBaseA], ["b", rb, el.baseB, el.errBaseB]].forEach(function (t) {
      var name = t[0], res = t[1], input = t[2], box = t[3];
      if (res.state === "invalid") { setError(input, box, res.msg); errors.push(name); }
      else if (res.state === "empty") { errors.push(name); }
      else if (res.state === "zero") { errors.push(name); }
    });
    if (ra.state === "ok") { a = ra.value; }
    if (rb.state === "ok") { b = rb.value; }

    // --- Height, or area when solving for height ---
    if (mode === "area") {
      if (rh.state === "invalid") { setError(el.height, el.errHeight, rh.msg); errors.push("h"); }
      else if (rh.state === "empty" || rh.state === "zero") { errors.push("h"); }
      if (rh.state === "ok") { h = rh.value; }
    } else {
      if (rArea.state === "invalid") { setError(el.knownArea, el.errKnownArea, rArea.msg); errors.push("A"); }
      else if (rArea.state === "empty" || rArea.state === "zero") { errors.push("A"); }
    }

    if (errors.length) {
      // Keep the headline area blank rather than showing a stale or fake number.
      safeSet(el.areaOut, "—");
      safeSet(el.areaUnit, units.area);
      safeSet(el.heightOut, "—");
      safeSet(el.medianOut, "—");
      safeSet(el.perimOut, "—");
      safeSet(el.legCOut, "—");
      safeSet(el.legDOut, "—");
      safeSet(el.ratioOut, "—");
      safeSet(el.formulaOut, "Enter the two parallel sides and " +
        (mode === "area" ? "the height" : "the known area") +
        " to see the calculation. All values must be greater than zero.");
      drawTrap(null);
      drawBars(null);
      showAlert("Please fix the highlighted inputs — every required value must be a number greater than zero.");
      return null;
    }

    if (mode === "height") {
      // h = 2A / (a + b)
      h = (2 * rArea.value) / (a + b);
    }
    area = ((a + b) / 2) * h;
    var median = (a + b) / 2;

    // --- Legs ---
    var legC = null, legD = null;
    var legNote = "";
    if (rc.state === "ok" && rc.value > 0) { legC = rc.value; }
    else if (rc.state === "invalid") { setError(el.legC, el.errLegC, rc.msg); }
    if (rd.state === "ok" && rd.value > 0) { legD = rd.value; }
    else if (rd.state === "invalid") { setError(el.legD, el.errLegD, rd.msg); }

    if (legC === null && legD === null && isIso) {
      var run = Math.abs(a - b) / 2;
      var leg = Math.sqrt(h * h + run * run);
      legC = leg;
      legD = leg;
      legNote = "estimated assuming an isosceles trapezoid";
    }

    // --- Validation: a leg can never be shorter than the height ---
    var legInvalid = false;
    [[legC, el.legC, el.errLegC, "c"], [legD, el.legD, el.errLegD, "d"]].forEach(function (t) {
      if (t[0] !== null && t[0] < h) {
        setError(t[1], t[2], "Leg " + t[3] + " cannot be shorter than the height (" + fmt(h, 2) + " " + units.a + ").");
        legInvalid = true;
      }
    });

    var perimeter = (!legInvalid && legC !== null && legD !== null) ? a + b + legC + legD : null;

    // --- Write results ---
    safeSet(el.areaOut, fmt(area, 2));
    safeSet(el.areaUnit, units.area);
    safeSet(el.heightOut, fmt(h, 2) + " " + units.a);
    safeSet(el.medianOut, fmt(median, 2) + " " + units.a);
    safeSet(el.perimOut, perimeter === null ? "add both legs" : fmt(perimeter, 2) + " " + units.a);
    safeSet(el.legCOut, legC === null ? "—" : fmt(legC, 2) + " " + units.a + (legNote ? " *" : ""));
    safeSet(el.legDOut, legD === null ? "—" : fmt(legD, 2) + " " + units.a + (legNote ? " *" : ""));
    safeSet(el.ratioOut, a > 0 ? fmt((h / a) * 100, 1) + "%" : "—");

    safeSet(el.formulaOut,
      "Area = (a + b) ÷ 2 × h = (" + fmt(a, 2) + " + " + fmt(b, 2) + ") ÷ 2 × " +
      fmt(h, 2) + " = " + fmt(area, 2) + " " + units.area +
      (mode === "height" ? "  •  h solved from A = " + fmt(rArea.value, 2) + " " + units.area : "") +
      (legNote ? "  •  Legs " + legNote + ". Untick the isosceles box to enter your own." : ""));

    return {
      a: a, b: b, h: h, area: area, median: median,
      legC: legC, legD: legD, perimeter: perimeter,
      isIso: isIso, legNote: legNote, units: units,
      labelA: el.baseA.value, labelB: el.baseB.value, labelH: el.height.value,
      legCLabel: el.legC.value, legDLabel: el.legD.value
    };
  }

  /* ------------------------- Canvas: scale diagram ------------------------- */
  function drawTrap(model) {
    var canvas = el.trapCanvas;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var PAD = 70;
    if (!model) {
      ctx.fillStyle = "#8a8691";
      ctx.font = "16px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Enter valid measurements to see the diagram", W / 2, H / 2);
      return;
    }

    var a = Math.max(model.a, model.b);
    var b = Math.min(model.a, model.b);
    var maxW = a;
    var availW = W - PAD * 2;
    var availH = H - PAD * 2;
    var scale = Math.min(availW / Math.max(maxW, 1e-9), availH / Math.max(model.h, 1e-9));

    var wa = a * scale, wb = b * scale, wh = model.h * scale;
    var cx = W / 2;
    var topLeft = cx - wb / 2, topRight = cx + wb / 2;
    var botLeft = cx - wa / 2, botRight = cx + wa / 2;
    var topY = PAD + (availH - wh) / 2;
    var botY = topY + wh;

    // Shape fill
    ctx.beginPath();
    ctx.moveTo(topLeft, topY);
    ctx.lineTo(topRight, topY);
    ctx.lineTo(botRight, botY);
    ctx.lineTo(botLeft, botY);
    ctx.closePath();
    var grad = ctx.createLinearGradient(0, topY, 0, botY);
    grad.addColorStop(0, "rgba(138, 63, 191, 0.16)");
    grad.addColorStop(1, "rgba(96, 8, 156, 0.07)");
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = "#60089c";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Height indicator (dashed, centered)
    ctx.save();
    ctx.setLineDash([6, 5]);
    ctx.strokeStyle = "#8a3fbf";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, topY);
    ctx.lineTo(cx, botY);
    ctx.stroke();
    ctx.restore();

    // Right-angle marker
    ctx.strokeStyle = "#8a3fbf";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx + 12, botY);
    ctx.lineTo(cx + 12, botY - 12);
    ctx.moveTo(cx, botY - 12);
    ctx.lineTo(cx + 12, botY - 12);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#37055a";
    ctx.font = "600 15px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("a = " + model.labelA + " " + model.units.a, cx, topY - 14);
    ctx.fillText("b = " + model.labelB + " " + model.units.a, cx, botY + 26);

    ctx.textAlign = "left";
    ctx.fillStyle = "#4c077d";
    ctx.fillText("h = " + model.labelH, cx + 16, (topY + botY) / 2 - 8);

    if (model.legC !== null) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#6b6572";
      ctx.font = "13px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.save();
      ctx.translate((topLeft + botLeft) / 2 - 34, (topY + botY) / 2);
      ctx.fillText("c", 0, 0);
      ctx.restore();
      ctx.save();
      ctx.translate((topRight + botRight) / 2 + 34, (topY + botY) / 2);
      ctx.fillText("d", 0, 0);
      ctx.restore();
    }

    ctx.fillStyle = "#6b6572";
    ctx.font = "14px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Drawn to scale — area " + fmt(model.area, 2) + " " + model.units.area, W / 2, H - 20);
  }

  /* --------------------- Canvas: area-vs-height bar chart ------------------- */
  function drawBars(model) {
    var canvas = el.barCanvas;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var PAD_L = 58, PAD_R = 20, PAD_T = 26, PAD_B = 46;
    var plotW = W - PAD_L - PAD_R;
    var plotH = H - PAD_T - PAD_B;

    if (!model) {
      ctx.fillStyle = "#8a8691";
      ctx.font = "15px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Height/area chart appears once the inputs are valid", W / 2, H / 2);
      safeSet(el.barNote, "Each bar uses the same bases with a taller height. Area is directly proportional to height, so the bars rise in a straight line.");
      return;
    }

    var median = model.median;
    var steps = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    var values = steps.map(function (s) { return median * model.h * s; });
    var maxV = values[values.length - 1];

    // Axes
    ctx.strokeStyle = "#d9d2e3";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PAD_L, PAD_T);
    ctx.lineTo(PAD_L, H - PAD_B);
    ctx.lineTo(W - PAD_R, H - PAD_B);
    ctx.stroke();

    // Y grid + ticks
    ctx.fillStyle = "#6b6572";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "right";
    for (var g = 0; g <= 4; g++) {
      var v = (maxV / 4) * g;
      var y = H - PAD_B - (v / maxV) * plotH;
      ctx.strokeStyle = "#efeaf6";
      ctx.beginPath();
      ctx.moveTo(PAD_L, y);
      ctx.lineTo(W - PAD_R, y);
      ctx.stroke();
      ctx.fillText(fmt(v, 0), PAD_L - 8, y + 4);
    }

    // Bars
    var gap = 8;
    var barW = (plotW - gap * (values.length - 1)) / values.length;
    values.forEach(function (val, i) {
      var bh = (val / maxV) * plotH;
      var x = PAD_L + i * (barW + gap);
      var y = H - PAD_B - bh;
      var isCurrent = Math.abs(steps[i] - 1) < 1e-9;
      var bg = ctx.createLinearGradient(0, y, 0, H - PAD_B);
      if (isCurrent) {
        bg.addColorStop(0, "#60089c");
        bg.addColorStop(1, "#8a3fbf");
      } else {
        bg.addColorStop(0, "#b98ada");
        bg.addColorStop(1, "#ded0ee");
      }
      ctx.fillStyle = bg;
      ctx.fillRect(x, y, barW, bh);

      ctx.fillStyle = "#4c077d";
      ctx.font = "10px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(steps[i] + "×", x + barW / 2, H - PAD_B + 16);

      ctx.fillStyle = "#3c3542";
      ctx.font = "10px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.fillText(fmt(val, 1), x + barW / 2, y - 5);
    });

    ctx.fillStyle = "#6b6572";
    ctx.font = "12px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Multiple of the current height (1× = your inputs)", W / 2, H - 12);
    ctx.save();
    ctx.translate(14, PAD_T + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Area (" + model.units.area + ")", 0, 0);
    ctx.restore();

    safeSet(el.barNote,
      "With bases a = " + model.labelA + " and b = " + model.labelB + " held constant, the area scales in a straight line with height. " +
      "At your current height the area is " + fmt(model.area, 2) + " " + model.units.area + "; at double the height it would be " +
      fmt(model.area * 2, 2) + " " + model.units.area + ".");
  }

  /* ------------------------------- Wiring -------------------------------- */
  function updateUnits() {
    var u = currentUnits();
    safeSet(el.unitA, u.a);
    safeSet(el.unitB, u.a);
    safeSet(el.unitH, u.a);
    safeSet(el.unitC, u.a);
    safeSet(el.unitD, u.a);
    safeSet(el.unitArea, u.area);
  }

  function updateMode() {
    var solving = el.solveHeight.checked;
    el.areaRow.classList.toggle("d-none", !solving);
    el.height.disabled = solving;
    el.height.closest(".col-12").classList.toggle("text-muted", solving);
  }

  function run() {
    updateUnits();
    updateMode();
    var model = compute();
    drawTrap(model);
    drawBars(model);
  }

  function debounce(fn, ms) {
    var t = null;
    return function () {
      if (t) { window.clearTimeout(t); }
      t = window.setTimeout(fn, ms);
    };
  }

  var debouncedRun = debounce(run, 140);

  if (el.trapForm) {
    el.trapForm.addEventListener("submit", function (e) {
      e.preventDefault();
      run();
    });
  }

  [el.baseA, el.baseB, el.height, el.knownArea, el.legC, el.legD].forEach(function (input) {
    if (!input) { return; }
    input.addEventListener("input", debouncedRun);
    input.addEventListener("change", run);
  });

  [el.solveHeight, el.isIsosceles].forEach(function (cb) {
    if (cb) { cb.addEventListener("change", run); }
  });

  Array.prototype.forEach.call(document.querySelectorAll('input[name="units"]'), function (radio) {
    radio.addEventListener("change", run);
  });

  if (el.resetBtn) {
    el.resetBtn.addEventListener("click", function () {
      el.baseA.value = 10;
      el.baseB.value = 6;
      el.height.value = 4;
      el.knownArea.value = "";
      el.legC.value = "";
      el.legD.value = "";
      el.solveHeight.checked = false;
      el.isIsosceles.checked = true;
      var metricRadio = document.querySelector('input[name="units"][value="metric"]');
      if (metricRadio) { metricRadio.checked = true; }
      run();
      el.baseA.focus();
    });
  }

  var today = new Date();
  var months = ["January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"];
  if (el.lastUpdated) {
    safeSet(el.lastUpdated, months[today.getMonth()] + " " + today.getDate() + ", " + today.getFullYear());
  }
  if (el.year) {
    safeSet(el.year, String(today.getFullYear()));
  }

  run();
})();