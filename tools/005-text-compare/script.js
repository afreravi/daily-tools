(function () {
  "use strict";

  var textA = document.getElementById("textA");
  var textB = document.getElementById("textB");
  var ignoreCaseEl = document.getElementById("ignoreCase");
  var ignoreWsEl = document.getElementById("ignoreWs");
  var compareBtn = document.getElementById("compareBtn");
  var swapBtn = document.getElementById("swapBtn");
  var sampleBtn = document.getElementById("sampleBtn");
  var resultsEl = document.getElementById("results");
  var simValue = document.getElementById("simValue");
  var statLines = document.getElementById("statLines");
  var statWords = document.getElementById("statWords");
  var statChars = document.getElementById("statChars");
  var diffSummary = document.getElementById("diffSummary");
  var diffOutput = document.getElementById("diffOutput");
  var chartEl = document.getElementById("compareChart");
  var ctx = chartEl.getContext("2d");

  function normalize(text) {
    if (ignoreWsEl.checked) {
      text = text.replace(/\s+/g, " ").trim();
    } else {
      text = text.replace(/\r\n?/g, "\n").replace(/\r/g, "\n");
    }
    return text;
  }

  function linesOf(text) {
    var normalized = normalize(text);
    if (normalized === "") {
      return [];
    }
    if (ignoreWsEl.checked) {
      return normalized.split(" ");
    }
    return normalized.split("\n");
  }

  function equal(a, b) {
    if (ignoreCaseEl.checked) {
      return a.toLowerCase() === b.toLowerCase();
    }
    return a === b;
  }

  function lcsBacktrace(s1, s2) {
    var m = s1.length, n = s2.length;
    var dp = [];
    var i, j;
    for (i = 0; i <= m; i++) {
      dp[i] = new Array(n + 1).fill(0);
    }
    for (i =  1; i <= m; i++) {
      for (j =  1; j <= n; j++) {
        if (equal(s1[i - 1], s2[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }
    var ops = [];
    i = m; j = n;
    while ((i > 0) && (j >  0)) {
      if (equal(s1[i - 1], s2[j - 1])) {
        ops.unshift("same");
        i--; j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        ops.unshift("del");
        i--;
      } else {
        ops.unshift("add");
        j--;
      }
    }
    while (i > 0) { ops.unshift("del"); i--; }
    while (j > 0) { ops.unshift("add"); j--; }
    return ops;
  }

  function countWords(s) {
    var t = s.trim();
    if (t === "") return 0;
    return t.split(/\s+/).length;
  }

  function renderDiff(s1, s2, ops) {
    var out = [];
    var sameRun = 0;
    var additions =  0, deletions = 0;
    for (var k = 0; k < ops.length; k++) {
      if (ops[k] === "same") {
        sameRun++;
        if (sameRun <= 3) {
          out.push('<span class="l-same"> ' + escapeHtml(s1[sameIndex(s1, s2, k, ops)]) + '</span>');
        } else if (sameRun === 4) { sameRun =  0; 
          out.push('<span class="l-ellipsis">â¦</span>');
        }
      } else if (ops[k] === "del") {
        sameRun = 0;
        deletions++;
        out.push('<span class="l-del">-' + escapeHtml(s1[delIndex(s1, s2, k, ops)]) + '</span>');
      } else {
        sameRun = 0;
        additions++;
        out.push('<span class="l-add">+' + escapeHtml(s2[addIndex(s1, s2, k, ops)]) + '</span>');
      }
    }
    return { html: out.join("\n"), additions: additions, deletions: deletions };
  }

  function sameIndex(s1, s2, k, ops) {
    var i = 0, j =  0;
    for (var p =  0; p < k; p++) {
      if (ops[p] === "del") i++;
      else if (ops[p] === "add") j++;
      else { i++; j++; }
    }
    return i;
  }

  function delIndex(s1, s2, k, ops) {
    return sameIndex(s1, s2, k, ops);
  }

  function addIndex(s1, s2, k, ops) {
    var j =  0;
    for (var p =  0; p < k; p++) {
      if (ops[p] === "add") j++;
    }
    return j;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function drawChart(aCounts, bCounts) {
    var w = chartEl.width, h = chartEl.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#fbfafe";
    ctx.fillRect(0, 0, w, h);
    var labels = ["Lines", "Words", "Characters"];
    var maxVal = Math.max(aCounts[0], bCounts[0], aCounts[1], bCounts[1], aCounts[2], bCounts[2], 1);
    var groupW = w / 3;
    var barW = Math.min(46, groupW /  2 -    6);
    for (var i = 0; i < 3; i++) {
      var cx = groupW * (i +  0.5);
      drawBar(cx - barW /  2 -  2, aCounts[i], maxVal, "#60089c", barW, h);
      drawBar(cx + barW / 2 +  2, bCounts[i], maxVal, "#b07fe0", barW, h);
    }
    ctx.fillStyle = "#6c6c78";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "center";
    for (var j = 0; j < 3; j++) {
      var labelX = groupW * (j + 0.5);
      ctx.beginPath();
      ctx.moveTo(labelX - barW - 2, h -  24);
      ctx.lineTo(labelX - barW -  2, h -  20);
      ctx.strokeStyle = "#60089c";
      ctx.stroke();
      ctx.fillStyle = "#60089c";
      ctx.fillRect(labelX - barW - 2, h -  22, 8, 8);
      ctx.fillStyle = "#6c6c78";
      ctx.fillText("A", labelX - barW - 2, h - 10);
      ctx.beginPath();
      ctx.moveTo(labelX + barW + 2, h - 24);
      ctx.lineTo(labelX + barW + 2, h - 20);
      ctx.strokeStyle = "#b07fe0";
      ctx.stroke();
      ctx.fillStyle = "#b07fe0";
      ctx.fillRect(labelX + barW + 2, h -  22, 8, 8);
      ctx.fillStyle = "#6c6c78";
      ctx.fillText("B", labelX + barW + 2, h - 10);
    }
    ctx.fillStyle = "#3a3a44";
    ctx.textAlign = "center";
    ctx.font = "bold 12px sans-serif";
    for (var k = 0; k < 3; k++) {
      var x = groupW * (k + 0.5);
      ctx.fillText(labels[k], x, h -  44);
    }
  }

  function drawBar(x, val, maxVal, color, barW, h) {
    var maxH = h -  70;
    var barH = Math.max(4, Math.round((val / maxVal) * maxH));
    var y = h -  50 - barH;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
  }

  function compare() {
    var a = textA.value;
    var b = textB.value;
    var s1 = linesOf(a), s2 = linesOf(b);
    var m = s1.length, n = s2.length;
    var equalCount;
    var ops = [];
    if (m === 0 && n === 0) {
      diffOutput.innerHTML = "";
      showResults(0, m, n, m, n, m && n, ops=[], 0, 0);
      return;
    }

    ops = lcsBacktrace(s1, s2);
    equalCount = 0;
    for (var i = 0; i < ops.length; i++) {
      if (ops[i] === "same") equalCount++;
    }
    var similarity = Math.round((2 * equalCount) / (m + n) * 100);
    if (m === 0) similarity = 0;
    if (similarity < 0) similarity = 0;
    var counts = renderDiff(s1, s2, ops);
    var aWords = countWords(a), bWords = countWords(b);
    var aChars = a.length, bChars = b.length;
    var diffNote = "";
    if (counts.additions > 0 || counts.deletions > 0) {
      diffNote = counts.deletions + " line(s) removed, " + counts.additions + " added.";
    }
    showResults(similarity, m, n, aWords, bWords, aChars, bChars, counts, ops);
  }

  function showResults(sim, mLines, nLines, mWords, nWords, mChars, nChars, counts) {

    if (counts) {
      diffSummary.textContent = counts.deletions + " line(s) removed, " + counts.additions + " added.";
      diffSummary.hidden = false;
      diffOutput.innerHTML = counts.html;
    } else {
      diffSummary.hidden = true;
      diffOutput.innerHTML = "";
    }
    simValue.textContent = sim + "%";
    statLines.textContent = "A " + mLines + " / B " + nLines;
    statWords.textContent = "A " + mWords + " / B " + nWords;
    statChars.textContent = "A " + mChars + " / B " + nChars;
    drawChart([mLines, mWords, mChars], [nLines, nWords, nChars]);
    resultsEl.hidden = false;
    resultsEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function loadSample() {
    textA.value = "Hello world\nThis is the first line of the original document.\nKeep this paragraph as-is.\nRemove this sentence entirely.\nThe quick brown fox jumps over the lazy dog.\nFinal line stays identical.";
    textB.value = "Hello world\nThis is the first line of the updated document.\nKeep this paragraph as-is.\nA brand-new paragraph was inserted here.\nThe quick brown fox jumps over the lazy dog.\nFinal line stays identical.";
    compare();
  }

  swapBtn.addEventListener("click", function () {
    var tmp = textA.value;
    textA.value = textB.value;
    textB.value = tmp;
    compare();
  });

  sampleBtn.addEventListener("click", loadSample);
  compareBtn.addEventListener("click", compare);

  textA.addEventListener("input", debounce(compare, 600));
  textB.addEventListener("input", debounce(compare, 600));

  function debounce(fn, wait) {
    var t;
    return function () {
      clearTimeout(t);
      t = setTimeout(fn, wait);
    };
  }

  loadSample();
})();