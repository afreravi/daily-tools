(function () {
  "use strict";

  var CU_FT_PER_CU_YD = 27;

  var shapeInputs = document.querySelectorAll('input[name="shape"]');
  var rectInputs = document.getElementById("rectInputs");
  var circleInputs = document.getElementById("circleInputs");
  var triInputs = document.getElementById("triInputs");

  var lengthFt = document.getElementById("lengthFt");
  var widthFt = document.getElementById("widthFt");
  var diameterFt = document.getElementById("diameterFt");
  var baseFt = document.getElementById("baseFt");
  var triHeightFt = document.getElementById("triHeightFt");
  var depthIn = document.getElementById("depthIn");
  var bagSize = document.getElementById("bagSize");
  var pricePer = document.getElementById("pricePer");

  var volCuYd = document.getElementById("volCuYd");
  var volCuFt = document.getElementById("volCuFt");
  var bagCount = document.getElementById("bagCount");
  var totalCost = document.getElementById("totalCost");
  var priceUnitLabel = document.getElementById("priceUnitLabel");

  var errorAlert = document.getElementById("errorAlert");

  function currentShape() {
    for (var i = 0; i < shapeInputs.length; i++) {
      if (shapeInputs[i].checked) return shapeInputs[i].value;
    }
    return "rectangle";
  }

  function numVal(el) {
    return parseFloat(el.value);
  }

  function formatNumber(n) {
    if (!isFinite(n)) return "—";
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function formatMoney(n) {
    if (!isFinite(n) || n <= 0) return "—";
    return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  }

  function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.classList.remove("d-none");
  }

  function clearError() {
    errorAlert.classList.add("d-none");
    errorAlert.textContent = "";
  }

  function areaSqFt(shape) {
    if (shape === "circle") {
      var d = numVal(diameterFt);
      var r = d / 2;
      return Math.PI * r * r;
    }
    if (shape === "triangle") {
      var b = numVal(baseFt);
      var h = numVal(triHeightFt);
      return 0.5 * b * h;
    }
    var l = numVal(lengthFt);
    var w = numVal(widthFt);
    return l * w;
  }

  function updateShape() {
    var shape = currentShape();
    rectInputs.classList.toggle("d-none", shape !== "rectangle");
    circleInputs.classList.toggle("d-none", shape !== "circle");
    triInputs.classList.toggle("d-none", shape !== "triangle");
  }

  function drawChart(bagsBySize, volumes) {
    var sizes = [
      { v: 0.75, label: "0.75 cu ft" },
      { v: 1.0, label: "1 cu ft" },
      { v: 1.5, label: "1.5 cu ft" },
      { v: 2.0, label: "2 cu ft" },
      { v: 3.0, label: "3 cu ft" }
    ];
    var maxBags = 1;
    for (var i = 0; i < sizes.length; i++) {
      if (volumes[sizes[i].v] > maxBags) maxBags = volumes[sizes[i].v];
    }

    var chartBars = document.getElementById("chartBars");
    chartBars.innerHTML = "";

    var barW = 52;
    var gap = 22;
    var startX = 8;
    var baseY = 175;
    var maxH = 120;
    var labelY = 148;

    for (var i = 0; i < sizes.length; i++) {
      var size = sizes[i];
      var count = volumes[size.v];
      var h = count > 0 ? Math.max(6, (count / maxBars) * maxH) : 6;

      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("transform", "translate(" + (startX + i * (barW + gap)) + ",0)");

      var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("x", 0);
      rect.setAttribute("y", baseY - h);
      rect.setAttribute("width", barW);
      rect.setAttribute("height", h);
      rect.setAttribute("rx", 5);
      rect.setAttribute("fill", i === 2 ? "#60089c" : "#9a4fd0");
      rect.setAttribute("role", "img");

      var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("x", barW / 2);
      text.setAttribute("y", baseY - h - 6);
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("class", "chart-bar-value");
      text.textContent = count > 0 ? Math.ceil(count) : "—";

      var label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", barW / 2);
      label.setAttribute("y", labelY);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("class", "chart-bar-label");
      label.textContent = size.label;

      var axis = document.createElementNS("http://www.w3.org/2000/svg", "line");
      axis.setAttribute("x1", 0);
      axis.setAttribute("x2", barW);
      axis.setAttribute("y1", baseY);
      axis.setAttribute("y2", baseY);
      axis.setAttribute("stroke", "#ddd");

      g.appendChild(axis);
      g.appendChild(rect);
      g.appendChild(text);
      g.appendChild(label);
      chartBars.appendChild(g);
    }
  }

  function calculate() {
    clearError();
    var shape = currentShape();

    var dims = [];
    if (shape === "rectangle") dims = [lengthFt, widthFt];
    else if (shape === "circle") dims = [diameterFt];
    else dims = [baseFt, triHeightFt];

    var ok = true;
    for (var i = 0; i < dims.length; i++) {
      var v = numVal(dims[i]);
      if (isNaN(v) || v <= 0) { ok = false; break; }
    }

    if (!ok) {
      showError("Please enter a positive number for every dimension of the bed. Dimensions are measured in feet.");
      volCuYd.textContent = "—";
      volCuFt.textContent = "—";
      bagCount.textContent = "—";
      totalCost.textContent = "—";
      drawChart(null, {});
      return;
    }

    var area = areaSqFt(shape);
    var depth = numVal(depthIn) || 3;
    var depthFt = depth / 12;
    var volumeCuFt = area * depthFt;
    var volumeCuYd = volumeCuFt / CU_FT_PER_CU_YD;

    var bagVol = numVal(bagSize) || 2;
    var bagCountVal = Math.ceil(volumeCuFt / bagVol);

    var price = numVal(pricePer);
    var cost = (isNaN(price) || price < 0) ? NaN : price * bagCountVal;

    // Reference volumes for the chart (bags of each common size)
    var volumes = {};
    [0.75, 1.0, 1.5, 2.0, 3.0].forEach(function (v) {
      volumes[v] = volumeCuFt / v;
    });

    volCuYd.textContent = formatNumber(volumeCuYd);
    volCuFt.textContent = formatNumber(volumeCuFt);
    bagCount.textContent = formatNumber(bagCountVal);
    totalCost.textContent = formatMoney(cost);
    bagCount.textContent = Math.ceil(bagCountVal).toLocaleString("en-US");

    // Update the bag-size label next to the price input
    priceUnitLabel.textContent = bagVol + " cu ft bag";

    drawChart(null, volumes);
  }

  shapeInputs.forEach(function (el) {
    el.addEventListener("change", function () {
      updateShape();
      calculate();
    });
  });

  [lengthFt, widthFt, diameterFt, baseFt, triHeightFt, depthIn, bagSize, pricePer].forEach(function (el) {
    el.addEventListener("input", calculate);
    el.addEventListener("change", calculate);
  });

  updateShape();
  calculate();
})();