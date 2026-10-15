/* Quirk Generator — vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * Quirk pool. Each entry: text, hint (how to play it), tone, category.
   * ------------------------------------------------------------------ */
  var QUIRKS = [
    /* habit */
    { text: "Taps a spoon three times before the first bite", hint: "Show it at a shared meal; the third tap is always slightly harder.", tone: "charming", category: "habit" },
    { text: "Rewrites tomorrow's to-do list before going to bed, in pen", hint: "Let the list appear in a scene where nothing on it gets done.", tone: "stoic", category: "habit" },
    { text: "Walks the long way round to avoid one particular street", hint: "Have another character ask why; never answer in the same scene.", tone: "dark", category: "habit" },
    { text: "Alphabetises the spice rack, then uses it out of order", hint: "Use as evidence of control slipping, not of neatness.", tone: "nerdy", category: "habit" },
    { text: "Keeps every cinema ticket, sorted by seat number", hint: "The collection is a timeline of a life the character never mentions.", tone: "charming", category: "habit" },
    { text: "Refuses to start any task at a round number time", hint: "Play it for comedy first, then for the reason underneath.", tone: "funny", category: "habit" },
    { text: "Counts stairs out loud, but only when alone", hint: "The one time someone hears it, the character is embarrassed for a week.", tone: "charming", category: "habit" },
    { text: "Sets three alarms and sleeps through all of them", hint: "A reliable way to make a character late without making them careless.", tone: "funny", category: "habit" },
    { text: "Never leaves a room without checking the window twice", hint: "The second check should have a history the reader only half learns.", tone: "dark", category: "habit" },
    { text: "Sorts laundry by fabric weight, not colour", hint: "A quiet detail for a character who insists they are not sentimental.", tone: "nerdy", category: "habit" },
    { text: "Writes the date on the top of every receipt, in tiny numbers", hint: "Have a receipt turn up somewhere it should not be.", tone: "stoic", category: "habit" },
    { text: "Eats one thing at a time, in a fixed order", hint: "Break the order deliberately on the day everything changes.", tone: "stoic", category: "habit" },

    /* speech */
    { text: "Says \u201cright, right\u201d while waiting to disagree", hint: "The second \u201cright\u201d is the tell. Use it in an argument.", tone: "stoic", category: "speech" },
    { text: "Answers questions with a question, always a shorter one", hint: "Works best when the character is hiding something small, not large.", tone: "dark", category: "speech" },
    { text: "Narrates their own cooking like a sports commentator", hint: "Great for a character who is only funny when no one is watching.", tone: "funny", category: "speech" },
    { text: "Uses full names, never nicknames, for everyone", hint: "Have them slip into a nickname once, at the worst possible moment.", tone: "charming", category: "speech" },
    { text: "Ends sentences with \u201canyway\u201d when the topic gets close", hint: "A clean verbal exit. Let a listener refuse to take it.", tone: "dark", category: "speech" },
    { text: "Quotes a rule number instead of explaining the rule", hint: "Play for laughs, then reveal who taught them the rules.", tone: "nerdy", category: "speech" },
    { text: "Corrects pronunciation of names, including their own", hint: "The correction should cost them something socially.", tone: "stoic", category: "speech" },
    { text: "Calls everyone \u201cboss\u201d, including their own boss", hint: "Use it to mark exactly where the character refuses to rank themselves.", tone: "funny", category: "speech" },
    { text: "Never says goodbye, just leaves mid-sentence", hint: "Have someone chase the missing half of the sentence for a whole scene.", tone: "charming", category: "speech" },
    { text: "Whispers the punchline of a joke they have already told", hint: "Show a second character mouthing it along with them.", tone: "funny", category: "speech" },

    /* social */
    { text: "Introduces people to each other by their job, not their name", hint: "Reveals what the character thinks is worth knowing about a person.", tone: "stoic", category: "social" },
    { text: "Sits with their back to the wall in any room", hint: "Only explain it once, late, and briefly.", tone: "dark", category: "social" },
    { text: "Remembers every birthday but never attends the party", hint: "The card always arrives, always on time, always unsigned.", tone: "charming", category: "social" },
    { text: "Argues on the side that is losing, for practice", hint: "Makes a character unpopular and interesting in the same scene.", tone: "nerdy", category: "social" },
    { text: "Cannot accept a compliment without returning one immediately", hint: "The returned compliment is usually more accurate than the original.", tone: "charming", category: "social" },
    { text: "Leaves group conversations by announcing a fake errand", hint: "Someone should eventually call the errand out.", tone: "funny", category: "social" },
    { text: "Shakes hands a beat too long, watching the other person", hint: "A small power move the character would deny making.", tone: "dark", category: "social" },
    { text: "Takes the smallest portion, then eats from everyone's plate", hint: "Play as comedy, then as a boundary nobody has set.", tone: "funny", category: "social" },
    { text: "Learns one fact about a stranger, then never forgets it", hint: "Have them deploy the fact years later, to unsettling effect.", tone: "charming", category: "social" },
    { text: "Refuses to be the first to sit down or the last to leave", hint: "Use it to trap the character in a room they want out of.", tone: "stoic", category: "social" },

    /* objects */
    { text: "Keeps a spare shoelace in a small tin, for no stated reason", hint: "Specific beats strange: the tin should be described once, exactly.", tone: "charming", category: "objects" },
    { text: "Carries a folded receipt from a shop that no longer exists", hint: "Never let the character explain it. Let someone else find it.", tone: "dark", category: "objects" },
    { text: "Owns four identical pens and knows which is which", hint: "A tiny, funny hill for the character to die on.", tone: "funny", category: "objects" },
    { text: "Wraps every cable in a figure-eight before storing it", hint: "Useful for showing competence in a character who talks too much.", tone: "nerdy", category: "objects" },
    { text: "Keeps a chipped mug and refuses all replacements", hint: "The mug is the whole backstory. Do not add another object.", tone: "charming", category: "objects" },
    { text: "Labels their food in a shared fridge with the full date and time", hint: "Escalate it slowly until the label becomes a running joke.", tone: "funny", category: "objects" },
    { text: "Carries a paperback that has been on page 40 for years", hint: "Have someone ask about the bookmark; the answer should not be sad.", tone: "stoic", category: "objects" },
    { text: "Keeps a toolbox sorted by how often each tool is used", hint: "Reveals a mind that trusts order more than people.", tone: "nerdy", category: "objects" },
    { text: "Never throws away a key, even for a door that is gone", hint: "The keyring is a map of places the character cannot return to.", tone: "dark", category: "objects" },
    { text: "Buys the same jacket every time it wears out", hint: "Other characters notice the sameness long before the reader does.", tone: "stoic", category: "objects" },

    /* body */
    { text: "Chews the inside of their cheek while thinking", hint: "Show it in a silent scene; it reads as thought without a word.", tone: "stoic", category: "body" },
    { text: "Flips a coin between their knuckles when nervous", hint: "Give the coin a sound. Sounds are cheap and memorable.", tone: "dark", category: "body" },
    { text: "Sniffs food before every bite, even food they cooked", hint: "A warm habit that turns quietly sad in the right context.", tone: "charming", category: "body" },
    { text: "Holds their breath through doorways without noticing", hint: "Another character noticing is the whole scene.", tone: "nerdy", category: "body" },
    { text: "Cracks their neck before saying something they have rehearsed", hint: "A physical tell for a liar who thinks they are a good one.", tone: "dark", category: "body" },
    { text: "Cannot sit still without tapping both heels in rhythm", hint: "Use the rhythm to betray impatience in an otherwise calm scene.", tone: "charming", category: "body" },
    { text: "Squints at every menu, then orders the same thing", hint: "The habit and the choice should contradict each other on purpose.", tone: "funny", category: "body" },
    { text: "Sleeps on the floor when a bed is available", hint: "Do not explain it. Let the discomfort sit with the other characters.", tone: "dark", category: "body" },
    { text: "Rubs a thumb over a scar while listening to bad news", hint: "One gesture, one scene, no flashback required.", tone: "stoic", category: "body" },
    { text: "Wears a watch on the wrong wrist and checks it constantly", hint: "A small wrongness that pays off when someone notices.", tone: "nerdy", category: "body" },

    /* fear */
    { text: "Touches the doorframe twice when leaving a house", hint: "A superstition the character claims not to believe in.", tone: "charming", category: "fear" },
    { text: "Will not say a missing person's name out loud", hint: "The avoidance is stronger than any line of dialogue could be.", tone: "dark", category: "fear" },
    { text: "Refuses to sleep in a room with a mirror uncovered", hint: "Play it as a joke for two scenes, then stop joking.", tone: "dark", category: "fear" },
    { text: "Checks that the oven is off, then checks again from the car", hint: "The second check is the character, not the oven.", tone: "charming", category: "fear" },
    { text: "Cannot watch anyone else cut their food", hint: "A fast way to make a family dinner tense.", tone: "stoic", category: "fear" },
    { text: "Keeps salt in the car, and cannot say why", hint: "Let another character borrow the car and find it.", tone: "funny", category: "fear" },
    { text: "Never takes the last item from a shared plate", hint: "A politeness with a superstitious edge underneath it.", tone: "charming", category: "fear" },
    { text: "Turns off the news before any story about the coast", hint: "A specific avoidance is more telling than a general one.", tone: "dark", category: "fear" },
    { text: "Knocks on wood, then apologises to the table", hint: "Use for comedy in one scene and loneliness in the next.", tone: "funny", category: "fear" },
    { text: "Will not start a journey on a Friday", hint: "Costs the character something real: time, money, an opportunity.", tone: "nerdy", category: "fear" }
  ];

  var CATEGORY_LABELS = {
    habit: "Daily habits",
    speech: "Speech",
    social: "Social",
    objects: "Objects",
    body: "Body & senses",
    fear: "Fears"
  };

  var TONE_LABELS = {
    charming: "Charming",
    funny: "Funny",
    dark: "Dark",
    stoic: "Stoic",
    nerdy: "Nerdy"
  };

  var el = {
    tone: document.getElementById("toneSelect"),
    category: document.getElementById("categorySelect"),
    count: document.getElementById("countSelect"),
    contradict: document.getElementById("contradictToggle"),
    subject: document.getElementById("subjectInput"),
    subjectError: document.getElementById("subjectError"),
    generate: document.getElementById("generateBtn"),
    lockToggle: document.getElementById("lockToggleBtn"),
    clear: document.getElementById("clearBtn"),
    status: document.getElementById("statusLine"),
    list: document.getElementById("quirkList"),
    empty: document.getElementById("emptyState"),
    summary: document.getElementById("summaryWrap"),
    copy: document.getElementById("copyBtn"),
    download: document.getElementById("downloadBtn"),
    copyStatus: document.getElementById("copyStatus"),
    mixChart: document.getElementById("mixChart"),
    toneChart: document.getElementById("toneChart")
  };

  /* Current roll: array of { text, hint, tone, category, locked } */
  var current = [];

  /* ------------------------------------------------------------------ */
  /* Helpers                                                            */
  /* ------------------------------------------------------------------ */

  function randomIndex(n) {
    return Math.floor(Math.random() * n);
  }

  function shuffle(arr) {
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
      var j = randomIndex(i + 1);
      var tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function poolFor(tone, category) {
    return QUIRKS.filter(function (q) {
      if (tone !== "any" && q.tone !== tone) { return false; }
      if (category !== "any" && q.category !== category) { return false; }
      return true;
    });
  }

  function describeFilters() {
    var tone = el.tone.value;
    var cat = el.category.value;
    var parts = [];
    parts.push(tone === "any" ? "any tone" : TONE_LABELS[tone].toLowerCase());
    parts.push(cat === "any" ? "all categories" : CATEGORY_LABELS[cat].toLowerCase());
    return parts.join(", ");
  }

  function countBy(items, key) {
    var out = {};
    items.forEach(function (item) {
      out[item[key]] = (out[item[key]] || 0) + 1;
    });
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Generation                                                         */
  /* ------------------------------------------------------------------ */

  function generate() {
    var rawName = el.subject.value.trim();
    if (rawName.length > 60) {
      el.subject.classList.add("is-invalid");
      el.subjectError.textContent = "Keep the name under 60 characters (currently " + rawName.length + ").";
      el.status.textContent = "Fix the character name, then generate again.";
      el.subject.focus();
      return;
    }
    el.subject.classList.remove("is-invalid");

    var wanted = parseInt(el.count.value, 10);
    if (isNaN(wanted) || wanted < 1) { wanted = 3; }

    var kept = current.filter(function (q) { return q.locked; });
    if (kept.length > wanted) { kept = kept.slice(0, wanted); }

    var pool = poolFor(el.tone.value, el.category.value);
    var relaxed = false;
    if (pool.length === 0) {
      pool = QUIRKS.slice();
      relaxed = true;
    }

    var used = {};
    kept.forEach(function (q) { used[q.text] = true; });

    var candidates = shuffle(pool.filter(function (q) { return !used[q.text]; }));
    var drawn = [];
    var need = wanted - kept.length;

    for (var i = 0; i < candidates.length && drawn.length < need; i++) {
      drawn.push(candidates[i]);
    }

    /* Contradictory quirk: swap one fresh draw for an opposing tone. */
    var contradicted = false;
    if (el.contradict.checked && drawn.length > 0 && wanted > 1) {
      var tones = countBy(drawn.concat(kept), "tone");
      var dominant = null;
      Object.keys(tones).forEach(function (t) {
        if (dominant === null || tones[t] > tones[dominant]) { dominant = t; }
      });
      var opponents = shuffle(QUIRKS.filter(function (q) {
        return q.tone !== dominant && !used[q.text] && drawn.indexOf(q) === -1;
      }));
      if (opponents.length > 0) {
        drawn[drawn.length - 1] = opponents[0];
        contradicted = true;
      }
    }

    var fresh = drawn.map(function (q) {
      return { text: q.text, hint: q.hint, tone: q.tone, category: q.category, locked: false };
    });

    current = kept.concat(fresh);
    syncLockToggle();
    render();

    var name = rawName ? rawName : "your character";
    var parts = ["Generated " + current.length + " quirk" + (current.length === 1 ? "" : "s") +
      " for " + name + " (" + describeFilters() + ")."];
    if (kept.length > 0) { parts.push(kept.length + " locked and kept."); }
    if (contradicted) { parts.push("One contradictory quirk mixed in."); }
    if (relaxed) { parts.push("No quirks matched that tone and category, so the whole pool was used."); }
    if (current.length < wanted) { parts.push("The pool ran out, so fewer than " + wanted + " were returned."); }
    el.status.textContent = parts.join(" ");
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                          */
  /* ------------------------------------------------------------------ */

  function render() {
    el.list.innerHTML = "";

    if (current.length === 0) {
      el.empty.classList.remove("d-none");
      el.summary.classList.add("d-none");
      el.copyStatus.textContent = "";
      return;
    }

    el.empty.classList.add("d-none");
    el.summary.classList.remove("d-none");

    current.forEach(function (q, index) {
      var li = document.createElement("li");
      if (q.locked) { li.className = "locked"; }

      var head = document.createElement("div");
      head.className = "quirk-head";

      var body = document.createElement("div");

      var text = document.createElement("p");
      text.className = "quirk-text";
      text.textContent = q.text;

      var tags = document.createElement("div");
      tags.className = "quirk-tags";
      tags.appendChild(makeTag(CATEGORY_LABELS[q.category], ""));
      tags.appendChild(makeTag(TONE_LABELS[q.tone], "tone"));
      if (q.locked) { tags.appendChild(makeTag("Locked", "lock-tag")); }

      var hint = document.createElement("p");
      hint.className = "quirk-hint";
      hint.textContent = "How to play it: " + q.hint;

      body.appendChild(text);
      body.appendChild(tags);
      body.appendChild(hint);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "lock-btn";
      btn.setAttribute("aria-pressed", q.locked ? "true" : "false");
      btn.setAttribute("aria-label", (q.locked ? "Unlock quirk: " : "Lock quirk: ") + q.text);
      btn.textContent = q.locked ? "Locked" : "Lock";
      btn.addEventListener("click", function () { toggleLock(index); });

      head.appendChild(body);
      head.appendChild(btn);
      li.appendChild(head);
      el.list.appendChild(li);
    });

    drawCharts();
  }

  function syncLockToggle() {
    var allLocked = current.length > 0 && current.every(function (q) { return q.locked; });
    el.lockToggle.setAttribute("aria-pressed", allLocked ? "true" : "false");
    el.lockToggle.textContent = allLocked ? "Unlock all" : "Lock the ones I like";
  }

  function makeTag(label, extraClass) {
    var span = document.createElement("span");
    span.className = "tag" + (extraClass ? " " + extraClass : "");
    span.textContent = label;
    return span;
  }

  function toggleLock(index) {
    if (!current[index]) { return; }
    current[index].locked = !current[index].locked;
    var lockedCount = current.filter(function (q) { return q.locked; }).length;
    el.status.textContent = lockedCount === 0
      ? "No quirks locked. Generate again to replace the whole set."
      : lockedCount + " quirk" + (lockedCount === 1 ? "" : "s") + " locked and kept on the next roll.";
    syncLockToggle();
    render();
  }

  /* ------------------------------------------------------------------ */
  /* Charts                                                             */
  /* ------------------------------------------------------------------ */

  function drawCharts() {
    var catCounts = countBy(current, "category");
    var toneCounts = countBy(current, "tone");

    var catLabels = Object.keys(CATEGORY_LABELS).map(function (k) { return CATEGORY_LABELS[k]; });
    var catValues = Object.keys(CATEGORY_LABELS).map(function (k) { return catCounts[k] || 0; });

    var toneLabels = Object.keys(TONE_LABELS).map(function (k) { return TONE_LABELS[k]; });
    var toneValues = Object.keys(TONE_LABELS).map(function (k) { return toneCounts[k] || 0; });

    drawBars(el.mixChart, catLabels, catValues, "#60089c", "#8a3fc0");
    drawBars(el.toneChart, toneLabels, toneValues, "#0e7490", "#8a3fc0");
  }

  function drawBars(canvas, labels, values, colorA, colorB) {
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;
    var cssW = canvas.clientWidth || 320;
    var cssH = 220;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.height = cssH + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    var max = Math.max.apply(null, values.concat([1]));
    var labelW = 78;
    var right = 30;
    var top = 10;
    var rowH = Math.floor((cssH - top - 10) / labels.length);
    var barH = Math.max(10, rowH - 8);
    var trackW = cssW - labelW - right;

    ctx.font = "12px Segoe UI, Arial, sans-serif";
    ctx.textBaseline = "middle";

    for (var i = 0; i < labels.length; i++) {
      var y = top + i * rowH + rowH / 2;
      ctx.fillStyle = "#6b6277";
      ctx.textAlign = "right";
      ctx.fillText(labels[i], labelW - 10, y);

      ctx.fillStyle = "#f0eaf7";
      roundRect(ctx, labelW, y - barH / 2, trackW, barH, barH / 2);
      ctx.fill();

      var w = values[i] === 0 ? 0 : Math.max(6, (values[i] / max) * trackW);
      if (w > 0) {
        var grad = ctx.createLinearGradient(labelW, 0, labelW + w, 0);
        grad.addColorStop(0, colorA);
        grad.addColorStop(1, colorB);
        ctx.fillStyle = grad;
        roundRect(ctx, labelW, y - barH / 2, w, barH, barH / 2);
        ctx.fill();
      }

      ctx.fillStyle = "#241a2e";
      ctx.textAlign = "left";
      ctx.fillText(String(values[i]), labelW + w + 6, y);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    var radius = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /* ------------------------------------------------------------------ */
  /* Export                                                             */
  /* ------------------------------------------------------------------ */

  function asText() {
    var rawName = el.subject.value.trim();
    var lines = [];
    lines.push("Quirk list" + (rawName ? " for " + rawName : "") + " (" + describeFilters() + ")");
    lines.push("");
    current.forEach(function (q, i) {
      lines.push((i + 1) + ". " + q.text);
      lines.push("   " + CATEGORY_LABELS[q.category] + " / " + TONE_LABELS[q.tone] +
        (q.locked ? " / locked" : ""));
      lines.push("   How to play it: " + q.hint);
      lines.push("");
    });
    lines.push("Generated with the Quirk Generator on A Free Tools.");
    return lines.join("\n");
  }

  function copyText(text, message) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        el.copyStatus.textContent = message;
      }, function () {
        fallbackCopy(text, message);
      });
    } else {
      fallbackCopy(text, message);
    }
  }

  function fallbackCopy(text, message) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
      el.copyStatus.textContent = message;
    } catch (err) {
      el.copyStatus.textContent = "Copying was blocked by the browser. Select the list and copy it manually.";
    }
    document.body.removeChild(area);
  }

  /* ------------------------------------------------------------------ */
  /* Wiring                                                             */
  /* ------------------------------------------------------------------ */

  el.generate.addEventListener("click", generate);

  el.lockToggle.addEventListener("click", function () {
    if (current.length === 0) {
      el.status.textContent = "Nothing to lock yet. Generate some quirks first.";
      return;
    }
    var allLocked = current.every(function (q) { return q.locked; });
    current.forEach(function (q) { q.locked = !allLocked; });
    el.status.textContent = allLocked
      ? "All quirks unlocked."
      : "All quirks locked. Generate again to keep them all.";
    syncLockToggle();
    render();
  });

  el.clear.addEventListener("click", function () {
    current = [];
    el.subject.value = "";
    el.subject.classList.remove("is-invalid");
    el.copyStatus.textContent = "";
    el.status.textContent = "Cleared. Choose a tone and press Generate quirks to begin.";
    syncLockToggle();
    render();
  });

  el.copy.addEventListener("click", function () {
    if (current.length === 0) { return; }
    copyText(asText(), "Copied " + current.length + " quirk" + (current.length === 1 ? "" : "s") + " to the clipboard.");
  });

  el.download.addEventListener("click", function () {
    if (current.length === 0) { return; }
    var blob = new Blob([asText()], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "quirks.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    el.copyStatus.textContent = "Downloaded quirks.txt.";
  });

  el.subject.addEventListener("input", function () {
    if (el.subject.value.trim().length <= 60) {
      el.subject.classList.remove("is-invalid");
    }
  });

  el.subject.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      generate();
    }
  });

  window.addEventListener("resize", function () {
    if (current.length > 0) { drawCharts(); }
  });

  generate();
})();
