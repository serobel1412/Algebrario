export type Difficulty = "Básico" | "Intermedio" | "Reto";

export interface Exercise {
  id: string;
  difficulty: Difficulty;
  prompt: string;
  type: "choice" | "text";
  options?: string[];
  answer: string;
  hint: string;
  explanation: string;
}

export interface Topic {
  id: string;
  number: number;
  slug: string;
  title: string;
  label: string;
  description: string;
  goal: string;
  level: string;
  duration: string;
  lessons: number;
  accent: string;
  icon: string;
  formulaLabel: string;
  formula: string;
  explanation: string;
  example: { question: string; steps: string[]; result: string };
  error: string;
  exercise: Exercise;
}

const make = (
  number: number,
  slug: string,
  title: string,
  label: string,
  description: string,
  goal: string,
  level: string,
  duration: string,
  accent: string,
  icon: string,
  formulaLabel: string,
  formula: string,
  explanation: string,
  question: string,
  steps: string[],
  result: string,
  error: string,
  exercise: Exercise,
  lessons = 4,
): Topic => ({ id: slug, number, slug, title, label, description, goal, level, duration, lessons, accent, icon, formulaLabel, formula, explanation, example: { question, steps, result }, error, exercise });

export const topics: Topic[] = [
  make(1, "lenguaje-algebraico", "Lenguaje algebraico", "Expresiones", "Traduce situaciones a símbolos, reconoce términos y simplifica expresiones con sentido.", "Pasar de palabras a expresiones que puedas operar.", "Inicio", "18 min", "coral", "braces", "Término algebraico", "coeficiente × parte literal", "Una expresión combina números, letras y operaciones. El coeficiente acompaña a la variable; la parte literal indica las letras y sus exponentes.", "Traduce: el triple de un número disminuido en 5.", ["Llama x al número desconocido.", "El triple de x es 3x.", "Disminuido en 5 significa restar 5."], "3x − 5", "Confundir ‘disminuido en 5’ con dividir entre 5.", { id: "exp-1", difficulty: "Básico", prompt: "¿Qué expresión representa ‘la mitad de un número más 7’?", type: "choice", options: ["2x + 7", "x/2 + 7", "x + 14", "7x/2"], answer: "x/2 + 7", hint: "La mitad se escribe como dividir entre 2.", explanation: "Si el número es x, su mitad es x/2 y luego se suman 7." }),
  make(2, "potencias", "Potencias y exponentes", "Potencias", "Usa las propiedades de los exponentes para transformar productos y cocientes.", "Simplificar potencias sin perder las reglas de los exponentes.", "Inicio", "20 min", "ochre", "power", "Producto de potencias", "aᵐ · aⁿ = aᵐ⁺ⁿ", "Con la misma base, al multiplicar se suman exponentes; al dividir se restan.", "Simplifica x³ · x⁵ / x².", ["Suma al multiplicar: 3 + 5 = 8.", "Resta al dividir: 8 − 2 = 6.", "Conserva la base x."], "x⁶", "Sumar las bases en vez de los exponentes.", { id: "pot-1", difficulty: "Básico", prompt: "Simplifica: a⁴ · a³.", type: "choice", options: ["a⁷", "a¹²", "2a⁷", "a"], answer: "a⁷", hint: "Con la misma base, suma los exponentes.", explanation: "a⁴ · a³ = a⁴⁺³ = a⁷." }),
  make(3, "radicales", "Radicales", "Raíces", "Interpreta raíces, extrae factores y conecta radicales con potencias fraccionarias.", "Simplificar radicales y operar con ellos con criterio.", "Inicio", "22 min", "sage", "radical", "Producto de radicales", "√a · √b = √(ab)", "Una raíz cuadrada pregunta qué número multiplicado por sí mismo produce el radicando.", "Simplifica √72.", ["Separa 72 como 36 · 2.", "Extrae √36 = 6.", "Conserva el factor sin pareja."], "6√2", "Separar una suma dentro de una raíz: √(a + b) no es √a + √b.", { id: "rad-1", difficulty: "Intermedio", prompt: "¿Cuál es la forma simplificada de √50?", type: "choice", options: ["5√2", "2√5", "25√2", "10√5"], answer: "5√2", hint: "50 = 25 · 2.", explanation: "√50 = √(25 · 2) = 5√2." }),
  make(4, "polinomios", "Polinomios", "Operaciones", "Suma, resta y multiplica polinomios identificando términos semejantes.", "Organizar términos y operar con precisión.", "Inicio", "24 min", "sky", "polynomial", "Distributiva", "a(b + c) = ab + ac", "Los términos semejantes tienen la misma parte literal y los mismos exponentes.", "Reduce 3x² + 2x − 5 + x² − 7x + 1.", ["Agrupa x²: 3x² + x² = 4x².", "Agrupa x: 2x − 7x = −5x.", "Agrupa constantes: −5 + 1 = −4."], "4x² − 5x − 4", "Combinar 3x² con 2x: el exponente forma parte del término.", { id: "pol-1", difficulty: "Básico", prompt: "Reduce: 4x + 3 + 2x − 8.", type: "text", answer: "6x-5", hint: "Combina primero las x y luego las constantes.", explanation: "4x + 2x = 6x y 3 − 8 = −5." }),
  make(5, "productos-notables", "Productos notables", "Atajos", "Reconoce patrones de multiplicación que aparecen una y otra vez en álgebra.", "Expandir binomios usando patrones.", "Intermedio", "21 min", "violet", "spark", "Cuadrado de una suma", "(a + b)² = a² + 2ab + b²", "El cuadrado de un binomio tiene cuadrado del primero, doble producto y cuadrado del segundo.", "Desarrolla (x + 4)².", ["Cuadrado del primero: x².", "Doble producto: 2 · x · 4 = 8x.", "Cuadrado del segundo: 4² = 16."], "x² + 8x + 16", "Olvidar el término del medio: (a + b)² no es a² + b².", { id: "prod-1", difficulty: "Intermedio", prompt: "Desarrolla (x − 3)².", type: "choice", options: ["x² − 9", "x² − 6x + 9", "x² + 6x + 9", "x² − 3x + 9"], answer: "x² − 6x + 9", hint: "El doble producto conserva el signo.", explanation: "(x − 3)² = x² − 6x + 9." }),
  make(6, "factorizacion", "Factorización", "Desarmar", "Encuentra factores comunes y patrones para escribir polinomios como productos.", "Ver la estructura escondida dentro de una expresión.", "Intermedio", "26 min", "coral", "factor", "Diferencia de cuadrados", "a² − b² = (a − b)(a + b)", "Factorizar es hacer el camino inverso de multiplicar. Empieza buscando factor común.", "Factoriza x² − 25.", ["Reconoce x² − 5².", "Aplica la diferencia de cuadrados.", "Reemplaza a por x y b por 5."], "(x − 5)(x + 5)", "Sacar factor común solo a un término.", { id: "fac-1", difficulty: "Intermedio", prompt: "Factoriza 3x + 12.", type: "choice", options: ["3(x + 4)", "3(x + 12)", "x(3 + 12)", "12(x + 3)"], answer: "3(x + 4)", hint: "El factor común de 3x y 12 es 3.", explanation: "Divide cada término entre 3: 3x + 12 = 3(x + 4)." }),
  make(7, "fracciones-algebraicas", "Fracciones algebraicas", "Fracciones", "Simplifica, multiplica y suma fracciones con variables cuidando las restricciones.", "Operar fracciones algebraicas como un sistema.", "Intermedio", "25 min", "ochre", "fraction", "Restricción", "x − 3 ≠ 0  ⇒  x ≠ 3", "El denominador nunca puede ser cero. Factoriza antes de simplificar.", "Simplifica (x² − 9)/(x + 3).", ["Factoriza: x² − 9 = (x − 3)(x + 3).", "Cancela el factor x + 3.", "Anota la restricción x ≠ −3."], "x − 3, con x ≠ −3", "Cancelar términos que se están sumando; solo se cancelan factores.", { id: "frac-1", difficulty: "Intermedio", prompt: "¿Qué valor no puede tomar x en 5/(x − 2)?", type: "choice", options: ["x = 0", "x = 2", "x = 5", "x = −2"], answer: "x = 2", hint: "Haz que el denominador sea cero.", explanation: "x − 2 = 0 cuando x = 2; ese valor está excluido." }),
  make(8, "ecuaciones-lineales", "Ecuaciones lineales", "Ecuaciones", "Aísla la incógnita paso a paso y comprueba tus soluciones.", "Resolver igualdades de primer grado con una estrategia ordenada.", "Intermedio", "23 min", "sage", "equal", "Equilibrio", "ax + b = c  ⇒  x = (c − b)/a", "Una ecuación es una balanza: cualquier operación hecha a un lado debe hacerse al otro.", "Resuelve 3x + 4 = 19.", ["Resta 4 a ambos lados: 3x = 15.", "Divide entre 3: x = 5.", "Comprueba: 3·5 + 4 = 19."], "x = 5", "Cambiar de lado sin entender la operación inversa.", { id: "eq-1", difficulty: "Básico", prompt: "Resuelve: 2x + 6 = 14.", type: "text", answer: "4", hint: "Resta 6 y luego divide entre 2.", explanation: "2x = 8 y, al dividir entre 2, x = 4." }),
  make(9, "desigualdades", "Desigualdades", "Intervalos", "Resuelve inecuaciones y representa sus soluciones en la recta numérica.", "Leer y comunicar conjuntos de soluciones.", "Intermedio", "20 min", "sky", "interval", "Regla de inversión", "−2x > 6  ⇒  x < −3", "Al multiplicar o dividir por un número negativo, el signo se invierte.", "Resuelve 2x − 1 ≤ 7.", ["Suma 1: 2x ≤ 8.", "Divide entre 2: x ≤ 4.", "Punto cerrado en 4 y sombreado hacia la izquierda."], "x ≤ 4", "No invertir el signo al dividir por un número negativo.", { id: "ineq-1", difficulty: "Intermedio", prompt: "Resuelve: −3x ≥ 12.", type: "choice", options: ["x ≥ 4", "x ≤ −4", "x ≥ −4", "x ≤ 4"], answer: "x ≤ −4", hint: "Divide entre −3 e invierte el signo.", explanation: "Al dividir −3x ≥ 12 entre −3, queda x ≤ −4." }),
  make(10, "sistemas", "Sistemas de ecuaciones", "Dos incógnitas", "Compara sustitución, igualación y reducción para encontrar puntos comunes.", "Resolver dos condiciones al mismo tiempo.", "Intermedio", "28 min", "violet", "system", "Solución común", "(x, y) satisface ambas ecuaciones", "La solución de un sistema es el punto donde las dos rectas se encuentran.", "Resuelve x + y = 9 y x − y = 1.", ["Suma para eliminar y: 2x = 10.", "Despeja x = 5.", "Sustituye: 5 + y = 9, entonces y = 4."], "(5, 4)", "Encontrar un valor que solo funciona en una ecuación.", { id: "sys-1", difficulty: "Reto", prompt: "En x + y = 10 y x − y = 2, ¿cuál es x?", type: "choice", options: ["4", "5", "6", "8"], answer: "6", hint: "Suma las dos ecuaciones.", explanation: "2x = 12, por tanto x = 6." }),
  make(11, "funciones-lineales", "Funciones lineales", "Rectas", "Interpreta pendiente, intercepto y tablas para modelar relaciones de cambio constante.", "Leer una recta como una historia de cambio.", "Intermedio", "25 min", "coral", "line", "Forma pendiente-intercepto", "y = mx + b", "m indica cuánto cambia y cuando x aumenta una unidad; b es el valor inicial.", "Interpreta y = 2x + 3.", ["La pendiente es m = 2.", "El intercepto es b = 3.", "Para x = 4, y = 11."], "Cambio constante: 2; inicio: 3", "Confundir pendiente con intercepto.", { id: "lin-1", difficulty: "Básico", prompt: "En y = −3x + 2, ¿cuál es la pendiente?", type: "choice", options: ["2", "−3", "3", "−2"], answer: "−3", hint: "Busca el número que multiplica a x.", explanation: "En y = mx + b, m es el coeficiente de x: −3." }),
  make(12, "funciones-cuadraticas", "Funciones cuadráticas", "Parábolas", "Analiza vértice, raíces y apertura para comprender una parábola.", "Relacionar la fórmula con la forma de la gráfica.", "Reto", "30 min", "ochre", "parabola", "Forma general", "f(x) = ax² + bx + c", "Si a es positivo abre hacia arriba; si es negativo, hacia abajo.", "Analiza f(x) = x² − 4.", ["Abre hacia arriba porque a = 1.", "Las raíces cumplen x² − 4 = 0.", "Factoriza: (x − 2)(x + 2)."], "Raíces: x = ±2; abre hacia arriba", "Creer que c es el vértice: c es el corte con el eje y.", { id: "quad-1", difficulty: "Intermedio", prompt: "¿Hacia dónde abre f(x) = −2x² + 1?", type: "choice", options: ["Arriba", "Abajo", "A la derecha", "No es parábola"], answer: "Abajo", hint: "Mira el signo de a.", explanation: "Como a = −2 es negativo, abre hacia abajo." }),
  make(13, "sucesiones", "Sucesiones y progresiones", "Patrones", "Encuentra reglas para secuencias aritméticas y geométricas y predice nuevos términos.", "Describir un patrón con una fórmula general.", "Reto", "24 min", "sage", "sequence", "Sucesión aritmética", "aₙ = a₁ + (n − 1)d", "En una progresión aritmética se suma siempre la misma diferencia d.", "Encuentra a₁₀ para 5, 8, 11, …", ["Identifica a₁ = 5 y d = 3.", "Usa aₙ = 5 + (n − 1)3.", "Para n = 10: 5 + 27 = 32."], "a₁₀ = 32", "Usar la posición n como si fuera la diferencia.", { id: "seq-1", difficulty: "Intermedio", prompt: "En 4, 9, 14, … ¿cuál es la diferencia común?", type: "choice", options: ["4", "5", "9", "14"], answer: "5", hint: "Resta dos términos consecutivos.", explanation: "9 − 4 = 5 y 14 − 9 = 5." }),
  make(14, "logaritmos", "Logaritmos", "Inversas", "Conecta logaritmos y exponentes para resolver ecuaciones y comparar escalas.", "Leer un logaritmo como una pregunta sobre exponentes.", "Reto", "27 min", "sky", "log", "Definición", "log_b(a) = c  ⇔  bᶜ = a", "El logaritmo responde a qué exponente elevar la base para obtener el número.", "Calcula log₂(32).", ["Pregunta qué potencia de 2 produce 32.", "2⁵ = 32.", "El exponente buscado es 5."], "log₂(32) = 5", "Confundir la base con el resultado.", { id: "log-1", difficulty: "Básico", prompt: "¿Cuánto vale log₃(27)?", type: "choice", options: ["2", "3", "9", "27"], answer: "3", hint: "3 elevado a qué número da 27?", explanation: "3³ = 27, así que log₃(27) = 3." }),
  make(15, "problemas-aplicados", "Problemas aplicados", "Modelación", "Convierte situaciones reales en variables, ecuaciones y decisiones justificadas.", "Elegir un modelo, resolverlo y volver a interpretar el resultado.", "Reto", "32 min", "violet", "target", "Ruta de modelación", "situación → variables → modelo → solución → interpretación", "Resolver no termina al encontrar x: hay que comprobar unidades y sentido.", "Un plan cobra $12.000 de base y $3.000 por clase. ¿Cuánto cuestan 5 clases?", ["Define n como número de clases.", "Modelo: C(n) = 12000 + 3000n.", "Evalúa n = 5: 12000 + 15000 = 27000."], "$27.000", "Resolver pero no responder con unidades ni verificar el contexto.", { id: "app-1", difficulty: "Reto", prompt: "Un taxi cobra 5.000 de inicio y 2.000 por km. ¿Cuánto cuesta 4 km?", type: "choice", options: ["7.000", "8.000", "13.000", "20.000"], answer: "13.000", hint: "Suma la tarifa fija y 4 veces el costo por km.", explanation: "C(4) = 5000 + 2000·4 = 13000." }),
];

export const topicBySlug = (slug: string) => topics.find((topic) => topic.slug === slug);
