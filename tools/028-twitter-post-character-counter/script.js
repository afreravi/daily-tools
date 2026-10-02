/* Twitter Post Character Counter
   Vanilla JS. Applies X (Twitter) weighting rules:
   - every link counts as 23 characters
   - all other text counts by Unicode code point (so multi-part emoji cost more)
*/
(function () {
  "use strict";

  var LIMIT = 280;
  var LINK_WEIGHT = 23;
  var WARN_AT = Math.floor(LIMIT * 0.85);

  var URL_RE = /\bhttps?:\/\/[^\s]+|\bwww\.[^\s]+/gi;
  var HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
  var MENTION_RE = /@[\p{L}\p{N}_]+/gu;
  /* no global flag: used with .test() on single code points, which is stateful under /g */
  var EMOJI_RE = /[\p{Extended_Pictographic}\uFE0F\u200D\u20E3\u{1F1E6}-\u{1F1FF}]/u;

  var input = document.getElementById("tweetInput");
  var previewBody = document.getElementById("previewBody");
  var previewCard = document.getElementById("previewCard");
  var progressBar = document.getElementById("progressBar");
  var alertBox = document.getElementById("alertBox");
  var limitBadge = document.getElementById("limitBadge");
  var statCount = document.getElementById("statCount");
  var statRemaining = document.getElementById("statRemaining");
  var statWords = document.getElementById("statWords");
  var statTags = document.getElementById("statTags");
  var tileCount = document.getElementById("tileCount");
  var tileRemaining = document.getElementById("tileRemaining");
  var tbody = document.querySelector("#threadTable tbody");
  var canvas = document.getElementById("breakdownChart");
  var legend = document.getElementById("chartLegend");

  var SAMPLE = "Shipping day! \uD83D\uDE80 We rebuilt the export flow from scratch.\n\n" +
    "Now you can pull a full CSV in one click: https://afreetools.com/export\n\n" +
    "What should we build next? #buildinpublic";

  var CATS = [
    { key: "text", label: "Text", color: "#60089c" },
    { key: "links", label: "Links (23 each)", color: "#8a3fc4" },
    { key: "hashtags", label: "Hashtags", color: "#b07fd8" },
    { key: "mentions", label: "Mentions", color: "#d3b3ea" },
    { key: "emoji", label: "Emoji", color: "#efd9f8" }
  ];

  function cpCount(s) {
    return Array.from(s).length;
  }

  function safeMatch(str, re) {
    try { return str.match(re) || []; } catch (e) { return []; }
  }

  function isEmojiCp(ch) {
    try { return EMOJI_RE.test(ch); } catch (e) { return false; }
  }

  /* Count weighted length and a per-category breakdown. */
  function analyze(text) {
    var result = {
      weighted: 0,
      raw: cpCount(text),
      words: 0,
      linkCount: 0,
      hashtagCount: 0,
      mentionCount: 0,
      breakdown: { text: 0, links: 0, hashtags: 0, mentions: 0, emoji: 0 }
    };
    if (!text) { return result; }

    var trimmed = text.trim();
    result.words = trimmed ? trimmed.split(/\s+/).length : 0;

    var rest = text;
    var urls = safeMatch(rest, URL_RE);
    result.linkCount = urls.length;
    result.breakdown.links = urls.length * LINK_WEIGHT;
    rest = rest.replace(URL_RE, "");

    var tags = safeMatch(rest, HASHTAG_RE);
    result.hashtagCount = tags.length;
    for (var i = 0; i < tags.length; i++) { result.breakdown.hashtags += cpCount(tags[i]); }
    rest = rest.replace(HASHTAG_RE, "");

    var mentions = safeMatch(rest, MENTION_RE);
    result.mentionCount = mentions.length;
    for (var j = 0; j < mentions.length; j++) { result.breakdown.mentions += cpCount(mentions[j]); }
    rest = rest.replace(MENTION_RE, "");

    var chars = Array.from(rest);
    for (var k = 0; k < chars.length; k++) {
      if (isEmojiCp(chars[k])) { result.breakdown.emoji += 1; }
      else { result.breakdown.text += 1; }
    }

    result.weighted = result.breakdown.text + result.breakdown.links +
      result.breakdown.hashtags + result.breakdown.mentions + result.breakdown.emoji;
    return result;
  }

  /* Weight of a single whitespace-delimited token, treating URLs as 23. */
  function tokenWeight(token) {
    var urls = safeMatch(token, URL_RE);
    if (urls.length && token.replace(URL_RE, "").trim() === "") {
      return urls.length * LINK_WEIGHT;
    }
    var stripped = token.replace(URL_RE, "");
    return urls.length * LINK_WEIGHT + cpCount(stripped);
  }

  /* Split a draft into <=280-weighted chunks for a thread. */
  function splitThread(text) {
    var words = text.split(/\s+/).filter(Boolean);
    if (!words.length) { return []; }
    var chunks = [];
    var current = [];
    var weight = 0;
    for (var i = 0; i < words.length; i++) {
      var w = tokenWeight(words[i]);
      var add = current.length ? w + 1 : w;
      if (weight + add > LIMIT && current.length) {
        chunks.push(current.join(" "));
        current = [words[i]];
        weight = w;
      } else {
        current.push(words[i]);
        weight += add;
      }
    }
    if (current.length) { chunks.push(current.join(" ")); }
    return chunks;
  }

  /* Split text at the point where the weighted limit is reached. */
  function cutText(text, limit) {
    var tokens = text.split(/(\s+)/); // keep whitespace
    var head = "";
    var weight = 0;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i];
      var w = /^\s+$/.test(t) ? cpCount(t) : tokenWeight(t);
      if (weight + w > limit) { break; }
      head += t;
      weight += w;
    }
    return { head: head, weight: weight, truncated: head.length < text.length };
  }

  function suggestTrim(text) {
    var words = text.split(/\s+/).filter(Boolean);
    var out = [];
    var weight = 0;
    for (var i = 0; i < words.length; i++) {
      var w = tokenWeight(words[i]);
      var add = out.length ? w + 1 : w;
      if (weight + add > LIMIT) { break; }
      out.push(words[i]);
      weight += add;
    }
    return out.join(" ");
  }

  function showAlert(kind, msg) {
    if (!kind) { alertBox.className = "alert d-none mt-3 mb-0"; alertBox.textContent = ""; return; }
    alertBox.className = "alert alert-" + kind + " mt-3 mb-0";
    alertBox.textContent = msg;
  }

  function renderPreview(text, info) {
    previewBody.innerHTML = "";
    if (!text) {
      var empty = document.createElement("span");
      empty.className = "preview-empty";
      empty.textContent = "Your post preview appears here as you type.";
      previewBody.appendChild(empty);
      return;
    }
    var cut = cutText(text, LIMIT);
    previewBody.appendChild(document.createTextNode(cut.head));
    if (cut.truncated) {
      var marker = document.createElement("span");
      marker.className = "preview-cut";
      marker.textContent = " \u2026 [post limit reached]";
      previewBody.appendChild(marker);
      previewCard.classList.add("preview-over");
    } else {
      previewCard.classList.remove("preview-over");
    }
  }

  function renderStats(info) {
    var remaining = LIMIT - info.weighted;
    statCount.textContent = info.weighted;
    statRemaining.textContent = remaining;
    statWords.textContent = info.words;
    statTags.textContent = info.hashtagCount + info.mentionCount;

    tileCount.className = "stat-tile" + (info.weighted > LIMIT ? " is-over" : (info.weighted >= WARN_AT ? " is-warn" : ""));
    tileRemaining.className = "stat-tile" + (remaining < 0 ? " is-over" : (remaining <= LIMIT - WARN_AT ? " is-warn" : ""));

    var pct = Math.min(100, (info.weighted / LIMIT) * 100);
    progressBar.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", String(info.weighted));
    progressBar.className = "progress-bar" + (info.weighted > LIMIT ? " is-over" : (info.weighted >= WARN_AT ? " is-warn" : ""));

    limitBadge.className = "badge border " + (info.weighted > LIMIT ? "badge-danger" : "badge-light");
    limitBadge.textContent = info.weighted > LIMIT
      ? (info.weighted - LIMIT) + " over"
      : remaining + " left";
  }

  function renderChart(info) {
    var dpr = window.devicePixelRatio || 1;
    var displayW = canvas.clientWidth || 660;
    var displayH = 240;
    canvas.width = Math.round(displayW * dpr);
    canvas.height = Math.round(displayH * dpr);
    var ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, displayW, displayH);

    var padLeft = 96, padRight = 54, padTop = 10, padBottom = 10;
    var rows = CATS.length;
    var rowH = (displayH - padTop - padBottom) / rows;
    var barH = Math.min(22, rowH - 8);
    var maxVal = Math.max(1, info.breakdown.text, info.breakdown.links,
      info.breakdown.hashtags, info.breakdown.mentions, info.breakdown.emoji);
    var plotW = displayW - padLeft - padRight;

    ctx.font = "12px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "middle";

    for (var i = 0; i < rows; i++) {
      var cat = CATS[i];
      var val = info.breakdown[cat.key];
      var y = padTop + i * rowH + rowH / 2;
      var barW = Math.max(0, (val / maxVal) * plotW);

      ctx.fillStyle = "#6b6478";
      ctx.textAlign = "right";
      ctx.fillText(cat.label, padLeft - 10, y);

      ctx.fillStyle = "#f4eefb";
      ctx.fillRect(padLeft, y - barH / 2, plotW, barH);

      ctx.fillStyle = cat.color;
      ctx.fillRect(padLeft, y - barH / 2, barW, barH);

      ctx.fillStyle = "#241b2e";
      ctx.textAlign = "left";
      ctx.fillText(String(val), padLeft + barW + 8, y);
    }

    legend.innerHTML = "";
    for (var l = 0; l < CATS.length; l++) {
      var span = document.createElement("span");
      var dot = document.createElement("i");
      dot.style.backgroundColor = CATS[l].color;
      span.appendChild(dot);
      span.appendChild(document.createTextNode(CATS[l].label));
      legend.appendChild(span);
    }
  }

  function renderThread(text, info) {
    tbody.innerHTML = "";
    if (!text.trim()) {
      tbody.appendChild(row("\u2014", "0", "Start typing to see how your post splits."));
      return;
    }
    if (info.weighted <= LIMIT) {
      tbody.appendChild(row("1", String(info.weighted), snippet(text)));
      return;
    }
    var chunks = splitThread(text);
    for (var i = 0; i < chunks.length; i++) {
      tbody.appendChild(row(String(i + 1), String(analyze(chunks[i]).weighted), snippet(chunks[i])));
    }
  }

  function row(post, chars, text) {
    var tr = document.createElement("tr");
    var td1 = document.createElement("td");
    td1.textContent = post;
    var td2 = document.createElement("td");
    td2.textContent = chars;
    var td3 = document.createElement("td");
    td3.textContent = text;
    tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3);
    return tr;
  }

  function snippet(text) {
    var t = text.replace(/\s+/g, " ").trim();
    return t.length > 60 ? t.slice(0, 57) + "\u2026" : t;
  }

  function update() {
    var text = input.value;
    var info = analyze(text);
    renderPreview(text, info);
    renderStats(info);
    renderChart(info);
    renderThread(text, info);

    if (!text.trim()) {
      showAlert(null);
    } else if (info.weighted > LIMIT) {
      showAlert("danger", "This post is " + (info.weighted - LIMIT) +
        " characters over the 280 limit. Try Suggest trim, or split it into a thread.");
    } else if (info.weighted >= WARN_AT) {
      showAlert("warning", "Nearly there \u2014 only " + (LIMIT - info.weighted) +
        " characters left. Check the preview to be sure nothing important is cut.");
    } else {
      showAlert(null);
    }
  }

  /* ---------- events ---------- */

  input.addEventListener("input", update);

  document.getElementById("btnSample").addEventListener("click", function () {
    input.value = SAMPLE;
    update();
    input.focus();
  });

  document.getElementById("btnClear").addEventListener("click", function () {
    input.value = "";
    update();
    input.focus();
  });

  document.getElementById("btnShorten").addEventListener("click", function () {
    var info = analyze(input.value);
    if (!input.value.trim()) { showAlert("info", "Add some text first, then I can trim it."); return; }
    if (info.weighted <= LIMIT) { showAlert("success", "Your post already fits inside the 280 character limit."); return; }
    var trimmed = suggestTrim(input.value);
    if (!trimmed) { showAlert("warning", "The first word alone is too long to fit. Shorten it and try again."); return; }
    input.value = trimmed;
    update();
    showAlert("info", "Trimmed to " + analyze(trimmed).weighted +
      " characters. Edit it back if I cut something you needed.");
    input.focus();
  });

  document.getElementById("btnCopy").addEventListener("click", function () {
    if (!input.value.trim()) { showAlert("info", "Write your post first."); return; }
    var done = function (ok) {
      showAlert(ok ? "success" : "warning", ok ? "Post copied to your clipboard." : "Copy failed. Select the text and copy it manually.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(input.value).then(function () { done(true); }, function () { done(false); });
    } else {
      input.select();
      try { done(document.execCommand("copy")); } catch (e) { done(false); }
    }
  });

  window.addEventListener("resize", function () {
    renderChart(analyze(input.value));
  });

  /* ---------- init ---------- */

  input.value = SAMPLE;
  update();
})();
