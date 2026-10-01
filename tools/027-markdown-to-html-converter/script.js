(function () {
  "use strict";

  var mdInput = document.getElementById("markdown");
  var out = document.getElementById("output");
  var outStats = document.getElementById("outStats");
  var headingStyle = document.getElementById("headingStyle");
  var listStyle = document.getElementById("listStyle");
  var sanitizeEl = document.getElementById("sanitize");
  var prettyEl = document.getElementById("pretty");
  var alertBox = document.getElementById("alertBox");
  var previewCard = document.getElementById("previewCard");
  var preview = document.getElementById("preview");
  var chart = document.getElementById("mixChart");

  var SAMPLE = [
    "# Markdown to HTML Converter",
    "",
    "Paste **Markdown** and get clean HTML. It supports *italics*, `inline code`,",
    "~~strikethrough~~ and [links](https://example.com).",
    "",
    "## Why use it",
    "",
    "- Runs entirely in your browser",
    "- Produces semantic, accessible markup",
    "- Handles tables and code blocks",
    "",
    "1. Type or paste Markdown",
    "2. Review the HTML",
    "3. Copy or download",
    "",
    "> Markdown is readable as plain text and structured as a document.",
    "",
    "```js",
    "const hello = (name) => `Hi ${name}`;",
    "```",
    "",
    "| Feature | Supported |",
    "| --- | --- |",
    "| Headings | Yes |",
    "| Tables | Yes |",
    "",
    "---",
    "",
    "That is the whole idea."
  ].join("\n");

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function slugify(text) {
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 60);
  }

  /* ---------- inline parsing ---------- */

  function inline(text, stats) {
    var store = [];
    function stash(html) {
      store.push(html);
      return "\u0000" + (store.length - 1) + "\u0000";
    }

    var s = text;

    // code spans first so their contents are not parsed further
    s = s.replace(/`([^`]+)`/g, function (m, code) {
      stats.code += 1;
      return stash("<code>" + escapeHtml(code) + "</code>");
    });

    // images before links
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, function (m, alt, src, title) {
      stats.images += 1;
      var t = title ? ' title="' + escapeHtml(title) + '"' : "";
      return stash('<img src="' + escapeHtml(src) + '" alt="' + escapeHtml(alt) + '"' + t + ">");
    });

    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, label, href) {
      stats.links += 1;
      var rel = /^https?:\/\//i.test(href) ? ' target="_blank" rel="noopener noreferrer"' : "";
      return stash('<a href="' + escapeHtml(href) + '"' + rel + ">" + escapeHtml(label) + "</a>");
    });

    s = escapeHtml(s);

    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/(^|[^_])_([^_\n]+)_/g, "$1<em>$2</em>");
    s = s.replace(/~~([^~]+)~~/g, "<del>$1</del>");

    // restore stashed fragments
    s = s.replace(/\u0000(\d+)\u0000/g, function (m, i) {
      return store[Number(i)] || "";
    });

    return s;
  }

  /* ---------- block parsing ---------- */

  function parseMarkdown(src, opts, stats) {
    var lines = src.replace(/\r\n?/g, "\n").split("\n");
    var html = [];
    var i = 0;

    function headingTag(level, text) {
      var inner = inline(text, stats);
      if (opts.headingStyle === "classed") {
        var cls = "h" + Math.min(level + 1, 6);
        return '<h' + level + ' class="' + cls + '">' + inner + "</h" + level + ">";
      }
      return "<h" + level + ">" + inner + "</h" + level + ">";
    }

    while (i < lines.length) {
      var line = lines[i];

      // blank line
      if (/^\s*$/.test(line)) { i++; continue; }

      // fenced code block
      var fence = line.match(/^\s*(```|~~~)(.*)$/);
      if (fence) {
        var marker = fence[1];
        var lang = fence[2].trim();
        var buf = [];
        i++;
        var closed = false;
        while (i < lines.length) {
          if (lines[i].indexOf(marker) === 0) { closed = true; i++; break; }
          buf.push(lines[i]);
          i++;
        }
        stats.codeBlocks += 1;
        var langAttr = lang ? ' class="language-' + escapeHtml(lang) + '"' : "";
        var note = closed ? "" : "\n<!-- warning: unclosed code fence -->";
        html.push("<pre><code" + langAttr + ">" + escapeHtml(buf.join("\n")) + "</code></pre>" + note);
        if (!closed) stats.warnings.push("A code fence was never closed; the rest of the document was treated as code.");
        continue;
      }

      // heading
      var h = line.match(/^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/);
      if (h) {
        var level = h[1].length;
        var text = h[2];
        if (level === 1) stats.h1 += 1;
        stats.headings += 1;
        if (level === 1 && stats.h1 === 2) {
          stats.warnings.push("More than one level-1 heading found. For accessibility and SEO, keep a single h1 per page.");
        }
        html.push(headingTag(level, text));
        i++;
        continue;
      }

      // horizontal rule
      if (/^\s{0,3}([-*_])(\s*\1){2,}\s*$/.test(line)) {
        stats.hr += 1;
        html.push("<hr>");
        i++;
        continue;
      }

      // blockquote (may span lines)
      if (/^\s{0,3}>/.test(line)) {
        var qbuf = [];
        while (i < lines.length && /^\s{0,3}>/.test(lines[i])) {
          qbuf.push(lines[i].replace(/^\s{0,3}>\s?/, ""));
          i++;
        }
        html.push("<blockquote>\n<p>" + inline(qbuf.join(" "), stats) + "</p>\n</blockquote>");
        continue;
      }

      // table
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].indexOf("-") !== -1) {
        var headerCells = splitRow(line);
        var align = splitRow(lines[i + 1]);
        i += 2;
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) {
          rows.push(splitRow(lines[i]));
          i++;
        }
        stats.tables += 1;
        var t = ["<table>", "<thead>", "<tr>"];
        headerCells.forEach(function (c, idx) {
          t.push('<th' + alignAttr(align[idx]) + ">" + inline(c, stats) + "</th>");
        });
        t.push("</tr>", "</thead>", "<tbody>");
        rows.forEach(function (r) {
          t.push("<tr>");
          for (var c = 0; c < headerCells.length; c++) {
            t.push("<td" + alignAttr(align[c]) + ">" + inline(r[c] || "", stats) + "</td>");
          }
          t.push("</tr>");
        });
        t.push("</tbody>", "</table>");
        html.push(t.join("\n"));
        continue;
      }

      // unordered list
      if (/^\s{0,3}[-*+]\s+/.test(line)) {
        i = parseList(lines, i, false, html, opts, stats);
        continue;
      }

      // ordered list
      if (/^\s{0,3}\d+[.)]\s+/.test(line)) {
        i = parseList(lines, i, true, html, opts, stats);
        continue;
      }

      // paragraph
      var pbuf = [line];
      i++;
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
             !/^\s{0,3}(#{1,6})\s+/.test(lines[i]) &&
             !/^\s{0,3}>/.test(lines[i]) &&
             !/^\s{0,3}(```|~~~)/.test(lines[i]) &&
             !/^\s{0,3}[-*+]\s+/.test(lines[i]) &&
             !/^\s{0,3}\d+[.)]\s+/.test(lines[i]) &&
             !/^\s*\|/.test(lines[i])) {
        pbuf.push(lines[i]);
        i++;
      }
      stats.paragraphs += 1;
      html.push("<p>" + inline(pbuf.join("\n"), stats).replace(/\n/g, "<br>") + "</p>");
    }

    return html.join("\n");
  }

  function alignAttr(a) {
    if (!a) return "";
    if (/^:?-+:?$/.test(a) === false) return "";
    var left = a.charAt(0) === ":";
    var right = a.charAt(a.length - 1) === ":";
    if (left && right) return ' style="text-align:center"';
    if (right) return ' style="text-align:right"';
    if (left) return ' style="text-align:left"';
    return "";
  }

  function splitRow(line) {
    var s = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return s.split("|").map(function (c) { return c.trim(); });
  }

  function parseList(lines, i, ordered, html, opts, stats) {
    var re = ordered ? /^(\s{0,3})(\d+)[.)]\s+(.*)$/ : /^(\s{0,3})([-*+])\s+(.*)$/;
    var items = [];
    while (i < lines.length) {
      var m = lines[i].match(re);
      if (!m) break;
      items.push(m[3]);
      i++;
    }
    var tag = ordered ? "ol" : "ul";
    var cls = opts.listStyle === "bootstrap" ? ' class="' + (ordered ? "pl-4" : "pl-4") + '"' : "";
    var out = ["<" + tag + cls + ">"];
    items.forEach(function (it) {
      out.push("<li>" + inline(it, stats) + "</li>");
      stats.listItems += 1;
    });
    out.push("</" + tag + ">");
    html.push(out.join("\n"));
    return i;
  }

  /* ---------- sanitising ---------- */

  function stripRawHtml(src) {
    // Remove raw block and inline HTML tags so only generated markup survives.
    return src.replace(/<\/?[a-zA-Z][^>]*>/g, "");
  }

  /* ---------- pretty printing ---------- */

  function prettyPrint(html) {
    var tokens = html.split(/(<pre[\s\S]*?<\/pre>|<[^>]+>)/g).filter(function (t) { return t !== ""; });
    var indent = 0;
    var lines = [];
    var buf = "";
    var blockTags = /^(h[1-6]|p|ul|ol|li|blockquote|table|thead|tbody|tr|th|td|hr|pre)$/;
    var voidTags = /^(hr|br|img|input|meta|link)$/;

    function flush() {
      if (buf.trim()) lines.push(spaces(indent) + buf.trim());
      buf = "";
    }

    tokens.forEach(function (tok) {
      if (/^<pre[\s\S]*<\/pre>$/.test(tok)) {
        flush();
        lines.push(spaces(indent) + tok.replace(/\n/g, "\n" + spaces(indent)));
        return;
      }
      if (/^<!--/.test(tok)) {
        flush();
        lines.push(spaces(indent) + tok);
        return;
      }
      var m = tok.match(/^<(\/?)([a-zA-Z0-9]+)/);
      if (!m) { buf += tok; return; } // plain text stays with the current line

      var closing = m[1] === "/";
      var name = m[2].toLowerCase();
      if (!blockTags.test(name)) { buf += tok; return; } // inline tag stays with the current line

      flush();
      if (closing) {
        indent = Math.max(indent - 1, 0);
        lines.push(spaces(indent) + tok);
      } else if (voidTags.test(name) || /\/>$/.test(tok)) {
        lines.push(spaces(indent) + tok);
      } else {
        lines.push(spaces(indent) + tok);
        indent += 1;
      }
    });
    flush();
    return lines.join("\n");
  }

  function spaces(n) {
    return new Array(n + 1).join("  ");
  }

  /* ---------- validation ---------- */

  function validate(src) {
    var warnings = [];
    if (!src.trim()) return { ok: false, empty: true, warnings: warnings };
    if (src.length > 200000) warnings.push("Input is very large; conversion may be slow in older browsers.");
    var fences = (src.match(/^\s*(```|~~~)/gm) || []).length;
    if (fences % 2 !== 0) warnings.push("An odd number of code fences was found. One fence may be unclosed.");
    return { ok: true, empty: false, warnings: warnings };
  }

  /* ---------- stats + chart ---------- */

  function countStats(stats) {
    return [
      { label: "Headings", value: stats.headings, color: "#60089c" },
      { label: "Paragraphs", value: stats.paragraphs, color: "#8b34c7" },
      { label: "List items", value: stats.listItems, color: "#a95fdc" },
      { label: "Links", value: stats.links, color: "#c48ce8" },
      { label: "Code blocks", value: stats.codeBlocks, color: "#d9b8f2" }
    ];
  }

  function drawChart(stats) {
    if (!chart || !chart.getContext) return;
    var ctx = chart.getContext("2d");
    var data = countStats(stats);
    var W = chart.width;
    var H = chart.height;
    ctx.clearRect(0, 0, W, H);

    var padLeft = 90;
    var padRight = 20;
    var padTop = 16;
    var padBottom = 28;
    var plotW = W - padLeft - padRight;
    var plotH = H - padTop - padBottom;
    var max = Math.max.apply(null, data.map(function (d) { return d.value; }).concat([1]));
    var rowH = plotH / data.length;

    ctx.font = "12px -apple-system, Segoe UI, Roboto, sans-serif";
    ctx.textBaseline = "middle";

    data.forEach(function (d, idx) {
      var y = padTop + idx * rowH + rowH / 2;
      var barH = Math.min(rowH * 0.55, 22);
      var w = (d.value / max) * plotW;

      ctx.fillStyle = "#6b6478";
      ctx.textAlign = "right";
      ctx.fillText(d.label, padLeft - 10, y);

      ctx.fillStyle = "#f0ebf7";
      ctx.fillRect(padLeft, y - barH / 2, plotW, barH);

      ctx.fillStyle = d.color;
      ctx.fillRect(padLeft, y - barH / 2, Math.max(w, d.value > 0 ? 2 : 0), barH);

      ctx.fillStyle = "#241b2e";
      ctx.textAlign = "left";
      ctx.fillText(String(d.value), padLeft + w + 6, y);
    });

    ctx.strokeStyle = "#e2d9ee";
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.stroke();
  }

  /* ---------- main convert ---------- */

  function showAlert(type, message) {
    if (!message) { alertBox.className = "alert d-none mt-3 mb-0"; alertBox.textContent = ""; return; }
    alertBox.className = "alert alert-" + type + " mt-3 mb-0";
    alertBox.textContent = message;
  }

  function convert() {
    var src = mdInput.value;
    var check = validate(src);

    if (check.empty) {
      out.value = "";
      outStats.textContent = "0 chars";
      preview.innerHTML = "";
      previewCard.classList.add("d-none");
      showAlert("info", "Paste some Markdown above to see the HTML output.");
      drawChart(blankStats());
      return;
    }

    var stats = blankStats();
    stats.warnings = [];
    var working = sanitizeEl.checked ? stripRawHtml(src) : src;

    var html;
    try {
      html = parseMarkdown(working, {
        headingStyle: headingStyle.value,
        listStyle: listStyle.value
      }, stats);
    } catch (err) {
      showAlert("danger", "Something went wrong while parsing. Try removing unusual characters and converting again.");
      return;
    }

    if (prettyEl.checked) html = prettyPrint(html);

    out.value = html;
    outStats.textContent = html.length.toLocaleString() + " chars";

    var allWarnings = check.warnings.concat(stats.warnings || []);
    if (allWarnings.length) {
      showAlert("warning", allWarnings.join(" "));
    } else {
      showAlert("", "");
    }

    if (!previewCard.classList.contains("d-none")) {
      preview.innerHTML = html;
    }

    drawChart(stats);
  }

  function blankStats() {
    return {
      headings: 0, h1: 0, paragraphs: 0, listItems: 0,
      links: 0, images: 0, code: 0, codeBlocks: 0,
      tables: 0, hr: 0, warnings: []
    };
  }

  /* ---------- events ---------- */

  var debounceTimer = null;
  function scheduleConvert() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 120);
  }

  mdInput.addEventListener("input", scheduleConvert);
  headingStyle.addEventListener("change", convert);
  listStyle.addEventListener("change", convert);
  sanitizeEl.addEventListener("change", convert);
  prettyEl.addEventListener("change", convert);

  document.getElementById("btnSample").addEventListener("click", function () {
    mdInput.value = SAMPLE;
    convert();
  });

  document.getElementById("btnCopy").addEventListener("click", function () {
    if (!out.value) { showAlert("info", "There is nothing to copy yet."); return; }
    out.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    if (navigator.clipboard && !ok) {
      navigator.clipboard.writeText(out.value).then(function () {
        showAlert("info", "HTML copied to your clipboard.");
      }).catch(function () {
        showAlert("warning", "Copy failed. Select the output and copy it manually.");
      });
    } else {
      showAlert(ok ? "info" : "warning", ok ? "HTML copied to your clipboard." : "Copy failed. Select the output and copy it manually.");
    }
  });

  document.getElementById("btnDownload").addEventListener("click", function () {
    if (!out.value) { showAlert("info", "Convert some Markdown first."); return; }
    var doc = "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n" +
      "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n" +
      "<title>Converted document</title>\n</head>\n<body>\n" + out.value + "\n</body>\n</html>\n";
    var blob = new Blob([doc], { type: "text/html" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "converted.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  });

  document.getElementById("btnClear").addEventListener("click", function () {
    mdInput.value = "";
    convert();
    mdInput.focus();
  });

  document.getElementById("btnPreview").addEventListener("click", function () {
    if (!out.value) { showAlert("info", "Convert some Markdown first."); return; }
    previewCard.classList.toggle("d-none");
    var showing = !previewCard.classList.contains("d-none");
    if (showing) preview.innerHTML = out.value;
    this.textContent = showing ? "Hide preview" : "Preview rendered";
  });

  /* ---------- init ---------- */

  mdInput.value = SAMPLE;
  convert();
})();
