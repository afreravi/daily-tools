(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var divisionEl = $("division");
  var countEl = $("count");
  var repeatEl = $("optRepeat");
  var soundEl = $("optSound");
  var drawBtn = $("drawBtn");
  var resetBtn = $("resetBtn");
  var errorBox = $("errorBox");
  var resultsEl = $("results");
  var copyBtn = $("copyBtn");
  var clearBtn = $("clearBtn");
  var historyNote = $("historyNote");
  var statCount = $("statCount");
  var statPool = $("statPool");
  var statSplit = $("statSplit");
  var statTitle = $("statTitle");
  var canvas = $("titleChart");
  var ctx = canvas.getContext("2d");

  /* ---- franchise data: city, name, conference, division, arena, titles ---- */
  var TEAMS = [
    { city: "Boston", name: "Celtics", conf: "East", div: "Atlantic", arena: "TD Garden", titles: 18 },
    { city: "Brooklyn", name: "Nets", conf: "East", div: "Atlantic", arena: "Barclays Center", titles: 0 },
    { city: "New York", name: "Knicks", conf: "East", div: "Atlantic", arena: "Madison Square Garden", titles: 2 },
    { city: "Philadelphia", name: "76ers", conf: "East", div: "Atlantic", arena: "Wells Fargo Center", titles: 3 },
    { city: "Toronto", name: "Raptors", conf: "East", div: "Atlantic", arena: "Scotiabank Arena", titles: 1 },

    { city: "Chicago", name: "Bulls", conf: "East", div: "Central", arena: "United Center", titles: 6 },
    { city: "Cleveland", name: "Cavaliers", conf: "East", div: "Central", arena: "Rocket Arena", titles: 1 },
    { city: "Detroit", name: "Pistons", conf: "East", div: "Central", arena: "Little Caesars Arena", titles: 3 },
    { city: "Indiana", name: "Pacers", conf: "East", div: "Central", arena: "Gainbridge Fieldhouse", titles: 0 },
    { city: "Milwaukee", name: "Bucks", conf: "East", div: "Central", arena: "Fiserv Forum", titles: 2 },

    { city: "Atlanta", name: "Hawks", conf: "East", div: "Southeast", arena: "State Farm Arena", titles: 1 },
    { city: "Charlotte", name: "Hornets", conf: "East", div: "Southeast", arena: "Spectrum Center", titles: 0 },
    { city: "Miami", name: "Heat", conf: "East", div: "Southeast", arena: "Kaseya Center", titles: 3 },
    { city: "Orlando", name: "Magic", conf: "East", div: "Southeast", arena: "Kia Center", titles: 0 },
    { city: "Washington", name: "Wizards", conf: "East", div: "Southeast", arena: "Capital One Arena", titles: 1 },

    { city: "Denver", name: "Nuggets", conf: "West", div: "Northwest", arena: "Ball Arena", titles: 1 },
    { city: "Minnesota", name: "Timberwolves", conf: "West", div: "Northwest", arena: "Target Center", titles: 0 },
    { city: "Oklahoma City", name: "Thunder", conf: "West", div: "Northwest", arena: "Paycom Center", titles: 1 },
    { city: "Portland", name: "Trail Blazers", conf: "West", div: "Northwest", arena: "Moda Center", titles: 1 },
    { city: "Utah", name: "Jazz", conf: "West", div: "Northwest", arena: "Delta Center", titles: 0 },

    { city: "Golden State", name: "Warriors", conf: "West", div: "Pacific", arena: "Chase Center", titles: 7 },
    { city: "LA", name: "Clippers", conf: "West", div: "Pacific", arena: "Intuit Dome", titles: 0 },
    { city: "Los Angeles", name: "Lakers", conf: "West", div: "Pacific", arena: "Crypto.com Arena", titles: 17 },
    { city: "Phoenix", name: "Suns", conf: "West", div: "Pacific", arena: "Footprint Center", titles: 0 },
    { city: "Sacramento", name: "Kings", conf: "West", div: "Pacific", arena: "Golden 1 Center", titles: 1 },

    { city: "Dallas", name: "Mavericks", conf: "West", div: "Southwest", arena: "American Airlines Center", titles: 1 },
    { city: "Houston", name: "Rockets", conf: "West", div: "Southwest", arena: "Toyota Center", titles: 2 },
    { city: "Memphis", name: "Grizzlies", conf: "West", div: "Southwest", arena: "FedExForum", titles: 0 },
    { city: "New Orleans", name: "Pelicans", conf: "West", div: "Southwest", arena: "Smoothie King Center", titles: 0 },
    { city: "San Antonio", name: "Spurs", conf: "West", div: "Southwest", arena: "Frost Bank Center", titles: 5 }
  ];

  var drawHistory = [];
  var currentDraw = [];

  function fullName(t) { return t.city + " " + t.name; }

  function selectedPool() {
    var div = divisionEl.value;
    if (div !== "all") {
      return TEAMS.filter(function (t) { return t.div === div; });
    }
    var confInput = document.querySelector('input[name="pool"]:checked');
    var conf = confInput ? confInput.value : "all";
    if (conf === "all") return TEAMS.slice();
    return TEAMS.filter(function (t) { return t.conf === conf; });
  }

  function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("d-none");
  }

  function clearError() {
    errorBox.textContent = "";
    errorBox.classList.add("d-none");
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function sample(arr, n, noRepeat) {
    var pool = arr.slice();
    var out = [];
    n = Math.min(n, pool.length);
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * pool.length);
      out.push(pool[idx]);
      if (noRepeat) pool.splice(idx, 1);
    }
    return out;
  }

  function pillClass(conf) {
    return conf === "East" ? "pill pill-conf-east" : "pill pill-conf-west";
  }

  function render(teams) {
    resultsEl.innerHTML = teams.map(function (t) {
      var ringLine = t.titles > 0
        ? '<p class="ring-note">' + t.titles + (t.titles === 1 ? " championship" : " championships") + "</p>"
        : '<p class="ring-note text-muted font-weight-normal">Still chasing a first title</p>';
      return '<div class="team-card">' +
        '<div class="team-top">' +
          '<div>' +
            '<span class="team-city">' + esc(t.city) + "</span>" +
            '<div class="team-name">' + esc(t.name) + "</div>" +
          "</div>" +
          '<span class="' + pillClass(t.conf) + '">' + esc(t.conf) + "ern</span>" +
        "</div>" +
        '<div class="team-meta">' +
          '<span class="pill pill-div">' + esc(t.div) + " Division</span>" +
          (t.titles > 0 ? '<span class="pill pill-ring">' + t.titles + "x champ</span>" : "") +
        "</div>" +
        '<p class="team-arena">Home arena: <strong>' + esc(t.arena) + "</strong></p>" +
        ringLine +
      "</div>";
    }).join("");
  }

  function updateStats(teams) {
    var pool = selectedPool();
    var east = 0, west = 0;
    teams.forEach(function (t) { if (t.conf === "East") east++; else west++; });
    var maxTitles = teams.reduce(function (m, t) { return Math.max(m, t.titles); }, 0);

    statCount.textContent = teams.length;
    statPool.textContent = pool.length;
    statSplit.textContent = east + " / " + west;
    statTitle.textContent = maxTitles > 0 ? maxTitles : "0";
  }

  function drawChart(teams) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 820;
    var cssHeight = 240;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var data = teams.slice().sort(function (a, b) { return b.titles - a.titles; }).slice(0, 12);
    var padL = 128, padR = 44, padT = 16, padB = 26;
    var plotW = cssWidth - padL - padR;
    var rowH = data.length ? (cssHeight - padT - padB) / data.length : 0;
    var max = data.reduce(function (m, t) { return Math.max(m, t.titles); }, 1);

    if (!data.length) {
      ctx.fillStyle = "#67626f";
      ctx.font = "13px -apple-system, Segoe UI, Roboto, sans-serif";
      ctx.fillText("Draw a team to see championship titles.", 12, 30);
      return;
    }

    ctx.font = "12px -apple-system, Segoe UI, Roboto, sans-serif";
    data.forEach(function (t, i) {
      var y = padT + i * rowH;
      var barH = Math.max(6, rowH - 8);
      var w = max > 0 ? (t.titles / max) * plotW : 0;

      ctx.fillStyle = "#201c28";
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillText(fullName(t), padL - 10, y + barH / 2);

      ctx.fillStyle = "#efeaf7";
      roundRect(ctx, padL, y, plotW, barH, 4);
      ctx.fill();

      ctx.fillStyle = t.titles > 0 ? "#60089c" : "#c9c3d6";
      roundRect(ctx, padL, y, Math.max(w, t.titles > 0 ? 4 : 0), barH, 4);
      ctx.fill();

      ctx.fillStyle = "#3d0566";
      ctx.textAlign = "left";
      ctx.fillText(t.titles, padL + Math.max(w, 4) + 8, y + barH / 2);
    });
  }

  function roundRect(c, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  function beep() {
    if (!soundEl.checked) return;
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      var ac = new AudioCtx();
      var osc = ac.createOscillator();
      var gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, ac.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.16);
      osc.connect(gain).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + 0.18);
      osc.onended = function () { ac.close(); };
    } catch (e) { /* audio is a nice-to-have, never block the draw */ }
  }

  function generate() {
    clearError();
    var raw = countEl.value.trim();
    var n = parseInt(raw, 10);
    if (raw === "" || isNaN(n)) {
      showError("Enter how many teams to draw (a whole number from 1 to 30).");
      return;
    }
    if (n < 1 || n > 30) {
      showError("Choose between 1 and 30 draws.");
      return;
    }

    var pool = selectedPool();
    var noRepeat = repeatEl.checked;
    if (noRepeat && n > pool.length) {
      showError("Only " + pool.length + " teams are eligible in this pool, so no-repeats mode can draw at most that many. Reduce the number of draws or widen the pool.");
      return;
    }

    var teams = sample(pool, n, noRepeat);
    currentDraw = teams;
    render(teams);
    updateStats(teams);
    drawChart(teams);
    beep();

    drawHistory.push(teams.map(fullName).join(", "));
    if (drawHistory.length > 20) drawHistory.shift();
    historyNote.textContent = "Draw history: " + drawHistory.length;

    copyBtn.disabled = false;
    clearBtn.disabled = false;
  }

  function copyText(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done); });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
    done();
  }

  function flash(btn, label) {
    var original = btn.getAttribute("data-label") || btn.textContent;
    btn.setAttribute("data-label", original);
    btn.textContent = label;
    window.setTimeout(function () { btn.textContent = original; }, 1400);
  }

  copyBtn.addEventListener("click", function () {
    if (!currentDraw.length) return;
    var text = currentDraw.map(function (t) {
      return fullName(t) + " (" + t.conf + ", " + t.div + ") - " + t.arena +
        (t.titles > 0 ? ", " + t.titles + "x champion" : "");
    }).join("\n");
    copyText(text, function () { flash(copyBtn, "Copied!"); });
  });

  function clearDraw() {
    currentDraw = [];
    resultsEl.innerHTML = '<p class="text-muted mb-0">Your team will appear here &mdash; press <strong>Draw teams</strong> to spin.</p>';
    copyBtn.disabled = true;
    clearBtn.disabled = true;
    statCount.textContent = "\u2014";
    statSplit.textContent = "\u2014";
    statTitle.textContent = "\u2014";
    statPool.textContent = selectedPool().length;
    drawChart([]);
  }

  clearBtn.addEventListener("click", clearDraw);

  resetBtn.addEventListener("click", function () {
    divisionEl.value = "all";
    $("pool-all").checked = true;
    countEl.value = "1";
    repeatEl.checked = true;
    soundEl.checked = false;
    drawHistory = [];
    historyNote.textContent = "Draw history: 0";
    clearError();
    clearDraw();
  });

  function updatePoolOnly() {
    statPool.textContent = selectedPool().length;
  }

  /* live pool stats + chart whenever filters change */
  Array.prototype.forEach.call(document.querySelectorAll('input[name="pool"]'), function (r) {
    r.addEventListener("change", function () {
      divisionEl.value = "all";
      updatePoolOnly();
      drawChart(selectedPool());
    });
  });
  divisionEl.addEventListener("change", function () {
    if (divisionEl.value !== "all") {
      $("pool-all").checked = true;
    }
    updatePoolOnly();
    drawChart(selectedPool());
  });

  countEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });

  window.addEventListener("resize", function () {
    drawChart(currentDraw.length ? currentDraw : selectedPool());
  });

  /* initial paint */
  updatePoolOnly();
  drawChart(selectedPool());
})();
