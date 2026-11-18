import rawSeed from "@shared/data/ejercicios_algebrario_seed.json";
import type { Difficulty, Exercise, ExerciseOption, SocraticHint } from "./topics";

type SeedOption = { texto: string; correcta: boolean; retroalimentacion: string };
type SeedHint = { nivel: number; enfoque: string; pregunta: string };
type SeedRow = { id: string; tema_id: number; nivel_grupo: string; dificultad: string; enunciado: string; opciones: SeedOption[]; pistas_socraticas: SeedHint[] };

export const topicSlugByNumber: Record<number, string> = {
  1: "lenguaje-algebraico", 2: "potencias", 3: "radicales", 4: "polinomios", 5: "productos-notables", 6: "factorizacion", 7: "fracciones-algebraicas", 8: "ecuaciones-lineales", 9: "desigualdades", 10: "sistemas", 11: "funciones-lineales", 12: "funciones-cuadraticas", 13: "sucesiones", 14: "logaritmos", 15: "problemas-aplicados",
};

const difficultyMap: Record<string, Difficulty> = { Básica: "Básico", Media: "Intermedio", Avanzada: "Reto" };

export function seedRowToExercise(row: SeedRow): Exercise {
  const options: ExerciseOption[] = row.opciones.map(option => ({ text: option.texto, correct: option.correcta, feedback: option.retroalimentacion }));
  const correct = row.opciones.find(option => option.correcta);
  const hints: SocraticHint[] = row.pistas_socraticas.map(hint => ({ level: hint.nivel, focus: hint.enfoque, question: hint.pregunta }));
  return {
    id: row.id,
    difficulty: difficultyMap[row.dificultad] ?? "Básico",
    prompt: row.enunciado,
    type: "choice",
    options,
    answer: correct?.texto ?? "",
    hint: hints[0] && typeof hints[0] !== "string" ? hints[0].question : "Lee la estructura antes de operar.",
    explanation: correct?.retroalimentacion ?? "Revisa la propiedad aplicada.",
    socraticHints: hints,
    skill: "Banco semilla",
  };
}

const rows = rawSeed as SeedRow[];
export const seedExercises = rows.map(seedRowToExercise);
export const seedExercisesByTopic: Record<string, Exercise[]> = Object.fromEntries(Object.entries(topicSlugByNumber).map(([number, slug]) => [slug, seedExercises.filter(exercise => exercise.id.startsWith(`T${String(number).padStart(2, "0")}_`))]));
