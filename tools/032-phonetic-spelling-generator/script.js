/* Phonetic Spelling Generator — vanilla JS, no dependencies.
   Rule-based respelling: split a word into syllables, map letter patterns to
   sound-it-out spellings, mark stress, and spell it out in the NATO alphabet. */
(function () {
  'use strict';

  var VOWEL_LETTERS = 'aeiouy';
  var NATO = {
    a: 'Alpha', b: 'Bravo', c: 'Charlie', d: 'Delta', e: 'Echo', f: 'Foxtrot',
    g: 'Golf', h: 'Hotel', i: 'India', j: 'Juliett', k: 'Kilo', l: 'Lima',
    m: 'Mike', n: 'November', o: 'Oscar', p: 'Papa', q: 'Quebec', r: 'Romeo',
    s: 'Sierra', t: 'Tango', u: 'Uniform', v: 'Victor', w: 'Whiskey',
    x: 'X-ray', y: 'Yankee', z: 'Zulu',
    0: 'Zero', 1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
    6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine'
  };

  function isVowel(c) { return VOWEL_LETTERS.indexOf(c) !== -1; }

  /* ---------- syllabification ---------- */
  function vowelGroups(word) {
    var groups = [];
    var i = 0;
    while (i < word.length) {
      if (isVowel(word[i])) {
        var start = i;
        while (i < word.length && isVowel(word[i])) i++;
        groups.push({ start: start, end: i - 1 });
      } else {
        i++;
      }
    }
    return groups;
  }

  function syllabify(word) {
    var w = word.toLowerCase();
    // A final silent "e" (cake, shire) is not its own vowel nucleus — pull it
    // out before splitting, then reattach it to the last syllable.
    var silentE = false;
    if (/[^aeiouy]e$/.test(w) && w.length > 3) {
      silentE = true;
      w = w.slice(0, -1);
    }
    if (w.length <= 3) {
      return [silentE ? w + 'e' : w];
    }
    var groups = vowelGroups(w);
    if (groups.length <= 1) return [silentE ? w + 'e' : w];
    var cuts = [];
    for (var g = 0; g < groups.length - 1; g++) {
      var endOfFirst = groups[g].end;
      var startOfNext = groups[g + 1].start;
      var consonants = startOfNext - endOfFirst - 1;
      var cut;
      if (consonants <= 1) {
        cut = endOfFirst + 1;
      } else if (consonants === 2) {
        cut = endOfFirst + 2;
      } else {
        cut = endOfFirst + 2;
      }
      cuts.push(cut);
    }
    var syllables = [];
    var prev = 0;
    for (var c = 0; c < cuts.length; c++) {
      syllables.push(w.slice(prev, cuts[c]));
      prev = cuts[c];
    }
    syllables.push(w.slice(prev));
    if (silentE) syllables[syllables.length - 1] += 'e';
    // A final silent "e" on its own makes no syllable — merge it back.
    if (syllables.length > 1 && syllables[syllables.length - 1] === 'e') {
      syllables.pop();
      syllables[syllables.length - 1] += 'e';
    }
    return syllables.filter(function (s) { return s.length > 0; });
  }

  /* ---------- grapheme -> respelling ---------- */
  // Longest patterns first.
  var MULTI = [
    ['ough', 'oh'], ['augh', 'aw'], ['tion', 'shun'], ['sion', 'zhun'],
    ['ture', 'chur'], ['eigh', 'ay'], ['igh', 'y'], ['wor', 'wur'],
    ['ck', 'k'], ['ch', 'ch'], ['sh', 'sh'], ['th', 'th'], ['ph', 'f'],
    ['wh', 'w'], ['gh', ''], ['qu', 'kw'], ['ee', 'ee'], ['ea', 'ee'],
    ['oo', 'oo'], ['ou', 'ow'], ['ow', 'ow'], ['oi', 'oy'], ['oy', 'oy'],
    ['ai', 'ay'], ['ay', 'ay'], ['ei', 'ay'], ['ey', 'ay'], ['ie', 'ee'],
    ['er', 'ur'], ['ir', 'ur'], ['ur', 'ur'], ['ar', 'ar'], ['or', 'or']
  ];

  var VOWEL_SOUNDS = {
    a: { stressed: 'a', unstressed: 'uh' },
    e: { stressed: 'e', unstressed: 'uh' },
    i: { stressed: 'i', unstressed: 'i' },
    o: { stressed: 'o', unstressed: 'uh' },
    u: { stressed: 'u', unstressed: 'uh' },
    ar: { stressed: 'ar', unstressed: 'ur' },
    or: { stressed: 'or', unstressed: 'ur' }
  };

  var VOWEL_HINT = {
    uh: 'like the <em>a</em> in sofa', ay: 'like <em>ay</em> in day',
    ee: 'like <em>ee</em> in see', y: 'like <em>y</em> in my',
    oh: 'like <em>o</em> in go', oo: 'like <em>oo</em> in too',
    ow: 'like <em>ow</em> in cow', oy: 'like <em>oy</em> in boy',
    yoo: 'like <em>u</em> in use', ur: 'like <em>ur</em> in fur',
    ar: 'like <em>ar</em> in car', or: 'like <em>or</em> in for',
    a: 'short <em>a</em>', e: 'short <em>e</em>', i: 'short <em>i</em>',
    o: 'short <em>o</em>', u: 'short <em>u</em>'
  };

  // Silent leading pairs (knight -> nyt, write -> ryt, psychology -> sy...).
  var LEADING = { kn: 'n', wr: 'r', ps: 's', pn: 'n', gn: 'n', mn: 'm', gh: 'g' };

  function scan(syl) {
    // A bare "le" syllable sounds like "ul" (ta-ble -> TAY-bul).
    if (syl === 'le') syl = 'ul';
    // "le" ending after a consonant sounds like "ul" (ta-ble -> TAY-bul).
    if (/[^aeiouy]le$/.test(syl) && syl.length > 2) {
      syl = syl.slice(0, -2) + 'ul';
    }
    var tokens = [];
    var i = 0;
    while (i < syl.length) {
      var matched = null;
      if (i === 0 && syl.length > 2) {
        var lead = LEADING[syl.slice(0, 2)];
        if (lead) {
          tokens.push({ ph: lead, vowel: false });
          i += 2;
          continue;
        }
      }
      for (var m = 0; m < MULTI.length; m++) {
        if (syl.indexOf(MULTI[m][0], i) === i) { matched = MULTI[m]; break; }
      }
      if (matched) {
        tokens.push({ ph: matched[1], vowel: /[aeiou]/.test(matched[1]), key: matched[0] });
        i += matched[0].length;
        continue;
      }
      var c = syl[i];
      if (c === 'c') {
        var nxt = syl[i + 1] || '';
        tokens.push({ ph: 'eiy'.indexOf(nxt) !== -1 ? 's' : 'k', vowel: false });
        i++;
      } else if (c === 'g') {
        var nxtg = syl[i + 1] || '';
        tokens.push({ ph: 'eiy'.indexOf(nxtg) !== -1 ? 'j' : 'g', vowel: false });
        i++;
      } else if (c === 'x') {
        tokens.push({ ph: 'ks', vowel: false });
        i++;
      } else if (c === 'y') {
        if (i === 0) { tokens.push({ ph: 'y', vowel: false }); }
        else if (i === syl.length - 1) { tokens.push({ ph: 'ee', vowel: true, key: 'y' }); }
        else { tokens.push({ ph: 'i', vowel: true, key: 'y' }); }
        i++;
      } else if (isVowel(c)) {
        tokens.push({ ph: c, vowel: true, key: c });
        i++;
      } else {
        tokens.push({ ph: c, vowel: false });
        i++;
      }
    }
    return { syl: syl, tokens: tokens };
  }

  function respellSyllable(original, stressed, isFinalWordSyllable) {
    var res = scan(original);
    var syl = res.syl;
    var tokens = res.tokens;

    // Silent final "e" with a long vowel before it (cake -> KAYK).
    var magicE = false;
    if (/[^aeiouy]e$/.test(syl) && syl.length >= 2) {
      // drop a trailing literal e token
      if (tokens.length && tokens[tokens.length - 1].ph === 'e') {
        tokens.pop();
        magicE = true;
      }
    }

    var LONG = { a: 'ay', e: 'ee', i: 'y', o: 'oh', u: 'yoo' };
    if (magicE) {
      for (var k = tokens.length - 1; k >= 0; k--) {
        if (tokens[k].vowel && tokens[k].ph.length === 1 && LONG[tokens[k].ph]) {
          tokens[k].ph = LONG[tokens[k].ph];
          break;
        }
      }
    }

    // Unstressed single vowels reduce toward schwa.
    for (var t = 0; t < tokens.length; t++) {
      var tok = tokens[t];
      if (!tok.vowel) continue;
      if (VOWEL_SOUNDS[tok.ph]) {
        tok.ph = stressed ? VOWEL_SOUNDS[tok.ph].stressed : VOWEL_SOUNDS[tok.ph].unstressed;
      }
    }

    var out = tokens.map(function (x) { return x.ph; }).join('');
    var hintKey = null;
    for (var h = 0; h < tokens.length; h++) {
      if (tokens[h].vowel && VOWEL_HINT[tokens[h].ph]) { hintKey = tokens[h].ph; break; }
    }
    if (!hintKey) {
      for (var h2 = 0; h2 < tokens.length; h2++) {
        if (tokens[h2].vowel) { hintKey = tokens[h2].ph; break; }
      }
    }
    return {
      respelled: out,
      hint: hintKey ? VOWEL_HINT[hintKey] : '',
      sounds: tokens.length
    };
  }

  /* ---------- stress heuristic ---------- */
  function stressIndex(word, syllables) {
    var n = syllables.length;
    if (n <= 1) return 0;
    var w = word.toLowerCase();
    var suffixes = ['tion', 'sion', 'cian', 'ical', 'ity', 'ify', 'ial', 'ic',
      'ious', 'eous', 'graphy', 'logy', 'nomy', 'meter'];
    for (var s = 0; s < suffixes.length; s++) {
      if (w.length > suffixes[s].length && w.slice(-suffixes[s].length) === suffixes[s]) {
        return Math.max(0, n - 2);
      }
    }
    var prefixes = ['be', 'de', 're', 'in', 'im', 'un', 'con', 'com', 'ex',
      'pre', 'pro', 'per', 'sub', 'ad', 'ac', 'at', 'ob', 'oc', 'sur', 'en'];
    for (var p = 0; p < prefixes.length; p++) {
      if (w.length > prefixes[p].length + 1 && w.indexOf(prefixes[p]) === 0) return 1;
    }
    return 0;
  }

  /* ---------- difficulty ---------- */
  function difficulty(word, syllables) {
    var score = 0;
    var w = word.toLowerCase();
    if (w.length >= 8) score += 2; else if (w.length >= 5) score += 1;
    if (syllables.length >= 4) score += 2; else if (syllables.length >= 3) score += 1;
    if (/([bcdfghjklmnpqrstvwxz]{3,})/.test(w)) score += 2;
    if (/(ough|augh|eigh|igh|tion|sion|ture|ps|pn|kn|wr|rh)/.test(w)) score += 1;
    if (/([aeiou])e$/.test(w)) score += 1;
    if (score <= 1) return { label: 'Easy', cls: 'diff-easy' };
    if (score <= 4) return { label: 'Medium', cls: 'diff-medium' };
    return { label: 'Hard', cls: 'diff-hard' };
  }

  /* ---------- per-word processing ---------- */
  function processWord(raw) {
    var word = raw.toLowerCase();
    var syllables = syllabify(word);
    var stress = stressIndex(word, syllables);
    var isFinal = true;
    var parts = syllables.map(function (syl, idx) {
      var r = respellSyllable(syl, idx === stress, idx === syllables.length - 1 && isFinal);
      return { original: syl, respelled: r.respelled, hint: r.hint, sounds: r.sounds, stressed: idx === stress };
    });
    return { word: raw, syllables: parts, stress: stress, difficulty: difficulty(word, syllables) };
  }

  /* ---------- rendering helpers ---------- */
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function readable(p, markStress) {
    return p.syllables.map(function (s) {
      return (markStress && s.stressed) ? s.respelled.toUpperCase() : s.respelled;
    }).join('-');
  }

  function plain(p) {
    return p.syllables.map(function (s) { return s.respelled; }).join('-');
  }

  function natoFor(word) {
    var out = [];
    for (var i = 0; i < word.length; i++) {
      var c = word[i].toLowerCase();
      if (NATO[c]) out.push('<span class="letter">' + esc(word[i]) + '</span> ' + NATO[c]);
    }
    return out.join(' &middot; ');
  }

  /* ---------- chart ---------- */
  function drawChart(data) {
    var canvas = document.getElementById('syllableChart');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    var labels = [], values = [];
    data.forEach(function (p, wi) {
      p.syllables.forEach(function (s) {
        labels.push(s.respelled);
        values.push(s.sounds);
      });
    });
    if (!labels.length) return;

    var padL = 40, padR = 16, padT = 20, padB = 44;
    var plotW = W - padL - padR;
    var plotH = H - padT - padB;
    var maxV = Math.max.apply(null, values);
    maxV = Math.max(maxV, 1);

    // axes
    ctx.strokeStyle = '#e9e3f2';
    ctx.lineWidth = 1;
    for (var g = 0; g <= 4; g++) {
      var y = padT + plotH - (plotH * g / 4);
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(W - padR, y);
      ctx.stroke();
      ctx.fillStyle = '#67626f';
      ctx.font = '11px -apple-system, Segoe UI, Arial';
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(maxV * g / 4)), padL - 6, y + 4);
    }

    var n = values.length;
    var slot = plotW / n;
    var barW = Math.min(52, slot * 0.62);
    for (var i = 0; i < n; i++) {
      var x = padL + slot * i + (slot - barW) / 2;
      var bh = (values[i] / maxV) * plotH;
      var by = padT + plotH - bh;
      var grad = ctx.createLinearGradient(0, by, 0, padT + plotH);
      grad.addColorStop(0, '#8f38d1');
      grad.addColorStop(1, '#60089c');
      ctx.fillStyle = grad;
      ctx.fillRect(x, by, barW, bh);
      ctx.fillStyle = '#3d0566';
      ctx.font = 'bold 11px -apple-system, Segoe UI, Arial';
      ctx.textAlign = 'center';
      ctx.fillText(String(values[i]), x + barW / 2, by - 5);
      ctx.fillStyle = '#201c28';
      ctx.font = '11px ui-monospace, Menlo, Consolas, monospace';
      var label = labels[i].length > 9 ? labels[i].slice(0, 8) + '\u2026' : labels[i];
      ctx.fillText(label, x + barW / 2, padT + plotH + 16);
    }

    ctx.fillStyle = '#67626f';
    ctx.font = '11px -apple-system, Segoe UI, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('sound units per syllable', padL, H - 8);
  }

  /* ---------- main ---------- */
  var els = {};
  function cache() {
    ['wordInput', 'errorBox', 'results', 'statSyll', 'statChars', 'statStress',
      'statDiff', 'copyBtn', 'resetBtn', 'genBtn', 'clearBtn', 'optNato',
      'optStress', 'genNote'].forEach(function (id) { els[id] = document.getElementById(id); });
  }

  var lastPlain = '';
  var lastNato = '';

  function showError(msg) {
    els.errorBox.textContent = msg;
    els.errorBox.classList.remove('d-none');
  }
  function clearError() {
    els.errorBox.textContent = '';
    els.errorBox.classList.add('d-none');
  }

  function currentStyle() {
    var radios = document.querySelectorAll('input[name="style"]');
    for (var i = 0; i < radios.length; i++) if (radios[i].checked) return radios[i].value;
    return 'respelling';
  }

  function generate() {
    clearError();
    var raw = els.wordInput.value.trim();
    if (!raw) {
      showError('Please type a word or name to spell out.');
      return;
    }
    if (raw.length > 120) {
      showError('That is longer than 120 characters. Please shorten it.');
      return;
    }
    var cleaned = raw.replace(/[^A-Za-z0-9'\-\s\u00C0-\u024F]/g, ' ');
    var words = cleaned.split(/\s+/).filter(function (w) { return w.replace(/[^A-Za-z0-9\u00C0-\u024F]/g, '').length > 0; });
    if (!words.length) {
      showError('No pronounceable letters found. Use letters, spaces, hyphens or apostrophes.');
      return;
    }
    if (words.length > 12) {
      showError('Please limit the input to 12 words or fewer.');
      return;
    }

    var processed = words.map(processWord);
    var style = currentStyle();
    var markStress = els.optStress.checked;

    // stats
    var totalSyll = processed.reduce(function (a, p) { return a + p.syllables.length; }, 0);
    var letterCount = words.join('').replace(/[^A-Za-z0-9\u00C0-\u024F]/g, '').length;
    els.statSyll.textContent = totalSyll;
    els.statChars.textContent = letterCount;
    var stressWord = processed.reduce(function (best, p) {
      return p.syllables.length > best.syllables.length ? p : best;
    }, processed[0]);
    els.statStress.textContent = stressWord.syllables[stressWord.stress] ?
      stressWord.syllables[stressWord.stress].respelled.toUpperCase() : '\u2014';
    var worst = processed.reduce(function (best, p) {
      var order = { Easy: 0, Medium: 1, Hard: 2 };
      return order[p.difficulty.label] > order[best.difficulty.label] ? p : best;
    }, processed[0]);
    els.statDiff.innerHTML = '<span class="badge-diff ' + worst.difficulty.cls + '">' +
      worst.difficulty.label + '</span>';

    // results
    var html = '';
    var mainLines = processed.map(function (p) {
      if (style === 'simple') return esc(plain(p));
      return esc(readable(p, markStress));
    });
    html += '<div class="result-card"><h3>Readable respelling</h3>' +
      '<div class="result-value">' + mainLines.join(' &middot; ') + '</div></div>';

    html += '<div class="result-card say"><h3>Syllable breakdown</h3><div class="syllable-row">';
    processed.forEach(function (p, wi) {
      if (wi > 0) html += '<span class="syllable-chip" style="border:none;background:transparent;min-width:0"><span class="syl">|</span></span>';
      p.syllables.forEach(function (s) {
        var sylText = (style === 'syllables' && markStress && s.stressed) ? s.respelled.toUpperCase() : s.respelled;
        html += '<span class="syllable-chip"><span class="syl' + (s.stressed ? ' stressed' : '') + '">' +
          esc(sylText) + '</span>';
        if (style === 'syllables' && s.hint) {
          html += '<span class="hint">' + s.hint + '</span>';
        }
        html += '</span>';
      });
    });
    html += '</div></div>';

    if (els.optNato.checked) {
      html += '<div class="result-card"><h3>NATO alphabet spelling</h3>' +
        '<div class="nato-line">' +
        processed.map(function (p) { return natoFor(p.word); }).join(' &nbsp;/&nbsp; ') +
        '</div></div>';
    }

    els.results.innerHTML = html;
    els.copyBtn.disabled = false;
    els.resetBtn.disabled = false;
    els.genNote.textContent = words.length + ' word' + (words.length === 1 ? '' : 's') + ' \u00b7 ' + totalSyll + ' syllables';

    lastPlain = processed.map(function (p) { return plain(p); }).join(' ');
    lastNato = processed.map(function (p) {
      return p.word.split('').map(function (c) { return NATO[c.toLowerCase()] || c; }).join(' ');
    }).join(' / ');

    drawChart(processed);
  }

  function reset() {
    els.wordInput.value = '';
    els.results.innerHTML = '<p class="text-muted mb-0">Your spelling will appear here \u2014 press <strong>Generate spelling</strong> after typing a word.</p>';
    ['statSyll', 'statChars', 'statStress', 'statDiff'].forEach(function (id) { els[id].textContent = '\u2014'; });
    els.statDiff.innerHTML = '\u2014';
    els.copyBtn.disabled = true;
    els.resetBtn.disabled = true;
    els.genNote.textContent = 'No word yet';
    clearError();
    var canvas = document.getElementById('syllableChart');
    if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    lastPlain = '';
    lastNato = '';
    els.wordInput.focus();
  }

  function copyResult() {
    if (!lastPlain) return;
    var text = lastPlain + (lastNato ? '\nNATO: ' + lastNato : '');
    var done = function () {
      var old = els.copyBtn.textContent;
      els.copyBtn.textContent = 'Copied!';
      setTimeout(function () { els.copyBtn.textContent = old; }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallbackCopy);
    } else {
      fallbackCopy();
    }
    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    cache();
    els.genBtn.addEventListener('click', generate);
    els.clearBtn.addEventListener('click', reset);
    els.resetBtn.addEventListener('click', reset);
    els.copyBtn.addEventListener('click', copyResult);
    els.wordInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); generate(); }
    });
    document.querySelectorAll('input[name="style"], #optStress').forEach(function (el) {
      el.addEventListener('change', function () { if (lastPlain) generate(); });
    });
    els.optNato.addEventListener('change', function () { if (lastPlain) generate(); });
  });
})();
