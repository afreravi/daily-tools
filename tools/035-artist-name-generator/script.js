/* Artist Name Generator — vanilla JS, no dependencies.
   Assembles band names and solo stage names from per-genre word banks. */
(function () {
  "use strict";

  // Each style carries its own vocabulary so the results feel genre-appropriate.
  var BANKS = {
    Indie: {
      adj: ["velvet", "paper", "quiet", "hollow", "amber", "coastal", "northern", "gentle", "faded", "lunar", "golden", "silver"],
      noun: ["meadow", "harbour", "lantern", "orchard", "sparrow", "river", "static", "season", "film", "echo", "atlas", "winter"],
      plural: ["wolves", "lanterns", "sparrows", "rivers", "echoes", "seasons", "films", "meadows", "harbours", "orchards", "atlases", "winters"],
      first: ["June", "Milo", "Rowan", "Wren", "Ellis", "Hazel", "Arlo", "Iris", "Theo", "Sage"],
      last: ["Vale", "North", "Rivers", "Hart", "Lane", "Frost", "Bloom", "Meadows", "Wren", "Ash"]
    },
    Rock: {
      adj: ["wild", "broken", "electric", "crimson", "iron", "reckless", "feral", "jagged", "loud", "black", "restless", "storm"],
      noun: ["thunder", "riot", "engine", "canyon", "hammer", "wolf", "fire", "signal", "shadow", "bridge", "ghost", "leather"],
      plural: ["riots", "engines", "canyons", "hammers", "wolves", "fires", "signals", "shadows", "bridges", "ghosts", "thunders", "storms"],
      first: ["Jet", "Cash", "Roxy", "Deacon", "Nova", "Jett", "Stone", "Rex", "Bex", "Ace"],
      last: ["Kane", "Stone", "Ryder", "Black", "Wolfe", "Steele", "Vane", "Cross", "Blaze", "Knox"]
    },
    Electronic: {
      adj: ["neon", "digital", "silent", "chrome", "mirrored", "endless", "spectral", "quantum", "liquid", "zero", "cobalt", "prismatic"],
      noun: ["circuit", "signal", "pulse", "matrix", "horizon", "vector", "static", "prism", "nightfall", "current", "glow", "axis"],
      plural: ["circuits", "signals", "pulses", "matrices", "vectors", "prisms", "currents", "glows", "axes", "horizons", "static", "pulses"],
      first: ["Kairo", "Vex", "Nix", "Echo", "Lyra", "Zeno", "Cyra", "Orion", "Axi", "Nova"],
      last: ["Volt", "Prism", "Axis", "Vector", "Neon", "Pulse", "Circuit", "Halo", "Zenith", "Cobalt"]
    },
    Pop: {
      adj: ["candy", "golden", "shiny", "electric", "sugar", "bright", "dazzling", "satin", "glossy", "vivid", "sweet", "prime"],
      noun: ["starlight", "heart", "diamond", "kiss", "summer", "spotlight", "melody", "sparkle", "cherry", "magic", "dream", "neon"],
      plural: ["hearts", "diamonds", "kisses", "summers", "sparks", "cherries", "dreams", "melodies", "stars", "lights", "sparkles", "magics"],
      first: ["Lila", "Bella", "Mia", "Zac", "Ava", "Cody", "Ruby", "Leo", "Nina", "Kai"],
      last: ["Star", "Rose", "Lane", "Cruz", "Belle", "West", "Skye", "Hart", "James", "Rey"]
    },
    "Hip-Hop": {
      adj: ["slick", "young", "heavy", "golden", "raw", "smooth", "icy", "sharp", "real", "prime", "fly", "bold"],
      noun: ["cipher", "block", "crown", "hustle", "flow", "diamond", "city", "legend", "rhythm", "gold", "empire", "mic"],
      plural: ["kings", "crowns", "hustlers", "legends", "mics", "diamonds", "blocks", "flows", "empires", "ciphers", "rhythms", "cities"],
      first: ["Kayo", "Dre", "Marlo", "Zay", "Rico", "Jayce", "Luda", "Vito", "Kaze", "Nino"],
      last: ["Reign", "Gold", "King", "Vault", "Marks", "Cruz", "Bolden", "Frost", "Stone", "Reigns"]
    },
    Jazz: {
      adj: ["blue", "mellow", "velvet", "midnight", "smoky", "gentle", "golden", "soft", "dusky", "cool", "amber", "late"],
      noun: ["harmony", "swing", "lantern", "note", "river", "velvet", "moon", "cafe", "rhythm", "breeze", "stride", "quartet"],
      plural: ["notes", "harmonies", "rivers", "lanterns", "strides", "breezes", "swings", "moons", "chords", "quarters", "cafes", "rhythms"],
      first: ["Miles", "Ella", "Louis", "Nina", "Duke", "Billie", "Theo", "Lena", "Oscar", "Alice"],
      last: ["Blue", "Note", "Rivers", "Vale", "Moon", "Cole", "Hart", "Lane", "Sway", "Bell"]
    },
    Metal: {
      adj: ["black", "iron", "raging", "crimson", "frozen", "hollow", "damned", "steel", "venom", "grim", "blazing", "eternal"],
      noun: ["furnace", "abyss", "hammer", "serpent", "throne", "storm", "blade", "raven", "tomb", "forge", "void", "crown"],
      plural: ["hammers", "serpents", "thrones", "blades", "ravens", "tombs", "forges", "crowns", "storms", "wolves", "abysses", "furnaces"],
      first: ["Varg", "Nyx", "Dante", "Rhea", "Kael", "Soren", "Raven", "Ash", "Bane", "Moros"],
      last: ["Black", "Iron", "Vane", "Thorne", "Grimm", "Ash", "Steel", "Crowe", "Void", "Blaze"]
    }
  };

  var STYLE_KEYS = Object.keys(BANKS);

  var els = {
    draw: document.getElementById("drawBtn"),
    reset: document.getElementById("resetBtn"),
    copy: document.getElementById("copyBtn"),
    clear: document.getElementById("clearBtn"),
    results: document.getElementById("results"),
    error: document.getElementById("errorBox"),
    count: document.getElementById("count"),
    kind: document.getElementById("kind"),
    keyword: document.getElementById("keyword"),
    repeat: document.getElementById("optRepeat"),
    statCount: document.getElementById("statCount"),
    statStyle: document.getElementById("statStyle"),
    statAvg: document.getElementById("statAvg"),
    statRuns: document.getElementById("statRuns"),
    historyNote: document.getElementById("historyNote"),
    chart: document.getElementById("styleChart"),
    caption: document.getElementById("chartCaption")
  };

  var state = { names: [], used: {}, batches: 0, total: 0 };

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function cap(word) { return word.charAt(0).toUpperCase() + word.slice(1); }

  function activeStyle() {
    var checked = document.querySelector('input[name="style"]:checked');
    var v = checked ? checked.value : "all";
    return v === "all" ? pick(STYLE_KEYS) : v;
  }

  function bankFor(style) { return BANKS[style]; }

  // Build one name. `custom` (a cleaned user word) replaces adjectives/nouns
  // and solo first names so it appears in every result.
  function buildName(bank, kind, custom) {
    var adj = custom || pick(bank.adj);
    var noun = custom || pick(bank.noun);
    var plural = pick(bank.plural);
    var first = custom ? cap(custom) : pick(bank.first);
    var last = pick(bank.last);

    var bandShapes = [
      function () { return "The " + cap(adj) + " " + cap(plural); },
      function () { return cap(adj) + " " + cap(noun); },
      function () { return cap(adj) + " " + cap(plural); },
      function () { return cap(noun) + " " + cap(plural); },
      function () { return "The " + cap(plural); },
      function () { return cap(noun) + " & the " + cap(plural); }
    ];
    var soloShapes = [
      function () { return cap(noun); },
      function () { return cap(adj); },
      function () { return first + " " + last; },
      function () { return first.charAt(0) + ". " + last; },
      function () { return cap(noun) + " " + last; },
      function () { return first; }
    ];

    var useBand = kind === "band" ? true : kind === "solo" ? false : Math.random() < 0.5;
    var shapes = useBand ? bandShapes : soloShapes;
    var name = pick(shapes)();
    return { name: name, kind: useBand ? "Band" : "Solo" };
  }

  function validate() {
    var raw = els.count.value.trim();
    var n = Number(raw);
    if (raw === "" || !isFinite(n)) return { error: "Enter how many names to generate (1 to 20)." };
    if (n < 1 || n > 20) return { error: "Please choose between 1 and 20 names." };
    if (Math.floor(n) !== n) return { error: "Use a whole number of names, from 1 to 20." };
    var kw = els.keyword.value.trim();
    if (kw && !/^[A-Za-z][A-Za-z '-]{0,23}$/.test(kw)) {
      return { error: "Your own word should use letters only, up to 24 characters." };
    }
    return { count: n, keyword: kw ? kw.toLowerCase().replace(/[^a-z]/g, "") : "" };
  }

  function showError(msg) {
    els.error.textContent = msg;
    els.error.classList.remove("d-none");
  }
  function clearError() {
    els.error.textContent = "";
    els.error.classList.add("d-none");
  }

  function generate() {
    var v = validate();
    if (v.error) { showError(v.error); return; }
    clearError();

    var style = activeStyle();
    var bank = bankFor(style);
    var kind = els.kind.value;
    var noRepeat = els.repeat.checked;
    var out = [];
    var guard = 0;

    while (out.length < v.count && guard < v.count * 40) {
      guard++;
      var made = buildName(bank, kind, v.keyword);
      if (noRepeat && state.used[made.name]) continue;
      state.used[made.name] = true;
      out.push(made);
    }

    state.names = out;
    state.batches++;
    state.total += out.length;
    render(out, style);
  }

  function render(names, style) {
    els.results.innerHTML = "";

    if (!names.length) {
      var empty = document.createElement("p");
      empty.className = "text-muted mb-0";
      empty.textContent = "No names were produced. Try a different style.";
      els.results.appendChild(empty);
    } else {
      names.forEach(function (item, i) {
        var card = document.createElement("div");
        card.className = "name-card";
        card.style.animationDelay = (i * 22) + "ms";

        var wave = document.createElement("div");
        wave.className = "wave";
        wave.setAttribute("aria-hidden", "true");
        wave.innerHTML = '<svg width="30" height="26" viewBox="0 0 30 26" fill="none">' +
          '<path d="M1 13h3l2-7 3 14 3-19 3 21 3-13 2 5 2-2h5" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        var body = document.createElement("div");
        body.className = "name-body";

        var text = document.createElement("p");
        text.className = "name-text";
        text.textContent = item.name;

        var meta = document.createElement("div");
        meta.className = "name-meta";
        meta.appendChild(pill(style, "pill-style"));
        meta.appendChild(pill(item.kind + " name", item.kind === "Band" ? "pill-kind-band" : "pill-kind-solo"));
        meta.appendChild(pill(item.name.length + " chars", "pill-len"));

        body.appendChild(text);
        body.appendChild(meta);

        var copyOne = document.createElement("button");
        copyOne.type = "button";
        copyOne.className = "btn btn-outline-brand btn-sm copy-one";
        copyOne.textContent = "Copy";
        copyOne.setAttribute("aria-label", "Copy name " + item.name);
        copyOne.addEventListener("click", function () { copyText(item.name, copyOne); });

        card.appendChild(wave);
        card.appendChild(body);
        card.appendChild(copyOne);
        els.results.appendChild(card);
      });
    }

    els.copy.disabled = !names.length;
    els.clear.disabled = !names.length;
    els.statCount.textContent = names.length || "\u2014";
    els.statStyle.textContent = style;
    var avg = names.length ? Math.round(names.reduce(function (s, n) { return s + n.name.length; }, 0) / names.length) : 0;
    els.statAvg.textContent = names.length ? avg : "\u2014";
    els.statRuns.textContent = state.batches;
    els.historyNote.textContent = "Names generated: " + state.total;

    drawChart(names);
  }

  function pill(label, cls) {
    var s = document.createElement("span");
    s.className = "pill " + cls;
    s.textContent = label;
    return s;
  }

  function copyText(value, btn) {
    var done = function () {
      if (!btn) return;
      var old = btn.textContent;
      btn.textContent = "Copied";
      setTimeout(function () { btn.textContent = old; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () { fallbackCopy(value, done); });
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    var ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
  }

  function drawChart(names) {
    var canvas = els.chart;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 820;
    var rows = names.length || 1;
    var rowH = 24;
    var cssHeight = rows * rowH + 26;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.height = cssHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.clearRect(0, 0, cssWidth, cssHeight);
    ctx.font = '13px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    ctx.textBaseline = "middle";

    if (!names.length) {
      ctx.fillStyle = "#6a6572";
      ctx.fillText("Generate names to see the length chart.", 10, 14);
      return;
    }

    var max = Math.max.apply(null, names.map(function (n) { return n.name.length; }));
    var labelW = Math.min(200, Math.max.apply(null, names.map(function (n) { return ctx.measureText(n.name).width; })) + 12);
    var barArea = cssWidth - labelW - 44;
    var gap = 4;
    var barH = rowH - gap - 4;

    names.forEach(function (item, i) {
      var y = i * rowH + 10;
      var w = Math.max(3, (item.name.length / max) * barArea);
      ctx.fillStyle = "#1d1a24";
      ctx.fillText(item.name, 4, y + barH / 2);
      ctx.fillStyle = item.kind === "Band" ? "#60089c" : "#0e7a8a";
      ctx.fillRect(labelW, y, w, barH);
      ctx.fillStyle = "#6a6572";
      ctx.fillText(String(item.name.length), labelW + w + 6, y + barH / 2);
    });
  }

  function reset() {
    state = { names: [], used: {}, batches: 0, total: 0 };
    els.count.value = "8";
    els.keyword.value = "";
    els.kind.value = "both";
    els.repeat.checked = true;
    document.getElementById("style-all").checked = true;
    clearError();
    els.results.innerHTML = '<p class="text-muted mb-0">Your names will appear here \u2014 press <strong>Generate names</strong> to start.</p>';
    els.statCount.textContent = "\u2014";
    els.statStyle.textContent = "\u2014";
    els.statAvg.textContent = "\u2014";
    els.statRuns.textContent = "\u2014";
    els.historyNote.textContent = "Names generated: 0";
    els.copy.disabled = true;
    els.clear.disabled = true;
    drawChart([]);
  }

  function clearResults() {
    state.names = [];
    els.results.innerHTML = '<p class="text-muted mb-0">Cleared. Press <strong>Generate names</strong> for a fresh batch.</p>';
    els.copy.disabled = true;
    els.clear.disabled = true;
    els.statCount.textContent = "\u2014";
    els.statAvg.textContent = "\u2014";
    drawChart([]);
  }

  els.draw.addEventListener("click", generate);
  els.reset.addEventListener("click", reset);
  els.clear.addEventListener("click", clearResults);
  els.copy.addEventListener("click", function () {
    if (state.names.length) copyText(state.names.map(function (n) { return n.name; }).join("\n"), els.copy);
  });
  els.count.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });
  els.keyword.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });

  reset();
})();
