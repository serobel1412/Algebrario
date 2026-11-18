import katex from "katex";
import "katex/dist/katex.min.css";
import type { ReactNode } from "react";

type Props = { children: string; className?: string };

function renderSegment(value: string, displayMode = false) {
  return katex.renderToString(value, { throwOnError: false, displayMode, strict: "ignore" });
}

export default function MathText({ children, className = "" }: Props) {
  const parts: ReactNode[] = [];
  const pattern = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(children)) !== null) {
    if (match.index > cursor) parts.push(<span key={`text-${cursor}`}>{children.slice(cursor, match.index)}</span>);
    parts.push(<span key={`math-${match.index}`} className="math-fragment" dangerouslySetInnerHTML={{ __html: renderSegment(match[1] ?? match[2], Boolean(match[1])) }} />);
    cursor = match.index + match[0].length;
  }
  if (cursor < children.length) parts.push(<span key={`text-${cursor}`}>{children.slice(cursor)}</span>);
  return <span className={`math-text ${className}`}>{parts.length ? parts : children}</span>;
}
