function showError(msg) {
  errorBox.textContent = msg;
  errorBox.classList.remove("d-none");
  results.classList.add("d-none");
}
function clearError() {
  errorBox.classList.add("d-none");
}
function normalize(raw) {
  var v = (raw || "").trim().replace(/^#/, "").toLowerCase();
  if (v.length === 3 && /^[a-f0-9]{3}$/.test(v)) {
    v = v.split(""").map(function(c) { return c + c; }).join("");
  }
  return v;
}