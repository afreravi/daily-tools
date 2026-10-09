/* Random NFL Player Generator — vanilla JS, no dependencies.
   Draws from a hand-built list of well-known NFL players. */
(function () {
  "use strict";

  // group: Offense | Defense | Special teams
  // tier ranking: Rising Star < All-Pro < Legend
  var PLAYERS = [
    // ---- Quarterbacks ----
    { name: "Tom Brady",          pos: "QB", group: "Offense", team: "New England Patriots",  era: "2000–2022", tier: "Legend" },
    { name: "Peyton Manning",     pos: "QB", group: "Offense", team: "Indianapolis Colts",    era: "1998–2015", tier: "Legend" },
    { name: "Joe Montana",        pos: "QB", group: "Offense", team: "San Francisco 49ers",   era: "1979–1994", tier: "Legend" },
    { name: "John Elway",         pos: "QB", group: "Offense", team: "Denver Broncos",        era: "1983–1998", tier: "Legend" },
    { name: "Dan Marino",         pos: "QB", group: "Offense", team: "Miami Dolphins",        era: "1983–1999", tier: "Legend" },
    { name: "Brett Favre",        pos: "QB", group: "Offense", team: "Green Bay Packers",     era: "1991–2010", tier: "Legend" },
    { name: "Aaron Rodgers",      pos: "QB", group: "Offense", team: "Green Bay Packers",     era: "2005–2024", tier: "Legend" },
    { name: "Drew Brees",         pos: "QB", group: "Offense", team: "New Orleans Saints",    era: "2001–2020", tier: "Legend" },
    { name: "Patrick Mahomes",    pos: "QB", group: "Offense", team: "Kansas City Chiefs",    era: "2017–now",  tier: "Legend" },
    { name: "Steve Young",        pos: "QB", group: "Offense", team: "San Francisco 49ers",   era: "1985–1999", tier: "Legend" },
    { name: "Troy Aikman",        pos: "QB", group: "Offense", team: "Dallas Cowboys",        era: "1989–2000", tier: "Legend" },
    { name: "Terry Bradshaw",     pos: "QB", group: "Offense", team: "Pittsburgh Steelers",   era: "1970–1983", tier: "Legend" },
    { name: "Johnny Unitas",      pos: "QB", group: "Offense", team: "Baltimore Colts",       era: "1956–1973", tier: "Legend" },
    { name: "Josh Allen",         pos: "QB", group: "Offense", team: "Buffalo Bills",         era: "2018–now",  tier: "All-Pro" },
    { name: "Lamar Jackson",      pos: "QB", group: "Offense", team: "Baltimore Ravens",      era: "2018–now",  tier: "All-Pro" },
    { name: "Joe Burrow",         pos: "QB", group: "Offense", team: "Cincinnati Bengals",    era: "2020–now",  tier: "All-Pro" },
    { name: "Russell Wilson",     pos: "QB", group: "Offense", team: "Seattle Seahawks",      era: "2012–now",  tier: "All-Pro" },
    { name: "Matthew Stafford",   pos: "QB", group: "Offense", team: "Detroit Lions",         era: "2009–now",  tier: "All-Pro" },
    { name: "Eli Manning",        pos: "QB", group: "Offense", team: "New York Giants",       era: "2004–2019", tier: "All-Pro" },
    { name: "Ben Roethlisberger", pos: "QB", group: "Offense", team: "Pittsburgh Steelers",   era: "2004–2021", tier: "All-Pro" },
    { name: "Jalen Hurts",        pos: "QB", group: "Offense", team: "Philadelphia Eagles",   era: "2020–now",  tier: "All-Pro" },
    { name: "Dak Prescott",       pos: "QB", group: "Offense", team: "Dallas Cowboys",        era: "2016–now",  tier: "All-Pro" },
    { name: "Jared Goff",         pos: "QB", group: "Offense", team: "Los Angeles Rams",      era: "2016–now",  tier: "All-Pro" },
    { name: "Justin Herbert",     pos: "QB", group: "Offense", team: "Los Angeles Chargers",  era: "2020–now",  tier: "Rising Star" },
    { name: "C.J. Stroud",        pos: "QB", group: "Offense", team: "Houston Texans",        era: "2023–now",  tier: "Rising Star" },

    // ---- Running backs ----
    { name: "Barry Sanders",      pos: "RB", group: "Offense", team: "Detroit Lions",         era: "1989–1998", tier: "Legend" },
    { name: "Emmitt Smith",       pos: "RB", group: "Offense", team: "Dallas Cowboys",        era: "1990–2004", tier: "Legend" },
    { name: "Walter Payton",      pos: "RB", group: "Offense", team: "Chicago Bears",         era: "1975–1987", tier: "Legend" },
    { name: "Jim Brown",          pos: "RB", group: "Offense", team: "Cleveland Browns",      era: "1957–1965", tier: "Legend" },
    { name: "LaDainian Tomlinson",pos: "RB", group: "Offense", team: "Los Angeles Chargers",  era: "2001–2011", tier: "Legend" },
    { name: "Adrian Peterson",    pos: "RB", group: "Offense", team: "Minnesota Vikings",     era: "2007–2021", tier: "Legend" },
    { name: "Marshall Faulk",     pos: "RB", group: "Offense", team: "Los Angeles Rams",      era: "1994–2005", tier: "Legend" },
    { name: "Derrick Henry",      pos: "RB", group: "Offense", team: "Tennessee Titans",      era: "2016–now",  tier: "All-Pro" },
    { name: "Christian McCaffrey",pos: "RB", group: "Offense", team: "Carolina Panthers",     era: "2017–now",  tier: "All-Pro" },
    { name: "Ezekiel Elliott",    pos: "RB", group: "Offense", team: "Dallas Cowboys",        era: "2016–now",  tier: "All-Pro" },
    { name: "Saquon Barkley",     pos: "RB", group: "Offense", team: "New York Giants",       era: "2018–now",  tier: "All-Pro" },
    { name: "Alvin Kamara",       pos: "RB", group: "Offense", team: "New Orleans Saints",    era: "2017–now",  tier: "All-Pro" },
    { name: "Nick Chubb",         pos: "RB", group: "Offense", team: "Cleveland Browns",      era: "2018–now",  tier: "All-Pro" },
    { name: "Jonathan Taylor",    pos: "RB", group: "Offense", team: "Indianapolis Colts",    era: "2020–now",  tier: "All-Pro" },
    { name: "Josh Jacobs",        pos: "RB", group: "Offense", team: "Las Vegas Raiders",     era: "2019–now",  tier: "All-Pro" },
    { name: "Aaron Jones",        pos: "RB", group: "Offense", team: "Green Bay Packers",     era: "2017–now",  tier: "All-Pro" },
    { name: "Bijan Robinson",     pos: "RB", group: "Offense", team: "Atlanta Falcons",       era: "2023–now",  tier: "Rising Star" },
    { name: "Jahmyr Gibbs",       pos: "RB", group: "Offense", team: "Detroit Lions",         era: "2023–now",  tier: "Rising Star" },

    // ---- Wide receivers ----
    { name: "Jerry Rice",         pos: "WR", group: "Offense", team: "San Francisco 49ers",   era: "1985–2004", tier: "Legend" },
    { name: "Randy Moss",         pos: "WR", group: "Offense", team: "Minnesota Vikings",     era: "1998–2012", tier: "Legend" },
    { name: "Terrell Owens",      pos: "WR", group: "Offense", team: "San Francisco 49ers",   era: "1996–2010", tier: "Legend" },
    { name: "Calvin Johnson",     pos: "WR", group: "Offense", team: "Detroit Lions",         era: "2007–2015", tier: "Legend" },
    { name: "Marvin Harrison",    pos: "WR", group: "Offense", team: "Indianapolis Colts",    era: "1996–2008", tier: "Legend" },
    { name: "Larry Fitzgerald",   pos: "WR", group: "Offense", team: "Arizona Cardinals",     era: "2004–2020", tier: "Legend" },
    { name: "Julio Jones",        pos: "WR", group: "Offense", team: "Atlanta Falcons",       era: "2011–now",  tier: "All-Pro" },
    { name: "DeAndre Hopkins",    pos: "WR", group: "Offense", team: "Houston Texans",        era: "2013–now",  tier: "All-Pro" },
    { name: "Davante Adams",      pos: "WR", group: "Offense", team: "Green Bay Packers",     era: "2014–now",  tier: "All-Pro" },
    { name: "Tyreek Hill",        pos: "WR", group: "Offense", team: "Kansas City Chiefs",    era: "2016–now",  tier: "All-Pro" },
    { name: "Cooper Kupp",        pos: "WR", group: "Offense", team: "Los Angeles Rams",      era: "2017–now",  tier: "All-Pro" },
    { name: "Justin Jefferson",   pos: "WR", group: "Offense", team: "Minnesota Vikings",     era: "2020–now",  tier: "All-Pro" },
    { name: "Ja'Marr Chase",      pos: "WR", group: "Offense", team: "Cincinnati Bengals",    era: "2021–now",  tier: "All-Pro" },
    { name: "CeeDee Lamb",        pos: "WR", group: "Offense", team: "Dallas Cowboys",        era: "2020–now",  tier: "All-Pro" },
    { name: "A.J. Brown",         pos: "WR", group: "Offense", team: "Philadelphia Eagles",   era: "2019–now",  tier: "All-Pro" },
    { name: "Amon-Ra St. Brown",  pos: "WR", group: "Offense", team: "Detroit Lions",         era: "2021–now",  tier: "All-Pro" },
    { name: "Puka Nacua",         pos: "WR", group: "Offense", team: "Los Angeles Rams",      era: "2023–now",  tier: "Rising Star" },
    { name: "Garrett Wilson",     pos: "WR", group: "Offense", team: "New York Jets",         era: "2022–now",  tier: "Rising Star" },

    // ---- Tight ends ----
    { name: "Rob Gronkowski",     pos: "TE", group: "Offense", team: "New England Patriots",  era: "2010–2021", tier: "Legend" },
    { name: "Travis Kelce",       pos: "TE", group: "Offense", team: "Kansas City Chiefs",    era: "2013–now",  tier: "Legend" },
    { name: "Tony Gonzalez",      pos: "TE", group: "Offense", team: "Kansas City Chiefs",    era: "1997–2013", tier: "Legend" },
    { name: "Antonio Gates",      pos: "TE", group: "Offense", team: "Los Angeles Chargers",  era: "2003–2018", tier: "Legend" },
    { name: "George Kittle",      pos: "TE", group: "Offense", team: "San Francisco 49ers",   era: "2017–now",  tier: "All-Pro" },
    { name: "Mark Andrews",       pos: "TE", group: "Offense", team: "Baltimore Ravens",      era: "2018–now",  tier: "All-Pro" },
    { name: "T.J. Hockenson",     pos: "TE", group: "Offense", team: "Detroit Lions",         era: "2019–now",  tier: "All-Pro" },
    { name: "Sam LaPorta",        pos: "TE", group: "Offense", team: "Detroit Lions",         era: "2023–now",  tier: "Rising Star" },

    // ---- Offensive line ----
    { name: "Anthony Munoz",      pos: "OL", group: "Offense", team: "Cincinnati Bengals",    era: "1980–1992", tier: "Legend" },
    { name: "Jonathan Ogden",     pos: "OL", group: "Offense", team: "Baltimore Ravens",      era: "1996–2007", tier: "Legend" },
    { name: "Joe Thomas",         pos: "OL", group: "Offense", team: "Cleveland Browns",      era: "2007–2017", tier: "Legend" },
    { name: "Jason Kelce",        pos: "OL", group: "Offense", team: "Philadelphia Eagles",   era: "2011–2023", tier: "Legend" },
    { name: "Quenton Nelson",     pos: "OL", group: "Offense", team: "Indianapolis Colts",    era: "2018–now",  tier: "All-Pro" },
    { name: "Trent Williams",     pos: "OL", group: "Offense", team: "San Francisco 49ers",   era: "2010–now",  tier: "All-Pro" },

    // ---- Defensive line ----
    { name: "Reggie White",       pos: "DL", group: "Defense", team: "Philadelphia Eagles",   era: "1985–2000", tier: "Legend" },
    { name: "Aaron Donald",       pos: "DL", group: "Defense", team: "Los Angeles Rams",      era: "2014–2023", tier: "Legend" },
    { name: "Bruce Smith",        pos: "DL", group: "Defense", team: "Buffalo Bills",         era: "1985–2003", tier: "Legend" },
    { name: "J.J. Watt",          pos: "DL", group: "Defense", team: "Houston Texans",        era: "2011–2022", tier: "Legend" },
    { name: "Myles Garrett",      pos: "DL", group: "Defense", team: "Cleveland Browns",      era: "2017–now",  tier: "All-Pro" },
    { name: "Nick Bosa",          pos: "DL", group: "Defense", team: "San Francisco 49ers",   era: "2019–now",  tier: "All-Pro" },
    { name: "Micah Parsons",      pos: "DL", group: "Defense", team: "Dallas Cowboys",        era: "2021–now",  tier: "All-Pro" },
    { name: "Chris Jones",        pos: "DL", group: "Defense", team: "Kansas City Chiefs",    era: "2016–now",  tier: "All-Pro" },
    { name: "T.J. Watt",          pos: "DL", group: "Defense", team: "Pittsburgh Steelers",   era: "2017–now",  tier: "All-Pro" },
    { name: "Aidan Hutchinson",   pos: "DL", group: "Defense", team: "Detroit Lions",         era: "2022–now",  tier: "Rising Star" },

    // ---- Linebackers ----
    { name: "Lawrence Taylor",    pos: "LB", group: "Defense", team: "New York Giants",       era: "1981–1993", tier: "Legend" },
    { name: "Ray Lewis",          pos: "LB", group: "Defense", team: "Baltimore Ravens",      era: "1996–2012", tier: "Legend" },
    { name: "Derrick Brooks",     pos: "LB", group: "Defense", team: "Tampa Bay Buccaneers",  era: "1995–2008", tier: "Legend" },
    { name: "Luke Kuechly",       pos: "LB", group: "Defense", team: "Carolina Panthers",     era: "2012–2019", tier: "Legend" },
    { name: "Von Miller",         pos: "LB", group: "Defense", team: "Denver Broncos",        era: "2011–now",  tier: "Legend" },
    { name: "Bobby Wagner",       pos: "LB", group: "Defense", team: "Seattle Seahawks",      era: "2012–now",  tier: "All-Pro" },
    { name: "Fred Warner",        pos: "LB", group: "Defense", team: "San Francisco 49ers",   era: "2018–now",  tier: "All-Pro" },
    { name: "Roquan Smith",       pos: "LB", group: "Defense", team: "Baltimore Ravens",      era: "2018–now",  tier: "All-Pro" },

    // ---- Defensive backs ----
    { name: "Deion Sanders",      pos: "DB", group: "Defense", team: "Dallas Cowboys",        era: "1989–2005", tier: "Legend" },
    { name: "Ed Reed",            pos: "DB", group: "Defense", team: "Baltimore Ravens",      era: "2002–2013", tier: "Legend" },
    { name: "Ronnie Lott",        pos: "DB", group: "Defense", team: "San Francisco 49ers",   era: "1981–1994", tier: "Legend" },
    { name: "Charles Woodson",    pos: "DB", group: "Defense", team: "Green Bay Packers",     era: "1998–2015", tier: "Legend" },
    { name: "Richard Sherman",    pos: "DB", group: "Defense", team: "Seattle Seahawks",      era: "2011–2021", tier: "All-Pro" },
    { name: "Jalen Ramsey",       pos: "DB", group: "Defense", team: "Los Angeles Rams",      era: "2016–now",  tier: "All-Pro" },
    { name: "Derwin James",       pos: "DB", group: "Defense", team: "Los Angeles Chargers",  era: "2018–now",  tier: "All-Pro" },
    { name: "Minkah Fitzpatrick", pos: "DB", group: "Defense", team: "Pittsburgh Steelers",   era: "2018–now",  tier: "All-Pro" },
    { name: "Sauce Gardner",      pos: "DB", group: "Defense", team: "New York Jets",         era: "2022–now",  tier: "Rising Star" },

    // ---- Specialists ----
    { name: "Adam Vinatieri",     pos: "K",  group: "Special teams", team: "New England Patriots",  era: "1996–2019", tier: "Legend" },
    { name: "Justin Tucker",      pos: "K",  group: "Special teams", team: "Baltimore Ravens",      era: "2012–now",  tier: "Legend" },
    { name: "Harrison Butker",    pos: "K",  group: "Special teams", team: "Kansas City Chiefs",    era: "2017–now",  tier: "All-Pro" },
    { name: "Brandon Aubrey",     pos: "K",  group: "Special teams", team: "Dallas Cowboys",        era: "2023–now",  tier: "Rising Star" },
    { name: "Ray Guy",            pos: "P",  group: "Special teams", team: "Oakland Raiders",       era: "1973–1986", tier: "Legend" },
    { name: "Shane Lechler",      pos: "P",  group: "Special teams", team: "Oakland Raiders",       era: "2000–2017", tier: "All-Pro" },
    { name: "Johnny Hekker",      pos: "P",  group: "Special teams", team: "Los Angeles Rams",      era: "2012–now",  tier: "All-Pro" },
    { name: "Michael Dickson",    pos: "P",  group: "Special teams", team: "Seattle Seahawks",      era: "2018–now",  tier: "All-Pro" },
    { name: "Tommy Townsend",     pos: "P",  group: "Special teams", team: "Kansas City Chiefs",    era: "2020–now",  tier: "Rising Star" }
  ];

  var TIER_RANK = { "Rising Star": 1, "All-Pro": 2, "Legend": 3 };
  var GROUP_COLORS = { "Offense": "#a3391f", "Defense": "#0e5a7a", "Special teams": "#60089c" };

  var els = {
    groupRadios: document.querySelectorAll('input[name="group"]'),
    position: document.getElementById("position"),
    team: document.getElementById("team"),
    tier: document.getElementById("tier"),
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
    statPos: document.getElementById("statPos"),
    statLegend: document.getElementById("statLegend"),
    chart: document.getElementById("poolChart")
  };

  var currentDraw = [];
  var history = [];

  function groupValue() {
    for (var i = 0; i < els.groupRadios.length; i++) {
      if (els.groupRadios[i].checked) return els.groupRadios[i].value;
    }
    return "all";
  }

  function buildTeamOptions() {
    var seen = {};
    var teams = [];
    PLAYERS.forEach(function (p) {
      if (!seen[p.team]) { seen[p.team] = true; teams.push(p.team); }
    });
    teams.sort();
    teams.forEach(function (t) {
      var opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      els.team.appendChild(opt);
    });
  }

  function eligible() {
    var group = groupValue();
    var position = els.position.value;
    var team = els.team.value;
    var tier = els.tier.value;
    var minRank = tier === "any" ? 0 : (tier === "Legend" ? 3 : 2);

    return PLAYERS.filter(function (p) {
      if (position !== "all") {
        if (p.pos !== position) return false;
      } else if (group !== "all") {
        if (p.group !== group) return false;
      }
      if (team !== "all" && p.team !== team) return false;
      if (TIER_RANK[p.tier] < minRank) return false;
      return true;
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
      osc.frequency.value = 660;
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

  function groupPillClass(group) {
    if (group === "Offense") return "pill-group-off";
    if (group === "Defense") return "pill-group-def";
    return "pill-group-st";
  }

  function playerCard(p) {
    var card = document.createElement("div");
    card.className = "player-card";

    var jersey = document.createElement("div");
    jersey.className = "jersey";
    var badge = document.createElement("span");
    badge.className = "pos-badge";
    badge.textContent = p.pos;
    var mark = document.createElement("span");
    mark.className = "tier-mark";
    mark.textContent = p.tier === "Legend" ? "Legend" : (p.tier === "All-Pro" ? "All-Pro" : "Rising");
    jersey.appendChild(badge);
    jersey.appendChild(mark);

    var body = document.createElement("div");
    body.className = "player-body";

    var name = document.createElement("h3");
    name.className = "player-name";
    name.textContent = p.name;

    var meta = document.createElement("div");
    meta.className = "player-meta";
    meta.appendChild(pill(p.group, groupPillClass(p.group)));
    meta.appendChild(pill(p.team, "pill-team"));
    meta.appendChild(pill(p.tier, "pill-tag"));

    var era = document.createElement("p");
    era.className = "player-era";
    var strong = document.createElement("strong");
    strong.textContent = "Career span: ";
    era.appendChild(strong);
    era.appendChild(document.createTextNode(p.era));

    body.appendChild(name);
    body.appendChild(meta);
    body.appendChild(era);

    card.appendChild(jersey);
    card.appendChild(body);
    return card;
  }

  function updateStats() {
    var pool = eligible();
    els.statPool.textContent = pool.length;

    var drawn = currentDraw.length;
    els.statCount.textContent = drawn;

    if (drawn === 0) {
      els.statPos.textContent = "\u2014";
      els.statLegend.textContent = "\u2014";
      return;
    }

    var positions = {};
    var legends = 0;
    currentDraw.forEach(function (p) {
      positions[p.pos] = true;
      if (p.tier === "Legend") legends++;
    });
    els.statPos.textContent = Object.keys(positions).length;
    els.statLegend.textContent = legends;
  }

  function renderResults() {
    els.results.innerHTML = "";
    if (currentDraw.length === 0) {
      var p = document.createElement("p");
      p.className = "text-muted mb-0";
      p.innerHTML = "Your player will appear here \u2014 press <strong>Draw players</strong> to spin.";
      els.results.appendChild(p);
      return;
    }
    currentDraw.forEach(function (player) {
      els.results.appendChild(playerCard(player));
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
      showError("No players match those filters. Loosen the position, team or tier and try again.");
      return;
    }

    var raw = els.count.value.trim();
    if (raw === "") {
      showError("Enter how many players you want to draw (1 to 10).");
      els.count.focus();
      return;
    }
    var n = Number(raw);
    if (!isFinite(n) || Math.floor(n) !== n) {
      showError("Please enter a whole number of players to draw.");
      els.count.focus();
      return;
    }
    if (n < 1) {
      showError("Enter at least 1 player to draw.");
      els.count.focus();
      return;
    }
    if (n > 10) {
      showError("You can draw at most 10 players at a time. Lower the number and try again.");
      els.count.focus();
      return;
    }

    var noRepeat = els.optRepeat.checked;
    if (noRepeat && n > pool.length) {
      showError("No-repeats is on and only " + pool.length + " player" + (pool.length === 1 ? "" : "s") +
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
    history = history.concat(picks).slice(-60);

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
    els.position.value = "all";
    els.team.value = "all";
    els.tier.value = "any";
    document.getElementById("group-all").checked = true;
    renderResults();
    updateStats();
    updateButtons();
    updateHistoryNote();
    drawChart();
  }

  function copyDraw() {
    if (currentDraw.length === 0) return;
    var text = currentDraw.map(function (p) {
      return p.name + " (" + p.pos + ", " + p.team + ", " + p.era + ", " + p.tier + ")";
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
    var groups = ["Offense", "Defense", "Special teams"];
    var counts = { "Offense": 0, "Defense": 0, "Special teams": 0 };
    pool.forEach(function (p) { counts[p.group]++; });

    var pad = 46;
    var baseY = H - 42;
    var topY = 34;
    var maxVal = Math.max(1, counts["Offense"], counts["Defense"], counts["Special teams"]);
    var barW = 110;
    var gap = (W - pad * 2 - barW * groups.length) / (groups.length + 1);

    ctx.font = "600 13px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.fillStyle = "#6a6572";
    ctx.textAlign = "left";
    ctx.fillText("Eligible players by position group", pad, 20);

    ctx.strokeStyle = "#e8e2f1";
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = baseY - (baseY - topY) * (g / 4);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(W - pad, y);
      ctx.stroke();
    }

    groups.forEach(function (label, i) {
      var x = pad + gap * (i + 1) + barW * i;
      var h = (baseY - topY) * (counts[label] / maxVal);
      ctx.fillStyle = GROUP_COLORS[label];
      ctx.fillRect(x, baseY - h, barW, h);

      ctx.fillStyle = "#1d1a24";
      ctx.textAlign = "center";
      ctx.font = "700 18px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(String(counts[label]), x + barW / 2, baseY - h - 9);

      ctx.fillStyle = "#6a6572";
      ctx.font = "600 12px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(label, x + barW / 2, baseY + 20);
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

    els.position.addEventListener("change", function () {
      if (els.position.value !== "all") {
        var group = null;
        for (var i = 0; i < PLAYERS.length; i++) {
          if (PLAYERS[i].pos === els.position.value) { group = PLAYERS[i].group; break; }
        }
        if (group === "Offense") { document.getElementById("group-offense").checked = true; }
        else if (group === "Defense") { document.getElementById("group-defense").checked = true; }
        else if (group === "Special teams") { document.getElementById("group-special").checked = true; }
      }
      clearError();
      updateStats();
      drawChart();
    });

    els.team.addEventListener("change", function () { clearError(); updateStats(); drawChart(); });
    els.tier.addEventListener("change", function () { clearError(); updateStats(); drawChart(); });
    Array.prototype.forEach.call(els.groupRadios, function (r) {
      r.addEventListener("change", function () {
        if (r.value !== "all") {
          var pos = els.position.value;
          if (pos !== "all") {
            var pg = null;
            for (var i = 0; i < PLAYERS.length; i++) {
              if (PLAYERS[i].pos === pos) { pg = PLAYERS[i].group; break; }
            }
            if (pg !== r.value) els.position.value = "all";
          }
        }
        clearError();
        updateStats();
        drawChart();
      });
    });
    els.count.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); draw(); }
    });
  }

  buildTeamOptions();
  bind();
  renderResults();
  updateStats();
  updateButtons();
  updateHistoryNote();
  drawChart();
})();
