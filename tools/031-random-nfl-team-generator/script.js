/* Random NFL Team Generator — vanilla JS, no dependencies.
   Draws from a hand-built list of the 32 current NFL franchises. */
(function () {
  "use strict";

  // Super Bowl wins reflect results through the 2025 season.
  var TEAMS = [
    // AFC East
    { city: "Buffalo",     name: "Bills",       conf: "AFC", division: "AFC East",  stadium: "Highmark Stadium",      wins: 0 },
    { city: "Miami",       name: "Dolphins",    conf: "AFC", division: "AFC East",  stadium: "Hard Rock Stadium",     wins: 2 },
    { city: "New England", name: "Patriots",    conf: "AFC", division: "AFC East",  stadium: "Gillette Stadium",      wins: 6 },
    { city: "New York",    name: "Jets",        conf: "AFC", division: "AFC East",  stadium: "MetLife Stadium",       wins: 1 },
    // AFC North
    { city: "Baltimore",   name: "Ravens",      conf: "AFC", division: "AFC North", stadium: "M&T Bank Stadium",      wins: 2 },
    { city: "Cincinnati",  name: "Bengals",     conf: "AFC", division: "AFC North", stadium: "Paycor Stadium",        wins: 0 },
    { city: "Cleveland",   name: "Browns",      conf: "AFC", division: "AFC North", stadium: "Huntington Bank Field", wins: 0 },
    { city: "Pittsburgh",  name: "Steelers",    conf: "AFC", division: "AFC North", stadium: "Acrisure Stadium",      wins: 6 },
    // AFC South
    { city: "Houston",     name: "Texans",      conf: "AFC", division: "AFC South", stadium: "NRG Stadium",           wins: 0 },
    { city: "Indianapolis", name: "Colts",      conf: "AFC", division: "AFC South", stadium: "Lucas Oil Stadium",     wins: 2 },
    { city: "Jacksonville", name: "Jaguars",    conf: "AFC", division: "AFC South", stadium: "EverBank Stadium",      wins: 0 },
    { city: "Nashville",   name: "Titans",      conf: "AFC", division: "AFC South", stadium: "Nissan Stadium",        wins: 0 },
    // AFC West
    { city: "Denver",      name: "Broncos",     conf: "AFC", division: "AFC West",  stadium: "Empower Field",         wins: 3 },
    { city: "Kansas City", name: "Chiefs",      conf: "AFC", division: "AFC West",  stadium: "GEHA Field at Arrowhead", wins: 4 },
    { city: "Las Vegas",   name: "Raiders",     conf: "AFC", division: "AFC West",  stadium: "Allegiant Stadium",     wins: 3 },
    { city: "Los Angeles", name: "Chargers",    conf: "AFC", division: "AFC West",  stadium: "SoFi Stadium",          wins: 0 },
    // NFC East
    { city: "Dallas",      name: "Cowboys",     conf: "NFC", division: "NFC East",  stadium: "AT&T Stadium",          wins: 5 },
    { city: "New York",    name: "Giants",      conf: "NFC", division: "NFC East",  stadium: "MetLife Stadium",       wins: 4 },
    { city: "Philadelphia", name: "Eagles",     conf: "NFC", division: "NFC East",  stadium: "Lincoln Financial Field", wins: 2 },
    { city: "Landover",    name: "Commanders",  conf: "NFC", division: "NFC East",  stadium: "Northwest Stadium",     wins: 3 },
    // NFC North
    { city: "Chicago",     name: "Bears",       conf: "NFC", division: "NFC North", stadium: "Soldier Field",         wins: 1 },
    { city: "Detroit",     name: "Lions",       conf: "NFC", division: "NFC North", stadium: "Ford Field",            wins: 0 },
    { city: "Green Bay",   name: "Packers",     conf: "NFC", division: "NFC North", stadium: "Lambeau Field",         wins: 4 },
    { city: "Minneapolis", name: "Vikings",     conf: "NFC", division: "NFC North", stadium: "U.S. Bank Stadium",     wins: 0 },
    // NFC South
    { city: "Atlanta",     name: "Falcons",     conf: "NFC", division: "NFC South", stadium: "Mercedes-Benz Stadium", wins: 0 },
    { city: "Charlotte",   name: "Panthers",    conf: "NFC", division: "NFC South", stadium: "Bank of America Stadium", wins: 0 },
    { city: "New Orleans", name: "Saints",      conf: "NFC", division: "NFC South", stadium: "Caesars Superdome",     wins: 1 },
    { city: "Tampa",       name: "Buccaneers",  conf: "NFC", division: "NFC South", stadium: "Raymond James Stadium", wins: 2 },
    // NFC West
    { city: "Glendale",    name: "Cardinals",   conf: "NFC", division: "NFC West",  stadium: "State Farm Stadium",    wins: 0 },
    { city: "Inglewood",   name: "Rams",        conf: "NFC", division: "NFC West",  stadium: "SoFi Stadium",          wins: 2 },
    { city: "San Francisco", name: "49ers",     conf: "NFC", division: "NFC West",  stadium: "Levi's Stadium",        wins: 5 },
    { city: "Seattle",     name: "Seahawks",    conf: "NFC", division: "NFC West",  stadium: "Lumen Field",           wins: 1 }
  ];

  var els = {
    poolRadios: document.querySelectorAll('input[name="pool"]'),
    division: document.getElementById("division"),
    titles: document.getElementById("titles"),
    count: document.getElementById("count"),
    optRepeat: document.getElementById("optRepeat"),
    optSound: document.getElementById("optSound"),
    drawBtn: document.getElementById("drawBtn"),
    resetBtn: document.getElementById("resetBtn"),
    errorBox: document.getElementById("errorBox"),
    results: document.getElementById("results"),
    copyBtn: document.getElementById("copyBtn"),
    clearBtn: document.getElementById("clearBtn"),
    historyNote: document.getElementById("historyNote"),
    statCount: document.getElementById("statCount"),
    statPool: document.getElementById("statPool"),
    statSplit: document.getElementById("statSplit"),
    statTitle: document.getElementById("statTitle"),
    chart: document.getElementById("titleChart")
  };

  var currentDraw = [];
  var history = [];

  function poolValue() {
    for (var i = 0; i < els.poolRadios.length; i++) {
      if (els.poolRadios[i].checked) return els.poolRadios[i].value;
    }
    return "all";
  }

  function eligible() {
    var pool = poolValue();
    var division = els.division.value;
    var minWins = parseInt(els.titles.value, 10) || 0;
    return TEAMS.filter(function (t) {
      if (division !== "all") return t.division === division && t.wins >= minWins;
      if (pool !== "all") return t.conf === pool && t.wins >= minWins;
      return t.wins >= minWins;
    });
  }

  function showError(msg) {
    els.errorBox.textContent = msg;
    els.errorBox.classList.remove("d-none");
  }

  function clearError() {
    els.errorBox.textContent = "";
    els.errorBox.classList.add("d-none");
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function beep() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 720;
      gain.gain.value = 0.05;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.11);
      osc.onended = function () { if (ctx.close) ctx.close(); };
    } catch (e) { /* audio is optional */ }
  }

  function pill(text, cls) {
    var span = document.createElement("span");
    span.className = "pill " + cls;
    span.textContent = text;
    return span;
  }

  function teamCard(team) {
    var card = document.createElement("div");
    card.className = "team-card";

    var top = document.createElement("div");
    top.className = "team-top";
    var city = document.createElement("span");
    city.className = "team-city";
    city.textContent = team.city;
    top.appendChild(city);

    var name = document.createElement("div");
    name.className = "team-name";
    name.textContent = team.name;

    var meta = document.createElement("div");
    meta.className = "team-meta";
    meta.appendChild(pill(team.conf, team.conf === "AFC" ? "pill-conf-afc" : "pill-conf-nfc"));
    meta.appendChild(pill(team.division, "pill-div"));
    meta.appendChild(pill(team.wins + (team.wins === 1 ? " title" : " titles"), "pill-ring"));

    var arena = document.createElement("p");
    arena.className = "team-arena";
    var strong = document.createElement("strong");
    strong.textContent = "Home stadium: ";
    arena.appendChild(strong);
    arena.appendChild(document.createTextNode(team.stadium));

    card.appendChild(top);
    card.appendChild(name);
    card.appendChild(meta);
    card.appendChild(arena);
    return card;
  }

  function updateStats() {
    var pool = eligible();
    els.statPool.textContent = pool.length;

    var drawn = currentDraw.length;
    els.statCount.textContent = drawn;

    if (drawn === 0) {
      els.statSplit.textContent = "\u2014";
      els.statTitle.textContent = "\u2014";
      return;
    }

    var afc = 0, nfc = 0, most = 0;
    currentDraw.forEach(function (t) {
      if (t.conf === "AFC") afc++; else nfc++;
      if (t.wins > most) most = t.wins;
    });
    els.statSplit.textContent = afc + " / " + nfc;
    els.statTitle.textContent = most === 0 ? "0" : most;
  }

  function renderResults() {
    els.results.innerHTML = "";
    if (currentDraw.length === 0) {
      var p = document.createElement("p");
      p.className = "text-muted mb-0";
      p.innerHTML = "Your team will appear here \u2014 press <strong>Draw teams</strong> to spin.";
      els.results.appendChild(p);
      return;
    }
    currentDraw.forEach(function (t) {
      els.results.appendChild(teamCard(t));
    });
  }

  function updateButtons() {
    var has = currentDraw.length > 0;
    els.copyBtn.disabled = !has;
    els.clearBtn.disabled = !has;
  }

  function updateHistoryNote() {
    els.historyNote.textContent = "Draw history: " + history.length;
  }

  function draw() {
    clearError();
    var pool = eligible();
    if (pool.length === 0) {
      showError("No teams match those filters. Loosen the division or lower the Super Bowl minimum and try again.");
      return;
    }

    var raw = els.count.value.trim();
    if (raw === "") {
      showError("Enter how many teams you want to draw (1 to 32).");
      els.count.focus();
      return;
    }
    var n = Number(raw);
    if (!isFinite(n) || Math.floor(n) !== n) {
      showError("Please enter a whole number of teams to draw.");
      els.count.focus();
      return;
    }
    if (n < 1) {
      showError("Enter at least 1 team to draw.");
      els.count.focus();
      return;
    }
    if (n > 32) {
      showError("You can draw at most 32 teams. Lower the number and try again.");
      els.count.focus();
      return;
    }

    var noRepeat = els.optRepeat.checked;
    if (noRepeat && n > pool.length) {
      showError("No-repeats is on and only " + pool.length + " team" + (pool.length === 1 ? "" : "s") +
        " match your filters. Draw " + pool.length + " or fewer, widen the pool, or turn off no repeats.");
      return;
    }

    var picks = [];
    if (noRepeat) {
      picks = shuffle(pool).slice(0, n);
    } else {
      for (var i = 0; i < n; i++) {
        picks.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    }

    currentDraw = picks;
    history = history.concat(picks).slice(-40);

    renderResults();
    updateStats();
    updateButtons();
    updateHistoryNote();
    drawChart();
    if (els.optSound.checked) beep();
  }

  function reset() {
    clearError();
    currentDraw = [];
    els.count.value = 1;
    els.optRepeat.checked = true;
    els.optSound.checked = false;
    els.division.value = "all";
    els.titles.value = "0";
    document.getElementById("pool-all").checked = true;
    renderResults();
    updateStats();
    updateButtons();
    updateHistoryNote();
    drawChart();
  }

  function copyDraw() {
    if (currentDraw.length === 0) return;
    var text = currentDraw.map(function (t) {
      return t.city + " " + t.name + " (" + t.division + ", " + t.wins +
        (t.wins === 1 ? " title" : " titles") + ")";
    }).join("\n");
    var done = function () {
      els.copyBtn.textContent = "Copied!";
      window.setTimeout(function () { els.copyBtn.textContent = "Copy draw"; }, 1400);
    };
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
    try { document.execCommand("copy"); done(); } catch (e) { showError("Copy failed \u2014 select the text manually."); }
    document.body.removeChild(ta);
  }

  function drawChart() {
    var canvas = els.chart;
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d");
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var pool = eligible();
    var afc = 0, nfc = 0;
    pool.forEach(function (t) { if (t.conf === "AFC") afc += t.wins; else nfc += t.wins; });

    var bars = [
      { label: "AFC", value: afc, color: "#60089c" },
      { label: "NFC", value: nfc, color: "#0f7b3f" }
    ];

    var pad = 46;
    var baseY = H - 42;
    var topY = 30;
    var maxVal = Math.max(1, afc, nfc);
    var barW = 96;
    var gap = (W - pad * 2 - barW * bars.length) / (bars.length + 1);

    ctx.font = "600 13px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillStyle = "#67626f";
    ctx.textAlign = "left";
    ctx.fillText("Super Bowl wins in the current pool", pad, 18);

    // gridlines
    ctx.strokeStyle = "#e9e3f2";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = baseY - (baseY - topY) * (g / 4);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(W - pad, y);
      ctx.stroke();
    }

    bars.forEach(function (bar, i) {
      var x = pad + gap * (i + 1) + barW * i;
      var h = (baseY - topY) * (bar.value / maxVal);
      ctx.fillStyle = bar.color;
      ctx.fillRect(x, baseY - h, barW, h);

      ctx.fillStyle = "#201c28";
      ctx.textAlign = "center";
      ctx.font = "700 18px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(String(bar.value), x + barW / 2, baseY - h - 9);

      ctx.fillStyle = "#67626f";
      ctx.font = "600 13px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(bar.label, x + barW / 2, baseY + 20);
    });

    ctx.strokeStyle = "#c9c1d8";
    ctx.beginPath();
    ctx.moveTo(pad, baseY);
    ctx.lineTo(W - pad, baseY);
    ctx.stroke();
  }

  function bind() {
    els.drawBtn.addEventListener("click", draw);
    els.resetBtn.addEventListener("click", reset);
    els.copyBtn.addEventListener("click", copyDraw);
    els.clearBtn.addEventListener("click", function () { reset(); });

    els.division.addEventListener("change", function () {
      if (els.division.value !== "all") {
        var conf = els.division.value.indexOf("AFC") === 0 ? "AFC" : "NFC";
        document.getElementById(conf === "AFC" ? "pool-afc" : "pool-nfc").checked = true;
      }
      clearError();
      updateStats();
      drawChart();
    });

    els.titles.addEventListener("change", function () { clearError(); updateStats(); drawChart(); });
    Array.prototype.forEach.call(els.poolRadios, function (r) {
      r.addEventListener("change", function () { clearError(); updateStats(); drawChart(); });
    });
    els.count.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); draw(); }
    });
  }

  bind();
  renderResults();
  updateStats();
  updateButtons();
  updateHistoryNote();
  drawChart();
})();
