import katex from "katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

type Props = { children: string; className?: string; displayMode?: boolean };

const superscriptMap: Record<string, string> = { "⁰": "0", "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5", "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁺": "+", "⁻": "-", "⁽": "(", "⁾": ")" };

function toKatex(value: string) {
  return value
    .replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾]+)/g, match => `^{${[...match].map(character => superscriptMap[character] ?? character).join("")}}`)
    .replace(/√\s*\(([^)]+)\)/g, "\\sqrt{$1}")
    .replace(/√\s*([A-Za-z0-9]+)/g, "\\sqrt{$1}")
    .replace(/\b([A-Za-z0-9]+)\/([A-Za-z0-9]+)\b/g, "\\frac{$1}{$2}")
    .replace(/([−–])/g, "-")
    .replace(/·|⋅/g, "\\cdot ")
    .replace(/×/g, "\\times ")
    .replace(/÷/g, "\\div ");
}

function renderSegment(value: string, displayMode = false) {
  return katex.renderToString(toKatex(value), { throwOnError: false, displayMode, strict: "ignore" });
}

// Finds compact mathematical runs inside Spanish prose without converting ordinary words.
const autoMathPattern = /(?:(?:[A-Za-z]|\d+)(?:\s*(?:[A-Za-z]|\d+|[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁽⁾]+|\^|=|≠|≤|≥|\+|−|-|·|⋅|×|÷|\/|\(|\)|,)+)+)/g;

function renderPlainText(value: string, keyPrefix: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  autoMathPattern.lastIndex = 0;
  while ((match = autoMathPattern.exec(value)) !== null) {
    const candidate = match[0].trim();
    const hasMathSignal = /\d|[⁰¹²³⁴⁵⁶⁷⁸⁹]|\^|=|≠|≤|≥|[+−×÷·⋅/]/.test(candidate) && /[A-Za-z]/.test(candidate);
    if (!hasMathSignal) continue;
    const start = match.index + (match[0].length - match[0].trimStart().length);
    if (start > cursor) parts.push(<span key={`${keyPrefix}-text-${cursor}`}>{value.slice(cursor, start)}</span>);
    parts.push(<span key={`${keyPrefix}-auto-${start}`} className="math-fragment" dangerouslySetInnerHTML={{ __html: renderSegment(candidate) }} />);
    cursor = start + candidate.length;
  }
  if (cursor < value.length) parts.push(<span key={`${keyPrefix}-text-${cursor}`}>{value.slice(cursor)}</span>);
  return parts.length ? parts : [value];
}

export default function MathText({ children, className = "", displayMode = false }: Props) {
  const parts: ReactNode[] = [];
  const pattern = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(children)) !== null) {
    if (match.index > cursor) parts.push(...renderPlainText(children.slice(cursor, match.index), `plain-${cursor}`));
    parts.push(<span key={`math-${match.index}`} className="math-fragment" dangerouslySetInnerHTML={{ __html: renderSegment(match[1] ?? match[2], displayMode || Boolean(match[1])) }} />);
    cursor = match.index + match[0].length;
  }
  if (cursor < children.length) parts.push(...renderPlainText(children.slice(cursor), `plain-${cursor}`));
  return <span className={`math-text ${className}`}>{parts.length ? parts : children}</span>;
}
