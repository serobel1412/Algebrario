import { generateInfiniteExercise } from "@shared/exerciseGenerator";

export { generateInfiniteExercise };

export function createInfiniteExercise(topicId: string, round: number, difficulty: "Básico" | "Intermedio" | "Reto") {
  return generateInfiniteExercise(topicId, round, difficulty);
}
