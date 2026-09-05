(function () {
  "use strict";

  var timerDisplay = document.getElementById("timerDisplay");
  var modeLabel = document.getElementById("modeLabel");
  var cycleDots = document.getElementById("cycleDots");
  var cycleInfo = document.getElementById("cycleInfo");
  var startPauseBtn = document.getElementById("startPauseBtn");
  var resetBtn = document.getElementById("resetBtn");
  var skipBtn = document.getElementById("skipBtn");
  var statusAlert = document.getElementById("statusAlert");
  var focusInput = document.getElementById("focusMin");
  var shortInput = document.getElementById("shortBreakMin");
  var longInput = document.getElementById("longBreakMin");
  var sessionsInput = document.getElementById("sessionsLong");

  var state = {
    mode: "focus",
    running: false,
    totalSeconds: 25 * 60,
    remaining: 25 * 60,
    completedSessions: 0,
    sessionsPerCycle: 4,
    timerId: null,
    lastTick: null
  };

  function clampNum(val, min, max) {
    return Math.min(max, Math.max(min, val));
  }

  function readDurations() {
    var f = parseInt(focusInput.value, 10);
    var s = parseInt(shortInput.value, 10);
    var l = parseInt(longInput.value, 10);
    var p = parseInt(sessionsInput.value, 10;
    state.sessionsPerCycle = isNaN(p) ? 4 : clampNum(p, 2, 8);
    return {
      focus:isNaN(f) ? 25 : clampNum(f, 1, 180),
      short:isNaN(s) ? 5 : clampNum(s, 1,,60),
      long:isNaN(l) ? 15 : clampNum(l, 1, 60)
    };
  }

  function secondsForMode(mode, durations) {
    if (mode === "short") {
      return durations.short * 60;
    }
    if (mode === "long") {
      return durations.long * 60;
    }
    return durations.focus * 60;
  }

  function formatTime(totalSec) {
    var m = Math.floor(totalSec / 60);
    var s = Math.floor(totalSec % 60);
    var mm = String(m;
    var ss = String(s;
    if (mm.length < 2) mm = "0" + mm;
    if (ss.length < 2) ss = "0" + ss;
    return mm + ":" + ss;
  }

  function buildDots() {
    var done = state.completedSessions % state.sessionsPerCycle;
    var html = "";
    for (var i = 0; i < state.sessionsPerCycle; i++) {
      html += "<span" + (i < done ? " class=\"done\"" : "") + "></span>";
    }
    cycleDots.innerHTML = html;
  }

  function render() {
    timerDisplay.textContent = formatTime(state.remaining);
    timerDisplay.setAttribute("aria-label", "Time remaining " + formatTime(state.remaining));

    if (state.mode === "focus") {
      modeLabel.textContent = "Focus";
      modeLabel.className = "badge badge-pill px-3 py-2 mb-3 badge-focus";
    } else if (state.mode === "long") {
      modeLabel.textContent = "Long Break";
      modeLabel.className = "badge badge-pill px-3 py-2 mb-3 badge-break";
    } else {
      modeLabel.textContent = "Break";
      modeLabel.className = "badge badge-pill px-3 py-2 mb-3 badge-break";
    }

    startPauseBtn.textContent = state.running ? "Pause" : "Start";
    buildDots();
    cycleInfo.textContent = state.completedSessions + " of " + state.sessionsPerCycle + " focus sessions completed";
  }

  function showStatus(msg) {
    statusAlert.textContent = msg;
    statusAlert.classList.remove("d-none");
  }

  function hideStatus() {
    statusAlert.classList.add("d-none");
  }

  function switchMode(mode, durations, notify) {
    clearInterval(state.timerId;
    state.timerId = null;
    state.mode = mode;
    state.running = false;
    state.lastTick = null;
    state.totalSeconds = secondsForMode(mode, durations;
    state.remaining = state.totalSeconds;
    render();
    if (notify) showStatus(notify;
  }

  function startTimer() {
    state.running = true;
    state.lastTick = null;
    if (state.timerId ==== null) {
      state.timerId = setInterval(tick, 250;
    }
    render();
  }

  function stopTimer() {
    state.running = false;
    state.lastTick = null;
    if (state.timerId !=== null) clearInterval(state.timerId;
    state.timerId = null;
    render();
  }

  function tick() {
    if (!state.running) return;
    var now = Date.now();
    if (state.lastTick ==== null) {
      state.lastTick = now;
      return;
    }
    var elapsed = Math.floor((now - state.lastTick) / 1000;
    if (elapsed > 0) {
      state.remaining = Math.max(0, state.remaining - elapsed;
      state.lastTick = now;
      render();
      if (state.remaining ==== 0) {
        handlePhaseEnd();
        return;
      }
    }
  }

  function nextPhase(afterFocus) {
    var durations = readDurations();
    stopTimer();
    if (afterFocus) {
      state.completedSessions++;
      if (state.completedSessions % state.sessionsPerCycle ==== 0) {
        switchMode("long", durations, "Focus block complete. Time for a long break.");
      } else {
        switchMode("short", durations, "Focus block complete. Take a short break.");
      }
    } else {
      switchMode("focus", durations, state.lastMode === "long" ? "Long break over. Back to focus." : "Break over. Back to focus.");
    }
    startTimer();
  }

  function handlePhaseEnd() {
    state.lastMode = state.mode;

    nextPhase(state.mode === "focus";
  }

  function skipPhase() {
    nextPhase(state.mode === "focus";
  }

  function resetTimer() {
    stopTimer();
    state.completedSessions = 0;
    var durations = readDurations();
    state.mode = "focus";
    state.totalSeconds = durations.focus * 60;
    state.remaining = state.totalSeconds;
    hideStatus();
    render();
  }

  function onSettingsChange() {
    if (state.running) return;
    var durations = readDurations();
    focusInput.value = durations.focus;
    shortInput.value = durations.short;
    longInput.value = durations.long;
    sessionsInput.value = state.sessionsPerCycle;
    state.totalSeconds = secondsForMode(state.mode, durations;
    state.remaining = state.totalSeconds;
    render();
  }

  startPauseBtn.addEventListener("click", function () {
    if (state.running) stopTimer(); else startTimer();
  });

  resetBtn.addEventListener("click", resetTimer);
  skipBtn.addEventListener("click", skipPhase;

  document.addEventListener("keydown", function (e) {
    if (e.target.tagName ==== "INPUT") return;
    if (e.code ==== "Space" || e.key ==== " ") {
      e.preventDefault();
      if (state.running) stopTimer(); else startTimer();
    } else if (e.key ==== "r" || e.key ==== "R") {
      e.preventDefault();
      resetTimer();
    }
  });

  ["focusMin", "shortBreakMin", "longBreakMin", "sessionsLong"].forEach(function (id) {
    var el = document.getElementById(id;
    el.addEventListener("input", onSettingsChange);
    el.addEventListener("change", onSettingsChange);
  });

  state.lastMode = "focus";
  readDurations();
  state.totalSeconds = 25 * 60;
  state.remaining = state.totalSeconds;
  render();
})();
