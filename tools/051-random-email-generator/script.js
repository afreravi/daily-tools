(function () {
  "use strict";

  var FIRST_NAMES = [
    "Ava", "Liam", "Maya", "Noah", "Priya", "Ethan", "Sofia", "Owen", "Chloe", "Marcus",
    "Isla", "Diego", "Nora", "Kai", "Elena", "Jonah", "Amara", "Leo", "Ruby", "Samir",
    "Grace", "Theo", "Ines", "Hugo", "Zara", "Felix", "Lena", "Idris", "Nina", "Oscar",
    "Tara", "Miles", "Aisha", "Rowan", "Cora", "Dev", "Freya", "Nate", "Yara", "Silas"
  ];

  var LAST_NAMES = [
    "Bennett", "Patel", "Nguyen", "Okafor", "Rossi", "Kim", "Silva", "Hughes", "Adeyemi", "Novak",
    "Fischer", "Moreau", "Costa", "Larsen", "Reyes", "Bianchi", "Haddad", "Kowalski", "Mensah", "Ivanov",
    "Turner", "Alvarez", "Berg", "Osei", "Delgado", "Farah", "Lindqvist", "Chen", "Mueller", "Santos",
    "Abara", "Voss", "Rahman", "Petrov", "Duarte", "Sato", "Walsh", "Nakamura", "Bauer", "Cohen"
  ];

  var FORMATS = ["first.last", "flast", "firstlast", "first_last", "first-last"];

  var els = {
    form: document.getElementById("emailForm"),
    count: document.getElementById("countInput"),
    format: document.getElementById("formatSelect"),
    domain: document.getElementById("domainSelect"),
    customDomain: document.getElementById("customDomain"),
    baseName: document.getElementById("baseName"),
    numbers: document.getElementById("numbersChk"),
    unique: document.getElementById("uniqueChk"),
    generateBtn: document.getElementById("generateBtn"),
    clearBtn: document.getElementById("clearBtn"),
    errorBox: document.getElementById("errorBox"),
    resultsWrap: document.getElementById("resultsWrap"),
    list: document.getElementById("emailList"),
    copyAllBtn: document.getElementById("copyAllBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    chart: document.getElementById("lengthChart"),
    chartCaption: document.getElementById("chartCaption"),
    year: document.getElementById("year")
  };

  function randInt(max) {
    return Math.floor(Math.random() * max);
  }

  function pick(arr) {
    return arr[randInt(arr.length)];
  }

  function titleCase(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  // Strip accents and anything that is not a letter, so the local part stays valid.
  function slugify(name) {
    return name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }

  function isValidDomain(value) {
    if (!value || value.length > 253) {
      return false;
    }
    var labels = value.split(".");
    if (labels.length < 2) {
      return false;
    }
    for (var i = 0; i < labels.length; i++) {
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i.test(labels[i])) {
        return false;
      }
    }
    return /^[a-z]{2,}$/i.test(labels[labels.length - 1]);
  }

  function splitBaseName(raw) {
    var parts = raw.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return null;
    }
    var first = slugify(parts[0]);
    var last = parts.length > 1 ? slugify(parts[parts.length - 1]) : "";
    if (!first) {
      return null;
    }
    return { first: first, last: last };
  }

  function buildLocalPart(first, last, format) {
    if (!last) {
      return first;
    }
    switch (format) {
      case "first.last":
        return first + "." + last;
      case "flast":
        return first.charAt(0) + last;
      case "firstlast":
        return first + last;
      case "first_last":
        return first + "_" + last;
      case "first-last":
        return first + "-" + last;
      default:
        return first + "." + last;
    }
  }

  function showError(message) {
    els.errorBox.textContent = message;
    els.errorBox.classList.remove("d-none");
  }

  function clearError() {
    els.errorBox.textContent = "";
    els.errorBox.classList.add("d-none");
  }

  function getDomain() {
    if (els.domain.value === "custom") {
      return els.customDomain.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
    }
    return els.domain.value;
  }

  function generate() {
    clearError();

    var count = parseInt(els.count.value, 10);
    if (isNaN(count) || count < 1 || count > 25) {
      showError("Please choose a number of emails between 1 and 25.");
      els.count.focus();
      return;
    }

    var domain = getDomain();
    if (!isValidDomain(domain)) {
      showError("Enter a valid domain such as example.com (two or more parts, no spaces).");
      if (els.domain.value === "custom") {
        els.customDomain.focus();
      }
      return;
    }

    var base = els.baseName.value.trim() ? splitBaseName(els.baseName.value) : null;
    if (els.baseName.value.trim() && !base) {
      showError("The name you entered has no usable letters. Try something like Jordan Ellis.");
      els.baseName.focus();
      return;
    }

    var useNumbers = els.numbers.checked;
    var keepUnique = els.unique.checked;
    var chosenFormat = els.format.value;

    var results = [];
    var seen = Object.create(null);
    var attempts = 0;
    var maxAttempts = count * 40;

    while (results.length < count && attempts < maxAttempts) {
      attempts++;

      var first;
      var last;
      if (base) {
        first = base.first;
        last = base.last;
      } else {
        first = slugify(pick(FIRST_NAMES));
        last = slugify(pick(LAST_NAMES));
      }

      var format = chosenFormat === "mixed" ? pick(FORMATS) : chosenFormat;
      var local = buildLocalPart(first, last, format);
      if (!local) {
        continue;
      }

      if (useNumbers && Math.random() < 0.5) {
        local += String(randInt(90) + 10);
      }

      var address = local + "@" + domain;
      if (keepUnique && seen[address]) {
        continue;
      }
      seen[address] = true;
      results.push(address);
    }

    if (!results.length) {
      showError("Could not build a valid address from those inputs. Try a different name or style.");
      return;
    }

    if (results.length < count) {
      showError("Only " + results.length + " unique address" + (results.length === 1 ? "" : "es") +
        " could be made from that fixed name. Add more variety or turn off uniqueness.");
    }

    render(results);
  }

  function render(addresses) {
    els.list.innerHTML = "";
    addresses.forEach(function (address, i) {
      var li = document.createElement("li");
      li.className = "list-group-item";

      var idx = document.createElement("span");
      idx.className = "item-index";
      idx.textContent = (i + 1) + ".";

      var val = document.createElement("span");
      val.className = "item-value";
      val.textContent = address;

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-sm btn-brand-outline copy-one";
      btn.textContent = "Copy";
      btn.setAttribute("aria-label", "Copy " + address);
      btn.addEventListener("click", function () {
        copyText(address, btn);
      });

      li.appendChild(idx);
      li.appendChild(val);
      li.appendChild(btn);
      els.list.appendChild(li);
    });

    els.resultsWrap.hidden = false;
    drawChart(addresses);
    els.resultsWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function copyText(text, btn) {
    var done = function () {
      if (!btn) {
        return;
      }
      var original = btn.textContent;
      btn.textContent = "Copied";
      window.setTimeout(function () {
        btn.textContent = original;
      }, 1200);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, function () {
        fallbackCopy(text, done);
      });
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
    try {
      document.execCommand("copy");
      done();
    } catch (e) {
      showError("Copy failed. Please select the text manually.");
    }
    document.body.removeChild(ta);
  }

  function drawChart(addresses) {
    var canvas = els.chart;
    var ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    var dpr = window.devicePixelRatio || 1;
    var cssWidth = canvas.clientWidth || 720;
    var cssHeight = 280;
    canvas.width = cssWidth * dpr;
    canvas.height = cssHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssWidth, cssHeight);

    var buckets = [
      { label: "Under 15", test: function (n) { return n < 15; } },
      { label: "15-19", test: function (n) { return n >= 15 && n <= 19; } },
      { label: "20-24", test: function (n) { return n >= 20 && n <= 24; } },
      { label: "25-29", test: function (n) { return n >= 25 && n <= 29; } },
      { label: "30+", test: function (n) { return n >= 30; } }
    ];

    var counts = buckets.map(function (b) {
      return addresses.filter(function (a) { return b.test(a.length); }).length;
    });
    var max = Math.max.apply(null, counts.concat([1]));

    var padLeft = 34;
    var padBottom = 40;
    var padTop = 18;
    var padRight = 12;
    var plotW = cssWidth - padLeft - padRight;
    var plotH = cssHeight - padTop - padBottom;
    var barGap = 14;
    var barW = (plotW - barGap * (buckets.length - 1)) / buckets.length;

    ctx.strokeStyle = "#e7d8f5";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop);
    ctx.lineTo(padLeft, padTop + plotH);
    ctx.lineTo(padLeft + plotW, padTop + plotH);
    ctx.stroke();

    ctx.font = "11px -apple-system, Segoe UI, Arial, sans-serif";
    ctx.fillStyle = "#6b6076";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    for (var t = 0; t <= max; t += Math.max(1, Math.ceil(max / 4))) {
      var y = padTop + plotH - (t / max) * plotH;
      ctx.fillText(String(t), padLeft - 8, y);
      ctx.strokeStyle = "#f2e9fa";
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + plotW, y);
      ctx.stroke();
    }

    buckets.forEach(function (b, i) {
      var x = padLeft + i * (barW + barGap);
      var h = (counts[i] / max) * plotH;
      var y = padTop + plotH - h;

      var grad = ctx.createLinearGradient(0, y, 0, padTop + plotH);
      grad.addColorStop(0, "#8a3ec2");
      grad.addColorStop(1, "#60089c");
      ctx.fillStyle = counts[i] ? grad : "#f4ecfa";
      ctx.fillRect(x, y, barW, h || 2);

      ctx.fillStyle = "#2f0449";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      if (counts[i]) {
        ctx.fillText(String(counts[i]), x + barW / 2, y - 4);
      }

      ctx.fillStyle = "#6b6076";
      ctx.textBaseline = "top";
      ctx.fillText(b.label, x + barW / 2, padTop + plotH + 8);
    });

    var avg = addresses.reduce(function (s, a) { return s + a.length; }, 0) / addresses.length;
    els.chartCaption.textContent = "Average address length: " + avg.toFixed(1) +
      " characters across " + addresses.length + " address" + (addresses.length === 1 ? "" : "es") + ".";
  }

  function reset() {
    els.form.reset();
    els.customDomain.disabled = true;
    clearError();
    els.resultsWrap.hidden = true;
    els.list.innerHTML = "";
    els.chartCaption.textContent = "";
  }

  els.form.addEventListener("submit", function (e) {
    e.preventDefault();
    generate();
  });

  els.domain.addEventListener("change", function () {
    var isCustom = els.domain.value === "custom";
    els.customDomain.disabled = !isCustom;
    if (isCustom) {
      els.customDomain.focus();
    }
    clearError();
  });

  els.clearBtn.addEventListener("click", reset);

  els.copyAllBtn.addEventListener("click", function () {
    var values = Array.prototype.map.call(
      els.list.querySelectorAll(".item-value"),
      function (el) { return el.textContent; }
    );
    if (!values.length) {
      return;
    }
    copyText(values.join("\n"), els.copyAllBtn);
  });

  els.downloadBtn.addEventListener("click", function () {
    var values = Array.prototype.map.call(
      els.list.querySelectorAll(".item-value"),
      function (el) { return el.textContent; }
    );
    if (!values.length) {
      return;
    }
    var blob = new Blob([values.join("\n") + "\n"], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "random-emails.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  els.year.textContent = String(new Date().getFullYear());
})();
