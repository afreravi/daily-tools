/* Random NBA Player Generator
   Draws from a hand-built pool of well-known basketball players.
   Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* Each entry: [name, position, primary franchise, peak era, resume tier]
     tier: "Legend" | "All-Star" | "Pro" */
  var POOL = [
    ["Bill Russell", "C", "Boston Celtics", "1950s-60s", "Legend"],
    ["Wilt Chamberlain", "C", "Los Angeles Lakers", "1950s-60s", "Legend"],
    ["Oscar Robertson", "PG", "Sacramento Kings", "1950s-60s", "Legend"],
    ["Jerry West", "SG", "Los Angeles Lakers", "1950s-60s", "Legend"],
    ["Elgin Baylor", "SF", "Los Angeles Lakers", "1950s-60s", "Legend"],
    ["Bob Pettit", "PF", "Atlanta Hawks", "1950s-60s", "Legend"],
    ["Sam Jones", "SG", "Boston Celtics", "1950s-60s", "All-Star"],
    ["John Havlicek", "SF", "Boston Celtics", "1950s-60s", "Legend"],
    ["Willis Reed", "C", "New York Knicks", "1950s-60s", "All-Star"],
    ["Walt Frazier", "PG", "New York Knicks", "1970s", "Legend"],
    ["Kareem Abdul-Jabbar", "C", "Los Angeles Lakers", "1970s", "Legend"],
    ["Julius Erving", "SF", "Philadelphia 76ers", "1970s", "Legend"],
    ["Pete Maravich", "SG", "Utah Jazz", "1970s", "All-Star"],
    ["Rick Barry", "SF", "Golden State Warriors", "1970s", "Legend"],
    ["Elvin Hayes", "PF", "Washington Wizards", "1970s", "All-Star"],
    ["Dave Cowens", "C", "Boston Celtics", "1970s", "All-Star"],
    ["Bob McAdoo", "PF", "Buffalo Braves", "1970s", "All-Star"],
    ["Artis Gilmore", "C", "Chicago Bulls", "1970s", "All-Star"],
    ["Magic Johnson", "PG", "Los Angeles Lakers", "1980s", "Legend"],
    ["Larry Bird", "SF", "Boston Celtics", "1980s", "Legend"],
    ["Isiah Thomas", "PG", "Detroit Pistons", "1980s", "Legend"],
    ["Hakeem Olajuwon", "C", "Houston Rockets", "1980s", "Legend"],
    ["Charles Barkley", "PF", "Phoenix Suns", "1980s", "Legend"],
    ["Karl Malone", "PF", "Utah Jazz", "1980s", "Legend"],
    ["John Stockton", "PG", "Utah Jazz", "1980s", "Legend"],
    ["Dominique Wilkins", "SF", "Atlanta Hawks", "1980s", "All-Star"],
    ["Clyde Drexler", "SG", "Portland Trail Blazers", "1980s", "All-Star"],
    ["Patrick Ewing", "C", "New York Knicks", "1980s", "All-Star"],
    ["James Worthy", "SF", "Los Angeles Lakers", "1980s", "All-Star"],
    ["Robert Parish", "C", "Boston Celtics", "1980s", "All-Star"],
    ["Michael Jordan", "SG", "Chicago Bulls", "1990s", "Legend"],
    ["Scottie Pippen", "SF", "Chicago Bulls", "1990s", "Legend"],
    ["Shaquille O'Neal", "C", "Los Angeles Lakers", "1990s", "Legend"],
    ["Tim Duncan", "PF", "San Antonio Spurs", "1990s", "Legend"],
    ["Kobe Bryant", "SG", "Los Angeles Lakers", "1990s", "Legend"],
    ["Allen Iverson", "PG", "Philadelphia 76ers", "1990s", "Legend"],
    ["Kevin Garnett", "PF", "Minnesota Timberwolves", "1990s", "Legend"],
    ["Dirk Nowitzki", "PF", "Dallas Mavericks", "1990s", "Legend"],
    ["Gary Payton", "PG", "Seattle SuperSonics", "1990s", "All-Star"],
    ["Reggie Miller", "SG", "Indiana Pacers", "1990s", "All-Star"],
    ["David Robinson", "C", "San Antonio Spurs", "1990s", "Legend"],
    ["Jason Kidd", "PG", "New Jersey Nets", "1990s", "All-Star"],
    ["Steve Nash", "PG", "Phoenix Suns", "2000s", "Legend"],
    ["LeBron James", "SF", "Cleveland Cavaliers", "2000s", "Legend"],
    ["Dwyane Wade", "SG", "Miami Heat", "2000s", "Legend"],
    ["Paul Pierce", "SF", "Boston Celtics", "2000s", "All-Star"],
    ["Ray Allen", "SG", "Seattle SuperSonics", "2000s", "All-Star"],
    ["Vince Carter", "SG", "Toronto Raptors", "2000s", "All-Star"],
    ["Tracy McGrady", "SG", "Orlando Magic", "2000s", "All-Star"],
    ["Chauncey Billups", "PG", "Detroit Pistons", "2000s", "All-Star"],
    ["Ben Wallace", "C", "Detroit Pistons", "2000s", "All-Star"],
    ["Tony Parker", "PG", "San Antonio Spurs", "2000s", "All-Star"],
    ["Manu Ginobili", "SG", "San Antonio Spurs", "2000s", "All-Star"],
    ["Amar'e Stoudemire", "PF", "Phoenix Suns", "2000s", "All-Star"],
    ["Pau Gasol", "PF", "Los Angeles Lakers", "2000s", "All-Star"],
    ["Chris Bosh", "PF", "Miami Heat", "2000s", "All-Star"],
    ["Dwight Howard", "C", "Orlando Magic", "2000s", "All-Star"],
    ["Stephen Curry", "PG", "Golden State Warriors", "2010s", "Legend"],
    ["Kevin Durant", "SF", "Golden State Warriors", "2010s", "Legend"],
    ["Kawhi Leonard", "SF", "San Antonio Spurs", "2010s", "All-Star"],
    ["James Harden", "SG", "Houston Rockets", "2010s", "All-Star"],
    ["Russell Westbrook", "PG", "Oklahoma City Thunder", "2010s", "All-Star"],
    ["Chris Paul", "PG", "Los Angeles Clippers", "2010s", "All-Star"],
    ["Anthony Davis", "PF", "New Orleans Pelicans", "2010s", "All-Star"],
    ["Damian Lillard", "PG", "Portland Trail Blazers", "2010s", "All-Star"],
    ["Kyrie Irving", "PG", "Cleveland Cavaliers", "2010s", "All-Star"],
    ["Klay Thompson", "SG", "Golden State Warriors", "2010s", "All-Star"],
    ["Draymond Green", "PF", "Golden State Warriors", "2010s", "All-Star"],
    ["Giannis Antetokounmpo", "PF", "Milwaukee Bucks", "2010s", "Legend"],
    ["Kyle Lowry", "PG", "Toronto Raptors", "2010s", "All-Star"],
    ["Blake Griffin", "PF", "Los Angeles Clippers", "2010s", "All-Star"],
    ["Paul George", "SF", "Indiana Pacers", "2010s", "All-Star"],
    ["Kemba Walker", "PG", "Charlotte Hornets", "2010s", "All-Star"],
    ["Nikola Jokic", "C", "Denver Nuggets", "2020s", "Legend"],
    ["Joel Embiid", "C", "Philadelphia 76ers", "2020s", "All-Star"],
    ["Luka Doncic", "PG", "Dallas Mavericks", "2020s", "All-Star"],
    ["Jayson Tatum", "SF", "Boston Celtics", "2020s", "All-Star"],
    ["Devin Booker", "SG", "Phoenix Suns", "2020s", "All-Star"],
    ["Ja Morant", "PG", "Memphis Grizzlies", "2020s", "All-Star"],
    ["Donovan Mitchell", "SG", "Cleveland Cavaliers", "2020s", "All-Star"],
    ["Anthony Edwards", "SG", "Minnesota Timberwolves", "2020s", "All-Star"],
    ["Shai Gilgeous-Alexander", "PG", "Oklahoma City Thunder", "2020s", "All-Star"],
    ["Jalen Brunson", "PG", "New York Knicks", "2020s", "All-Star"],
    ["Jimmy Butler", "SF", "Miami Heat", "2020s", "All-Star"],
    ["Bam Adebayo", "C", "Miami Heat", "2020s", "All-Star"],
    ["Trae Young", "PG", "Atlanta Hawks", "2020s", "All-Star"],
    ["Zion Williamson", "PF", "New Orleans Pelicans", "2020s", "All-Star"],
    ["Victor Wembanyama", "C", "San Antonio Spurs", "2020s", "All-Star"],
    ["Tyrese Haliburton", "PG", "Indiana Pacers", "2020s", "All-Star"],
    ["Domantas Sabonis", "C", "Sacramento Kings", "2020s", "All-Star"],
    ["De'Aaron Fox", "PG", "Sacramento Kings", "2020s", "All-Star"],
    ["Paolo Banchero", "PF", "Orlando Magic", "2020s", "All-Star"],
    ["Chet Holmgren", "C", "Oklahoma City Thunder", "2020s", "All-Star"],
    ["Dennis Rodman", "PF", "Chicago Bulls", "1990s", "All-Star"],
    ["Moses Malone", "C", "Philadelphia 76ers", "1980s", "Legend"],
    ["George Gervin", "SG", "San Antonio Spurs", "1980s", "All-Star"],
    ["Bill Walton", "C", "Portland Trail Blazers", "1970s", "All-Star"],
    ["Grant Hill", "SF", "Detroit Pistons", "1990s", "All-Star"]
  ];

  var POSITIONS = ["PG", "SG", "SF", "PF", "C"];
  var POS_LABEL = {
    PG: "Point guard", SG: "Shooting guard", SF: "Small forward",
    PF: "Power forward", C: "Centre"
  };

  var el = {
    position: document.getElementById("position"),
    team: document.getElementById("team"),
    era: document.getElementById("era"),
    tier: document.getElementById("tier"),
    count: document.getElementById("count"),
    repeat: document.getElementById("optRepeat"),
    drawBtn: document.getElementById("drawBtn"),
    resetBtn: document.getElementById("resetBtn"),
    copyBtn: document.getElementById("copyBtn"),
    clearBtn: document.getElementById("clearBtn"),
    results: document.getElementById("results"),
    errorBox: document.getElementById("errorBox"),
    statCount: document.getElementById("statCount"),
    statPool: document.getElementById("statPool"),
    statPos: document.getElementById("statPos"),
    statLegend: document.getElementById("statLegend"),
    historyNote: document.getElementById("historyNote"),
    chart: document.getElementById("poolChart")
  };

  var current = [];   // players currently shown
  var historyCount = 0;

  /* ---------- helpers ---------- */
  function tierRank(t) {
    if (t === "Legend") return 2;
    if (t === "All-Star") return 1;
    return 0;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function playerObj(row) {
    return {
      name: row[0], pos: row[1], team: row[2], era: row[3], tier: row[4]
    };
  }

  /* ---------- filtering ---------- */
  function eligiblePool() {
    var pos = el.position.value;
    var team = el.team.value;
    var era = el.era.value;
    var tier = el.tier.value;
    var minRank = tier === "any" ? -1 : (tier === "All-Star" ? 1 : 2);

    return POOL.filter(function (row) {
      if (pos !== "all" && row[1] !== pos) return false;
      if (team !== "all" && row[2] !== team) return false;
      if (era !== "all" && row[3] !== era) return false;
      if (minRank >= 0 && tierRank(row[4]) < minRank) return false;
      return true;
    }).map(playerObj);
  }

  /* ---------- team dropdown ---------- */
  function buildTeamOptions() {
    var teams = {};
    POOL.forEach(function (r) { teams[r[2]] = true; });
    Object.keys(teams).sort().forEach(function (t) {
      var o = document.createElement("option");
      o.value = t;
      o.textContent = t;
      el.team.appendChild(o);
    });
  }

  /* ---------- errors ---------- */
  function showError(msg) {
    el.errorBox.textContent = msg;
    el.errorBox.classList.remove("d-none");
  }
  function clearError() {
    el.errorBox.textContent = "";
    el.errorBox.classList.add("d-none");
  }

  /* ---------- rendering ---------- */
  function cardHtml(p, isNew) {
    var tags = "";
    if (p.tier) {
      tags += '<span class="tag tag-tier">' + escapeHtml(p.tier) + "</span>";
    }
    tags += '<span class="tag tag-era">' + escapeHtml(p.era) + "</span>";
    tags += '<span class="tag">' + escapeHtml(POS_LABEL[p.pos] || p.pos) + "</span>";
    return (
      '<div class="draft-card' + (isNew ? " is-new" : "") + '">' +
        '<div class="jersey" aria-hidden="true">' + escapeHtml(p.pos) + "</div>" +
        "<div>" +
          '<p class="draft-name">' + escapeHtml(p.name) + "</p>" +
          '<p class="draft-meta">' + escapeHtml(p.team) + " &middot; peak " + escapeHtml(p.era) + "</p>" +
          tags +
        "</div>" +
      "</div>"
    );
  }

  function render(newOnes) {
    if (!current.length) {
      el.results.innerHTML = '<p class="text-muted mb-0">The draft card will land here &mdash; press <strong>Draw players</strong> to spin.</p>';
      el.copyBtn.disabled = true;
      el.clearBtn.disabled = true;
      return;
    }
    var newKeys = {};
    (newOnes || []).forEach(function (p) { newKeys[p.name + "|" + p.team + "|" + p.era] = true; });
    el.results.innerHTML = current.map(function (p) {
      var k = p.name + "|" + p.team + "|" + p.era;
      return cardHtml(p, newKeys[k]);
    }).join("");
    el.copyBtn.disabled = false;
    el.clearBtn.disabled = false;
  }

  function updateStats(pool) {
    el.statPool.textContent = pool.length;
    el.statCount.textContent = current.length || "\u2014";
    var positions = {};
    var legends = 0;
    current.forEach(function (p) {
      positions[p.pos] = true;
      if (p.tier === "Legend") legends++;
    });
    el.statPos.textContent = current.length ? Object.keys(positions).length : "\u2014";
    el.statLegend.textContent = current.length ? legends : "\u2014";
    el.historyNote.textContent = "Draw history: " + historyCount;
  }

  /* ---------- chart ---------- */
  function drawChart(pool) {
    var c = el.chart;
    var ctx = c.getContext("2d");
    var W = c.width, H = c.height;
    ctx.clearRect(0, 0, W, H);

    var counts = {};
    POSITIONS.forEach(function (p) { counts[p] = 0; });
    pool.forEach(function (p) { if (counts[p.pos] != null) counts[p.pos]++; });

    var max = Math.max(1, Math.max.apply(null, POSITIONS.map(function (p) { return counts[p]; })));
    var padL = 48, padR = 16, padT = 26, padB = 44;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var slot = plotW / POSITIONS.length;
    var barW = Math.min(70, slot * 0.55);

    // axes
    ctx.strokeStyle = "#e9e3f2";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // gridlines
    var steps = 4;
    ctx.fillStyle = "#67616f";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    for (var g = 0; g <= steps; g++) {
      var val = Math.round((max / steps) * g);
      var y = padT + plotH - (plotH * (g / steps));
      ctx.strokeStyle = "#f1ecf8";
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + plotW, y);
      ctx.stroke();
      ctx.fillText(val, padL - 8, y + 4);
    }

    // bars
    POSITIONS.forEach(function (p, i) {
      var v = counts[p];
      var h = (v / max) * plotH;
      var x = padL + slot * i + (slot - barW) / 2;
      var y = padT + plotH - h;
      var grad = ctx.createLinearGradient(0, y, 0, padT + plotH);
      grad.addColorStop(0, "#8f38d1");
      grad.addColorStop(1, "#60089c");
      ctx.fillStyle = grad;
      ctx.fillRect(x, y, barW, h);

      // value
      ctx.fillStyle = "#3d0566";
      ctx.textAlign = "center";
      ctx.font = "bold 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(v, x + barW / 2, y - 6);

      // label
      ctx.fillStyle = "#1c1922";
      ctx.font = "12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(p, x + barW / 2, padT + plotH + 18);
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "#67616f";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillText("Players eligible in the current board", padL, 14);
  }

  /* ---------- actions ---------- */
  function draw() {
    clearError();
    var pool = eligiblePool();

    var raw = parseInt(el.count.value, 10);
    if (isNaN(raw)) raw = 1;
    if (raw < 1) {
      showError("Please enter at least 1 player to draw.");
      raw = 1;
      el.count.value = 1;
    } else if (raw > 8) {
      showError("You can draw up to 8 players at once. Showing 8.");
      raw = 8;
      el.count.value = 8;
    }

    if (!pool.length) {
      showError("No players match those filters. Try widening the position, franchise, era or resume.");
      current = [];
      render();
      updateStats(pool);
      drawChart(pool);
      return;
    }

    var noRepeat = el.repeat.checked;
    var take = Math.min(raw, noRepeat ? pool.length : raw);
    if (noRepeat && raw > pool.length) {
      showError("Only " + pool.length + " player" + (pool.length === 1 ? "" : "s") +
        " match those filters, so that is all this draw can return.");
    }

    var picks;
    if (noRepeat) {
      picks = shuffle(pool).slice(0, take);
      current = picks;
    } else {
      picks = [];
      for (var i = 0; i < take; i++) {
        picks.push(pool[Math.floor(Math.random() * pool.length)]);
      }
      current = picks;
    }

    historyCount += picks.length;
    render(picks);
    updateStats(pool);
    drawChart(pool);
  }

  function resetFilters() {
    el.position.value = "all";
    el.team.value = "all";
    el.era.value = "all";
    el.tier.value = "any";
    el.count.value = 1;
    el.repeat.checked = true;
    clearError();
    current = [];
    render();
    updateStats(eligiblePool());
    drawChart(eligiblePool());
  }

  function clearResults() {
    current = [];
    clearError();
    render();
    updateStats(eligiblePool());
  }

  function copyDraw() {
    if (!current.length) return;
    var lines = current.map(function (p) {
      return p.name + " \u2014 " + (POS_LABEL[p.pos] || p.pos) + ", " + p.team +
        " (peak " + p.era + ", " + (p.tier || "Pro") + ")";
    });
    var text = lines.join("\n");
    var done = function () {
      var prev = el.copyBtn.textContent;
      el.copyBtn.textContent = "Copied!";
      window.setTimeout(function () { el.copyBtn.textContent = prev; }, 1400);
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
    try { document.execCommand("copy"); done(); } catch (e) { /* ignore */ }
    document.body.removeChild(ta);
  }

  /* ---------- wiring ---------- */
  function init() {
    buildTeamOptions();
    [el.position, el.team, el.era, el.tier].forEach(function (node) {
      node.addEventListener("change", function () {
        current = [];
        render();
        updateStats(eligiblePool());
        drawChart(eligiblePool());
        clearError();
      });
    });
    el.drawBtn.addEventListener("click", draw);
    el.resetBtn.addEventListener("click", resetFilters);
    el.clearBtn.addEventListener("click", clearResults);
    el.copyBtn.addEventListener("click", copyDraw);
    el.count.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); draw(); }
    });

    updateStats(eligiblePool());
    drawChart(eligiblePool());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
