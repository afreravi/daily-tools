/* Grade Calculator — vanilla JS, no dependencies.
   Weighted average = sum(score x weight) / sum(weight of graded items).
   Final planner   = (target - current x (1 - w)) / w. */
(function () {
  "use strict";

  var DEFAULT_SCALE = [
    { letter: "A+", min: 97 },
    { letter: "A",  min: 93 },
    { letter: "A-", min: 90 },
    { letter: "B+", min: 87 },
    { letter: "B",  min: 83 },
    { letter: "B-", min: 80 },
    { letter: "C+", min: 77 },
    { letter: "C",  min: 73 },
    { letter: "C-", min: 70 },
    { letter: "D+", min: 67 },
    { letter: "D",  min: 63 },
    { letter: "D-", min: 60 },
    { letter: "F",  min: 0 }
  ];

  var DEFAULT_ROWS = [
    { name: "Homework", score: "90", weight: "20" },
    { name: "Quizzes", score: "85", weight: "20" },
    { name: "Midterm", score: "78", weight: "30" },
    { name: "Final Exam", score: "", weight: "30" }
  ];

  var scale = DEFAULT_SCALE.map(function (s) { return { letter: s.letter, min: s.min }; });

  var rowsBody = document.getElementById("gradeRows");
  var weightTotalEl = document.getElementById("weightTotal");
  var errorBox = document.getElementById("errorBox");
  var resultPanel = document.getElementById("resultPanel");
  var breakdownBody = document.getElementById("breakdownBody");
  var scaleInputs = document.getElementById("scaleInputs");
  var chart = document.getElementById("gradeChart");
  var chartCaption = document.getElementById("chartCaption");

  var finalErrorBox = document.getElementById("finalErrorBox");
  var finalPanel = document.getElementById("finalPanel");

  function toNumber(value) {
    if (value === null || value === undefined) return NaN;
    var s = String(value).trim();
    if (s === "") return NaN;
    return Number(s);
  }

  function makeRow(data) {
    var tr = document.createElement("tr");

    var tdName = document.createElement("td");
    var inName = document.createElement("input");
    inName.type = "text";
    inName.className = "form-control";
    inName.value = data && data.name ? data.name : "";
    inName.setAttribute("aria-label", "Assignment name");
    inName.placeholder = "e.g. Midterm";
    tdName.appendChild(inName);

    var tdScore = document.createElement("td");
    var inScore = document.createElement("input");
    inScore.type = "number";
    inScore.className = "form-control row-score";
    inScore.min = "0";
    inScore.max = "150";
    inScore.step = "any";
    inScore.inputMode = "decimal";
    inScore.value = data && data.score !== undefined ? data.score : "";
    inScore.setAttribute("aria-label", "Score as a percentage");
    inScore.placeholder = "%";
    tdScore.appendChild(inScore);

    var tdWeight = document.createElement("td");
    var inWeight = document.createElement("input");
    inWeight.type = "number";
    inWeight.className = "form-control row-weight";
    inWeight.min = "0";
    inWeight.max = "100";
    inWeight.step = "any";
    inWeight.inputMode = "decimal";
    inWeight.value = data && data.weight !== undefined ? data.weight : "";
    inWeight.setAttribute("aria-label", "Weight as a percentage");
    inWeight.placeholder = "%";
    tdWeight.appendChild(inWeight);

    var tdDel = document.createElement("td");
    tdDel.className = "text-center";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "remove-row";
    btn.innerHTML = "&times;";
    btn.setAttribute("aria-label", "Remove this assignment");
    btn.addEventListener("click", function () {
      tr.parentNode.removeChild(tr);
      refreshWeightTotal();
      updateRemoveButtons();
    });
    tdDel.appendChild(btn);

    tr.appendChild(tdName);
    tr.appendChild(tdScore);
    tr.appendChild(tdWeight);
    tr.appendChild(tdDel);
    tr.addEventListener("input", refreshWeightTotal);
    return tr;
  }

  function updateRemoveButtons() {
    var rows = rowsBody.querySelectorAll("tr");
    var disable = rows.length <= 1;
    rows.forEach(function (tr) {
      tr.querySelector(".remove-row").disabled = disable;
    });
  }

  function refreshWeightTotal() {
    var total = 0;
    rowsBody.querySelectorAll(".row-weight").forEach(function (input) {
      var v = toNumber(input.value);
      if (!isNaN(v) && v > 0) total += v;
    });
    var shown = Math.round(total * 100) / 100;
    weightTotalEl.textContent = "Total weight: " + shown + "%";
    weightTotalEl.classList.toggle("is-off", Math.abs(total - 100) > 0.01);
  }

  function readRows() {
    var list = [];
    rowsBody.querySelectorAll("tr").forEach(function (tr, index) {
      var name = tr.querySelector("input[type=text]").value.trim();
      var scoreRaw = tr.querySelector(".row-score").value;
      var weightRaw = tr.querySelector(".row-weight").value;
      list.push({
        name: name || "Item " + (index + 1),
        scoreRaw: scoreRaw,
        weightRaw: weightRaw
      });
    });
    return list;
  }

  function showError(box, msg) {
    box.textContent = msg;
    box.classList.remove("d-none");
  }
  function clearError(box) {
    box.textContent = "";
    box.classList.add("d-none");
  }

  function letterFor(avg) {
    for (var i = 0; i < scale.length; i++) {
      if (avg >= scale[i].min) return scale[i].letter;
    }
    return "F";
  }

  function calculate() {
    clearError(errorBox);
    var raw = readRows();
    var items = [];
    var gradedWeight = 0;
    var weightedPoints = 0;
    var ungradedCount = 0;

    for (var i = 0; i < raw.length; i++) {
      var r = raw[i];
      var w = toNumber(r.weightRaw);
      var s = toNumber(r.scoreRaw);

      if (r.weightRaw.trim() !== "" && (isNaN(w) || w < 0 || w > 100)) {
        showError(errorBox, "Weight for \u201c" + r.name + "\u201d must be a number between 0 and 100.");
        return;
      }
      if (r.weightRaw.trim() === "") {
        if (r.scoreRaw.trim() !== "") {
          showError(errorBox, "Add a weight for \u201c" + r.name + "\u201d, or clear its score.");
          return;
        }
        continue; // fully blank row
      }
      if (r.scoreRaw.trim() === "") {
        ungradedCount++;
        continue; // not graded yet — excluded from the running average
      }
      if (isNaN(s) || s < 0 || s > 150) {
        showError(errorBox, "Score for \u201c" + r.name + "\u201d must be a number between 0 and 150.");
        return;
      }
      var points = s * w / 100;
      weightedPoints += points;
      gradedWeight += w;
      items.push({ name: r.name, score: s, weight: w, points: points });
    }

    if (gradedWeight === 0) {
      showError(errorBox, "Enter at least one score with a weight greater than zero.");
      return;
    }

    var average = weightedPoints / gradedWeight * 100;
    var letter = letterFor(average);

    // Hero figures
    document.getElementById("statAverage").textContent = average.toFixed(2) + "%";
    document.getElementById("statAverageNote").textContent =
      "across " + items.length + " graded item" + (items.length === 1 ? "" : "s") +
      (ungradedCount > 0 ? ", " + ungradedCount + " still to be graded" : "");
    document.getElementById("statLetter").textContent = letter;

    var nextBand = null;
    for (var b = scale.length - 1; b >= 0; b--) {
      if (scale[b].min > average) { nextBand = scale[b]; }
    }
    var letterNote = document.getElementById("statLetterNote");
    if (nextBand) {
      var gap = nextBand.min - average;
      letterNote.textContent = gap.toFixed(2) + " points to the next band (" + nextBand.letter + " at " + nextBand.min + "%)";
      letterNote.className = "stat-note";
    } else {
      letterNote.textContent = "top of the scale — well done";
      letterNote.className = "stat-note is-good";
    }

    // Progress bar
    var bar = document.getElementById("gradeBar");
    var clamped = Math.max(0, Math.min(100, average));
    bar.style.width = clamped + "%";
    bar.setAttribute("aria-valuenow", average.toFixed(2));
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    document.getElementById("barNote").textContent =
      "Weighted average " + average.toFixed(2) + "% out of 100 — the bar fills to your current standing.";

    // Breakdown table
    breakdownBody.innerHTML = "";
    items.forEach(function (it) {
      var tr = document.createElement("tr");
      var share = it.points / weightedPoints * 100;
      tr.innerHTML =
        "<td>" + escapeHtml(it.name) + "</td>" +
        "<td>" + it.score.toFixed(1) + "%</td>" +
        "<td>" + it.weight + "%</td>" +
        "<td>" + it.points.toFixed(2) + "</td>" +
        "<td>" + share.toFixed(1) + "%</td>";
      breakdownBody.appendChild(tr);
    });

    drawChart(items, gradedWeight);
    resultPanel.classList.remove("d-none");
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function drawChart(items, gradedWeight) {
    var ctx = chart.getContext("2d");
    var W = chart.width, H = chart.height;
    ctx.clearRect(0, 0, W, H);

    var padL = 46, padR = 16, padT = 18, padB = 54;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;

    var maxPoints = 100;
    items.forEach(function (it) { if (it.points > maxPoints) maxPoints = it.points; });
    maxPoints = Math.ceil(maxPoints / 10) * 10;

    // Axes
    ctx.strokeStyle = "#e8e2f0";
    ctx.fillStyle = "#6a6673";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    var ticks = 5;
    for (var t = 0; t <= ticks; t++) {
      var val = maxPoints * t / ticks;
      var y = padT + plotH - (plotH * t / ticks);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(val.toFixed(0), padL - 8, y);
    }

    // Bars
    var n = items.length || 1;
    var slot = plotW / n;
    var barW = Math.min(64, slot * 0.6);
    items.forEach(function (it, i) {
      var x = padL + slot * i + (slot - barW) / 2;
      var h = it.points / maxPoints * plotH;
      var y = padT + plotH - h;
      var grad = ctx.createLinearGradient(0, y, 0, padT + plotH);
      grad.addColorStop(0, "#8b2fd0");
      grad.addColorStop(1, "#60089c");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, h);

      ctx.fillStyle = "#3f0568";
      ctx.font = "bold 11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(it.points.toFixed(1), x + barW / 2, y - 3);

      ctx.fillStyle = "#221f28";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.textBaseline = "top";
      var label = it.name.length > 12 ? it.name.slice(0, 11) + "\u2026" : it.name;
      ctx.fillText(label, x + barW / 2, padT + plotH + 8);
      ctx.fillStyle = "#6a6673";
      ctx.fillText(it.weight + "% wt", x + barW / 2, padT + plotH + 24);
    });

    ctx.strokeStyle = "#60089c";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();
    ctx.lineWidth = 1;

    chartCaption.textContent =
      "Weighted points contributed by each graded item (total " +
      items.reduce(function (a, b) { return a + b.points; }, 0).toFixed(2) +
      " out of " + gradedWeight + " weight).";
  }

  function buildScaleInputs() {
    scaleInputs.innerHTML = "";
    scale.forEach(function (band, i) {
      var col = document.createElement("div");
      col.className = "col-6 col-sm-4 col-md-2 mb-2";
      var label = document.createElement("label");
      label.className = "small mb-0";
      label.textContent = band.letter + " at or above";
      var input = document.createElement("input");
      input.type = "number";
      input.className = "form-control form-control-sm scale-input";
      input.min = "0";
      input.max = "150";
      input.step = "any";
      input.value = band.min;
      input.setAttribute("aria-label", band.letter + " minimum percentage");
      input.addEventListener("input", function () {
        var v = toNumber(input.value);
        if (!isNaN(v)) scale[i].min = v;
        if (!resultPanel.classList.contains("d-none")) calculate();
      });
      col.appendChild(label);
      col.appendChild(input);
      scaleInputs.appendChild(col);
    });
  }

  function planFinal() {
    clearError(finalErrorBox);
    var current = toNumber(document.getElementById("currentGrade").value);
    var weight = toNumber(document.getElementById("finalWeight").value);
    var target = toNumber(document.getElementById("targetGrade").value);

    if (isNaN(current) || current < 0 || current > 150) {
      showError(finalErrorBox, "Enter a current grade between 0 and 150.");
      return;
    }
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      showError(finalErrorBox, "Enter a final exam weight between 1 and 100.");
      return;
    }
    if (isNaN(target) || target < 0 || target > 150) {
      showError(finalErrorBox, "Enter a target grade between 0 and 150.");
      return;
    }

    var w = weight / 100;
    var needed = (target - current * (1 - w)) / w;
    var best = current * (1 - w) + 100 * w;
    var worst = current * (1 - w);

    var neededEl = document.getElementById("statNeeded");
    var neededNote = document.getElementById("statNeededNote");
    neededEl.textContent = needed.toFixed(1) + "%";
    if (needed > 100) {
      neededNote.textContent = "Above 100% — this target cannot be reached by the final alone.";
      neededNote.className = "stat-note is-bad";
    } else if (needed <= 0) {
      neededNote.textContent = "Zero or below — this target is already locked in.";
      neededNote.className = "stat-note is-good";
    } else {
      neededNote.textContent = "Score this on the final to finish at " + target + "%.";
      neededNote.className = "stat-note";
    }

    document.getElementById("statRange").textContent =
      worst.toFixed(1) + "% \u2013 " + best.toFixed(1) + "%";
    document.getElementById("statRangeNote").textContent =
      "Even a zero on the final leaves " + worst.toFixed(1) + "%; a perfect score gives " + best.toFixed(1) + "%.";
    finalPanel.classList.remove("d-none");
  }

  // ---- wiring ----
  document.getElementById("addRowBtn").addEventListener("click", function () {
    rowsBody.appendChild(makeRow({ name: "", score: "", weight: "" }));
    updateRemoveButtons();
    refreshWeightTotal();
  });

  document.getElementById("calcBtn").addEventListener("click", calculate);

  document.getElementById("resetBtn").addEventListener("click", function () {
    rowsBody.innerHTML = "";
    DEFAULT_ROWS.forEach(function (r) { rowsBody.appendChild(makeRow(r)); });
    scale = DEFAULT_SCALE.map(function (s) { return { letter: s.letter, min: s.min }; });
    buildScaleInputs();
    updateRemoveButtons();
    refreshWeightTotal();
    clearError(errorBox);
    resultPanel.classList.add("d-none");
    finalPanel.classList.add("d-none");
    clearError(finalErrorBox);
    document.getElementById("currentGrade").value = "82";
    document.getElementById("finalWeight").value = "20";
    document.getElementById("targetGrade").value = "90";
  });

  document.getElementById("finalBtn").addEventListener("click", planFinal);

  document.getElementById("gradeChart").addEventListener("click", function () {
    if (!resultPanel.classList.contains("d-none")) calculate();
  });

  // init
  DEFAULT_ROWS.forEach(function (r) { rowsBody.appendChild(makeRow(r)); });
  buildScaleInputs();
  updateRemoveButtons();
  refreshWeightTotal();
})();
