import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Lightbulb, RotateCcw, X } from "lucide-react";
import type { Difficulty, Exercise } from "@/data/topics";

export type ExerciseFeedback = "correct" | "wrong" | null;

type Props = {
  exercise: Exercise;
  topicSlug: string;
  difficulty?: Difficulty;
  onAnswer: (correct: boolean) => void;
  compact?: boolean;
};

type GeneratedExercise = Exercise & { socraticHints: [string, string, string] };

const hintFallback: [string, string, string] = [
  "¿Qué operación o forma principal reconoces antes de empezar?",
  "¿Qué propiedad uniforme o patrón de factorización puedes aplicar?",
  "¿Cómo comprobarías tu resultado en la expresión original?",
];

const asChoice = (base: Exercise, prompt: string, answer: string, options: string[], hint: string, explanation: string): GeneratedExercise => ({
  ...base,
  type: "choice",
  prompt,
  answer,
  options,
  hint,
  explanation,
  socraticHints: base.socraticHints ?? hintFallback,
});

function generateVariant(base: Exercise, slug: string, round: number, difficulty: Difficulty): GeneratedExercise {
  const n = (round % 4) + 2;
  const k = (round % 5) + 3;
  const hint = base.socraticHints ?? hintFallback;
  if (slug === "potencias") {
    const answer = `a${n + k}`;
    return asChoice(base, `Simplifica: a${n} · a${k}.`, answer, [answer, `a${n * k}`, `2a${n + k}`, `a${Math.max(1, k - n)}`], "Observa que la base es la misma y decide qué ocurre con los exponentes.", `Al multiplicar potencias de igual base se suman los exponentes: a${n} · a${k} = ${answer}.`);
  }
  if (slug === "radicales") {
    const square = n * n;
    const answer = `${n}√2`;
    return asChoice(base, `Simplifica √${square * 2}.`, answer, [answer, `2√${n}`, `${square}√2`, `${n * 2}√2`], "Busca dentro del radicando un factor que sea un cuadrado perfecto.", `√${square * 2} = √(${square} · 2) = ${answer}.`);
  }
  if (slug === "productos-notables") {
    const answer = `x² + ${2 * k}x + ${k * k}`;
    return asChoice(base, `Desarrolla (x + ${k})².`, answer, [answer, `x² + ${k}x + ${k * k}`, `x² + ${k * k}`, `x² − ${2 * k}x + ${k * k}`], "Identifica el cuadrado del primer término, el doble producto y el cuadrado del segundo.", `(x + ${k})² = x² + 2·x·${k} + ${k}² = ${answer}.`);
  }
  if (slug === "factorizacion") {
    const answer = `${n}(x + ${k})`;
    return asChoice(base, `Factoriza ${n}x + ${n * k}.`, answer, [answer, `${k}(x + ${n})`, `${n}(x + ${n + k})`, `x(${n} + ${n * k})`], "Busca el número que divide exactamente a ambos términos.", `${n}x + ${n * k} = ${n}(x + ${k}).`);
  }
  if (slug === "fracciones-algebraicas") {
    const answer = `x = ${k}`;
    return asChoice(base, `¿Qué valor no puede tomar x en ${n}/(x − ${k})?`, answer, [`x = ${k}`, `x = ${n}`, `x = 0`, `x = −${k}`], "El denominador no puede ser cero.", `x − ${k} = 0 cuando ${answer}; ese valor queda excluido.`);
  }
  if (slug === "ecuaciones-lineales") {
    const result = k;
    const constant = n;
    const total = 2 * result + constant;
    return { ...base, type: "text", prompt: `Resuelve: 2x + ${constant} = ${total}.`, answer: String(result), hint: "Aplica la misma resta a ambos lados y luego divide ambos lados por el coeficiente de x.", explanation: `Al restar ${constant} a ambos lados queda 2x = ${2 * result}; al dividir ambos lados entre 2, x = ${result}.`, socraticHints: hint };
  }
  if (slug === "desigualdades") {
    const answer = `x ≤ −${k}`;
    return asChoice(base, `Resuelve: −${n}x ≥ ${n * k}.`, answer, [answer, `x ≥ ${k}`, `x ≤ ${k}`, `x ≥ −${k}`], "¿Qué sucede con el sentido del signo al dividir ambos lados por un número negativo?", `Al dividir ambos lados entre −${n}, la desigualdad se invierte y queda ${answer}.`);
  }
  if (slug === "sistemas") {
    const total = 2 * k;
    const difference = 2 * n;
    const answer = String((total + difference) / 2);
    return asChoice(base, `En x + y = ${total} y x − y = ${difference}, ¿cuál es x?`, answer, [answer, String(n), String(k), String(total)], "Suma las dos ecuaciones para eliminar y.", `La suma produce 2x = ${total + difference}; al dividir ambos lados entre 2, x = ${answer}.`);
  }
  if (slug === "funciones-lineales") {
    const answer = String(n);
    return asChoice(base, `En y = ${n}x − ${k}, ¿cuál es la pendiente?`, answer, [answer, String(k), `−${n}`, `−${k}`], "Compara la expresión con y = mx + b.", `La pendiente es el coeficiente que multiplica a x: m = ${answer}.`);
  }
  if (slug === "funciones-cuadraticas") {
    const answer = n % 2 ? "Abajo" : "Arriba";
    const coefficient = n % 2 ? -n : n;
    return asChoice(base, `¿Hacia dónde abre f(x) = ${coefficient}x² + 1?`, answer, ["Arriba", "Abajo", "A la derecha", "No es cuadrática"], "Mira el signo del coeficiente de x².", `El coeficiente es ${coefficient}; por eso la parábola abre ${answer.toLowerCase()}.`);
  }
  if (slug === "sucesiones") {
    const answer = String(k);
    return asChoice(base, `En ${n}, ${n + k}, ${n + 2 * k}, … ¿cuál es la diferencia común?`, answer, [answer, String(n), String(n + k), String(2 * k)], "Resta un término y el consecutivo.", `La diferencia es (${n + k}) − ${n} = ${answer}.`);
  }
  if (slug === "logaritmos") {
    const answer = String(n);
    return asChoice(base, `¿Cuánto vale log₂(${2 ** n})?`, answer, [answer, String(2 ** n), String(n + 1), String(k)], "Pregunta a qué exponente debes elevar 2 para obtener el argumento.", `Como 2^${answer} = ${2 ** n}, el logaritmo vale ${answer}.`);
  }
  if (slug === "problemas-aplicados") {
    const answer = String(5000 + 2000 * n);
    return asChoice(base, `Un servicio cobra 5.000 de base y 2.000 por unidad. ¿Cuánto cuesta usarlo ${n} unidades?`, answer, [answer, String(5000 + 2000 * k), String(2000 * n), String(5000 * n)], "Separa el costo fijo del costo que depende de la cantidad.", `El modelo es C(n) = 5000 + 2000n; al evaluar ${n}, resulta ${answer}.`);
  }
  if (slug === "lenguaje-algebraico") {
    const answer = `x/${n} + ${k}`;
    return asChoice(base, `¿Qué expresión representa “la ${n === 2 ? "mitad" : "parte " + n} de un número más ${k}”?`, answer, [answer, `${n}x + ${k}`, `x + ${n * k}`, `${k}x/${n}`], "Traduce primero la división indicada y después la suma.", `Si el número es x, dividirlo entre ${n} y sumar ${k} produce ${answer}.`);
  }
  if (slug === "polinomios") {
    const answer = `${n + k}x − ${k - n}`;
    return { ...base, type: "text", prompt: `Reduce: ${n}x + ${k} − ${k - n}x − ${n}.`, answer: answer.replace(/\s/g, ""), hint: "Agrupa por separado los términos con x y las constantes.", explanation: `Los términos con x suman ${n + k - n}x y las constantes quedan ${k - n}; el resultado es ${answer}.`, socraticHints: hint };
  }
  return { ...base, difficulty, socraticHints: hint };
}

export default function ExercisePlayer({ exercise, topicSlug, difficulty = exercise.difficulty, onAnswer, compact = false }: Props) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<ExerciseFeedback>(null);
  const [visibleHints, setVisibleHints] = useState(0);
  const current = useMemo(() => generateVariant(exercise, topicSlug, round, difficulty), [exercise, topicSlug, round, difficulty]);
  const hints = current.socraticHints ?? hintFallback;

  const check = () => {
    if (!selected.trim() || feedback) return;
    const normalized = selected.toLowerCase().replace(/\s/g, "").replace(/[−–]/g, "-");
    const answer = current.answer.toLowerCase().replace(/\s/g, "").replace(/[−–]/g, "-");
    const correct = normalized === answer;
    setFeedback(correct ? "correct" : "wrong");
    onAnswer(correct);
  };

  const next = () => {
    setRound(value => value + 1);
    setSelected("");
    setFeedback(null);
    setVisibleHints(0);
  };

  return <div className={`exercise-card adaptive-exercise ${compact ? "exercise-compact" : ""} ${feedback ?? ""}`}>
    <div className="exercise-header"><div><span className="eyebrow">Práctica adaptativa</span><span className="difficulty-badge">{difficulty}</span></div><span className="exercise-index">Reto {round + 1}</span></div>
    <h3>{current.prompt}</h3>
    {current.type === "choice" ? <div className="choice-grid">{current.options?.map(option => <button key={option} className={selected === option ? "choice selected" : "choice"} onClick={() => { setSelected(option); setFeedback(null); }}>{option}</button>)}</div> : <input className="answer-input" value={selected} onChange={event => { setSelected(event.target.value); setFeedback(null); }} placeholder="Escribe tu respuesta" aria-label="Tu respuesta" />}
    <div className="socratic-panel"><button className="socratic-toggle" onClick={() => setVisibleHints(value => value === hints.length ? 0 : value + 1)} aria-expanded={visibleHints > 0}><Lightbulb size={15} /> Pista Socrática <ChevronDown size={15} /></button>{visibleHints > 0 && <div className="socratic-hints">{hints.slice(0, visibleHints).map((hint, index) => <p key={hint}><strong>Nivel {index + 1}.</strong> {hint}</p>)}</div>}</div>
    {feedback && <div className={`feedback ${feedback}`} aria-live="polite"><span className="feedback-icon">{feedback === "correct" ? <Check size={17} /> : <X size={17} />}</span><div><strong>{feedback === "correct" ? "¡Muy bien!" : "Todavía puedes razonarlo"}</strong><p>{feedback === "correct" ? current.explanation : "Usa una pista socrática, revisa la propiedad y vuelve a intentarlo en el siguiente reto."}</p></div></div>}
    {!feedback ? <button className="button button-primary exercise-button" onClick={check} disabled={!selected.trim()}>Comprobar respuesta <ArrowRight size={16} /></button> : <button className="button button-ghost exercise-button" onClick={next}>{feedback === "correct" ? "Nuevo reto" : "Intentar otro ejercicio"} {feedback === "correct" ? <ArrowRight size={16} /> : <RotateCcw size={15} />}</button>}
  </div>;
}
