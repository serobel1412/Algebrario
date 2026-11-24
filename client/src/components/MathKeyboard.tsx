import { Delete, Eraser } from "lucide-react";

type Props = { value: string; onChange: (value: string) => void; includeEquals?: boolean };

const keys = [
  ["7", "8", "9", "÷", "(", ")"],
  ["4", "5", "6", "×", "^", "√("] ,
  ["1", "2", "3", "−", "x", "log("],
  ["0", ".", "+", "ln(", "=", ")"] ,
];

export default function MathKeyboard({ value, onChange, includeEquals = false }: Props) {
  const insert = (key: string) => {
    if (key === "=" && !includeEquals) return;
    onChange(`${value}${key}`);
  };
  return <div className="math-keyboard" aria-label="Teclado matemático">
    <div className="math-keyboard-heading"><span>Teclado matemático</span><small>Las funciones se insertan al final</small></div>
    <div className="math-keyboard-grid">
      {keys.flat().map((key, index) => <button type="button" className={`math-key ${/[0-9.]/.test(key) ? "number-key" : "operator-key"}`} key={`${key}-${index}`} onClick={() => insert(key)} disabled={key === "=" && !includeEquals}>{key}</button>)}
      <button type="button" className="math-key function-key" onClick={() => insert("sqrt(")}>√ raíz</button>
      <button type="button" className="math-key function-key" onClick={() => insert("log10(")}>log10</button>
      <button type="button" className="math-key utility-key" onClick={() => onChange(value.slice(0, -1))}><Delete size={17} /> Retroceso</button>
      <button type="button" className="math-key utility-key clear-key" onClick={() => onChange("")}><Eraser size={17} /> Borrar</button>
    </div>
  </div>;
}
