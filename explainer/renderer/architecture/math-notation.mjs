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

const GREEK_NAMES = Object.freeze({
  alpha: ["\\alpha", "α"],
  beta: ["\\beta", "β"],
  gamma: ["\\gamma", "γ"],
  delta: ["\\delta", "δ"],
  sigma: ["\\sigma", "σ"],
  theta: ["\\theta", "θ"],
  Delta: ["\\Delta", "Δ"],
});

const SYMBOL_PATTERN = /^([A-Za-zͰ-Ͽ]+)(?:_(\{[^{}]+\}|[A-Za-z0-9+\-]+))?(?:\^(\{[^{}]+\}|[A-Za-z0-9+\-]+))?$/;
const SYMBOL_IN_TEXT = /[A-Za-zͰ-Ͽ]+(?:_(?:\{[^{}]+\}|[A-Za-z0-9+\-]+))?(?:\^(?:\{[^{}]+\}|[A-Za-z0-9+\-]+))?/g;

function scriptPart(source) {
  if (!source) return null;
  const grouped = source.startsWith("{");
  return { text: grouped ? source.slice(1, -1) : source, grouped };
}

function compactSymbol(value) {
  const match = String(value || "").match(SYMBOL_PATTERN);
  if (!match) return null;
  if (match[1].length > 1 && !GREEK_NAMES[match[1]] && !/^Δ[A-Za-z]$/.test(match[1])) return null;
  return {
    base: match[1],
    subscript: scriptPart(match[2]),
    superscript: scriptPart(match[3]),
  };
}

function scriptTex(part) {
  if (!part) return "";
  const value = /^[A-Za-z]{3,}$/.test(part.text)
    ? `\\mathrm{${part.text}}`
    : part.text;
  return `{${value}}`;
}

function baseTex(base) {
  if (GREEK_NAMES[base]) return GREEK_NAMES[base][0];
  if (base.startsWith("Δ") && base.length > 1) return `\\Delta ${base.slice(1)}`;
  return base;
}

function baseGlyph(base) {
  return GREEK_NAMES[base]?.[1] || base;
}

// Board notation may be a compact plain label (for example `.pdb`) or a
// mathematical symbol. Only the compact symbol grammar is sent to MathJax.
export function notationMarkup(value) {
  const notation = String(value || "");
  const symbol = compactSymbol(notation);
  if (!symbol) return escapeHtml(notation);
  const subscript = symbol.subscript ? `_${scriptTex(symbol.subscript)}` : "";
  const superscript = symbol.superscript ? `^${scriptTex(symbol.superscript)}` : "";
  return texMarkup(`${baseTex(symbol.base)}${subscript}${superscript}`);
}

// Keep authored prose intact while typesetting only isolated compact symbols.
// Code paths and longer snake_case identifiers do not match this grammar.
export function mathProseMarkup(value) {
  const text = String(value || "");
  let result = "";
  let offset = 0;
  for (const match of text.matchAll(SYMBOL_IN_TEXT)) {
    const before = text[match.index - 1] || "";
    const after = text[match.index + match[0].length] || "";
    const symbol = compactSymbol(match[0]);
    if (!symbol?.subscript && !symbol?.superscript) continue;
    if (/[A-Za-z0-9_.]/.test(before) || /[A-Za-z0-9_]/.test(after)) continue;
    result += escapeHtml(text.slice(offset, match.index));
    result += `<span class="math-inline">${notationMarkup(match[0])}</span>`;
    offset = match.index + match[0].length;
  }
  return result + escapeHtml(text.slice(offset));
}

// SVG edge labels cannot contain MathJax's HTML output. Return safe text
// segments so the renderer can use native SVG baseline shifts for scripts.
export function svgMathLabelParts(value) {
  const text = String(value || "");
  const parts = [];
  let offset = 0;
  for (const match of text.matchAll(SYMBOL_IN_TEXT)) {
    const before = text[match.index - 1] || "";
    const after = text[match.index + match[0].length] || "";
    const symbol = compactSymbol(match[0]);
    if (!symbol?.subscript && !symbol?.superscript) continue;
    if (/[A-Za-z0-9_.]/.test(before) || /[A-Za-z0-9_]/.test(after)) continue;
    if (match.index > offset) parts.push({ kind: "plain", text: text.slice(offset, match.index) });
    parts.push({ kind: "base", text: baseGlyph(symbol.base) });
    if (symbol.subscript) parts.push({ kind: "sub", text: symbol.subscript.text });
    if (symbol.superscript) {
      parts.push({
        kind: "sup",
        text: symbol.superscript.text,
        overlap: symbol.subscript ? symbol.subscript.text.length : 0,
      });
    }
    offset = match.index + match[0].length;
  }
  if (offset < text.length) parts.push({ kind: "plain", text: text.slice(offset) });
  return parts;
}
