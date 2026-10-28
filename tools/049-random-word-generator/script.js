/* Random Word Generator - vanilla JS, no dependencies.
   Word bank: common English nouns and verbs, ASCII only. */
(function () {
  'use strict';

  var NOUNS = ['anchor', 'apron', 'arrow', 'atlas', 'basket', 'beacon', 'bicycle', 'blanket', 'bottle',
    'bridge', 'bucket', 'button', 'cabin', 'cactus', 'camera', 'candle', 'canvas', 'carpet', 'castle',
    'cave', 'chair', 'chalk', 'cherry', 'chimney', 'circle', 'clock', 'cloud', 'coast', 'coffee',
    'coin', 'compass', 'cookie', 'coral', 'crayon', 'cricket', 'crown', 'cupboard', 'curtain', 'dagger',
    'desert', 'diamond', 'dinner', 'dolphin', 'donkey', 'dragon', 'drawer', 'drum', 'eagle', 'ember',
    'engine', 'envelope', 'falcon', 'feather', 'fence', 'ferry', 'forest', 'fossil', 'fountain', 'garden',
    'garlic', 'glacier', 'goblet', 'granite', 'guitar', 'hammock', 'harbour', 'harp', 'helmet', 'hollow',
    'honey', 'hornet', 'island', 'jacket', 'jungle', 'kettle', 'kitten', 'ladder', 'lantern', 'lattice',
    'lemon', 'lighthouse', 'lizard', 'lobster', 'magnet', 'mango', 'maple', 'marble', 'meadow', 'melon',
    'mirror', 'mitten', 'monsoon', 'mosaic', 'mountain', 'mushroom', 'needle', 'notebook', 'oasis', 'octopus',
    'orchard', 'otter', 'paddle', 'palace', 'panther', 'paper', 'parrot', 'pebble', 'pelican', 'penguin',
    'pepper', 'pillow', 'planet', 'plank', 'pocket', 'postcard', 'prairie', 'pumpkin', 'puzzle', 'quarry',
    'quilt', 'rabbit', 'radish', 'raft', 'rainbow', 'ribbon', 'river', 'rocket', 'rooster', 'saddle',
    'sailor', 'salad', 'sandwich', 'sapphire', 'satchel', 'scarecrow', 'scissors', 'seashell', 'shadow', 'shelter',
    'sherbet', 'sledge', 'slipper', 'sparrow', 'spider', 'spiral', 'spring', 'squirrel', 'stadium', 'statue',
    'steamboat', 'stomach', 'storm', 'strawberry', 'suitcase', 'sunflower', 'sunset', 'sweater', 'temple', 'tent',
    'thistle', 'thunder', 'tiger', 'toaster', 'tomato', 'torch', 'tortoise', 'tower', 'train', 'treasure',
    'trolley', 'trumpet', 'tunnel', 'turtle', 'umbrella', 'unicorn', 'valley', 'vanilla', 'velvet', 'vessel',
    'village', 'violin', 'volcano', 'voyage', 'walnut', 'walrus', 'wagon', 'waterfall', 'whale', 'whistle',
    'willow', 'window', 'winter', 'wizard', 'wombat', 'yacht', 'yarrow', 'zebra', 'zeppelin', 'zipper'];

  var VERBS = ['admire', 'arrange', 'assemble', 'balance', 'bargain', 'borrow', 'breathe', 'browse', 'build',
    'carve', 'catch', 'celebrate', 'chase', 'chew', 'climb', 'collect', 'compare', 'compose', 'conquer', 'cook',
    'crawl', 'create', 'decide', 'decorate', 'deliver', 'design', 'discover', 'divide', 'draw', 'dream',
    'drift', 'earn', 'encourage', 'enjoy', 'escape', 'examine', 'explain', 'explore', 'fetch', 'float',
    'fold', 'follow', 'forgive', 'gather', 'glide', 'greet', 'guard', 'hammer', 'harvest', 'hide',
    'hurry', 'imagine', 'invent', 'invite', 'jog', 'juggle', 'knead', 'knit', 'laugh', 'launch',
    'learn', 'lift', 'listen', 'mend', 'measure', 'mix', 'mould', 'navigate', 'notice', 'observe',
    'organise', 'pack', 'paint', 'pause', 'peel', 'persuade', 'plant', 'polish', 'ponder', 'practice',
    'prepare', 'protect', 'publish', 'puzzle', 'question', 'reach', 'recall', 'record', 'recycle', 'repair',
    'rescue', 'restore', 'rewrite', 'roam', 'scatter', 'sculpt', 'search', 'sharpen', 'shelter', 'shine',
    'sketch', 'sketch out', 'soar', 'solve', 'sort', 'sparkle', 'sprint', 'squeeze', 'stack', 'stretch',
    'stroll', 'study', 'swim', 'teach', 'tend', 'throw', 'trace', 'travel', 'treasure', 'trim',
    'twist', 'unfold', 'unpack', 'wander', 'whisper', 'wonder', 'wrap', 'write', 'yell', 'zoom'];

  var words = [];

  var form = document.getElementById('wordForm');
  var countInput = document.getElementById('countInput');
  var lengthSelect = document.getElementById('lengthSelect');
  var letterSelect = document.getElementById('letterSelect');
  var typeSelect = document.getElementById('typeSelect');
  var caseSelect = document.getElementById('caseSelect');
  var uniqueCheck = document.getElementById('uniqueCheck');
  var formError = document.getElementById('formError');
  var resultsSection = document.getElementById('resultsSection');
  var wordGrid = document.getElementById('wordGrid');
  var copyBtn = document.getElementById('copyBtn');
  var shuffleBtn = document.getElementById('shuffleBtn');
  var copyNote = document.getElementById('copyNote');
  var chart = document.getElementById('letterChart');
  var lastOptions = null;

  function buildBank() {
    NOUNS.forEach(function (word) {
      words.push({ word: word, type: 'noun' });
    });
    VERBS.forEach(function (word) {
      words.push({ word: word, type: 'verb' });
    });
  }

  function fillLetterOptions() {
    var letters = {};
    words.forEach(function (entry) {
      letters[entry.word.charAt(0).toUpperCase()] = true;
    });
    Object.keys(letters).sort().forEach(function (letter) {
      var option = document.createElement('option');
      option.value = letter;
      option.textContent = letter;
      letterSelect.appendChild(option);
    });
  }

  function matchesLength(word, band) {
    if (band === 'short') { return word.length <= 5; }
    if (band === 'medium') { return word.length >= 6 && word.length <= 9; }
    if (band === 'long') { return word.length >= 10; }
    return true;
  }

  function matchesType(entry, type) {
    if (type === 'noun') { return entry.type === 'noun'; }
    if (type === 'verb') { return entry.type === 'verb'; }
    return true;
  }

  function applyCase(word, mode) {
    if (mode === 'upper') { return word.toUpperCase(); }
    if (mode === 'title') {
      return word.replace(/\b[a-z]/g, function (letter) { return letter.toUpperCase(); });
    }
    return word;
  }

  function showError(message) {
    formError.textContent = message;
    formError.classList.remove('d-none');
    resultsSection.classList.add('d-none');
  }

  function clearError() {
    formError.textContent = '';
    formError.classList.add('d-none');
  }

  function randomInt(max) {
    if (window.crypto && window.crypto.getRandomValues) {
      var buffer = new Uint32Array(1);
      var limit = Math.floor(4294967296 / max) * max;
      var value = limit + 1;
      while (value >= limit) {
        window.crypto.getRandomValues(buffer);
        value = buffer[0];
      }
      return value % max;
    }
    return Math.floor(Math.random() * max);
  }

  function readOptions() {
    var count = parseInt(countInput.value, 10);
    if (isNaN(count)) { count = 0; }
    return {
      count: count,
      length: lengthSelect.value,
      letter: letterSelect.value,
      type: typeSelect.value,
      letterCase: caseSelect.value,
      unique: uniqueCheck.checked
    };
  }

  function pickWords(options) {
    if (isNaN(options.count) || options.count < 1 || options.count > 50) {
      showError('Enter a whole number of words between 1 and 50.');
      return null;
    }

    var pool = words.filter(function (entry) {
      if (!matchesLength(entry.word, options.length)) { return false; }
      if (!matchesType(entry, options.type)) { return false; }
      if (options.letter !== 'any' && entry.word.charAt(0).toUpperCase() !== options.letter) { return false; }
      return true;
    });

    if (pool.length === 0) {
      showError('No words match that combination of filters. Try a wider length, a different starting letter, or mixed word types.');
      return null;
    }

    if (options.unique && options.count > pool.length) {
      showError('Only ' + pool.length + ' words match your filters, so ' + options.count +
        ' unique words cannot be drawn. Lower the count, or untick "No repeats in a single draw".');
      return null;
    }

    var drawn = [];
    var available = pool.slice();

    for (var i = 0; i < options.count; i += 1) {
      var index = randomInt(available.length);
      drawn.push(available[index].word);
      if (options.unique) {
        available.splice(index, 1);
      }
    }

    clearError();
    return drawn;
  }

  function renderList(drawn, options) {
    wordGrid.innerHTML = '';
    drawn.forEach(function (word, index) {
      var item = document.createElement('li');
      item.setAttribute('data-index', String(index + 1).padStart(2, '0'));
      item.textContent = applyCase(word, options.letterCase);
      wordGrid.appendChild(item);
    });
  }

  function renderStats(drawn, options) {
    var lengths = drawn.map(function (word) { return word.length; });
    var shortest = drawn.reduce(function (a, b) { return b.length < a.length ? b : a; });
    var longest = drawn.reduce(function (a, b) { return b.length > a.length ? b : a; });
    var total = lengths.reduce(function (a, b) { return a + b; }, 0);
    var average = total / drawn.length;

    document.getElementById('wordCountValue').textContent = String(drawn.length);
    document.getElementById('drawSummary').textContent = describeOptions(options, drawn.length);
    document.getElementById('shortestWord').textContent = applyCase(shortest, options.letterCase) + ' (' + shortest.length + ')';
    document.getElementById('longestWord').textContent = applyCase(longest, options.letterCase) + ' (' + longest.length + ')';
    document.getElementById('averageLength').textContent = average.toFixed(1) + ' letters';
    document.getElementById('totalLetters').textContent = String(total);
  }

  function describeOptions(options, actual) {
    var parts = [];
    parts.push(actual + (actual === 1 ? ' word' : ' words'));
    parts.push(options.length === 'any' ? 'any length' : options.length + ' words');
    parts.push(options.letter === 'any' ? 'any starting letter' : 'starting with ' + options.letter);
    if (options.type === 'noun') { parts.push('nouns only'); }
    if (options.type === 'verb') { parts.push('verbs only'); }
    parts.push(options.unique ? 'no repeats' : 'repeats allowed');
    return parts.join(' | ');
  }

  function drawChart(drawn) {
    var context = chart.getContext('2d');
    var width = chart.width;
    var height = chart.height;
    var counts = {};

    drawn.forEach(function (word) {
      var letter = word.charAt(0).toUpperCase();
      counts[letter] = (counts[letter] || 0) + 1;
    });

    var letters = Object.keys(counts).sort();
    var max = 0;
    letters.forEach(function (letter) { max = Math.max(max, counts[letter]); });

    context.clearRect(0, 0, width, height);

    var paddingLeft = 26;
    var paddingBottom = 26;
    var paddingTop = 12;
    var plotWidth = width - paddingLeft - 10;
    var plotHeight = height - paddingTop - paddingBottom;

    context.strokeStyle = '#e7d8f5';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(paddingLeft, paddingTop);
    context.lineTo(paddingLeft, paddingTop + plotHeight);
    context.lineTo(paddingLeft + plotWidth, paddingTop + plotHeight);
    context.stroke();

    var slot = plotWidth / letters.length;
    var barWidth = Math.min(slot * 0.6, 34);

    letters.forEach(function (letter, index) {
      var barHeight = max === 0 ? 0 : (counts[letter] / max) * (plotHeight - 8);
      var x = paddingLeft + slot * index + (slot - barWidth) / 2;
      var y = paddingTop + plotHeight - barHeight;

      context.fillStyle = '#60089c';
      context.fillRect(x, y, barWidth, barHeight);

      context.fillStyle = '#48066f';
      context.font = '600 11px sans-serif';
      context.textAlign = 'center';
      context.fillText(letter, x + barWidth / 2, paddingTop + plotHeight + 15);
      context.fillStyle = '#6b6076';
      context.font = '10px sans-serif';
      context.fillText(String(counts[letter]), x + barWidth / 2, y - 4);
    });
  }

  function generate(options) {
    var drawn = pickWords(options);
    if (!drawn) { return; }

    lastOptions = options;
    renderList(drawn, options);
    renderStats(drawn, options);
    drawChart(drawn);
    copyNote.textContent = '';
    resultsSection.classList.remove('d-none');
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    generate(readOptions());
  });

  shuffleBtn.addEventListener('click', function () {
    if (lastOptions) { generate(lastOptions); }
  });

  copyBtn.addEventListener('click', function () {
    var items = Array.prototype.map.call(wordGrid.children, function (item) {
      return item.textContent;
    });
    var text = items.join('\n');

    function done() { copyNote.textContent = 'List copied to the clipboard.'; }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        copyNote.textContent = 'Copy failed. Select the list and copy it manually.';
      });
    } else {
      copyNote.textContent = 'Copy is not supported in this browser. Select the list and copy it manually.';
    }
  });

  countInput.addEventListener('input', clearError);

  buildBank();
  fillLetterOptions();
  document.getElementById('year').textContent = String(new Date().getFullYear());
  generate(readOptions());
})();
