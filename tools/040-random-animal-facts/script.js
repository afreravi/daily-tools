/* Random Animal Facts Generator — vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Fact pool. Each entry: animal, fact, group, difficulty.
   * ------------------------------------------------------------------ */
  var FACTS = [
    /* mammals */
    { animal: "Octopus", fact: "An octopus has three hearts and blue blood.", group: "sea", difficulty: "easy" },
    { animal: "Elephant", fact: "Elephants are the only mammals that cannot jump.", group: "mammal", difficulty: "easy" },
    { animal: "Cheetah", fact: "A cheetah can go from 0 to 100 km/h in about three seconds.", group: "mammal", difficulty: "easy" },
    { animal: "Blue whale", fact: "A blue whale's heart can weigh as much as a small car.", group: "mammal", difficulty: "easy" },
    { animal: "Bat", fact: "Bats are the only mammals capable of true sustained flight.", group: "mammal", difficulty: "easy" },
    { animal: "Giraffe", fact: "A giraffe has the same number of neck bones as a human: seven.", group: "mammal", difficulty: "easy" },
    { animal: "Kangaroo", fact: "A newborn kangaroo is about the size of a jelly bean.", group: "mammal", difficulty: "easy" },
    { animal: "Dolphin", fact: "Dolphins sleep with one half of their brain awake at a time.", group: "sea", difficulty: "easy" },
    { animal: "Polar bear", fact: "Polar bear skin is black under translucent fur; the fur only looks white.", group: "mammal", difficulty: "hard" },
    { animal: "Sloth", fact: "A sloth can take up to a month to digest a single meal.", group: "mammal", difficulty: "easy" },
    { animal: "Giant anteater", fact: "A giant anteater has no teeth and a two-foot-long tongue.", group: "mammal", difficulty: "hard" },
    { animal: "Honey badger", fact: "Honey badgers have skin so loose that they can twist inside it to bite an attacker.", group: "mammal", difficulty: "hard" },
    { animal: "Naked mole-rat", fact: "Naked mole-rats barely age and are highly resistant to cancer.", group: "mammal", difficulty: "hard" },
    { animal: "Prairie dog", fact: "Prairie dogs greet each other with what researchers call a 'jump-yip'.", group: "mammal", difficulty: "hard" },
    { animal: "Hippopotamus", fact: "A hippo can hold its breath for about five minutes and sleeps underwater.", group: "mammal", difficulty: "easy" },
    { animal: "Moose", fact: "A moose can dive more than five metres underwater to feed.", group: "mammal", difficulty: "hard" },
    { animal: "Tiger", fact: "No two tigers have the same stripe pattern; the stripes are on the skin too.", group: "mammal", difficulty: "easy" },
    { animal: "Armadillo", fact: "The nine-banded armadillo always gives birth to identical quadruplets.", group: "mammal", difficulty: "hard" },
    { animal: "Raccoon", fact: "Raccoons can remember solutions to tasks for years and pass them on.", group: "mammal", difficulty: "hard" },
    { animal: "Wombat", fact: "A wombat produces cube-shaped droppings that do not roll away.", group: "mammal", difficulty: "hard" },

    /* birds */
    { animal: "Flamingo", fact: "A group of flamingos is called a flamboyance.", group: "bird", difficulty: "easy" },
    { animal: "Hummingbird", fact: "A hummingbird can flap its wings around 80 times per second.", group: "bird", difficulty: "easy" },
    { animal: "Penguin", fact: "Emperor penguins can dive deeper than 500 metres.", group: "bird", difficulty: "hard" },
    { animal: "Owl", fact: "Owls have three eyelids and cannot move their eyeballs.", group: "bird", difficulty: "easy" },
    { animal: "Woodpecker", fact: "A woodpecker's tongue wraps around the back of its skull.", group: "bird", difficulty: "hard" },
    { animal: "Bar-tailed godwit", fact: "A bar-tailed godwit once flew non-stop for eleven days across the Pacific.", group: "bird", difficulty: "hard" },
    { animal: "Raven", fact: "Ravens can plan for the future and recognise individual human faces.", group: "bird", difficulty: "hard" },
    { animal: "Peregrine falcon", fact: "A diving peregrine falcon is the fastest animal on Earth, over 380 km/h.", group: "bird", difficulty: "hard" },
    { animal: "Ostrich", fact: "An ostrich eye is bigger than its brain.", group: "bird", difficulty: "easy" },
    { animal: "Parrot", fact: "Some parrots can learn hundreds of words and use them in context.", group: "bird", difficulty: "easy" },
    { animal: "Duck", fact: "Ducklings can swim and feed themselves within a day of hatching.", group: "bird", difficulty: "easy" },
    { animal: "Chicken", fact: "Chickens have full colour vision and can see more colours than humans.", group: "bird", difficulty: "hard" },
    { animal: "Albatross", fact: "An albatross can sleep while flying, using a technique called unihemispheric sleep.", group: "bird", difficulty: "hard" },
    { animal: "Toucan", fact: "A toucan's bill is one-third of its total length but very light.", group: "bird", difficulty: "easy" },
    { animal: "Crow", fact: "Crows can solve multi-step puzzles and remember who treated them badly.", group: "bird", difficulty: "easy" },

    /* reptiles & amphibians */
    { animal: "Crocodile", fact: "Crocodiles cannot chew, so they swallow stones to help grind food.", group: "reptile", difficulty: "hard" },
    { animal: "Wood frog", fact: "A wood frog can freeze solid in winter and thaw alive in spring.", group: "reptile", difficulty: "hard" },
    { animal: "Chameleon", fact: "A chameleon's tongue can be twice the length of its body.", group: "reptile", difficulty: "easy" },
    { animal: "Tuatara", fact: "The tuatara has a third eye on top of its head.", group: "reptile", difficulty: "hard" },
    { animal: "Snake", fact: "Some snakes can go months between meals by slowing their metabolism.", group: "reptile", difficulty: "easy" },
    { animal: "Axolotl", fact: "An axolotl can regrow a lost limb, and even parts of its brain.", group: "reptile", difficulty: "hard" },
    { animal: "Sea turtle", fact: "Sea turtles return to the beach where they hatched to lay their own eggs.", group: "reptile", difficulty: "easy" },
    { animal: "Gecko", fact: "A gecko's feet stick using molecular forces, not suction or glue.", group: "reptile", difficulty: "hard" },
    { animal: "Frog", fact: "A frog absorbs water through its skin and never needs to drink.", group: "reptile", difficulty: "easy" },
    { animal: "Komodo dragon", fact: "A Komodo dragon can detect carrion up to several kilometres away.", group: "reptile", difficulty: "hard" },
    { animal: "Tortoise", fact: "Some tortoises live well past 150 years.", group: "reptile", difficulty: "easy" },
    { animal: "Cane toad", fact: "A cane toad can squirt poison from glands behind its eyes.", group: "reptile", difficulty: "hard" },
    { animal: "Salamander", fact: "Some salamanders breathe entirely through their skin.", group: "reptile", difficulty: "easy" },
    { animal: "Alligator", fact: "Alligators have one of the strongest bite forces ever measured in a living animal.", group: "reptile", difficulty: "hard" },

    /* sea creatures */
    { animal: "Pistol shrimp", fact: "A pistol shrimp snaps its claw hard enough to stun prey with a sound louder than a jet engine.", group: "sea", difficulty: "hard" },
    { animal: "Immortal jellyfish", fact: "The immortal jellyfish can revert to its juvenile form and begin its life again.", group: "sea", difficulty: "hard" },
    { animal: "Shark", fact: "Sharks existed before trees did.", group: "sea", difficulty: "easy" },
    { animal: "Sea otter", fact: "Sea otters hold hands while sleeping so they do not drift apart.", group: "sea", difficulty: "easy" },
    { animal: "Clownfish", fact: "All clownfish are born male, and the largest one changes into a female.", group: "sea", difficulty: "hard" },
    { animal: "Starfish", fact: "A starfish can regrow an entire arm, and sometimes a whole body from one arm.", group: "sea", difficulty: "easy" },
    { animal: "Narwhal", fact: "A narwhal's tusk is actually a spiral tooth packed with nerve endings.", group: "sea", difficulty: "hard" },
    { animal: "Mantis shrimp", fact: "A mantis shrimp can punch with the speed of a bullet and see 16 colour types.", group: "sea", difficulty: "hard" },
    { animal: "Anglerfish", fact: "The male anglerfish fuses permanently onto the female's body.", group: "sea", difficulty: "hard" },
    { animal: "Jellyfish", fact: "Jellyfish have no brain, heart or bones and are about 95% water.", group: "sea", difficulty: "easy" },
    { animal: "Sea cucumber", fact: "Some sea cucumbers breathe through their rear end.", group: "sea", difficulty: "hard" },
    { animal: "Lobster", fact: "A lobster's teeth are inside its stomach.", group: "sea", difficulty: "easy" },
    { animal: "Whale shark", fact: "A whale shark is the largest fish in the world and eats only plankton.", group: "sea", difficulty: "easy" },
    { animal: "Cuttlefish", fact: "A cuttlefish can change its skin colour and texture in under a second.", group: "sea", difficulty: "hard" },

    /* insects & arachnids */
    { animal: "Dung beetle", fact: "A dung beetle can pull more than 1,000 times its own body weight.", group: "insect", difficulty: "hard" },
    { animal: "Honeybee", fact: "A honeybee visits up to 100 flowers in a single trip.", group: "insect", difficulty: "easy" },
    { animal: "Ant", fact: "An ant can lift 50 times its own body weight.", group: "insect", difficulty: "easy" },
    { animal: "Butterfly", fact: "Butterflies taste with their feet.", group: "insect", difficulty: "easy" },
    { animal: "Dragonfly", fact: "A dragonfly can fly backwards and hover like a helicopter.", group: "insect", difficulty: "easy" },
    { animal: "Spider", fact: "Spider silk is stronger by weight than steel.", group: "insect", difficulty: "easy" },
    { animal: "Jumping spider", fact: "A jumping spider can see almost 360 degrees and pounce on prey.", group: "insect", difficulty: "hard" },
    { animal: "Cicada", fact: "Some cicadas spend 17 years underground before emerging for a few weeks.", group: "insect", difficulty: "hard" },
    { animal: "Praying mantis", fact: "A praying mantis is the only insect that can turn its head to look over its shoulder.", group: "insect", difficulty: "hard" },
    { animal: "Firefly", fact: "Fireflies produce light without heat, a process called bioluminescence.", group: "insect", difficulty: "easy" },
    { animal: "Termite", fact: "Termite mounds have built-in ventilation that keeps them at a steady temperature.", group: "insect", difficulty: "hard" },
    { animal: "Bumblebee", fact: "A bumblebee can fly in the cold because it shivers its muscles to warm up.", group: "insect", difficulty: "hard" },
    { animal: "Tarantula", fact: "A tarantula can regrow a lost leg when it next moults.", group: "insect", difficulty: "hard" },
    { animal: "Monarch butterfly", fact: "Monarch butterflies migrate thousands of kilometres to a forest they have never seen.", group: "insect", difficulty: "hard" },
    { animal: "Mosquito", fact: "Only female mosquitoes bite; they need blood to develop their eggs.", group: "insect", difficulty: "easy" }
  ];

  var GROUP_LABELS = {
    mammal: "Mammals",
    bird: "Birds",
    reptile: "Reptiles & amphibians",
    sea: "Sea creatures",
    insect: "Insects & arachnids"
  };

  var GROUP_COLORS = {
    mammal: "#60089c",
    bird: "#8a3fc0",
    reptile: "#0e7c66",
    sea: "#0e7490",
    insect: "#b45309"
  };

  var el = {
    group: document.getElementById("groupSelect"),
    count: document.getElementById("countSelect"),
    difficulty: document.getElementById("difficultySelect"),
    noRepeat: document.getElementById("noRepeatToggle"),
    generate: document.getElementById("generateBtn"),
    clear: document.getElementById("clearBtn"),
    status: document.getElementById("statusLine"),
    empty: document.getElementById("emptyState"),
    list: document.getElementById("factList"),
    summary: document.getElementById("summaryWrap"),
    mixChart: document.getElementById("mixChart"),
    spotlight: document.getElementById("spotlightText"),
    copy: document.getElementById("copyBtn"),
    download: document.getElementById("downloadBtn"),
    copyStatus: document.getElementById("copyStatus")
  };

  var current = [];
  var seen = {}; /* index -> true, used for no-repeat mode */

  function pool() {
    var g = el.group.value;
    var d = el.difficulty.value;
    return FACTS.filter(function (f) {
      if (g !== "any" && f.group !== g) return false;
      if (d !== "any" && f.difficulty !== d) return false;
      return true;
    });
  }

  function pick(items, howMany, avoidRepeats) {
    var available = items.filter(function (f) {
      return !avoidRepeats || !seen[FACTS.indexOf(f)];
    });
    if (available.length === 0) {
      /* fall back to the full pool when everything has been seen */
      available = items.slice();
      if (avoidRepeats) { seen = {}; }
    }
    var picked = [];
    var working = available.slice();
    var n = Math.min(howMany, working.length);
    for (var i = 0; i < n; i++) {
      var idx = Math.floor(Math.random() * working.length);
      picked.push(working.splice(idx, 1)[0]);
    }
    return picked;
  }

  function render() {
    if (current.length === 0) {
      el.empty.classList.remove("d-none");
      el.list.innerHTML = "";
      el.summary.classList.add("d-none");
      return;
    }
    el.empty.classList.add("d-none");
    el.summary.classList.remove("d-none");

    var html = "";
    current.forEach(function (f) {
      var diffClass = f.difficulty === "easy" ? "tag-easy" : "tag-hard";
      var diffLabel = f.difficulty === "easy" ? "Kid friendly" : "Trivia hard";
      html += '<li class="fact-item">' +
        '<div class="d-flex justify-content-between align-items-start mb-1">' +
        '<span class="animal-name">' + escapeHtml(f.animal) + '</span>' +
        '<span class="tag ' + diffClass + '">' + diffLabel + '</span>' +
        '</div>' +
        '<p class="fact-text mb-1">' + escapeHtml(f.fact) + '</p>' +
        '<span class="tag">' + escapeHtml(GROUP_LABELS[f.group] || f.group) + '</span>' +
        '</li>';
    });
    el.list.innerHTML = html;

    var highlight = current[Math.floor(Math.random() * current.length)];
    el.spotlight.textContent = highlight.animal + ": " + highlight.fact;

    drawMixChart();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function drawMixChart() {
    var canvas = el.mixChart;
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 400;
    var cssH = 220;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var counts = {};
    current.forEach(function (f) { counts[f.group] = (counts[f.group] || 0) + 1; });
    var keys = Object.keys(counts);
    if (keys.length === 0) return;

    var padLeft = 120, padRight = 20, padTop = 14, padBottom = 14;
    var maxVal = Math.max.apply(null, keys.map(function (k) { return counts[k]; }));
    var rowH = (cssH - padTop - padBottom) / keys.length;
    var barH = Math.min(26, rowH * 0.6);
    var maxBarW = cssW - padLeft - padRight;

    ctx.font = "12px 'Segoe UI', Arial, sans-serif";
    ctx.textBaseline = "middle";

    keys.forEach(function (k, i) {
      var y = padTop + i * rowH + rowH / 2;
      var w = maxVal > 0 ? (counts[k] / maxVal) * maxBarW : 0;

      ctx.fillStyle = "#6b6277";
      ctx.textAlign = "right";
      ctx.fillText(GROUP_LABELS[k] || k, padLeft - 10, y);

      ctx.fillStyle = "#f0eaf7";
      roundRect(ctx, padLeft, y - barH / 2, maxBarW, barH, 4);
      ctx.fill();

      ctx.fillStyle = GROUP_COLORS[k] || "#60089c";
      roundRect(ctx, padLeft, y - barH / 2, w, barH, 4);
      ctx.fill();

      ctx.fillStyle = "#241a2e";
      ctx.textAlign = "left";
      ctx.fillText(String(counts[k]), padLeft + w + 6, y);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    if (w < r * 2) r = w / 2;
    if (h < r * 2) r = h / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function generate() {
    var items = pool();
    if (items.length === 0) {
      el.status.textContent = "No facts match that combination. Try a different group or difficulty.";
      return;
    }
    var howMany = parseInt(el.count.value, 10) || 3;
    var avoidRepeat = el.noRepeat.checked;
    var picked = pick(items, howMany, avoidRepeat);
    if (avoidRepeat) {
      picked.forEach(function (f) { seen[FACTS.indexOf(f)] = true; });
    }
    current = picked;
    render();
    el.status.textContent = "Generated " + picked.length + " fact" + (picked.length === 1 ? "" : "s") +
      " from " + (el.group.value === "any" ? "all groups" : GROUP_LABELS[el.group.value]) +
      (el.difficulty.value === "any" ? "." : " (" + el.difficulty.value + ").");
    el.copyStatus.textContent = "";
  }

  function clearAll() {
    current = [];
    seen = {};
    render();
    el.status.textContent = "Cleared. Press Generate facts to roll a new set.";
    el.copyStatus.textContent = "";
  }

  function copyFacts() {
    if (current.length === 0) {
      el.copyStatus.textContent = "Generate some facts first.";
      return;
    }
    var text = current.map(function (f, i) {
      return (i + 1) + ". " + f.animal + " — " + f.fact;
    }).join("\n");
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        el.copyStatus.textContent = "Copied " + current.length + " fact(s) to your clipboard.";
      }).catch(function () {
        el.copyStatus.textContent = "Copy failed — select the text and copy manually.";
      });
    } else {
      el.copyStatus.textContent = "Copy is not supported in this browser — select the text and copy manually.";
    }
  }

  function downloadFacts() {
    if (current.length === 0) {
      el.copyStatus.textContent = "Generate some facts first.";
      return;
    }
    var text = "Random Animal Facts\n\n" + current.map(function (f, i) {
      return (i + 1) + ". " + f.animal + " — " + f.fact;
    }).join("\n") + "\n";
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "animal-facts.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    el.copyStatus.textContent = "Downloaded animal-facts.txt";
  }

  el.generate.addEventListener("click", generate);
  el.clear.addEventListener("click", clearAll);
  el.copy.addEventListener("click", copyFacts);
  el.download.addEventListener("click", downloadFacts);
  window.addEventListener("resize", function () {
    if (current.length) drawMixChart();
  });

  render();
})();
