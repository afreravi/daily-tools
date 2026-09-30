(function () {
  "use strict";

  var POOLS = {
    smileys: ["\uD83D\uDE00", "\uD83D\uDE04", "\uD83D\uDE01", "\uD83D\uDE06", "\uD83D\uDE05", "\uD83D\uDE02", "\uD83E\uDD23", "\uD83D\uDE0A", "\uD83D\uDE07", "\uD83D\uDE0E", "\uD83E\uDD13", "\uD83E\uDD17", "\uD83D\uDE18", "\uD83D\uDE0D", "\uD83D\uDE1C", "\uD83E\uDD2A", "\uD83D\uDE10", "\uD83D\uDE11", "\uD83D\uDE0F", "\uD83D\uDE12", "\uD83D\uDE2C", "\uD83D\uDE44", "\uD83D\uDE2D", "\uD83D\uDE34", "\uD83D\uDE31", "\uD83E\uDD14", "\uD83D\uDE16", "\uD83D\uDE2E"],
    love: ["\u2764\uFE0F", "\uD83E\uDDE1", "\uD83D\uDC9B", "\uD83D\uDC9A", "\uD83D\uDC99", "\uD83D\uDC9C", "\uD83D\uDDA4", "\uD83E\uDD0D", "\uD83E\uDD0E", "\uD83D\uDC95", "\uD83D\uDC9E", "\uD83D\uDC93", "\uD83D\uDC97", "\uD83D\uDC98", "\uD83D\uDC96", "\uD83D\uDC9D", "\uD83D\uDC9F", "\uD83D\uDC8C", "\uD83D\uDC8B", "\uD83E\uDD70", "\uD83D\uDC8F", "\uD83D\uDC91", "\uD83D\uDC90"],
    animals: ["\uD83D\uDC36", "\uD83D\uDC31", "\uD83D\uDC2D", "\uD83D\uDC39", "\uD83D\uDC30", "\uD83E\uDD8A", "\uD83D\uDC3B", "\uD83D\uDC3C", "\uD83D\uDC28", "\uD83D\uDC2F", "\uD83E\uDD81", "\uD83D\uDC2E", "\uD83D\uDC37", "\uD83D\uDC38", "\uD83D\uDC35", "\uD83D\uDE48", "\uD83D\uDC14", "\uD83D\uDC27", "\uD83D\uDC26", "\uD83E\uDD86", "\uD83E\uDD85", "\uD83E\uDD89", "\uD83D\uDC22", "\uD83D\uDC1D", "\uD83D\uDC1F", "\uD83D\uDC33", "\uD83D\uDC2C", "\uD83E\uDD8B", "\uD83C\uDF3B", "\uD83C\uDF3C", "\uD83C\uDF37", "\uD83C\uDF40", "\uD83C\uDF3F", "\uD83C\uDF43", "\uD83C\uDF34", "\uD83C\uDF35", "\u2600\uFE0F", "\uD83C\uDF19", "\u2B50", "\uD83C\uDF08"],
    food: ["\uD83C\uDF55", "\uD83C\uDF54", "\uD83C\uDF5F", "\uD83C\uDF2E", "\uD83C\uDF2D", "\uD83C\uDF69", "\uD83C\uDF6A", "\uD83C\uDF70", "\uD83C\uDF82", "\uD83C\uDF66", "\uD83C\uDF6D", "\uD83C\uDF6B", "\uD83C\uDF6C", "\uD83C\uDF7F", "\uD83C\uDF6E", "\uD83C\uDF73", "\uD83C\uDF5C", "\uD83C\uDF72", "\uD83C\uDF67", "\uD83C\uDF63", "\uD83C\uDF71", "\uD83E\uDD57", "\uD83E\uDD65", "\uD83C\uDF49", "\uD83C\uDF47", "\uD83C\uDF53", "\uD83C\uDF4E", "\uD83C\uDF4A", "\uD83C\uDF4B", "\uD83C\uDF4C", "\uD83C\uDF50", "\uD83C\uDF52", "\uD83E\uDD51", "\uD83E\uDD66", "\uD83E\uDD55", "\u2615", "\uD83C\uDF75", "\uD83E\uDD64"],
    travel: ["\u2708\uFE0F", "\uD83D\uDE80", "\uD83D\uDE82", "\uD83D\uDE84", "\uD83D\uDE85", "\uD83D\uDE87", "\uD83D\uDE8B", "\uD83D\uDE8C", "\uD83D\uDE90", "\uD83D\uDE97", "\uD83D\uDE95", "\uD83D\uDE99", "\uD83D\uDE9A", "\uD83D\uDE9B", "\uD83D\uDEA2", "\u26F5", "\uD83D\uDEF3", "\uD83C\uDFD6\uFE0F", "\uD83C\uDFDD\uFE0F", "\uD83C\uDFD5\uFE0F", "\u26F0\uFE0F", "\uD83C\uDF0B", "\uD83C\uDF0C", "\uD83C\uDF0D", "\uD83C\uDF0E", "\uD83C\uDF0F", "\uD83C\uDFD9\uFE0F", "\uD83C\uDF07", "\uD83C\uDF05", "\uD83C\uDF04", "\uD83C\uDFD4\uFE0F", "\u26FA", "\uD83C\uDFA1", "\uD83C\uDFA2"],
    activities: ["\u26BD", "\uD83C\uDFC0", "\uD83C\uDFC8", "\uD83C\uDFC9", "\uD83C\uDFBE", "\uD83C\uDFD0", "\uD83C\uDFD3", "\uD83C\uDFF8", "\uD83C\uDFAF", "\uD83C\uDFB1", "\uD83C\uDFB3", "\uD83C\uDFAE", "\uD83C\uDFB2", "\uD83E\uDDE9", "\uD83C\uDFA8", "\uD83C\uDFAD", "\uD83C\uDFAC", "\uD83C\uDFA4", "\uD83C\uDFA7", "\uD83C\uDFB5", "\uD83C\uDFB6", "\uD83C\uDFB8", "\uD83C\uDFB9", "\uD83C\uDFBA", "\uD83C\uDFBB", "\uD83E\uDD41", "\u265F\uFE0F", "\uD83C\uDFC6", "\uD83E\uDD47", "\uD83E\uDD48", "\uD83E\uDD49"],
    objects: ["\uD83D\uDCA1", "\uD83D\uDD26", "\uD83D\uDCF1", "\uD83D\uDCBB", "\u2328\uFE0F", "\uD83D\uDDA5\uFE0F", "\uD83D\uDDA8\uFE0F", "\uD83D\uDCF7", "\uD83C\uDFA5", "\uD83D\uDCFA", "\uD83D\uDCFB", "\u23F0", "\u231A", "\uD83D\uDD0B", "\uD83D\uDD0C", "\uD83D\uDCB0", "\uD83D\uDCB3", "\uD83D\uDC8E", "\uD83D\uDD11", "\uD83D\uDD12", "\uD83D\uDCE6", "\uD83D\uDCE7", "\u270F\uFE0F", "\uD83D\uDCDA", "\uD83D\uDCDD", "\uD83D\uDCCC", "\u2702\uFE0F", "\uD83D\uDD8C\uFE0F", "\uD83C\uDF81", "\uD83C\uDF88", "\uD83C\uDF89", "\uD83C\uDF8A", "\uD83E\uDE84"],
    symbols: ["\u2728", "\uD83D\uDD25", "\uD83D\uDCA5", "\uD83D\uDCA2", "\uD83D\uDCAF", "\uD83C\uDF89", "\u2705", "\u274C", "\u2757", "\u2753", "\u2B50", "\uD83D\uDD31", "\uD83D\uDD34", "\uD83D\uDD35", "\uD83D\uDFE2", "\uD83D\uDFE1", "\uD83D\uDFE3", "\u26AA", "\u26AB", "\uD83D\uDFE0", "\uD83D\uDFE4", "\uD83D\uDFE5", "\uD83D\uDFE7", "\uD83D\uDFE9", "\uD83D\uDFEA", "\uD83D\uDD3A", "\uD83D\uDD3B", "\u267B\uFE0F", "\u2699\uFE0F", "\uD83D\uDEE1\uFE0F"]
  };

  var LABELS = {
    all: "All",
    smileys: "Smileys",
    love: "Love",
    animals: "Animals",
    food: "Food",
    travel: "Travel",
    activities: "Activities",
    objects: "Objects",
    symbols: "Symbols"
  };

  var CATEGORY_KEYS = Object.keys(LABELS).filter(function (k) { return k !== "all"; });

  var elCategory = document.getElementById("category");
  var elCount = document.getElementById("count");
  var elNoRepeat = document.getElementById("noRepeat");
  var elSpin = document.getElementById("btnSpin");
  var elCopy = document.getElementById("btnCopy");
  var elMinus = document.getElementById("btnMinus");
  var elPlus = document.getElementById("btnPlus");
  var elOutput = document.getElementById("emojiOutput");
  var elCopyMsg = document.getElementById("copyMsg");
  var elWarn = document.getElementById("warnBox");
  var elStatCount = document.getElementById("statCount");
  var elStatCategory = document.getElementById("statCategory");
  var elStatSpins = document.getElementById("statSpins");
  var canvas = document.getElementById("resultChart");

  var currentRow = [];
  var spinCount = 0;
  var copyTimer = null;

  function randomInt(max) {
    if (max <= 0) { return 0; }
    if (window.crypto && window.crypto.getRandomValues) {
      var limit = Math.floor(4294967296 / max) * max;
      var arr = new Uint32Array(1);
      var val;
      do {
        window.crypto.getRandomValues(arr);
        val = arr[0];
      } while (val >= limit);
      return val % max;
    }
    return Math.floor(Math.random() * max);
  }

  function pickPool(key) {
    if (key === "all") {
      var merged = [];
      CATEGORY_KEYS.forEach(function (k) { merged = merged.concat(POOLS[k]); });
      return merged;
    }
    return POOLS[key] || POOLS.smileys;
  }

  function clampCount(raw) {
    var n = parseInt(raw, 10);
    if (isNaN(n)) { return null; }
    if (n < 1) { return 1; }
    if (n > 20) { return 20; }
    return n;
  }

  function showWarn(msg) {
    if (!msg) {
      elWarn.hidden = true;
      elWarn.textContent = "";
      return;
    }
    elWarn.textContent = msg;
    elWarn.hidden = false;
  }

  function flashCopy(msg) {
    elCopyMsg.textContent = msg;
    if (copyTimer) { window.clearTimeout(copyTimer); }
    copyTimer = window.setTimeout(function () { elCopyMsg.textContent = ""; }, 2200);
  }

  function generate() {
    var key = elCategory.value;
    var pool = pickPool(key);
    var count = clampCount(elCount.value);
    if (count === null) {
      showWarn("Enter a whole number of emojis between 1 and 20.");
      elCount.value = currentRow.length || 5;
      return;
    }
    showWarn("");
    if (String(count) !== String(elCount.value).trim()) {
      elCount.value = count;
    }

    var row = [];
    var used = {};
    var guard = 0;

    while (row.length < count && guard < 2000) {
      guard++;
      var candidate = pool[randomInt(pool.length)];
      if (elNoRepeat.checked && used[candidate]) {
        if (pool.length <= count) { row.push(candidate); }
        continue;
      }
      used[candidate] = true;
      row.push(candidate);
    }
    while (row.length < count) { row.push(pool[randomInt(pool.length)]); }

    currentRow = row;
    spinCount++;
    render(key);
  }

  function render(key) {
    elOutput.innerHTML = "";
    elOutput.classList.add("is-active");

    currentRow.forEach(function (emoji, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "emoji-chip is-pop";
      btn.textContent = emoji;
      btn.title = "Click to copy this emoji";
      btn.setAttribute("aria-label", "Emoji " + (i + 1) + ": " + emoji + ". Click to copy.");
      btn.style.animationDelay = (i * 45) + "ms";
      btn.addEventListener("click", function () {
        copyText(emoji, "Copied " + emoji + " to your clipboard.");
      });
      elOutput.appendChild(btn);
    });

    elStatCount.textContent = currentRow.length;
    elStatCategory.textContent = LABELS[key] || "All";
    elStatSpins.textContent = spinCount;

    drawChart(key);
  }

  function tally(key) {
    var counts = {};
    CATEGORY_KEYS.forEach(function (k) { counts[k] = 0; });
    currentRow.forEach(function (emoji) {
      var owner = null;
      CATEGORY_KEYS.forEach(function (k) {
        if (owner === null && POOLS[k].indexOf(emoji) !== -1) { owner = k; }
      });
      if (owner) { counts[owner]++; }
    });
    return counts;
  }

  function drawChart(key) {
    var ctx = canvas.getContext("2d");
    if (!ctx) { return; }

    var counts = tally(key);
    var keys = CATEGORY_KEYS.filter(function (k) { return counts[k] > 0; });
    if (keys.length === 0) { keys = CATEGORY_KEYS.slice(0, 1); }

    var W = canvas.width;
    var H = canvas.height;
    var padLeft = 96;
    var padRight = 24;
    var padTop = 18;
    var padBottom = 30;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    var max = 1;
    keys.forEach(function (k) { if (counts[k] > max) { max = counts[k]; } });

    var plotW = W - padLeft - padRight;
    var rowH = (H - padTop - padBottom) / keys.length;
    var barH = Math.min(rowH * 0.6, 26);

    // gridlines
    ctx.strokeStyle = "#ece0f8";
    ctx.lineWidth = 1;
    for (var g = 0; g <= max; g++) {
      var gx = padLeft + (plotW * (g / max));
      ctx.beginPath();
      ctx.moveTo(gx, padTop);
      ctx.lineTo(gx, H - padBottom);
      ctx.stroke();
    }

    ctx.font = "13px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "middle";

    keys.forEach(function (k, i) {
      var y = padTop + rowH * i + rowH / 2;
      var barW = plotW * (counts[k] / max);

      ctx.fillStyle = "#47036f";
      ctx.textAlign = "right";
      ctx.fillText(LABELS[k], padLeft - 10, y);

      var grad = ctx.createLinearGradient(padLeft, 0, padLeft + Math.max(barW, 2), 0);
      grad.addColorStop(0, "#60089c");
      grad.addColorStop(1, "#a56ad4");
      ctx.fillStyle = grad;
      ctx.fillRect(padLeft, y - barH / 2, Math.max(barW, 2), barH);

      ctx.fillStyle = "#60089c";
      ctx.textAlign = "left";
      ctx.fillText(String(counts[k]), padLeft + Math.max(barW, 2) + 8, y);
    });

    ctx.strokeStyle = "#dcc6ef";
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, H - padBottom);
    ctx.stroke();
  }

  function copyText(text, msg) {
    if (!text) { return; }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        flashCopy(msg);
      }).catch(function () {
        legacyCopy(text, msg);
      });
    } else {
      legacyCopy(text, msg);
    }
  }

  function legacyCopy(text, msg) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      flashCopy(msg);
    } catch (e) {
      flashCopy("Copy failed \u2014 select the emojis and copy manually.");
    }
    document.body.removeChild(ta);
  }

  elSpin.addEventListener("click", generate);

  elCopy.addEventListener("click", function () {
    if (currentRow.length === 0) {
      showWarn("Spin the generator first, then copy the row.");
      return;
    }
    showWarn("");
    copyText(currentRow.join(" "), "Copied " + currentRow.length + " emojis to your clipboard.");
  });

  elMinus.addEventListener("click", function () {
    var n = clampCount(elCount.value);
    elCount.value = Math.max(1, (n === null ? 5 : n) - 1);
    showWarn("");
  });

  elPlus.addEventListener("click", function () {
    var n = clampCount(elCount.value);
    elCount.value = Math.min(20, (n === null ? 5 : n) + 1);
    showWarn("");
  });

  elCount.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      generate();
    }
  });

  elCount.addEventListener("change", function () {
    var n = clampCount(elCount.value);
    if (n === null) {
      showWarn("Enter a whole number of emojis between 1 and 20.");
      return;
    }
    showWarn("");
    elCount.value = n;
  });

  elCategory.addEventListener("change", function () {
    showWarn("");
    if (currentRow.length) { generate(); }
  });

  drawChart("all");
})();
