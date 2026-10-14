/* Random Anime Character Generator — vanilla JS, no build step */
(function () {
  "use strict";

  /* ------------------------------------------------------------------ *
   * Data pools
   * ------------------------------------------------------------------ */
  var NAMES = {
    feminine: ["Aiko", "Yuki", "Sakura", "Hina", "Mio", "Kaguya", "Nanami", "Ayame",
      "Kotone", "Hikari", "Akari", "Yuna", "Tsubaki", "Emi", "Chiaki", "Sumire",
      "Kaede", "Momo", "Rin", "Nozomi"],
    masculine: ["Ren", "Haruto", "Kaito", "Daiki", "Ryu", "Takumi", "Hiro", "Kenji",
      "Sota", "Yuto", "Riku", "Tatsuya", "Sho", "Kenta", "Akira", "Kazuki",
      "Minoru", "Ryo", "Jin", "Daichi"],
    neutral: ["Sora", "Aoi", "Hikaru", "Nao", "Kaoru", "Makoto", "Chihiro", "Ruka",
      "Nagi", "Tsubasa", "Yuzu", "Mizuki", "Rui", "Kiri", "Akane", "Hinata"]
  };

  var FAMILY = ["Tanaka", "Sato", "Suzuki", "Takahashi", "Watanabe", "Ito", "Yamamoto",
    "Nakamura", "Kobayashi", "Kato", "Yoshida", "Yamada", "Sasaki", "Matsumoto",
    "Inoue", "Kimura", "Hayashi", "Shimizu", "Mori", "Abe", "Ishikawa", "Ogawa",
    "Goto", "Okada", "Hasegawa", "Murakami", "Kondo", "Sakamoto", "Endo", "Fujita"];

  var MOVE_PREFIX = ["Crimson", "Azure", "Silent", "Blazing", "Frozen", "Thunder",
    "Void", "Radiant", "Obsidian", "Howling", "Golden", "Iron"];
  var MOVE_CORE = ["Comet Strike", "Dragon Fang", "Lotus Dance", "Iron Verdict",
    "Sky Splitter", "Heart Break", "Gale Step", "Sun Burst", "Moon Cut",
    "Storm Requiem", "Phantom Edge", "Star Fall"];

  var WEAPONS = ["Katana", "Nodachi", "Twin daggers", "Folding bow", "War fan", "Spear",
    "Gauntlets", "Scythe", "Chakram", "Staff", "Grimoire", "Rapier", "Chain whip",
    "Halberd", "Kunai", "Claymore", "Plasma blade", "Tower shield", "Talisman cards",
    "Ocarina", "Parasol", "Ribbon", "Mechanical arm", "Bare fists", "War hammer"];

  var CATCHPHRASES = {
    heroic: ["I will not let this end here.", "Stand behind me.", "One more step, together.",
      "Hope is a choice I make every day."],
    mysterious: ["You already know the answer.", "The wind told me you would come.",
      "Some doors open only once.", "Ask me again when it rains."],
    comedic: ["That was not in the plan, but okay!", "I'm ninety percent sure this works.",
      "Snacks first, destiny later.", "I have a plan. It is mostly running."],
    tragic: ["I already saw how this ends.", "There was never another way.",
      "Remember me as I was, not as I am.", "I traded everything and got this."],
    cool: ["Tch. Move.", "Predictable.", "I don't need a reason.",
      "That was your only chance."]
  };

  var WANTS = ["to avenge a fallen mentor", "to find a missing sibling",
    "to prove the family name wrong", "to protect a village that no longer trusts them",
    "to break a curse they were born under", "to win a contest that decides their future",
    "to repay a debt that was never theirs", "to outrun a prophecy",
    "to rebuild a school that burned down", "to free a friend from a binding oath"];

  var WOUNDS = ["a failed rescue still haunts them", "their power once hurt someone they loved",
    "they were raised as a weapon, not a child", "a promise they broke keeps them awake",
    "they survived when their squad did not", "a rival took everything and smiled doing it",
    "they were betrayed by the person they trusted most", "their name belongs to someone else"];

  var GENRE_LABEL = {
    shonen: "Shonen", shojo: "Shojo", isekai: "Isekai", scifi: "Sci-fi",
    slice: "Slice of life", villain: "Villain"
  };
  var VIBE_LABEL = {
    heroic: "Heroic", mysterious: "Mysterious", comedic: "Comedic",
    tragic: "Tragic", cool: "Cool"
  };

  var POOLS = {
    shonen: {
      archetype: ["Hot-blooded protagonist", "Rival turned ally", "Prodigy with a chip on the shoulder",
        "Mentor who fights dirty", "Loyal best friend", "Tournament underdog"],
      power: ["Flame Fist", "Thunder Step", "Iron Body", "Wind Blade", "Explosive Palm",
        "Beast Instinct", "Gravity Crush", "Sound Pulse", "Lightning Dash", "Steel Skin"],
      age: [14, 19]
    },
    shojo: {
      archetype: ["Quiet romantic lead", "Headstrong heiress", "Childhood friend",
        "Transfer student with a secret", "Rival for affection", "Club president with a crush"],
      power: ["Empathic Aura", "Bloom Touch", "Mirror Glamour", "Heartbeat Sense",
        "Rose Vines", "Dream Whisper", "Ribbon Bind", "Starlight Veil"],
      age: [15, 18]
    },
    isekai: {
      archetype: ["Summoned hero", "Reincarnated artisan", "Fallen noble", "Beast-kin scout",
        "Guild adventurer", "Wandering sage"],
      power: ["Summon Grimoire", "Cheat Skill: Appraisal", "Spirit Pact", "Rune Craft",
        "Dungeon Sense", "Holy Barrier", "Beast Tamer Bond", "Teleport Gate"],
      age: [16, 30]
    },
    scifi: {
      archetype: ["Ace pilot", "Rogue AI sympathiser", "Street samurai", "Ship engineer",
        "Bounty hunter", "Cyber-medic"],
      power: ["Plasma Rail", "Neural Hacking", "Nanite Armour", "Drone Swarm", "Phase Shift",
        "Ion Shield", "Cyber Reflex", "Gravity Engine"],
      age: [20, 40]
    },
    slice: {
      archetype: ["Club president", "Transfer student", "Part-time baker", "Class clown",
        "Studious loner", "Neighbourhood meddler"],
      power: ["Perfect Recall", "Baking Alchemy", "Charisma Field", "Lucky Timing",
        "Calm Presence", "Pocket Tidying", "Pet Whispering", "Homework Telepathy"],
      age: [15, 18]
    },
    villain: {
      archetype: ["Masked antagonist", "Charismatic mastermind", "Reluctant enforcer",
        "Corrupted hero", "Cult leader", "Rival with a grudge"],
      power: ["Shadow Devour", "Fear Aura", "Blood Contract", "Void Chains", "Puppet Strings",
        "Mirror Curse", "Soul Siphon", "Ashen Crown"],
      age: [25, 60]
    }
  };

  var GENRES = Object.keys(POOLS);
  var VIBES = Object.keys(CATCHPHRASES);
  var NAME_STYLES = Object.keys(NAMES);

  /* Build cross-pollinated unions for the "Any genre" option. */
  var ALL = (function () {
    var out = { archetype: [], power: [] };
    GENRES.forEach(function (g) {
      out.archetype = out.archetype.concat(POOLS[g].archetype);
      out.power = out.power.concat(POOLS[g].power);
    });
    return out;
  })();

  /* ------------------------------------------------------------------ *
   * Helpers
   * ------------------------------------------------------------------ */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function poolFor(key, genre) {
    return genre === "any" ? ALL[key] : POOLS[genre][key];
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* ------------------------------------------------------------------ *
   * Character generation
   * ------------------------------------------------------------------ */
  var rolledCount = 0;
  var current = null;
  var shortlist = [];

  function buildCharacter(genreSel, vibeSel, styleSel) {
    var genre = genreSel === "any" ? pick(GENRES) : genreSel;
    var vibe = vibeSel === "any" ? pick(VIBES) : vibeSel;
    var style = styleSel === "any" ? pick(NAME_STYLES) : styleSel;

    var name = pick(NAMES[style]) + " " + pick(FAMILY);
    var archetype = pick(poolFor("archetype", genreSel));
    var power = pick(poolFor("power", genreSel));
    var move = pick(MOVE_PREFIX) + " " + pick(MOVE_CORE);
    var weapon = pick(WEAPONS);
    var catchphrase = pick(CATCHPHRASES[vibe]);

    var band = genreSel === "any" ? POOLS[pick(GENRES)].age : POOLS[genreSel].age;
    var age = randInt(band[0], band[1]);

    var bio = "They fight " + pick(WANTS) + ", though " + pick(WOUNDS) +
      ". Where those two pull against each other is where the story starts.";

    var stats = rollStats();

    return {
      genre: genre, genreLabel: GENRE_LABEL[genre] || cap(genre),
      vibe: vibe, vibeLabel: VIBE_LABEL[vibe] || cap(vibe),
      style: style, name: name, age: age, archetype: archetype, power: power,
      move: move, weapon: weapon, catchphrase: catchphrase, bio: bio, stats: stats,
      tagline: archetype + " with " + power.toLowerCase() + " and a " + weapon.toLowerCase()
    };
  }

  var STAT_KEYS = [
    { key: "power", label: "Power" },
    { key: "speed", label: "Speed" },
    { key: "technique", label: "Technique" },
    { key: "wisdom", label: "Wisdom" },
    { key: "charisma", label: "Charisma" }
  ];

  function rollStats() {
    var stats = {};
    STAT_KEYS.forEach(function (s) { stats[s.key] = randInt(35, 92); });

    /* Force one standout and one weak spot so the profile reads clearly. */
    var keys = STAT_KEYS.map(function (s) { return s.key; });
    var high = pick(keys);
    var low = pick(keys.filter(function (k) { return k !== high; }));
    stats[high] = randInt(93, 99);
    stats[low] = randInt(18, 34);
    return stats;
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */
  var el = {
    genre: document.getElementById("genreSelect"),
    vibe: document.getElementById("vibeSelect"),
    style: document.getElementById("genderSelect"),
    generate: document.getElementById("generateBtn"),
    save: document.getElementById("saveBtn"),
    count: document.getElementById("countBadge"),
    error: document.getElementById("formError"),
    resultCard: document.getElementById("resultCard"),
    listCard: document.getElementById("listCard"),
    list: document.getElementById("shortlist"),
    clear: document.getElementById("clearBtn"),
    copy: document.getElementById("copyBtn"),
    portrait: document.getElementById("portrait"),
    portraitCaption: document.getElementById("portraitCaption"),
    genreTag: document.getElementById("genreTag"),
    vibeTag: document.getElementById("vibeTag"),
    name: document.getElementById("charName"),
    tagline: document.getElementById("charTagline"),
    age: document.getElementById("charAge"),
    archetype: document.getElementById("charArchetype"),
    power: document.getElementById("charPower"),
    move: document.getElementById("charMove"),
    weapon: document.getElementById("charWeapon"),
    catch: document.getElementById("charCatch"),
    bio: document.getElementById("charBio"),
    tableBody: document.getElementById("statTableBody"),
    chart: document.getElementById("statChart")
  };

  function showError(msg) {
    el.error.textContent = msg;
    el.error.classList.remove("d-none");
  }

  function clearError() {
    el.error.textContent = "";
    el.error.classList.add("d-none");
  }

  function initials(name) {
    var parts = name.split(" ");
    return (parts[0].charAt(0) + (parts[1] ? parts[1].charAt(0) : "")).toUpperCase();
  }

  function render(ch) {
    el.genreTag.textContent = ch.genreLabel;
    el.vibeTag.textContent = ch.vibeLabel;
    el.name.textContent = ch.name;
    el.tagline.textContent = ch.tagline;
    el.age.textContent = ch.age;
    el.archetype.textContent = ch.archetype;
    el.power.textContent = ch.power;
    el.move.textContent = ch.move;
    el.weapon.textContent = ch.weapon;
    el.catch.textContent = "\u201C" + ch.catchphrase + "\u201D";
    el.bio.textContent = ch.bio;
    el.portrait.textContent = initials(ch.name);
    el.portraitCaption.textContent = ch.name + " \u00B7 " + ch.genreLabel;

    el.tableBody.innerHTML = "";
    STAT_KEYS.forEach(function (s) {
      var tr = document.createElement("tr");
      var th = document.createElement("th");
      th.setAttribute("scope", "row");
      th.textContent = s.label;
      var td = document.createElement("td");
      td.textContent = ch.stats[s.key] + " / 100";
      tr.appendChild(th);
      tr.appendChild(td);
      el.tableBody.appendChild(tr);
    });

    drawChart(ch.stats);

    el.resultCard.classList.remove("d-none");
    el.save.disabled = false;
  }

  /* ------------------------------------------------------------------ *
   * Bar chart (canvas)
   * ------------------------------------------------------------------ */
  function drawChart(stats) {
    var canvas = el.chart;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 420;
    var cssH = 240;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    var W = cssW, H = cssH;
    var padTop = 18, padBottom = 34, padLeft = 8, padRight = 8;
    var plotH = H - padTop - padBottom;
    var plotW = W - padLeft - padRight;

    ctx.clearRect(0, 0, W, H);

    /* baseline */
    ctx.strokeStyle = "#e4dcf0";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + plotH);
    ctx.lineTo(W - padRight, padTop + plotH);
    ctx.stroke();

    var n = STAT_KEYS.length;
    var gap = 14;
    var barW = (plotW - gap * (n - 1)) / n;

    STAT_KEYS.forEach(function (s, i) {
      var v = stats[s.key];
      var h = Math.max(4, (v / 100) * plotH);
      var x = padLeft + i * (barW + gap);
      var y = padTop + plotH - h;

      var grad = ctx.createLinearGradient(0, y, 0, padTop + plotH);
      grad.addColorStop(0, "#8a3fc0");
      grad.addColorStop(1, "#60089c");

      ctx.fillStyle = grad;
      roundRect(ctx, x, y, barW, h, 6);
      ctx.fill();

      /* value */
      ctx.fillStyle = "#46006f";
      ctx.font = "600 12px 'Segoe UI', Roboto, Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(String(v), x + barW / 2, y - 5);

      /* label */
      ctx.fillStyle = "#6b6277";
      ctx.font = "12px 'Segoe UI', Roboto, Arial, sans-serif";
      ctx.fillText(s.label, x + barW / 2, padTop + plotH + 20);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------ *
   * Shortlist
   * ------------------------------------------------------------------ */
  function renderShortlist() {
    el.list.innerHTML = "";
    if (!shortlist.length) {
      el.listCard.classList.add("d-none");
      return;
    }
    el.listCard.classList.remove("d-none");
    shortlist.forEach(function (ch, i) {
      var li = document.createElement("li");
      li.className = "list-group-item";

      var left = document.createElement("span");
      var name = document.createElement("span");
      name.className = "name";
      name.textContent = ch.name;
      var meta = document.createElement("span");
      meta.className = "meta ml-2";
      meta.textContent = ch.genreLabel + " \u00B7 " + ch.archetype + " \u00B7 age " + ch.age;
      left.appendChild(name);
      left.appendChild(meta);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-outline-danger";
      btn.textContent = "Remove";
      btn.setAttribute("aria-label", "Remove " + ch.name + " from shortlist");
      btn.addEventListener("click", function () {
        shortlist.splice(i, 1);
        renderShortlist();
      });

      li.appendChild(left);
      li.appendChild(btn);
      el.list.appendChild(li);
    });
  }

  /* ------------------------------------------------------------------ *
   * Copy as text
   * ------------------------------------------------------------------ */
  function characterToText(ch) {
    return [
      ch.name + " (" + ch.genreLabel + ", " + ch.vibeLabel + ")",
      "Age: " + ch.age,
      "Archetype: " + ch.archetype,
      "Power: " + ch.power,
      "Signature move: " + ch.move,
      "Weapon: " + ch.weapon,
      "Catchphrase: " + ch.catchphrase,
      "Bio: " + ch.bio,
      "Stats: " + STAT_KEYS.map(function (s) {
        return s.label + " " + ch.stats[s.key];
      }).join(", "),
      "\u2014 generated with the Random Anime Character Generator"
    ].join("\n");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        resolve();
      } catch (e) {
        reject(e);
      } finally {
        document.body.removeChild(ta);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Events
   * ------------------------------------------------------------------ */
  el.generate.addEventListener("click", function () {
    clearError();
    try {
      var ch = buildCharacter(el.genre.value, el.vibe.value, el.style.value);
      current = ch;
      rolledCount += 1;
      el.count.textContent = rolledCount + (rolledCount === 1 ? " character rolled" : " characters rolled");
      render(ch);
    } catch (e) {
      showError("Sorry, something went wrong while rolling a character. Please try again.");
    }
  });

  el.save.addEventListener("click", function () {
    if (!current) { return; }
    shortlist.push(current);
    renderShortlist();
    el.save.disabled = true;
    el.save.textContent = "Saved \u2713";
    window.setTimeout(function () { el.save.textContent = "Save to shortlist"; }, 1200);
  });

  el.clear.addEventListener("click", function () {
    shortlist = [];
    renderShortlist();
  });

  el.copy.addEventListener("click", function () {
    if (!current) { return; }
    copyText(characterToText(current)).then(function () {
      el.copy.textContent = "Copied \u2713";
      window.setTimeout(function () { el.copy.textContent = "Copy as text"; }, 1200);
    }).catch(function () {
      showError("Copy failed. You can select the text manually instead.");
    });
  });

  window.addEventListener("resize", function () {
    if (current) { drawChart(current.stats); }
  });

  /* First roll so the page never looks empty. */
  el.generate.click();
})();
