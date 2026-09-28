(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  var countEl = $("count");
  var allitEl = $("optAllit");
  var tagEl = $("optTag");
  var theEl = $("optThe");
  var genBtn = $("genBtn");
  var resetBtn = $("resetBtn");
  var errorBox = $("errorBox");
  var resultsEl = $("results");
  var copyAllBtn = $("copyAllBtn");
  var clearBtn = $("clearBtn");
  var shortlistNote = $("shortlistNote");
  var statCount = $("statCount");
  var statAvg = $("statAvg");
  var statMin = $("statMin");
  var statMax = $("statMax");
  var canvas = $("nameChart");
  var ctx = canvas.getContext("2d");

  var WORD_BANKS = {
    corporate: {
      adj: ["Apex", "Summit", "Vanguard", "Blue", "Iron", "North", "Prime", "Sterling", "Quantum", "Cobalt",
            "Onyx", "Bold", "Crest", "Delta", "Everest", "Falcon", "Granite", "Horizon", "Juniper", "Keystone",
            "Lumen", "Meridian", "Nexus", "Oak", "Pinnacle", "Quartz", "Ridge", "Silver", "Titan", "Unity",
            "Vertex", "West", "Zenith", "Bright", "Copper", "Amber", "Cinder", "Dune", "Ember", "Sterling"],
      noun: ["Partners", "Collective", "Group", "Alliance", "Advisors", "Associates", "Capital", "Labs", "Works",
             "Ventures", "Holdings", "Network", "Council", "Union", "Circle", "Guild", "Bureau", "Company",
             "Foundry", "Syndicate", "Coalition", "Consortium", "Chamber", "Enterprise", "Institute", "League",
             "Society", "Trust", "Partners", "Group"]
    },
    sports: {
      adj: ["Thunder", "Iron", "Rapid", "Fierce", "Savage", "Wild", "Blazing", "Crimson", "Golden", "Mighty",
            "Storm", "Lightning", "Turbo", "Bold", "Swift", "Raging", "Fearless", "Steel", "Fire", "Ice",
            "Shadow", "Vicious", "Flying", "Charging", "Roaring", "Silver", "Red", "Blue", "Green", "Black",
            "White", "Electric", "Atomic", "Cosmic", "Rebel", "Victor", "Champion", "Dynamo", "Nitro", "Rogue"],
      noun: ["Vipers", "Wolves", "Lions", "Tigers", "Bears", "Hawks", "Eagles", "Falcons", "Sharks", "Cobras",
             "Panthers", "Jaguars", "Mustangs", "Stallions", "Rams", "Bulls", "Rhinos", "Dragons", "Titans",
             "Warriors", "Gladiators", "Knights", "Crushers", "Strikers", "Blazers", "Comets", "Meteors",
             "Rockets", "Cyclones", "Tornadoes", "Mavericks", "Renegades", "Outlaws", "Bandits", "Raiders",
             "Spartans", "Vikings", "Samurai", "Bruisers", "Dodgers"]
    },
    funny: {
      adj: ["Soggy", "Sleepy", "Grumpy", "Clumsy", "Wobbly", "Salty", "Chunky", "Dizzy", "Fluffy", "Sassy",
            "Snoring", "Sneaky", "Wiggly", "Bouncy", "Pickled", "Toasted", "Buttered", "Noodle", "Pixel",
            "Turbo", "Mega", "Confused", "Bewildered", "Hungry", "Caffeinated", "Unhinged", "Mildly", "Extra",
            "Cranky", "Jelly", "Muffin", "Bagel", "Waffle", "Tofu", "Donut", "Burrito", "Spud", "Feral",
            "Slightly", "Reluctant"],
      noun: ["Waffles", "Noodles", "Penguins", "Sloths", "Pandas", "Goats", "Llamas", "Muffins", "Bagels",
             "Pickles", "Dumplings", "Potatoes", "Donuts", "Burritos", "Tacos", "Nuggets", "Meatballs",
             "Cupcakes", "Biscuits", "Crackers", "Turnips", "Gherkins", "Cabbages", "Sprouts", "Churros",
             "Pierogi", "Gyoza", "Wombats", "Narwhals", "Hedgehogs", "Capybaras", "Quokkas", "Pigeons", "Ducks",
             "Turkeys", "Bumblebees", "Squirrels", "Otters", "Platypuses", "Ferrets"]
    },
    fantasy: {
      adj: ["Obsidian", "Shadow", "Iron", "Silver", "Ancient", "Eternal", "Forgotten", "Hidden", "Rune",
            "Dragon", "Ember", "Frost", "Storm", "Moon", "Star", "Blood", "Bone", "Ash", "Thorn", "Raven",
            "Wolf", "Bear", "Stone", "Crystal", "Mystic", "Arcane", "Cursed", "Blessed", "Crimson", "Golden",
            "Midnight", "Silent", "Whispering", "Broken", "Rising", "Fallen", "Wandering", "Sacred", "Grim", "Wild"],
      noun: ["Wardens", "Sentinels", "Guardians", "Keepers", "Rangers", "Knights", "Mages", "Warlocks", "Druids",
             "Paladins", "Blades", "Shields", "Banners", "Riders", "Hunters", "Seekers", "Wanderers", "Exiles",
             "Nomads", "Revenants", "Specters", "Golems", "Griffins", "Wyverns", "Drakes", "Serpents",
             "Phoenixes", "Hydras", "Chimeras", "Legion", "Order", "Coven", "Circle", "Cabal", "Dynasty",
             "Empire", "Kingdom", "Realm", "Citadel", "Bastion"]
    },
    tech: {
      adj: ["Pixel", "Quantum", "Byte", "Cloud", "Data", "Cyber", "Neural", "Binary", "Silicon", "Logic",
            "Nano", "Hyper", "Turbo", "Vector", "Matrix", "Crypto", "Digital", "Agile", "Lean", "Smart",
            "Deep", "Rapid", "Blue", "Green", "Bright", "Sharp", "Clear", "Swift", "Open", "Core",
            "Alpha", "Beta", "Delta", "Prime", "Zero", "Infinite", "Atomic", "Virtual", "Reactive", "Adaptive"],
      noun: ["Forge", "Labs", "Works", "Systems", "Studios", "Collective", "Foundry", "Syndicate", "Guild",
             "Loop", "Stack", "Bytes", "Bits", "Nodes", "Circuits", "Chips", "Robots", "Droids", "Bots",
             "Engines", "Reactors", "Dynamics", "Analytics", "Robotics", "Solutions", "Ventures", "Partners",
             "Networks", "Grids", "Clusters", "Servers", "Cores", "Pixels", "Vectors", "Matrices", "Protocols",
             "Signals", "Coders", "Builders", "Circuits"]
    }
  };

  var TAGS = ["Squad", "Crew", "Club", "FC", "United", "Collective", "Alliance", "Society", "Union", "Team",
              "Posse", "Troop", "Division", "Syndicate", "Assembly", "Coalition", "Guild"];

  var currentNames = [];
  var shortlist = [];

  function unique(arr) {
    var seen = {}, out = [];
    for (var i = 0; i < arr.length; i++) {
      if (!seen[arr[i]]) { seen[arr[i]] = 1; out.push(arr[i]); }
    }
    return out;
  }

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function pick(arr) {
    return arr[randInt(arr.length)];
  }

  function firstLetter(word) {
    return word.charAt(0).toUpperCase();
  }

  function buildName(bank, opts) {
    var adj = pick(bank.adj);
    var noun;

    if (opts.allit) {
      var letter = firstLetter(adj);
      var matching = [];
      for (var i = 0; i < bank.noun.length; i++) {
        if (firstLetter(bank.noun[i]) === letter) matching.push(bank.noun[i]);
      }
      noun = matching.length ? pick(matching) : pick(bank.noun);
    } else {
      noun = pick(bank.noun);
    }

    var name = adj + " " + noun;
    if (opts.tag) name += " " + pick(TAGS);
    if (opts.the) name = "The " + name;
    return name;
  }

  function readOptions() {
    var raw = countEl.value;
    if (raw === "" || raw === null) return { error: "Enter how many names you would like to generate." };
    var n = Number(raw);
    if (isNaN(n)) return { error: "That does not look like a number. Please enter a whole number between 1 and 50." };
    if (n < 1) return { error: "Please ask for at least one name (1 to 50)." };
    if (n > 50) return { error: "That is more names than one batch can hold. Please choose 50 or fewer." };
    n = Math.floor(n);

    var category = "corporate";
    var radios = document.getElementsByName("category");
    for (var i = 0; i < radios.length; i++) {
      if (radios[i].checked) category = radios[i].value;
    }

    return {
      count: n,
      category: category,
      allit: allitEl.checked,
      tag: tagEl.checked,
      the: theEl.checked
    };
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
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function render(names) {
    if (!names.length) return;
    var html = "";
    for (var i = 0; i < names.length; i++) {
      var saved = shortlist.indexOf(names[i]) !== -1;
      html += '<div class="name-card' + (saved ? " is-saved" : "") + '">' +
                '<span class="name-text">' + esc(names[i]) + "</span>" +
                '<span class="name-actions">' +
                  '<button type="button" class="icon-btn js-copy" data-name="' + esc(names[i]) +
                    '" aria-label="Copy ' + esc(names[i]) + '">Copy</button>' +
                  '<button type="button" class="icon-btn js-save' + (saved ? " is-saved" : "") +
                    '" data-name="' + esc(names[i]) + '" aria-pressed="' + saved +
                    '" aria-label="Save ' + esc(names[i]) + ' to shortlist">' + (saved ? "\u2605" : "\u2606") +
                  "</button>" +
                "</span>" +
              "</div>";
    }
    resultsEl.innerHTML = html;
    copyAllBtn.disabled = false;
  }

  function updateStats(names) {
    if (!names.length) return;
    var total = 0, min = Infinity, max = 0;
    for (var i = 0; i < names.length; i++) {
      var len = names[i].length;
      total += len;
      if (len < min) min = len;
      if (len > max) max = len;
    }
    statCount.textContent = names.length;
    statAvg.textContent = Math.round(total / names.length);
    statMin.textContent = min;
    statMax.textContent = max;
  }

  function drawChart(names) {
    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 820;
    var cssHeight = 250;
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var bands = [
      { label: "1-10", lo: 1, hi: 10 },
      { label: "11-15", lo: 11, hi: 15 },
      { label: "16-20", lo: 16, hi: 20 },
      { label: "21-25", lo: 21, hi: 25 },
      { label: "26-30", lo: 26, hi: 30 },
      { label: "31+", lo: 31, hi: Infinity }
    ];
    var counts = [0, 0, 0, 0, 0, 0];
    for (var i = 0; i < names.length; i++) {
      var len = names[i].length;
      for (var b = 0; b < bands.length; b++) {
        if (len >= bands[b].lo && len <= bands[b].hi) { counts[b]++; break; }
      }
    }
    var maxCount = Math.max.apply(null, counts.concat([1]));

    var padL = 42, padR = 14, padT = 18, padB = 40;
    var plotW = cssWidth - padL - padR;
    var plotH = cssHeight - padT - padB;
    var slot = plotW / bands.length;
    var barW = Math.min(58, slot * 0.6);

    // axis
    ctx.strokeStyle = "#e8e2f0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + plotH);
    ctx.lineTo(padL + plotW, padT + plotH);
    ctx.stroke();

    // y labels
    ctx.fillStyle = "#6a6673";
    ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    var steps = Math.min(maxCount, 4);
    for (var s = 0; s <= steps; s++) {
      var val = Math.round((maxCount / steps) * s);
      var y = padT + plotH - (plotH * (val / maxCount));
      ctx.fillText(String(val), padL - 8, y);
    }

    // bars
    for (var k = 0; k < bands.length; k++) {
      var c = counts[k];
      var h = maxCount ? (plotH * (c / maxCount)) : 0;
      var x = padL + slot * k + (slot - barW) / 2;
      var yTop = padT + plotH - h;
      ctx.fillStyle = "#60089c";
      ctx.fillRect(x, yTop, barW, h);
      if (h > 0) {
        ctx.fillStyle = "#3f0568";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(String(c), x + barW / 2, yTop - 3);
      }
      ctx.fillStyle = "#3f0568";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = "11px -apple-system, Segoe UI, Roboto, Arial, sans-serif";
      ctx.fillText(bands[k].label, x + barW / 2, padT + plotH + 8);
    }
    ctx.fillStyle = "#6a6673";
    ctx.textAlign = "left";
    ctx.fillText("characters per name", padL, padT + plotH + 24);
  }

  function generate() {
    clearError();
    var opts = readOptions();
    if (opts.error) { showError(opts.error); return; }

    var bank = WORD_BANKS[opts.category] || WORD_BANKS.corporate;
    var names = [], attempts = 0, limit = opts.count * 25;

    while (names.length < opts.count && attempts < limit) {
      var candidate = buildName(bank, opts);
      if (names.indexOf(candidate) === -1) names.push(candidate);
      attempts++;
    }

    // If the pool is exhausted (few combos), allow repeats to reach the count.
    while (names.length < opts.count) {
      names.push(buildName(bank, opts));
    }

    currentNames = names;
    render(names);
    updateStats(names);
    drawChart(names);
    copyAllBtn.disabled = false;
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
    try { document.execCommand("copy"); } catch (e) { /* clipboard unavailable */ }
    document.body.removeChild(ta);
    done();
  }

  function flash(btn, label) {
    var original = btn.textContent;
    btn.textContent = label;
    btn.disabled = true;
    window.setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  }

  function updateShortlistNote() {
    shortlistNote.textContent = "Shortlist: " + shortlist.length + " saved";
    clearBtn.disabled = shortlist.length === 0;
  }

  resultsEl.addEventListener("click", function (e) {
    var target = e.target;
    if (!target.classList) return;
    var name = target.getAttribute("data-name");
    if (!name) return;

    if (target.classList.contains("js-copy")) {
      copyText(name, function () { flash(target, "Copied"); });
    } else if (target.classList.contains("js-save")) {
      var idx = shortlist.indexOf(name);
      if (idx === -1) { shortlist.push(name); } else { shortlist.splice(idx, 1); }
      target.classList.toggle("is-saved", idx === -1);
      target.textContent = idx === -1 ? "\u2605" : "\u2606";
      target.setAttribute("aria-pressed", idx === -1 ? "true" : "false");
      target.closest(".name-card").classList.toggle("is-saved", idx === -1);
      updateShortlistNote();
    }
  });

  copyAllBtn.addEventListener("click", function () {
    if (!currentNames.length) return;
    copyText(currentNames.join("\n"), function () { flash(copyAllBtn, "Copied all"); });
  });

  clearBtn.addEventListener("click", function () {
    shortlist = [];
    updateShortlistNote();
    if (currentNames.length) render(currentNames);
  });

  genBtn.addEventListener("click", generate);

  resetBtn.addEventListener("click", function () {
    countEl.value = 12;
    allitEl.checked = true;
    tagEl.checked = false;
    theEl.checked = false;
    $("cat-corporate").checked = true;
    clearError();
    currentNames = [];
    shortlist = [];
    resultsEl.innerHTML = '<p class="text-muted mb-0">Your team names will appear here &mdash; hit <strong>Generate names</strong> to start.</p>';
    statCount.textContent = "\u2014";
    statAvg.textContent = "\u2014";
    statMin.textContent = "\u2014";
    statMax.textContent = "\u2014";
    copyAllBtn.disabled = true;
    updateShortlistNote();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  countEl.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); generate(); }
  });

  window.addEventListener("resize", function () {
    if (currentNames.length) drawChart(currentNames);
  });

  updateShortlistNote();
  generate();
})();
