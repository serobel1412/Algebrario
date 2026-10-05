export type AlgebraResult = { ok: true; value: string; detail?: string } | { ok: false; error: string };

type Token = number | "x" | "+" | "-" | "*" | "/" | "^" | "(" | ")";
const allowed = /^[0-9xX+\-*/().\s^×÷−,]+$/;

function normalize(input: string) {
  return input.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".");
}

function tokenize(input: string): Token[] | null {
  const tokens: Token[] = [];
  let index = 0;
  while (index < input.length) {
    const char = input[index];
    if (/\s/.test(char)) { index += 1; continue; }
    if (/[0-9.]/.test(char)) {
      const match = input.slice(index).match(/^(?:\d+\.?\d*|\.\d+)/);
      if (!match) return null;
      tokens.push(Number(match[0])); index += match[0].length; continue;
    }
    if (char.toLowerCase() === "x") { tokens.push("x"); index += 1; continue; }
    if ("+-*/^()".includes(char)) { tokens.push(char as Exclude<Token, number | "x">); index += 1; continue; }
    return null;
  }
  return tokens.length ? tokens : null;
}

function parseNumberExpression(input: string, xValue: number): number {
  const parsedTokens = tokenize(input);
  if (!parsedTokens) throw new Error("tokens");
  const tokens: Token[] = parsedTokens;
  let position = 0;
  const startsPrimary = (token: Token | undefined) => typeof token === "number" || token === "x" || token === "(";
  const primary = (): number => {
    const token = tokens[position++];
    if (typeof token === "number") return token;
    if (token === "x") return xValue;
    if (token === "(") {
      const value = expression();
      if (tokens[position++] !== ")") throw new Error("parentheses");
      return value;
    }
    throw new Error("primary");
  };
  const unary = (): number => {
    if (tokens[position] === "+") { position += 1; return unary(); }
    if (tokens[position] === "-") { position += 1; return -unary(); }
    return primary();
  };
  const power = (): number => {
    const base = unary();
    if (tokens[position] === "^") { position += 1; return base ** power(); }
    return base;
  };
  const term = (): number => {
    let value = power();
    while (tokens[position] === "*" || tokens[position] === "/" || startsPrimary(tokens[position])) {
      const operator = startsPrimary(tokens[position]) ? "*" : tokens[position++];
      const divisor = power();
      if (operator === "/" && divisor === 0) throw new Error("zero");
      value = operator === "/" ? value / divisor : value * divisor;
    }
    return value;
  };
  function expression(): number {
    let value = term();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const next = term();
      value = operator === "+" ? value + next : value - next;
    }
    return value;
  }
  const result = expression();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("syntax");
  return result;
}

export function evaluateExpression(input: string, xValue: string): AlgebraResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Escribe una expresión para comenzar." };
  if (!allowed.test(raw)) return { ok: false, error: "Usa solo números, x y las operaciones +, −, ×, ÷, ^ y paréntesis." };
  const x = Number(xValue);
  if (!Number.isFinite(x)) return { ok: false, error: "El valor de x debe ser un número." };
  try {
    const value = parseNumberExpression(normalize(raw), x);
    return { ok: true, value: Number(value.toFixed(6)).toString(), detail: `${raw} cuando x = ${x}` };
  } catch {
    return { ok: false, error: "No pude interpretar esa expresión. Revisa los paréntesis y operadores." };
  }
}

type Linear = { a: number; b: number };

function parseLinearSide(side: string): Linear | null {
  const compact = side.replace(/\s/g, "");
  if (!compact || /[()^]/.test(compact)) return null;
  const terms = compact.replace(/-/g, "+-").replace(/^\+/, "").split("+").filter(Boolean);
  let a = 0; let b = 0;
  for (const term of terms) {
    const hasX = /x/i.test(term);
    if (hasX && (term.match(/x/gi)?.length ?? 0) !== 1) return null;
    if (hasX) {
      const lower = term.toLowerCase();
      const xIndex = lower.indexOf("x");
      const before = lower.slice(0, xIndex).replace(/\*$/, "");
      const after = lower.slice(xIndex + 1);
      let coefficient = before === "" || before === "+" ? 1 : before === "-" ? -1 : Number(before);
      if (after) {
        if (!after.startsWith("/")) return null;
        const divisor = Number(after.slice(1));
        if (!Number.isFinite(divisor) || divisor === 0) return null;
        coefficient /= divisor;
      }
      if (!Number.isFinite(coefficient)) return null;
      a += coefficient;
    } else {
      if (!/^[+-]?(?:\d+\.?\d*|\.\d+)(?:\*\d+\.?\d*)?$/.test(term)) return null;
      const value = term.includes("*") ? term.split("*").reduce((total, part) => total * Number(part), 1) : Number(term);
      if (!Number.isFinite(value)) return null;
      b += value;
    }
  }
  return { a, b };
}

export function solveLinearEquation(input: string): AlgebraResult {
  const raw = input.trim().replace(/−/g, "-");
  if (!raw) return { ok: false, error: "Escribe una ecuación como 3x+4=19." };
  if (!/^[0-9xX+\-*/().=\s]+$/.test(raw) || raw.split("=").length !== 2) return { ok: false, error: "Usa una ecuación lineal con una sola x y un signo igual." };
  const [leftText, rightText] = raw.split("=");
  if (!/[x]/i.test(raw)) return { ok: false, error: "La ecuación debe incluir una incógnita x." };
  const left = parseLinearSide(leftText); const right = parseLinearSide(rightText);
  if (!left || !right) return { ok: false, error: "Usa una ecuación lineal sencilla, por ejemplo 2x+3=9." };
  const coefficient = left.a - right.a; const constant = right.b - left.b;
  if (coefficient === 0) return constant === 0 ? { ok: true, value: "Infinitas soluciones" } : { ok: false, error: "No hay una solución para esa ecuación." };
  const value = constant / coefficient;
  return { ok: true, value: Number(value.toFixed(6)).toString(), detail: `Aislamos x: x = (${constant}) / (${coefficient})` };
}
