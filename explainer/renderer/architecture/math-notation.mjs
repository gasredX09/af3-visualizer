function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function texMarkup(tex) {
  return `\\(${escapeHtml(tex)}\\)`;
}

export function equationMarkup(equation = {}) {
  const text = String(equation.text || "").trim();
  const tex = String(equation.tex || "").trim();
  if (!text || !tex) return "";

  return `<span class="arch-equation math-step" aria-label="${escapeHtml(text)}">${texMarkup(tex)}</span>`;
}

// Board notation may be a compact plain label (for example `.pdb`) or a
// mathematical symbol. Keep plain labels readable while routing the supported
// mathematical forms through MathJax. Multi-token subscripts are authored as
// TeX groups: x_{t-10}, never the code-like shorthand x_(t-10).
export function notationMarkup(value) {
  const notation = String(value || "");
  if (/^[A-Za-zͰ-Ͽ]$/.test(notation)) return texMarkup(notation);

  const simpleSubscript = notation.match(/^([A-Za-zͰ-Ͽ])_([A-Za-z0-9]+)$/);
  if (simpleSubscript) {
    return texMarkup(`${simpleSubscript[1]}_{\\mathrm{${simpleSubscript[2]}}}`);
  }

  if (/^[A-Za-zͰ-Ͽ]_\{[^{}]+\}$/.test(notation)) return texMarkup(notation);

  return escapeHtml(notation);
}
