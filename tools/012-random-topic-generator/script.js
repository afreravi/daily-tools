/* Random Topic Generator — vanilla JS, no dependencies */
(function () {
  'use strict';

  var CATEGORIES = [
    {
      id: 'persuasive',
      label: 'Persuasive & debate',
      blurb: 'Argue a position',
      topics: [
        'Should voting be compulsory in national elections?',
        'Is homework still a useful learning tool in secondary school?',
        'Should social media platforms be liable for harmful content posted by users?',
        'Are school uniforms a distraction from more important issues?',
        'Should university education be free at the point of use?',
        'Is remote work better for productivity than office work?',
        'Should advertising to children under twelve be banned?',
        'Do curfews for teenagers protect them or restrict them unfairly?',
        'Should governments tax sugary drinks to change consumer behaviour?',
        'Is it ever right to break a law you believe is unjust?',
        'Should testing on animals be phased out entirely?',
        'Are online reviews a trustworthy guide for buying decisions?'
      ]
    },
    {
      id: 'creative',
      label: 'Creative writing',
      blurb: 'Stories and scenes',
      topics: [
        'A lighthouse keeper receives a letter addressed to someone who never lived',
        'Two strangers discover they have been swapping dreams for a month',
        'The last shop on a street refuses to sell to anyone under thirty',
        'A city where every promise made aloud becomes physically visible',
        'A detective investigates a crime that has not happened yet',
        'A library where the books rewrite themselves overnight',
        'Someone inherits a house with a room that was not on the plans',
        'A radio host keeps receiving calls from a caller who died last year',
        'A town holds an annual festival for a disaster nobody remembers',
        'A translator realises one word in their new language has no equivalent',
        'A gardener grows a plant that answers questions nobody asked',
        'A clockmaker builds a clock that runs one minute behind everyone else'
      ]
    },
    {
      id: 'science',
      label: 'Science & technology',
      blurb: 'Research and innovation',
      topics: [
        'How CRISPR gene editing could change the treatment of inherited disease',
        'What quantum computing will and will not realistically replace',
        'Why sleep is the most underrated part of physical recovery',
        'How machine learning models actually learn from training data',
        'The engineering challenge of storing renewable energy at grid scale',
        'How mRNA vaccine platforms were adapted after 2020',
        'Why antibiotic resistance is a slow-moving global crisis',
        'What happens in the brain during sustained attention',
        'How satellites measure sea level rise to the centimetre',
        'The physics behind why bicycles stay upright',
        'How open-source software quietly runs most of the internet',
        'What the microbiome does and what the hype gets wrong'
      ]
    },
    {
      id: 'history',
      label: 'History & society',
      blurb: 'The past and its lessons',
      topics: [
        'How the printing press reshaped political power in Europe',
        'What the Silk Road actually carried besides goods',
        'Why the Industrial Revolution started where it did',
        'How ordinary people experienced the Great Depression',
        'The role of radio propaganda in twentieth-century conflict',
        'How public sanitation changed life expectancy more than medicine did',
        'What the fall of a currency looks like from the inside',
        'How women entered the industrial workforce during wartime',
        'Why some empires collapse quickly and others fade for centuries',
        'How maps have been used to claim territory that was never occupied',
        'What daily life was like in a medieval market town',
        'How the invention of the shipping container rewrote global trade'
      ]
    },
    {
      id: 'ethics',
      label: 'Ethics & philosophy',
      blurb: 'Right, wrong, and grey areas',
      topics: [
        'Is it ethical to edit the genes of an unborn child?',
        'Should companies be allowed to profit from personal data?',
        'What do we owe to people who will exist in a hundred years?',
        'Can a machine ever be held morally responsible for a decision?',
        'Is privacy a right you can trade away for convenience?',
        'Should we use algorithms to decide who receives scarce medical care?',
        'Is forgiveness always better than punishment?',
        'What makes a promise binding when circumstances change?',
        'Should there be limits on how much wealth one person can hold?',
        'Is it dishonest to present only the evidence that supports your view?',
        'Do animals have interests that humans are obliged to respect?',
        'Is free speech absolute or does it carry responsibilities?'
      ]
    },
    {
      id: 'business',
      label: 'Business & economics',
      blurb: 'Work, money, markets',
      topics: [
        'Why small businesses fail in their first three years',
        'How subscription pricing changes what customers expect',
        'What inflation actually does to a household budget over a decade',
        'Should employees own shares in the companies they work for?',
        'How supply chains break, and why nobody notices until they do',
        'The economics of why concert tickets are so hard to buy at face value',
        'What makes a brand survive a public crisis',
        'How remote hiring changed the geography of talent',
        'Why productivity growth matters more than almost any other statistic',
        'The real cost of cheap fast fashion',
        'How a four-day working week affects output and wellbeing',
        'What a central bank actually does when it raises interest rates'
      ]
    },
    {
      id: 'education',
      label: 'Education & learning',
      blurb: 'How people learn',
      topics: [
        'Why spaced repetition beats cramming for long-term memory',
        'Should schools teach personal finance before algebra?',
        'How note-taking style changes what you remember',
        'Are exams a fair measure of understanding?',
        'What role should failure play in a classroom?',
        'How reading aloud helps language acquisition at any age',
        'Should coding be a compulsory subject in secondary school?',
        'What makes a good teacher, according to the research',
        'How group projects can help and hurt learning',
        'Should students choose their own reading material?',
        'The case for and against learning a second language early',
        'How the shift to digital textbooks changed studying habits'
      ]
    },
    {
      id: 'health',
      label: 'Health & lifestyle',
      blurb: 'Body, mind, habits',
      topics: [
        'What the evidence actually says about intermittent fasting',
        'How to build an exercise habit that survives a busy month',
        'Why walking is an underrated form of cardiovascular training',
        'What stress does to the body over months rather than minutes',
        'How screen time before bed affects sleep quality',
        'Is there such a thing as a healthy breakfast, universally?',
        'The difference between feeling tired and being sleep-deprived',
        'How social connection affects physical health outcomes',
        'Why strength training matters more as you get older',
        'What hydration advice is based on evidence and what is folklore',
        'How to tell reliable health advice from wellness marketing',
        'The psychology of habit formation and how long it really takes'
      ]
    },
    {
      id: 'environment',
      label: 'Environment & climate',
      blurb: 'Planet and policy',
      topics: [
        'Which personal climate actions actually reduce emissions most',
        'How cities can be redesigned to survive extreme heat',
        'Why plastic recycling rates are lower than most people think',
        'What happens to a river when its upstream wetlands are drained',
        'The case for and against nuclear power in a low-carbon grid',
        'How food waste travels from farm to bin, and where to intervene',
        'What rewilding projects have achieved and where they struggled',
        'How air quality affects children in cities',
        'The hidden carbon cost of building with concrete',
        'Should water be priced to reflect scarcity?',
        'How melting permafrost changes the climate maths',
        'What a circular economy would look like for electronics'
      ]
    },
    {
      id: 'culture',
      label: 'Arts & culture',
      blurb: 'Media, music, design',
      topics: [
        'How streaming changed the way songs are written',
        'What makes a film score memorable',
        'Should museums return artefacts to their countries of origin?',
        'How street art moves from vandalism to gallery wall',
        'Why some novels become classics and others are forgotten',
        'How translation shapes the meaning of poetry',
        'The influence of architecture on how a city is used',
        'How photography changed the way we remember events',
        'What video games borrow from cinema, and where they diverge',
        'Why fashion trends recycle on roughly a twenty-year cycle',
        'How podcasts rebuilt long-form conversation as an art form',
        'Should AI-generated art be labelled as such?'
      ]
    }
  ];

  // Labels are separate clauses so the underlying sentence always stays grammatical.
  var TONE_FRAMES = {
    balanced: { pre: [''], suf: [''] },
    academic: {
      pre: ['Academic prompt: ', 'Research question: ', 'Seminar discussion: '],
      suf: [' Support your answer with cited evidence.', ' Discuss with reference to recent research.', '']
    },
    casual: {
      pre: ['Just curious: ', 'Coffee-break question: ', ''],
      suf: ['', ' — what do you actually think?', '']
    },
    provocative: {
      pre: ['Argue the uncomfortable side: ', 'Unpopular opinion: ', 'Steelman this claim: '],
      suf: ['', ' — make the case nobody wants to hear.', '']
    },
    funny: {
      pre: ['Deeply unserious debate: ', 'Overly dramatic investigation: ', 'Hot take, zero evidence: '],
      suf: ['', ' (evidence strictly optional)', '']
    }
  };
  var AUDIENCE_PREFIX = {
    school: 'For a school assignment: ',
    highschool: 'For a high school essay: ',
    college: 'For a university-level paper: ',
    professional: 'For a workplace briefing: '
  };

  var DEFAULT_HISTORY_KEY = '__sessionTopics';

  var state = {
    category: 'mixed',
    history: {}
  };

  // Restore no-repeat history for this tab session
  try {
    var saved = window.sessionStorage.getItem(DEFAULT_HISTORY_KEY);
    if (saved) { state.history = JSON.parse(saved) || {}; }
  } catch (e) {
    state.history = {};
  }

  var el = {
    form: document.getElementById('topicForm'),
    grid: document.getElementById('categoryGrid'),
    count: document.getElementById('count'),
    errCount: document.getElementById('errCount'),
    tone: document.getElementById('tone'),
    audience: document.getElementById('audience'),
    noRepeat: document.getElementById('noRepeat'),
    copyBtn: document.getElementById('copyBtn'),
    resetBtn: document.getElementById('resetBtn'),
    status: document.getElementById('statusLine'),
    results: document.getElementById('resultsSection'),
    list: document.getElementById('resultList'),
    canvas: document.getElementById('chartCanvas'),
    chartNote: document.getElementById('chartNote'),
    year: document.getElementById('year')
  };

  var lastTopics = [];

  function getCategory(id) {
    for (var i = 0; i < CATEGORIES.length; i++) {
      if (CATEGORIES[i].id === id) { return CATEGORIES[i]; }
    }
    return null;
  }

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function pluralise(n, word) {
    return n + ' ' + word + (n === 1 ? '' : 's');
  }

  function historyKey(categoryId) {
    return 'cat:' + categoryId;
  }

  function usedTopics(categoryId) {
    var key = historyKey(categoryId);
    if (!state.history[key]) { state.history[key] = []; }
    return state.history[key];
  }

  function persistHistory() {
    try {
      window.sessionStorage.setItem(DEFAULT_HISTORY_KEY, JSON.stringify(state.history));
    } catch (e) { /* storage unavailable — history stays in memory */ }
  }

  function buildCategoryGrid() {
    var html = '';
    for (var i = 0; i < CATEGORIES.length; i++) {
      var c = CATEGORIES[i];
      html += '<div class="col-12 col-sm-6 col-lg-4 category-chip">' +
        '<div class="custom-control custom-radio">' +
        '<input type="radio" class="custom-control-input" id="cat-' + c.id + '" name="category" value="' + c.id + '">' +
        '<label class="custom-control-label" for="cat-' + c.id + '">' + c.label +
        '<small>' + c.blurb + ' &middot; ' + c.topics.length + ' topics</small>' +
        '</label></div></div>';
    }
    el.grid.innerHTML = html;
  }

  // Strips the trailing period only when a new clause is appended, so framing
  // never produces a run-on like "…research.  — make the case".
  function normaliseBase(base) {
    var t = String(base).trim();
    t = t.replace(/^([A-Za-z][A-Za-z\s,&'\-]*?) question:\s*/i, '');
    return t;
  }

  function formatTopic(base, categoryLabel) {
    var tone = el.tone.value;
    var audience = el.audience.value;
    var frames = TONE_FRAMES[tone] || TONE_FRAMES.balanced;
    var text = normaliseBase(base);

    var pre = pick(frames.pre);
    var suf = pick(frames.suf);

    if (pre) {
      text = pre + text;
    }
    if (suf) {
      if (/[.!?]$/.test(text)) { text = text.replace(/([.!?])$/, ''); }
      text = text + suf;
      if (!/[.!?]$/.test(text)) { text += '.'; }
    }
    if (AUDIENCE_PREFIX[audience]) {
      text = AUDIENCE_PREFIX[audience] + text;
    }
    return { text: text, label: categoryLabel };
  }

  function poolFor(categoryId) {
    var pools = categoryId === 'mixed' ? CATEGORIES.slice() : [getCategory(categoryId)];
    var out = [];
    for (var i = 0; i < pools.length; i++) {
      for (var j = 0; j < pools[i].topics.length; j++) {
        out.push({ base: pools[i].topics[j], label: pools[i].label });
      }
    }
    return out;
  }

  function gather(categoryId, amount) {
    if (!el.noRepeat.checked) {
      var all = shuffle(poolFor(categoryId));
      var repeated = [];
      for (var i = 0; all.length && i < amount; i++) {
        repeated.push(all[i % all.length]);
      }
      return repeated;
    }

    // Prefer unseen topics, widening to the full pool, then recycle the
    // category history once every bank has been served.
    var used = usedTopics(categoryId);
    var key = historyKey(categoryId);
    var chosen = [];
    var seenThis = {};
    var stages = [poolFor(categoryId), poolFor('mixed')];

    for (var s2 = 0; s2 < stages.length && chosen.length < amount; s2++) {
      var fresh = stages[s2].filter(function (t) {
        return used.indexOf(t.base) === -1 && !seenThis[t.base];
      });
      shuffle(fresh);
      for (var f = 0; f < fresh.length && chosen.length < amount; f++) {
        seenThis[fresh[f].base] = true;
        chosen.push(fresh[f]);
      }
    }

    if (chosen.length < amount) {
      state.history[key] = [];
      var recycled = shuffle(poolFor(categoryId));
      for (var r = 0; recycled.length && chosen.length < amount; r++) {
        chosen.push(recycled[r % recycled.length]);
        if (r >= recycled.length) { break; }
      }
    }

    return chosen.slice(0, amount);
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
    return arr;
  }

  function validateCount() {
    var raw = el.count.value;
    if (raw === '' || raw === null) {
      return { ok: false, msg: 'Enter how many topics you need (1 to 30).' };
    }
    var n = Number(raw);
    if (!isFinite(n) || Math.floor(n) !== n) {
      return { ok: false, msg: 'Use a whole number between 1 and 30.' };
    }
    if (n < 1) {
      return { ok: false, msg: 'Please request at least 1 topic.' };
    }
    if (n > 30) {
      return { ok: false, msg: 'Please request at most 30 topics per click.' };
    }
    return { ok: true, value: n };
  }

  function renderResults(items) {
    var html = '';
    for (var i = 0; i < items.length; i++) {
      var it = items[i];
      html += '<li class="topic-item"><span class="topic-tag">' + it.label + '</span>' + escapeHtml(it.text) + '</li>';
    }
    el.list.innerHTML = html;
    el.results.classList.remove('d-none');
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function tally(items) {
    var counts = {};
    var order = [];
    for (var i = 0; i < items.length; i++) {
      var lbl = items[i].label;
      if (!counts[lbl]) { counts[lbl] = 0; order.push(lbl); }
      counts[lbl]++;
    }
    return { counts: counts, order: order };
  }

  function drawChart(items) {
    var canvas = el.canvas;
    if (!canvas || !canvas.getContext) { return; }
    var ctx = canvas.getContext('2d');
    var W = canvas.width;
    var H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!items.length) { return; }

    var data = tally(items);
    var labels = data.order.slice().sort(function (a, b) { return data.counts[b] - data.counts[a]; });
    var max = Math.max.apply(null, labels.map(function (l) { return data.counts[l]; }));

    var left = 150;
    var right = 34;
    var top = 26;
    var rowH = Math.min(30, (H - top - 14) / labels.length);
    var barH = Math.max(10, rowH - 10);
    var plotW = W - left - right;

    ctx.fillStyle = '#6d6675';
    ctx.font = '12px -apple-system, Segoe UI, Roboto, sans-serif';
    ctx.textBaseline = 'middle';

    for (var i = 0; i < labels.length; i++) {
      var y = top + i * rowH;
      var value = data.counts[labels[i]];
      var w = max ? (value / max) * plotW : 0;

      ctx.fillStyle = '#3d3644';
      ctx.textAlign = 'right';
      var label = labels[i];
      if (label.length > 20) { label = label.slice(0, 19) + '…'; }
      ctx.fillText(label, left - 12, y + barH / 2 + 1);

      // Track
      ctx.fillStyle = '#f1ecf7';
      roundRect(ctx, left, y, plotW, barH, 5);
      ctx.fill();

      // Bar
      var grad = ctx.createLinearGradient(left, 0, left + Math.max(w, 1), 0);
      grad.addColorStop(0, '#60089c');
      grad.addColorStop(1, '#8a3fbf');
      ctx.fillStyle = grad;
      roundRect(ctx, left, y, Math.max(w, 2), barH, 5);
      ctx.fill();

      ctx.fillStyle = '#37055a';
      ctx.textAlign = 'left';
      ctx.fillText(String(value), left + Math.max(w, 2) + 8, y + barH / 2 + 1);
    }
  }

  function roundRect(ctx, x, y, w, h, r) {
    r = Math.min(r, h / 2, w / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function setStatus(msg, isError) {
    el.status.textContent = msg;
    el.status.style.color = isError ? '#a1123c' : '';
  }

  function handleGenerate(e) {
    if (e) { e.preventDefault(); }

    var check = validateCount();
    el.errCount.textContent = check.ok ? '' : check.msg;
    el.count.classList.toggle('is-invalid', !check.ok);
    if (!check.ok) {
      setStatus('Fix the highlighted field, then try again.', true);
      el.count.focus();
      return;
    }

    var items = gather(state.category, check.value);
    if (!items.length) {
      setStatus('No topics available for that combination. Try another category.', true);
      return;
    }

    var formatted = [];
    var used = usedTopics(state.category);
    for (var i = 0; i < items.length; i++) {
      var f = formatTopic(items[i].base, items[i].label);
      formatted.push(f);
      if (used.indexOf(items[i].base) === -1) { used.push(items[i].base); }
    }
    persistHistory();

    lastTopics = formatted;
    renderResults(formatted);
    drawChart(formatted);
    el.copyBtn.disabled = false;

    var catLabel = state.category === 'mixed' ? 'all categories' : getCategory(state.category).label;
    setStatus('Generated ' + pluralise(formatted.length, 'topic') + ' from ' + catLabel + '.', false);
    el.results.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function handleCopy() {
    if (!lastTopics.length) { return; }
    var text = lastTopics.map(function (t, i) {
      return (i + 1) + '. ' + t.text + '  [' + t.label + ']';
    }).join('\n');

    function fallbackCopy() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setStatus('Copied ' + pluralise(lastTopics.length, 'topic') + ' to your clipboard.', false);
      }).catch(function () {
        fallbackCopy();
        setStatus('Copied your list using the fallback method.', false);
      });
    } else {
      fallbackCopy();
      setStatus('Copied your list.', false);
    }
  }

  function handleReset() {
    state.history = {};
    persistHistory();
    lastTopics = [];
    el.results.classList.add('d-none');
    el.list.innerHTML = '';
    el.copyBtn.disabled = true;
    var ctx = el.canvas && el.canvas.getContext ? el.canvas.getContext('2d') : null;
    if (ctx) { ctx.clearRect(0, 0, el.canvas.width, el.canvas.height); }
    setStatus('History cleared. Every topic is available again.', false);
  }

  function syncCategory(evt) {
    if (evt && evt.target && evt.target.name === 'category') {
      state.category = evt.target.value;
    } else {
      var checked = document.querySelector('input[name="category"]:checked');
      state.category = checked ? checked.value : 'mixed';
    }
    var hint = getCategory(state.category);
    document.getElementById('catHint').textContent = hint
      ? hint.label + ' — ' + hint.topics.length + ' curated topics in this bank.'
      : 'Each category holds a curated bank of topics. Mixing pools them all together, so you rarely see the same idea twice.';
  }

  // ---- Init ----
  buildCategoryGrid();
  el.form.addEventListener('submit', handleGenerate);
  el.form.addEventListener('change', syncCategory);
  el.copyBtn.addEventListener('click', handleCopy);
  el.resetBtn.addEventListener('click', handleReset);
  el.count.addEventListener('input', function () {
    if (el.count.value !== '') {
      el.errCount.textContent = '';
      el.count.classList.remove('is-invalid');
    }
  });
  syncCategory();
  if (el.year) { el.year.textContent = new Date().getFullYear(); }
})();