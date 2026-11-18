export type GeneratorDifficulty = "Básico" | "Intermedio" | "Reto";

export type GeneratorOption = {
  text: string;
  correct?: boolean;
  feedback?: string;
};

export type GeneratedExercise = {
  id: string;
  difficulty: GeneratorDifficulty;
  prompt: string;
  type: "choice" | "text";
  options?: GeneratorOption[];
  answer: string;
  hint: string;
  explanation: string;
  socraticHints: { level: number; focus: string; question: string }[];
  skill: string;
  infinite: true;
};

const hintSet = (focus: string, structure: string, verify: string) => [
  { level: 1, focus: "Lectura Estructural", question: focus },
  { level: 2, focus: "Propiedad Uniforme / Factorización", question: structure },
  { level: 3, focus: "Verificación", question: verify },
];

const option = (text: string, correct: boolean, feedback: string): GeneratorOption => ({ text, correct, feedback });
const pick = (seed: number, min: number, max: number) => min + (Math.abs(seed * 9301 + 49297) % 233280) / 233280 * (max - min + 1) | 0;
const nonZero = (seed: number, min: number, max: number) => { let value = pick(seed, min, max); return value === 0 ? 1 : value; };
const signed = (value: number) => value < 0 ? `(${value})` : String(value);
const power = (base: string, exponent: number) => exponent === 0 ? "1" : exponent === 1 ? base : `${base}^{${exponent}}`;

function exponentExercise(round: number, difficulty: GeneratorDifficulty): GeneratedExercise {
  const a = pick(round + 1, -5, 5);
  const b = pick(round + 2, -5, 5);
  const c = pick(round + 3, -5, 5);
  const d = pick(round + 4, -5, 5);
  const x = a - c;
  const y = b - d;
  const answer = `${power("x", x)}${y === 0 ? "" : ` ${y >= 0 ? "" : "· "}${power("y", y)}`}`.trim();
  const correct = answer.replace(/\s/g, "");
  const distractorA = `${power("x", a + c)} ${power("y", b + d)}`;
  const distractorB = `${power("x", c - a)} ${power("y", d - b)}`;
  const distractorC = `${power("x", x + 1)} ${power("y", y - 1)}`;
  return {
    id: `infinite-2-${round}`,
    difficulty,
    prompt: `Simplifica: \\(${`\\frac{${power("x", a)} ${power("y", b)}}{${power("x", c)} ${power("y", d)}}`}\\)`,
    type: "choice",
    options: [
      option(answer, true, "Correcto: al dividir potencias de la misma base se restan los exponentes del denominador."),
      option(distractorA, false, "Aquí sumaste exponentes como si fuera un producto, pero el signo de la división exige restar."),
      option(distractorB, false, "Invertiste el orden de la resta; conserva numerador menos denominador."),
      option(distractorC, false, "Revisa cada exponente por separado y no agregues una unidad sin justificarla."),
    ],
    answer: correct,
    hint: "Separa el cociente en una potencia de x y otra de y antes de operar.",
    explanation: `x^{${a}}/x^{${c}} = x^{${x}} y y^{${b}}/y^{${d}} = y^{${y}}.`,
    socraticHints: hintSet("¿Qué bases iguales aparecen arriba y abajo?", "Aplica a^m/a^n = a^{m-n} a x y a y por separado.", "Sustituye x=2 y y=3 en la expresión original y en tu resultado; ¿coinciden?"),
    skill: "Cociente de potencias",
    infinite: true,
  };
}

function factorizationExercise(round: number, difficulty: GeneratorDifficulty): GeneratedExercise {
  const p = nonZero(round + 5, -5, 5);
  const q = nonZero(round + 7, -5, 5);
  const sum = p + q;
  const product = p * q;
  const signedP = signed(p);
  const signedQ = signed(q);
  const answer = `(x ${p < 0 ? "−" : "+"} ${Math.abs(p)})(x ${q < 0 ? "−" : "+"} ${Math.abs(q)})`;
  return {
    id: `infinite-6-${round}`,
    difficulty,
    prompt: `Factoriza: \\(x^2 ${sum < 0 ? "−" : "+"} ${Math.abs(sum)}x ${product < 0 ? "−" : "+"} ${Math.abs(product)}\\).`,
    type: "choice",
    options: [
      option(answer, true, "Correcto: los factores tienen suma p + q y producto pq."),
      option(`(x ${p < 0 ? "+" : "−"} ${Math.abs(p)})(x ${q < 0 ? "+" : "−"} ${Math.abs(q)})`, false, "Cambia los signos y verifica si todavía obtienes el término independiente pq."),
      option(`(x + ${Math.abs(sum)})(x + ${Math.abs(product)})`, false, "Usa p y q como raíces/factores, no la suma y el producto como binomios."),
      option(`x(x ${sum < 0 ? "−" : "+"} ${Math.abs(sum)}) ${product < 0 ? "−" : "+"} ${Math.abs(product)}`, false, "Eso no es un producto de dos binomios y no reproduce el término constante."),
    ],
    answer,
    hint: "Busca dos enteros cuya suma sea el coeficiente de x y cuyo producto sea el término independiente.",
    explanation: `p = ${signedP} y q = ${signedQ}; por eso el trinomio es (x ${p < 0 ? "−" : "+"} ${Math.abs(p)})(x ${q < 0 ? "−" : "+"} ${Math.abs(q)}).`,
    socraticHints: hintSet("¿Qué dos números podrían sumar ${sum} y multiplicar ${product}?", "Usa el patrón x² + (p+q)x + pq = (x+p)(x+q).", "Multiplica tus binomios y comprueba el coeficiente de x y el término independiente."),
    skill: "Trinomio cuadrático",
    infinite: true,
  };
}

function equationExercise(round: number, difficulty: GeneratorDifficulty): GeneratedExercise {
  const a = nonZero(round + 9, 1, 5);
  const b = pick(round + 10, -5, 5);
  const c = pick(round + 11, -8, 8);
  const solution = pick(round + 12, -5, 5);
  const d = a * (solution + b) + c;
  const answer = String(solution);
  const formatted = `${a}(x ${b < 0 ? "−" : "+"} ${Math.abs(b)}) ${c < 0 ? "−" : "+"} ${Math.abs(c)} = ${d}`;
  return {
    id: `infinite-8-${round}`,
    difficulty,
    prompt: `Resuelve usando la misma operación a ambos lados: \\(${formatted}\\).`,
    type: "choice",
    options: [
      option(answer, true, "Correcto: aislaste el paréntesis y luego aplicaste la operación inversa al coeficiente."),
      option(String(solution + b), false, "Te detuviste antes de deshacer el desplazamiento b."),
      option(String(d - c), false, "Ese valor todavía pertenece al lado derecho antes de dividir por a."),
      option(String(-solution), false, "Revisa los signos al restar b y al conservar la igualdad."),
    ],
    answer,
    hint: "Resta c a ambos lados, divide entre a, y después resta b a ambos lados.",
    explanation: `Al despejar: a(x+b) = ${d - c}; x+b = ${(d - c) / a}; x = ${answer}.`,
    socraticHints: hintSet("¿Qué operación está más afuera de x: +c, multiplicar por a o +b?", "Aplica la misma resta/división a ambos lados en el orden inverso de las operaciones.", `Sustituye x=${answer}: ¿el lado izquierdo vuelve a ser ${d}?`),
    skill: "Despeje formal",
    infinite: true,
  };
}

function quadraticExercise(round: number, difficulty: GeneratorDifficulty): GeneratedExercise {
  const a = round % 3 === 0 ? -1 : 1;
  const h = pick(round + 13, -3, 3);
  const radius = pick(round + 14, 1, 3);
  const k = -radius * radius;
  const vertex = `(${h}, ${k})`;
  const left = h - radius;
  const right = h + radius;
  const askVertex = round % 2 === 0;
  const answer = askVertex ? vertex : `x = ${left} y x = ${right}`;
  const form = `${a === -1 ? "−" : ""}(x ${h < 0 ? "−" : "+"} ${Math.abs(h)})^2 ${k < 0 ? "−" : "+"} ${Math.abs(k)}`;
  return {
    id: `infinite-12-${round}`,
    difficulty,
    prompt: askVertex ? `En f(x) = ${form}, ¿cuál es el vértice?` : `En f(x) = ${form}, ¿cuáles son los interceptos con el eje x?`,
    type: "choice",
    options: [
      option(answer, true, askVertex ? "Correcto: la forma de vértice muestra directamente (h,k)." : "Correcto: iguala f(x) a cero y reconoce las dos raíces."),
      option(askVertex ? `(${left}, ${k})` : `x = ${h}`, false, "No confundas el eje de simetría con el vértice o las raíces."),
      option(askVertex ? `(${h}, ${radius})` : `x = ${-left} y x = ${-right}`, false, "Revisa el signo del término independiente y la ecuación que estás resolviendo."),
      option(askVertex ? `(${k}, ${h})` : `x = ${h - 1} y x = ${h + 1}`, false, "En la forma a(x−h)²+k, h es la coordenada x y k la coordenada y."),
    ],
    answer,
    hint: askVertex ? "Lee h y k directamente de la forma de vértice." : "Iguala a cero y despeja el cuadrado; las raíces quedan a distancia ${radius} de h.",
    explanation: askVertex ? `La forma a(x−h)²+k tiene vértice (${h}, ${k}).` : `Las raíces cumplen (x−${h})² = ${radius * radius}, por eso x = ${left} y x = ${right}.`,
    socraticHints: hintSet("¿La pregunta pide el punto mínimo/máximo o los valores donde la parábola cruza el eje x?", "Usa la lectura directa de (h,k) o factoriza/extrae raíz después de igualar f(x) a cero.", "Reemplaza tu respuesta en f(x) y verifica si da 0 cuando buscas interceptos."),
    skill: askVertex ? "Vértice en forma canónica" : "Interceptos cuadráticos",
    infinite: true,
  };
}

function logarithmExercise(round: number, difficulty: GeneratorDifficulty): GeneratedExercise {
  const b = pick(round + 15, 2, 5);
  const c = pick(round + 16, 1, 4);
  const shift = pick(round + 17, -3, 3);
  const solution = b ** c - shift;
  const answer = String(solution);
  return {
    id: `infinite-14-${round}`,
    difficulty,
    prompt: `Resuelve: \\(\\log_{${b}}(x ${shift < 0 ? "−" : "+"} ${Math.abs(shift)}) = ${c}\\).`,
    type: "choice",
    options: [
      option(answer, true, "Correcto: convertiste a forma exponencial y luego aplicaste la operación inversa al desplazamiento."),
      option(String(b ** c), false, "Ese es el valor de x más el desplazamiento, no x aislada."),
      option(String(c - shift), false, "El exponente c se usa como potencia de la base; no se resta directamente."),
      option(String(b * c - shift), false, "Una ecuación logarítmica se convierte en una potencia, no en un producto b·c."),
    ],
    answer,
    hint: `Convierte a forma exponencial: x ${shift < 0 ? "−" : "+"} ${Math.abs(shift)} = ${b}^${c}.`,
    explanation: `x ${shift < 0 ? "−" : "+"} ${Math.abs(shift)} = ${b ** c}; al aplicar la operación inversa, x = ${answer}.`,
    socraticHints: hintSet("¿Qué base y exponente aparecen al convertir el logaritmo?", "Usa log_b(A)=c ⇔ b^c=A y luego aplica la misma suma/resta a ambos lados.", `Comprueba que log_${b}(${answer} ${shift < 0 ? "−" : "+"} ${Math.abs(shift)}) = ${c}.`),
    skill: "Ecuación logarítmica",
    infinite: true,
  };
}

export function generateInfiniteExercise(topicId: string | number, round = 0, difficulty: GeneratorDifficulty = "Reto"): GeneratedExercise {
  const topic = String(topicId);
  if (topic === "2" || topic === "potencias") return exponentExercise(round, difficulty);
  if (topic === "6" || topic === "factorizacion") return factorizationExercise(round, difficulty);
  if (topic === "8" || topic === "ecuaciones-lineales") return equationExercise(round, difficulty);
  if (topic === "12" || topic === "funciones-cuadraticas") return quadraticExercise(round, difficulty);
  if (topic === "14" || topic === "logaritmos") return logarithmExercise(round, difficulty);
  return equationExercise(round + Number(topic) * 17, difficulty);
}
