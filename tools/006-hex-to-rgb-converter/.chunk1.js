function toRgb(h) {
  var v = h;
  if (v.length !== 6 && v.length !== 3) return null;
  if (!/^[a-f0-9]{6}$/.test(v)) return null;
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16)
  };
}