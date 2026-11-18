import { useMemo, useState } from "react";
import { ArrowRight, Check, ChevronDown, Infinity as InfinityIcon, Lightbulb, RotateCcw, Sparkles, X } from "lucide-react";
import { generateInfiniteExercise } from "@shared/exerciseGenerator";
import { trpc } from "@/lib/trpc";
import { seedExercisesByTopic } from "@/data/seedExercises";
import type { Difficulty, Exercise, ExerciseOption, SocraticHint } from "@/data/topics";
import MathText from "./MathText";

export type ExerciseFeedback = "correct" | "wrong" | null;

type Props = {
  exercise: Exercise;
  topicSlug: string;
  difficulty?: Difficulty;
  masteryPercentage?: number;
  onAnswer: (correct: boolean) => void;
  compact?: boolean;
};

type Hint = { level: number; focus: string; question: string };

const fallbackHints: Hint[] = [
  { level: 1, focus: "Lectura Estructural", question: "¿Qué operación o forma principal reconoces antes de empezar?" },
  { level: 2, focus: "Propiedad Uniforme / Factorización", question: "¿Qué propiedad o patrón puedes aplicar sin cambiar la igualdad?" },
  { level: 3, focus: "Verificación", question: "¿Cómo comprobarías tu resultado en la expresión original?" },
];

function optionData(option: ExerciseOption) {
  return typeof option === "string" ? { text: option, correct: undefined, feedback: undefined } : option;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/\s/g, "").replace(/[−–]/g, "-").replace(/\\\(|\\\)|\\\[|\\\]/g, "");
}

function toExercise(row: { id: string; difficulty: Difficulty; prompt: string; type: "choice" | "text"; options: unknown; answer: string; socraticHints: unknown; explanation: string }): Exercise {
  return {
    id: row.id,
    difficulty: row.difficulty,
    prompt: row.prompt,
    type: row.type,
    options: Array.isArray(row.options) ? row.options as ExerciseOption[] : undefined,
    answer: row.answer,
    hint: "Lee la estructura y aplica una propiedad a la vez.",
    explanation: row.explanation,
    socraticHints: Array.isArray(row.socraticHints) ? row.socraticHints as SocraticHint[] : undefined,
    skill: "Banco semilla",
  };
}

export default function ExercisePlayer({ exercise, topicSlug, difficulty = exercise.difficulty, masteryPercentage = 0, onAnswer, compact = false }: Props) {
  const [round, setRound] = useState(0);
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<ExerciseFeedback>(null);
  const [visibleHints, setVisibleHints] = useState(0);
  const canUseServer = typeof window !== "undefined" && !window.location.hostname.endsWith("github.io");
  const seedQuery = trpc.exercises.byTopic.useQuery({ topicId: topicSlug }, { enabled: canUseServer, retry: false, staleTime: Infinity });
  const infiniteMode = masteryPercentage >= 100;
  const infiniteQuery = trpc.exercises.infinite.useQuery({ topicId: topicSlug, round, difficulty }, { enabled: canUseServer && infiniteMode, retry: false, staleTime: 0 });
  const localBank = seedExercisesByTopic[topicSlug] ?? [];
  const bank = useMemo(() => seedQuery.data?.length ? seedQuery.data.map(row => toExercise(row)) : localBank.length ? localBank : [exercise], [exercise, localBank, seedQuery.data]);
  const current = useMemo(() => {
    if (infiniteMode) return infiniteQuery.data ?? generateInfiniteExercise(topicSlug, round, difficulty) as Exercise;
    return bank[round % bank.length] ?? exercise;
  }, [bank, difficulty, exercise, infiniteMode, infiniteQuery.data, round, topicSlug]);
  const hints: Hint[] = (current.socraticHints ?? fallbackHints).map((hint, index) => typeof hint === "string" ? { level: index + 1, focus: fallbackHints[index]?.focus ?? "Razonamiento", question: hint } : hint);
  const selectedOption = current.options?.map(optionData).find(option => option.text === selected);
  const challengeLabel = infiniteMode ? <><InfinityIcon size={14} /> Práctica infinita</> : <><Sparkles size={14} /> Banco semilla · {round % bank.length + 1}/10</>;

  const check = () => {
    if (!selected.trim() || feedback) return;
    const correct = selectedOption?.correct ?? normalize(selected) === normalize(current.answer);
    setFeedback(correct ? "correct" : "wrong");
    onAnswer(correct);
  };

  const next = () => {
    setRound(value => value + 1);
    setSelected("");
    setFeedback(null);
    setVisibleHints(0);
  };

  return <div className={`exercise-card adaptive-exercise ${infiniteMode ? "infinite-mode" : ""} ${compact ? "exercise-compact" : ""} ${feedback ?? ""}`}>
    <div className="exercise-header"><div><span className="eyebrow">{challengeLabel}</span><span className="difficulty-badge">{difficulty}</span></div><span className="exercise-index">Reto {round + 1}</span></div>
    <h3><MathText>{current.prompt}</MathText></h3>
    {current.type === "choice" ? <div className="choice-grid">{current.options?.map(option => { const item = optionData(option); return <button key={item.text} className={selected === item.text ? "choice selected" : "choice"} onClick={() => { setSelected(item.text); setFeedback(null); }}><MathText>{item.text}</MathText></button>; })}</div> : <input className="answer-input" value={selected} onChange={event => { setSelected(event.target.value); setFeedback(null); }} placeholder="Escribe tu respuesta" aria-label="Tu respuesta" />}
    <div className="socratic-panel"><button className="socratic-toggle" onClick={() => setVisibleHints(value => value === hints.length ? 0 : value + 1)} aria-expanded={visibleHints > 0}><Lightbulb size={15} /> Pista Socrática <ChevronDown size={15} /></button>{visibleHints > 0 && <div className="socratic-hints">{hints.slice(0, visibleHints).map(hint => <p key={`${hint.level}-${hint.question}`}><strong>Nivel {hint.level} · {hint.focus}.</strong> <MathText>{hint.question}</MathText></p>)}</div>}</div>
    {feedback && <div className={`feedback ${feedback}`} aria-live="polite"><span className="feedback-icon">{feedback === "correct" ? <Check size={17} /> : <X size={17} />}</span><div><strong>{feedback === "correct" ? "¡Muy bien!" : "Revisa la estructura"}</strong><p>{feedback === "correct" ? <MathText>{selectedOption?.feedback ?? current.explanation}</MathText> : <MathText>{selectedOption?.feedback ?? "Elige una operación, propiedad o factorización y vuelve a intentarlo."}</MathText>}</p></div></div>}
    {!feedback ? <button className="button button-primary exercise-button" onClick={check} disabled={!selected.trim()}>Comprobar respuesta <ArrowRight size={16} /></button> : <button className="button button-ghost exercise-button" onClick={next}>{feedback === "correct" ? "Nuevo reto" : "Intentar otro ejercicio"} {feedback === "correct" ? <ArrowRight size={16} /> : <RotateCcw size={15} />}</button>}
  </div>;
}
