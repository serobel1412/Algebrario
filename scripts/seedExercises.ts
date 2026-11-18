import "dotenv/config";
import { readFile } from "node:fs/promises";
import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { exercises, topics } from "../drizzle/schema";

const topicRows = [
  [1, "lenguaje-algebraico", "Lenguaje algebraico", "Inicio"],
  [2, "potencias", "Potencias y exponentes", "Inicio"],
  [3, "radicales", "Radicales", "Inicio"],
  [4, "polinomios", "Polinomios", "Inicio"],
  [5, "productos-notables", "Productos notables", "Intermedio"],
  [6, "factorizacion", "Factorización", "Intermedio"],
  [7, "fracciones-algebraicas", "Fracciones algebraicas", "Intermedio"],
  [8, "ecuaciones-lineales", "Ecuaciones lineales", "Intermedio"],
  [9, "desigualdades", "Desigualdades", "Intermedio"],
  [10, "sistemas", "Sistemas de ecuaciones", "Intermedio"],
  [11, "funciones-lineales", "Funciones lineales", "Intermedio"],
  [12, "funciones-cuadraticas", "Funciones cuadráticas", "Reto"],
  [13, "sucesiones", "Sucesiones y progresiones", "Reto"],
  [14, "logaritmos", "Logaritmos", "Reto"],
  [15, "problemas-aplicados", "Problemas aplicados", "Reto"],
] as const;

type SeedOption = { texto: string; correcta: boolean; retroalimentacion: string };
type SeedHint = { nivel: number; enfoque: string; pregunta: string };
type SeedRow = { id: string; tema_id: number; tema_nombre: string; nivel_grupo: string; dificultad: string; enunciado: string; opciones: SeedOption[]; pistas_socraticas: SeedHint[] };

const difficultyMap: Record<string, "Básico" | "Intermedio" | "Reto"> = { Básica: "Básico", Media: "Intermedio", Avanzada: "Reto" };
const topicByNumber = new Map<number, { slug: string; title: string; level: "Inicio" | "Intermedio" | "Reto" }>(topicRows.map(([number, slug, title, level]) => [number, { slug, title, level }]));

async function main() {
  const url = process.env.DATABASE_URL ?? process.env.DRIZZLE_DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL o DRIZZLE_DATABASE_URL es requerido para cargar el banco semilla.");
  const file = new URL("../shared/data/ejercicios_algebrario_seed.json", import.meta.url);
  const rows = JSON.parse(await readFile(file, "utf8")) as SeedRow[];
  if (rows.length !== 150) throw new Error(`El banco semilla debe tener 150 filas; se encontraron ${rows.length}.`);
  const counts = new Map<number, number>();
  for (const row of rows) {
    counts.set(row.tema_id, (counts.get(row.tema_id) ?? 0) + 1);
    if (row.opciones.length !== 4 || row.pistas_socraticas.length !== 3) throw new Error(`Fila ${row.id} no tiene 4 opciones y 3 pistas.`);
    if (!row.opciones.some(option => option.correcta)) throw new Error(`Fila ${row.id} no tiene respuesta correcta.`);
  }
  if (topicRows.some(([number]) => counts.get(number) !== 10)) throw new Error("Cada tema debe tener exactamente 10 ejercicios.");

  const db = drizzle(url);
  await db.insert(topics).values(topicRows.map(([number, slug, title, level]) => ({
    id: slug,
    number,
    title,
    level,
    description: `Banco semilla del módulo ${number}: ${title}.`,
    content: { source: "ejercicios_algebrario_seed.json", seedVersion: 1, exerciseCount: 10 },
  }))).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  const existing = await db.select({ id: exercises.id }).from(exercises);
  const existingIds = new Set(existing.map(row => row.id));
  const pending = rows.filter(row => !existingIds.has(row.id)).map(row => {
    const topic = topicByNumber.get(row.tema_id);
    if (!topic) throw new Error(`Tema desconocido: ${row.tema_id}`);
    const answer = row.opciones.find(option => option.correcta);
    return {
      id: row.id,
      topicId: topic.slug,
      difficulty: difficultyMap[row.dificultad] ?? "Básico",
      prompt: row.enunciado,
      type: "choice" as const,
      options: row.opciones.map(option => ({ text: option.texto, correct: option.correcta, feedback: option.retroalimentacion })),
      answer: answer?.texto ?? "",
      socraticHints: row.pistas_socraticas.map(hint => ({ level: hint.nivel, focus: hint.enfoque, question: hint.pregunta })),
      explanation: answer?.retroalimentacion ?? "Revisa la propiedad aplicada.",
    };
  });
  for (let index = 0; index < pending.length; index += 50) {
    const batch = pending.slice(index, index + 50);
    if (batch.length) await db.insert(exercises).values(batch);
  }
  await db.$client.end();
  console.log(JSON.stringify({ ok: true, topics: topicRows.length, seedRows: rows.length, inserted: pending.length, skipped: rows.length - pending.length }));
}

main().catch(error => { console.error(error); process.exitCode = 1; });
