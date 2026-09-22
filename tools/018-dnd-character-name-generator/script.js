(function () {
  'use strict';

  /* ---- Syllable library -------------------------------------------------
     Each root carries its own sound palette. A name is assembled by picking
     one root (weighted by ancestry), then drawing an opening, optional middle
     and a closing fragment from that root. Tone filters the closing pool;
     gender filters the opening pool.
  ----------------------------------------------------------------------- */

  var ROOTS = {
    'Elvish': {
      opens: [
        { s: 'Ael', g: 'n' }, { s: 'Aer', g: 'n' }, { s: 'Thal', g: 'm' },
        { s: 'Elen', g: 'f' }, { s: 'Syl', g: 'f' }, { s: 'Ith', g: 'n' },
        { s: 'Laer', g: 'n' }, { s: 'Nim', g: 'f' }, { s: 'Fael', g: 'n' },
        { s: 'Ril', g: 'm' }, { s: 'Vael', g: 'n' }, { s: 'Cael', g: 'm' }
      ],
      mids: ['a', 'i', 'ae', 'io', 'ea', 'ua'],
      ends: [
        { s: 'rion', t: 'heroic' }, { s: 'thil', t: 'heroic' },
        { s: 'wen', t: 'heroic' }, { s: 'las', t: 'any' },
        { s: 'nor', t: 'any' }, { s: 'iel', t: 'ominous' },
        { s: 'drin', t: 'gritty' }, { s: 'lith', t: 'whimsical' },
        { s: 'anor', t: 'any' }, { s: 'rill', t: 'whimsical' }
      ]
    },
    'Dwarven': {
      opens: [
        { s: 'Bran', g: 'm' }, { s: 'Dur', g: 'm' }, { s: 'Thra', g: 'm' },
        { s: 'Grim', g: 'm' }, { s: 'Hel', g: 'f' }, { s: 'Dagn', g: 'f' },
        { s: 'Kor', g: 'n' }, { s: 'Bael', g: 'n' }, { s: 'Mor', g: 'n' },
        { s: 'Var', g: 'm' }, { s: 'Run', g: 'f' }
      ],
      mids: ['a', 'o', 'u', 'i'],
      ends: [
        { s: 'din', t: 'heroic' }, { s: 'gar', t: 'gritty' },
        { s: 'stone', t: 'heroic' }, { s: 'grim', t: 'gritty' },
        { s: 'hild', t: 'any' }, { s: 'mund', t: 'any' },
        { s: 'vik', t: 'gritty' }, { s: 'bel', t: 'whimsical' },
        { s: 'rock', t: 'ominous' }
      ]
    },
    'Common': {
      opens: [
        { s: 'Ald', g: 'm' }, { s: 'Mar', g: 'f' }, { s: 'Ed', g: 'm' },
        { s: 'Ros', g: 'f' }, { s: 'Cor', g: 'n' }, { s: 'Wil', g: 'm' },
        { s: 'El', g: 'f' }, { s: 'Bran', g: 'n' }, { s: 'Tam', g: 'n' },
        { s: 'Holl', g: 'f' }, { s: 'Row', g: 'n' }
      ],
      mids: ['a', 'e', 'i', 'o'],
      ends: [
        { s: 'ric', t: 'heroic' }, { s: 'win', t: 'heroic' },
        { s: 'ford', t: 'any' }, { s: 'ley', t: 'whimsical' },
        { s: 'wick', t: 'any' }, { s: 'mere', t: 'ominous' },
        { s: 'ston', t: 'gritty' }, { s: 'a', t: 'whimsical' },
        { s: 'ard', t: 'gritty' }
      ]
    },
    'Halfling': {
      opens: [
        { s: 'Pip', g: 'n' }, { s: 'Tol', g: 'm' }, { s: 'Cori', g: 'f' },
        { s: 'Mer', g: 'n' }, { s: 'Dod', g: 'm' }, { s: 'Lil', g: 'f' },
        { s: 'Bil', g: 'm' }, { s: 'Nan', g: 'f' }, { s: 'Tob', g: 'n' }
      ],
      mids: ['a', 'o', 'i', 'e'],
      ends: [
        { s: 'bo', t: 'whimsical' }, { s: 'berry', t: 'whimsical' },
        { s: 'wick', t: 'any' }, { s: 'doc', t: 'any' },
        { s: 'ly', t: 'heroic' }, { s: 'buck', t: 'heroic' },
        { s: 'foot', t: 'any' }, { s: 'nim', t: 'ominous' }
      ]
    },
    'Gnomish': {
      opens: [
        { s: 'Fizz', g: 'n' }, { s: 'Wren', g: 'f' }, { s: 'Bim', g: 'n' },
        { s: 'Glim', g: 'n' }, { s: 'Zook', g: 'm' }, { s: 'Nyx', g: 'f' },
        { s: 'Tink', g: 'n' }, { s: 'Quil', g: 'm' }
      ],
      mids: ['a', 'i', 'o', 'u'],
      ends: [
        { s: 'wicket', t: 'whimsical' }, { s: 'spanner', t: 'whimsical' },
        { s: 'cog', t: 'any' }, { s: 'wrench', t: 'gritty' },
        { s: 'bangle', t: 'heroic' }, { s: 'nix', t: 'ominous' },
        { s: 'pop', t: 'whimsical' }, { s: 'gear', t: 'any' }
      ]
    },
    'Infernal': {
      opens: [
        { s: 'Zar', g: 'm' }, { s: 'Mal', g: 'f' }, { s: 'Ver', g: 'n' },
        { s: 'Nyx', g: 'f' }, { s: 'Kar', g: 'm' }, { s: 'Ash', g: 'n' },
        { s: 'Bel', g: 'm' }, { s: 'Lili', g: 'f' }, { s: 'Droz', g: 'n' }
      ],
      mids: ['a', 'e', 'o', 'ae'],
      ends: [
        { s: 'zeth', t: 'ominous' }, { s: 'mor', t: 'ominous' },
        { s: 'kai', t: 'heroic' }, { s: 'vash', t: 'gritty' },
        { s: 'riel', t: 'heroic' }, { s: 'thys', t: 'ominous' },
        { s: 'gor', t: 'gritty' }, { s: 'nix', t: 'whimsical' }
      ]
    },
    'Draconic': {
      opens: [
        { s: 'Arj', g: 'm' }, { s: 'Bal', g: 'n' }, { s: 'Rhog', g: 'm' },
        { s: 'Sora', g: 'f' }, { s: 'Tor', g: 'n' }, { s: 'Kava', g: 'f' },
        { s: 'Med', g: 'n' }, { s: 'Vra', g: 'm' }
      ],
      mids: ['a', 'o', 'i', 'u'],
      ends: [
        { s: 'ash', t: 'gritty' }, { s: 'ax', t: 'gritty' },
        { s: 'thar', t: 'heroic' }, { s: 'nyx', t: 'ominous' },
        { s: 'orum', t: 'heroic' }, { s: 'skarr', t: 'ominous' },
        { s: 'lin', t: 'whimsical' }
      ]
    },
    'Orcish': {
      opens: [
        { s: 'Gro', g: 'm' }, { s: 'Ur', g: 'n' }, { s: 'Kra', g: 'n' },
        { s: 'Mog', g: 'm' }, { s: 'Sha', g: 'f' }, { s: 'Thok', g: 'm' },
        { s: 'Gar', g: 'n' }, { s: 'Yara', g: 'f' }
      ],
      mids: ['a', 'o', 'u'],
      ends: [
        { s: 'gash', t: 'gritty' }, { s: 'mok', t: 'gritty' },
        { s: 'thak', t: 'gritty' }, { s: 'nar', t: 'any' },
        { s: 'zog', t: 'ominous' }, { s: 'ka', t: 'heroic' },
        { s: 'duk', t: 'whimsical' }
      ]
    },
    'Sylvan': {
      opens: [
        { s: 'Thistle', g: 'n' }, { s: 'Fern', g: 'f' }, { s: 'Moss', g: 'n' },
        { s: 'Lark', g: 'f' }, { s: 'Bramble', g: 'n' }, { s: 'Dew', g: 'n' },
        { s: 'Hawth', g: 'm' }
      ],
      mids: ['a', 'e', 'i', 'o'],
      ends: [
        { s: 'whisper', t: 'whimsical' }, { s: 'bloom', t: 'heroic' },
        { s: 'thorn', t: 'ominous' }, { s: 'glade', t: 'heroic' },
        { s: 'hollow', t: 'ominous' }, { s: 'song', t: 'whimsical' },
        { s: 'bark', t: 'gritty' }
      ]
    }
  };

  var RACE_WEIGHTS = {
    human: { 'Common': 4, 'Elvish': 1, 'Dwarven': 1, 'Infernal': 1, 'Draconic': 1 },
    elf: { 'Elvish': 6, 'Sylvan': 3, 'Common': 1 },
    dwarf: { 'Dwarven': 6, 'Common': 2, 'Orcish': 1 },
    halfling: { 'Halfling': 6, 'Common': 2, 'Gnomish': 1 },
    gnome: { 'Gnomish': 6, 'Halfling': 2, 'Common': 1 },
    halfOrc: { 'Orcish': 5, 'Common': 3, 'Dwarven': 1 },
    tiefling: { 'Infernal': 6, 'Common': 2, 'Draconic': 1 },
    dragonborn: { 'Draconic': 6, 'Common': 2, 'Orcish': 1 },
    orc: { 'Orcish': 6, 'Dwarven': 2 },
    fey: { 'Sylvan': 6, 'Elvish': 3 }
  };

  var RACE_LABEL = {
    human: 'Human', elf: 'Elf', dwarf: 'Dwarf', halfling: 'Halfling',
    gnome: 'Gnome', halfOrc: 'Half-Orc', tiefling: 'Tiefling',
    dragonborn: 'Dragonborn', orc: 'Orc', fey: 'Fey'
  };

  var SURNAMES = {
    'Elvish': ['Amakiir', 'Galanodel', 'Liadon', 'Siannodel', 'Xiloscient', 'Moonshadow', 'Dawnwhisper'],
    'Dwarven': ['Ironfoot', 'Emberforge', 'Stonebeard', 'Battlehammer', 'Goldvein', 'Coalfist', 'Deepanvil'],
    'Common': ['Ashford', 'Brightwater', 'Hollowell', 'Marsh', 'Thatcher', 'Wrenfield', 'Bellamy'],
    'Halfling': ['Underbough', 'Goodbarrel', 'Tealeaf', 'Thorngage', 'Brushgather', 'Appleblossom'],
    'Gnomish': ['Cogspinner', 'Fizzlebang', 'Glittergem', 'Springcog', 'Tosslebottom', 'Wrenchwhistle'],
    'Infernal': ['Bloodmark', 'Ashvale', 'Nightvow', 'Sunless', 'Thornpact', 'Emberchain'],
    'Draconic': ['Stormscale', 'Ashwing', 'Clethtinthiallor', 'Norixius', 'Yarjerit', 'Frostbrand'],
    'Orcish': ['Skullsplitter', 'Bonegnasher', 'Redtusk', 'Ironjaw', 'Nightgash', 'Threefang'],
    'Sylvan': ['Thornwood', 'Greenhollow', 'Mistwalker', 'Fernshade', 'Wildroot', 'Duskbloom']
  };

  var CLASS_EPITHET = {
    martial: ['the Unbroken', 'Shieldwarden', 'the Ironvow', 'Warbringer', 'the Steadfast'],
    arcane: ['the Farsighted', 'Spellbound', 'of the Ninth Circle', 'Starweaver', 'the Unravelled'],
    divine: ['Lightbearer', 'the Devout', 'Dawnsworn', 'of the Quiet Vow', 'the Merciful'],
    rogue: ['Quickfingers', 'the Unseen', 'Shadowstep', 'of No Fixed Address', 'the Quiet'],
    bard: ['Songkeeper', 'the Well-Travelled', 'Talespinner', 'of the Loud Tavern', 'the Half-Remembered'],
    any: ['the Wanderer', 'of the Long Road', 'the Younger', 'the Unlucky', 'of the North']
  };

  var TONES = ['heroic', 'gritty', 'whimsical', 'ominous'];

  /* ---- Utilities -------------------------------------------------------- */

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function pickWeighted(weights) {
    var keys = Object.keys(weights);
    var total = 0;
    var i;
    for (i = 0; i < keys.length; i++) total += weights[keys[i]];
    var roll = Math.random() * total;
    for (i = 0; i < keys.length; i++) {
      roll -= weights[keys[i]];
      if (roll <= 0) return keys[i];
    }
    return keys[keys.length - 1];
  }

  function capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  function filterGender(opens, gender) {
    if (gender === 'neutral') return opens;
    var want = gender === 'feminine' ? 'f' : 'm';
    var filtered = opens.filter(function (o) {
      return o.g === want || o.g === 'n';
    });
    return filtered.length ? filtered : opens;
  }

  function filterTone(ends, tone) {
    var wanted = tone === 'any' ? pick(TONES) : tone;
    var filtered = ends.filter(function (e) {
      return e.t === wanted || e.t === 'any';
    });
    return filtered.length ? filtered : ends;
  }

  /* ---- Name construction ------------------------------------------------ */

  function buildName(rootKey, gender, tone) {
    var root = ROOTS[rootKey];
    var opening = pick(filterGender(root.opens, gender)).s;
    var closing = pick(filterTone(root.ends, tone)).s;

    var syllables = [opening];
    /* Long or vowel-final openings already carry the beat - adding a linking
       vowel there turns Thistle into Thistleabloom. */
    var canTakeMiddle = /[^aeiou]$/i.test(opening) && opening.length <= 4;
    if (canTakeMiddle && Math.random() < 0.55) syllables.push(pick(root.mids));

    /* Occasional cross-root blend gives the batch a mixed feel. */
    if (Math.random() < 0.22) {
      var otherKeys = Object.keys(ROOTS).filter(function (k) { return k !== rootKey; });
      var other = ROOTS[pick(otherKeys)];
      closing = pick(filterTone(other.ends, tone)).s;
    }
    syllables.push(closing);

    var first = capitalize(syllables.join(''));

    var surname = '';
    if (document.getElementById('surnameCheck').checked) {
      var useEpithet = Math.random() < 0.4;
      surname = useEpithet
        ? pick(CLASS_EPITHET[document.getElementById('classSelect').value] || CLASS_EPITHET.any)
        : pick(SURNAMES[rootKey] || SURNAMES.Common);
    }

    return {
      full: surname ? first + ' ' + surname : first,
      syllables: syllables.join(' \u00b7 '),
      root: rootKey
    };
  }

  function generateNames(count, race, gender, tone) {
    var weights = RACE_WEIGHTS[race] || RACE_WEIGHTS.human;
    var results = [];
    var seen = {};
    var guard = 0;

    while (results.length < count && guard < count * 40) {
      guard++;
      var rootKey = pickWeighted(weights);
      var name = buildName(rootKey, gender, tone);
      if (seen[name.full]) continue;
      seen[name.full] = true;
      results.push(name);
    }
    return results;
  }

  /* ---- Chart ------------------------------------------------------------ */

  function drawChart(names) {
    var canvas = document.getElementById('rootChart');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var counts = {};
    names.forEach(function (n) {
      counts[n.root] = (counts[n.root] || 0) + 1;
    });

    var labels = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a];
    });
    var max = Math.max.apply(null, labels.map(function (l) { return counts[l]; }));

    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var padLeft = 8;
    var padTop = 16;
    var barGap = 10;
    var barHeight = Math.min(
      26,
      (H - padTop - 24) / Math.max(labels.length, 1) - barGap
    );
    var labelWidth = 86;
    var trackWidth = W - padLeft - labelWidth - 34;

    ctx.font = '12px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textBaseline = 'middle';

    labels.forEach(function (label, index) {
      var y = padTop + index * (barHeight + barGap);
      var value = counts[label];
      var barWidth = Math.max(6, (value / max) * trackWidth);

      ctx.fillStyle = '#4a3b57';
      ctx.textAlign = 'right';
      ctx.fillText(label, padLeft + labelWidth - 8, y + barHeight / 2);

      ctx.fillStyle = '#f3ebfa';
      ctx.fillRect(padLeft + labelWidth, y, trackWidth, barHeight);

      var gradient = ctx.createLinearGradient(padLeft + labelWidth, 0, padLeft + labelWidth + barWidth, 0);
      gradient.addColorStop(0, '#60089c');
      gradient.addColorStop(1, '#7b28b8');
      ctx.fillStyle = gradient;
      ctx.fillRect(padLeft + labelWidth, y, barWidth, barHeight);

      ctx.fillStyle = '#45056f';
      ctx.textAlign = 'left';
      ctx.fillText(String(value), padLeft + labelWidth + barWidth + 6, y + barHeight / 2);
    });

    document.getElementById('rootLegend').textContent =
      labels.length
        ? 'Most common root this batch: ' + labels[0] + ' (' + counts[labels[0]] + ' of ' + names.length + ').'
        : '';
  }

  /* ---- Rendering -------------------------------------------------------- */

  function renderResults(names) {
    var list = document.getElementById('nameList');
    list.innerHTML = '';

    names.forEach(function (name) {
      var li = document.createElement('li');

      var main = document.createElement('span');
      main.className = 'name-main';

      var value = document.createElement('span');
      value.className = 'name-value';
      value.textContent = name.full;

      var meta = document.createElement('span');
      meta.className = 'name-meta';
      meta.textContent = name.root + ' root \u00b7 ' + name.syllables;

      main.appendChild(value);
      main.appendChild(meta);

      var copy = document.createElement('button');
      copy.type = 'button';
      copy.className = 'name-copy';
      copy.textContent = 'Copy';
      copy.setAttribute('aria-label', 'Copy name ' + name.full);
      copy.addEventListener('click', function () {
        copyText(name.full, 'Copied ' + name.full);
      });

      li.appendChild(main);
      li.appendChild(copy);
      list.appendChild(li);
    });

    drawChart(names);

    var results = document.getElementById('results');
    results.classList.remove('d-none');
    results.focus();

    document.getElementById('copyMsg').textContent = '';
  }

  function copyText(text, message) {
    var msg = document.getElementById('copyMsg');
    function done() { if (msg) msg.textContent = message; }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text, done);
      });
    } else {
      fallbackCopy(text, done);
    }
  }

  function fallbackCopy(text, done) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'absolute';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (e) { /* noop */ }
    document.body.removeChild(area);
  }

  /* ---- Form wiring ------------------------------------------------------ */

  function showError(message) {
    var box = document.getElementById('errorBox');
    box.textContent = message;
    box.classList.remove('d-none');
  }

  function clearError() {
    var box = document.getElementById('errorBox');
    box.textContent = '';
    box.classList.add('d-none');
  }

  function handleSubmit(event) {
    event.preventDefault();
    clearError();

    var raw = document.getElementById('countInput').value.trim();
    var count = Number(raw);

    if (raw === '' || !isFinite(count) || Math.floor(count) !== count) {
      showError('Enter a whole number of names between 1 and 20.');
      document.getElementById('countInput').focus();
      return;
    }
    if (count < 1 || count > 20) {
      showError('Choose between 1 and 20 names per batch.');
      document.getElementById('countInput').focus();
      return;
    }

    var names = generateNames(
      count,
      document.getElementById('raceSelect').value,
      document.getElementById('genderSelect').value,
      document.getElementById('toneSelect').value
    );

    if (!names.length) {
      showError('Could not build a name with those settings. Try a different tone or ancestry.');
      return;
    }

    renderResults(names);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('nameForm');
    form.addEventListener('submit', handleSubmit);

    form.addEventListener('input', function (event) {
      if (event.target.id === 'countInput') clearError();
    });

    document.getElementById('resetBtn').addEventListener('click', function () {
      form.reset();
      clearError();
      document.getElementById('results').classList.add('d-none');
      document.getElementById('copyMsg').textContent = '';
      document.getElementById('raceSelect').focus();
    });

    document.getElementById('copyAllBtn').addEventListener('click', function () {
      var names = Array.prototype.map.call(
        document.querySelectorAll('#nameList .name-value'),
        function (el) { return el.textContent; }
      );
      if (!names.length) return;
      copyText(names.join('\n'), 'Copied ' + names.length + ' names.');
    });
  });
})();
