import { Delete, Eraser } from "lucide-react";

type Props = { value: string; onChange: (value: string) => void; includeEquals?: boolean };

const scientificRows = [
  ["x", "y", "π", "e"],
  ["x²", "1/", "√(", "|x|"],
  ["<", ">", "(", ")"],
  ["ans", ",", "ln(", "log10("],
];
const numericRows = [
  ["7", "8", "9", "×", "÷"],
  ["4", "5", "6", "+", "−"],
  ["1", "2", "3", "=", "⌫"],
  ["0", ".", "^", "‹", "›"],
];

export default function MathKeyboard({ value, onChange, includeEquals = false }: Props) {
  const insert = (key: string) => {
    if (key === "=") {
      if (includeEquals) onChange(`${value}=`);
      return;
    }
    if (key === "⌫") { onChange(value.slice(0, -1)); return; }
    if (["<", ">", "‹", "›", "ans", "y", "π", "e", "|x|"].includes(key)) return;
    const insertion = key === "x²" ? "x^2" : key;
    onChange(`${value}${insertion}`);
  };
  return <div className="math-keyboard" aria-label="Teclado matemático">
    <div className="math-keyboard-heading"><span>Teclado matemático</span><small>Funciones, símbolos y operadores</small></div>
    <div className="math-keyboard-layout">
      <div className="math-keyboard-scientific">
        {scientificRows.flat().map((key, index) => <button type="button" className={`math-key ${index < 4 || key === "ans" ? "math-key-muted" : "function-key"}`} key={`${key}-${index}`} onClick={() => insert(key)}>{key}</button>)}
      </div>
      <div className="math-keyboard-numeric">
        {numericRows.flat().map((key, index) => <button type="button" className={`math-key ${/[0-9.]/.test(key) ? "number-key" : "operator-key"} ${key === "⌫" ? "backspace-key" : ""}`} key={`${key}-${index}`} onClick={() => insert(key)} disabled={key === "=" && !includeEquals}>{key === "⌫" ? <Delete size={17} /> : key}</button>)}
      </div>
    </div>
    <div className="math-keyboard-actions"><button type="button" className="math-key utility-key" onClick={() => onChange("")}><Eraser size={16} /> Borrar</button><button type="button" className="math-key utility-key" onClick={() => onChange(value.slice(0, -1))}><Delete size={16} /> Retroceso</button></div>
  </div>;
}
