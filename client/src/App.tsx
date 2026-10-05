import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Compass,
  FunctionSquare,
  Lightbulb,
  Menu,
  Play,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Link, Route, Router as WouterRouter, Switch, useLocation, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { topicBySlug, topics, type Difficulty, type Exercise, type Topic } from "./data/topics";
import { evaluateExpression, solveLinearEquation } from "./lib/algebra";
import { useStudyProgress } from "./hooks/useStudyProgress";

const accentMap: Record<string, string> = {
  coral: "topic-coral", ochre: "topic-ochre", sage: "topic-sage", sky: "topic-sky", violet: "topic-violet",
};

function BrandMark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? "brand-mark-small" : ""}`} aria-hidden="true"><span>A</span><i /></span>;
}

function Header({ completion }: { completion: number }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, []);
  const items = [
    ["Inicio", "/"], ["Temas", "/#temas"], ["Práctica", "/practica"], ["Calculadora", "/calculadora"],
  ];
  return <header className="site-header">
    <div className="container header-inner">
      <Link href="/" className="brand" aria-label="Algebrario, ir al inicio"><BrandMark /><span>algebrario</span></Link>
      <nav id="main-navigation" className={`main-nav ${open ? "nav-open" : ""}`} aria-label="Navegación principal">
        {items.map(([label, href]) => <Link key={href} href={href} className={(href === "/" && location === "/" && hash !== "#temas") || (href === "/#temas" && (location.startsWith("/tema/") || hash === "#temas")) || (href !== "/" && href !== "/#temas" && location === href) ? "nav-link active" : "nav-link"} onClick={() => setOpen(false)}>{label}</Link>)}
      </nav>
      <div className="header-actions">
        <div className="header-progress" title={`${completion}% de la ruta completada`}><span className="progress-dot" /><span>{completion}%</span></div>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Cerrar menú" : "Abrir menú"} aria-expanded={open} aria-controls="main-navigation">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
    </div>
  </header>;
}

function Layout({ children, completion }: { children: ReactNode; completion: number }) {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [location]);
  useEffect(() => {
    const slug = location.startsWith("/tema/") ? location.split("/")[2] : "";
    const currentTopic = slug ? topicBySlug(slug) : undefined;
    const metadata = currentTopic
      ? { title: `${currentTopic.title} — Algebrario`, description: `${currentTopic.description} Estudia con ejemplos y practica paso a paso.` }
      : location === "/practica"
        ? { title: "Práctica de álgebra — Algebrario", description: "Entrena álgebra de décimo con preguntas, pistas y retroalimentación útil." }
        : location === "/calculadora"
          ? { title: "Calculadora algebraica — Algebrario", description: "Comprueba expresiones y resuelve ecuaciones lineales con una herramienta educativa." }
          : { title: "Algebrario — Álgebra de décimo", description: "Explicaciones claras, ejemplos y práctica de álgebra para grado décimo." };
    document.title = metadata.title;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", metadata.description);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", metadata.title);
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", metadata.description);
  }, [location]);
  return <div className="app-shell"><a className="skip-link" href="#main-content">Saltar al contenido</a><Header completion={completion} /><div id="main-content">{children}</div><footer className="site-footer"><div className="container footer-inner"><div className="brand footer-brand"><BrandMark small /><span>algebrario</span></div><p>Aprender álgebra es encontrar el patrón.</p><span className="footer-note">Grado décimo · Hecho para estudiar mejor</span></div></footer></div>;
}

function IconFor({ name, size = 22 }: { name: string; size?: number }) {
  const props = { size, strokeWidth: 1.8 };
  const icons: Record<string, typeof BookOpen> = { braces: FunctionSquare, power: Zap, radical: Sparkles, polynomial: BookOpen, spark: Sparkles, factor: Target, fraction: CircleHelp, equal: CheckCircle2, interval: Compass, system: FunctionSquare, line: ArrowUpRight, parabola: FunctionSquare, sequence: ArrowRight, log: Lightbulb, target: Target };
  const Icon = icons[name] ?? BookOpen;
  return <Icon {...props} />;
}

function ProgressBar({ value, label = "Progreso" }: { value: number; label?: string }) {
  return <div className="progress-wrap"><div className="progress-label"><span>{label}</span><strong>{value}%</strong></div><div className="progress-track" role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><div className="progress-fill" style={{ width: `${value}%` }} /></div></div>;
}

function TopicCard({ topic, completed }: { topic: Topic; completed: boolean }) {
  return <Link href={`/tema/${topic.slug}`} className={`topic-card ${accentMap[topic.accent] ?? ""} ${completed ? "completed" : ""}`}>
    <div className="topic-card-top"><span className="topic-number">{String(topic.number).padStart(2, "0")}</span><span className="topic-icon"><IconFor name={topic.icon} size={20} /></span></div>
    <div className="topic-card-body"><span className="eyebrow">{topic.label}</span><h3>{topic.title}</h3><p>{topic.description}</p></div>
    <div className="topic-card-bottom"><span><Clock3 size={14} /> {topic.duration}</span><span className="card-arrow"><ArrowUpRight size={18} /></span></div>
    {completed && <span className="completed-stamp"><Check size={13} /> Listo</span>}
  </Link>;
}

function HomePage({ completion, completed }: { completion: number; completed: string[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("Todos");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const filtered = useMemo(() => topics.filter((topic) => {
    const matchesQuery = `${topic.title} ${topic.label} ${topic.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesLevel = level === "Todos" || topic.level === level;
    const matchesStatus = !showOnlyOpen || !completed.includes(topic.slug);
    return matchesQuery && matchesLevel && matchesStatus;
  }), [query, level, showOnlyOpen, completed]);
  const next = topics.find((topic) => !completed.includes(topic.slug)) ?? topics[0];
  return <main>
    <section className="hero-section"><div className="container hero-grid"><div className="hero-copy"><span className="eyebrow eyebrow-coral"><span className="eyebrow-line" /> Ruta de álgebra · décimo</span><h1>Entender antes de <em>memorizar.</em></h1><p className="hero-lede">Una guía clara para recorrer el álgebra de décimo, con explicaciones que conectan, ejemplos que aterrizan y práctica que te devuelve feedback útil.</p><div className="hero-actions"><Link href={`/tema/${next.slug}`} className="button button-primary">{completion ? "Continuar la ruta" : "Empezar la ruta"}<ArrowRight size={17} /></Link><a href="#temas" className="text-link">Ver todos los temas <ChevronRight size={16} /></a></div><div className="hero-meta"><span><CheckCircle2 size={15} /> 15 módulos claros</span><span><Clock3 size={15} /> A tu propio ritmo</span></div></div><div className="hero-visual" aria-label="Ilustración abstracta de coordenadas y una parábola" role="img"><div className="graph-paper"><span className="axis axis-x" /><span className="axis axis-y" /><span className="curve curve-one" /><span className="curve curve-two" /><span className="graph-dot dot-one" /><span className="graph-dot dot-two" /><span className="graph-label label-x">x</span><span className="graph-label label-y">y</span></div><div className="formula-note note-one">y = mx + b</div><div className="formula-note note-two">a² + b² = c²</div><div className="hero-sticker"><Sparkles size={15} /><span>paso a paso</span></div></div></div></section>
    <section className="container quick-section"><div className="section-kicker"><span>Tu recorrido</span><span className="kicker-line" /></div><div className="dashboard-grid"><div className="progress-card"><div className="card-heading"><div><span className="eyebrow">Resumen de estudio</span><h2>Vas construyendo<br /><em>la idea completa.</em></h2></div><div className="completion-ring" style={{ "--progress": `${completion * 3.6}deg` } as React.CSSProperties}><strong>{completion}<small>%</small></strong><span>completo</span></div></div><ProgressBar value={completion} label="Ruta de aprendizaje" /><div className="stats-row"><div><strong>{completed.length}</strong><span>temas listos</span></div><div><strong>{Math.max(0, 15 - completed.length)}</strong><span>por descubrir</span></div><div><strong>∞</strong><span>intentos</span></div></div></div><div className="continue-card"><div className="continue-top"><span className="eyebrow">Siguiente paso</span><span className="topic-index">{String(next.number).padStart(2, "0")} / 15</span></div><div className="continue-icon"><IconFor name={next.icon} /></div><h3>{next.title}</h3><p>{next.goal}</p><Link href={`/tema/${next.slug}`} className="button button-dark">Abrir tema <ArrowRight size={16} /></Link></div></div></section>
    <section id="temas" className="container topics-section"><div className="section-header"><div><div className="section-kicker"><span>El mapa completo</span><span className="kicker-line" /></div><h2>15 temas para pensar<br /><em>con más claridad.</em></h2></div><Link href="/practica" className="button button-ghost">Ir a práctica <ArrowUpRight size={16} /></Link></div><div className="topics-toolbar"><label className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca un tema, una idea..." aria-label="Buscar temas" />{query && <button onClick={() => setQuery("")} aria-label="Limpiar búsqueda"><X size={15} /></button>}</label><div className="filter-pills">{["Todos", "Inicio", "Intermedio", "Reto"].map((item) => <button key={item} className={level === item ? "pill active" : "pill"} onClick={() => setLevel(item)}>{item}</button>)}<button className={showOnlyOpen ? "pill active pill-status" : "pill pill-status"} onClick={() => setShowOnlyOpen(!showOnlyOpen)}>{showOnlyOpen ? "Por comenzar" : "Ver pendientes"}</button></div></div>{filtered.length ? <div className="topic-grid">{filtered.map((topic) => <TopicCard key={topic.slug} topic={topic} completed={completed.includes(topic.slug)} />)}</div> : <div className="empty-state"><Search size={28} /><h3>No encontramos ese tema</h3><p>Prueba con otra palabra o limpia los filtros.</p><button className="button button-ghost" onClick={() => { setQuery(""); setLevel("Todos"); setShowOnlyOpen(false); }}>Limpiar filtros</button></div>}</section>
    <section className="container study-note-section"><div className="study-note"><div className="note-icon"><Lightbulb size={21} /></div><div><span className="eyebrow">Una idea para hoy</span><h3>No memorices el procedimiento: <em>pregunta qué está cambiando.</em></h3><p>Cuando puedas explicar por qué un paso funciona, ya no dependes de repetirlo de memoria.</p></div><Link href="/practica" className="round-arrow" aria-label="Ir a práctica"><ArrowUpRight size={19} /></Link></div></section>
  </main>;
}

function ExerciseCard({ exercise, slug, onAnswer }: { exercise: Exercise; slug: string; onAnswer: (correct: boolean) => void }) {
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const check = () => { if (!selected.trim()) return; const normalized = selected.toLowerCase().replace(/\s/g, "").replace(/[−–]/g, "-"); const answer = exercise.answer.toLowerCase().replace(/\s/g, "").replace(/[−–]/g, "-"); const correct = normalized === answer; setFeedback(correct ? "correct" : "wrong"); onAnswer(correct); };
  return <div className={`exercise-card ${feedback ?? ""}`}><div className="exercise-header"><div><span className="eyebrow">Comprueba lo que entendiste</span><span className="difficulty-badge">{exercise.difficulty}</span></div><span className="exercise-index">Ejercicio {exercise.id.split("-")[1]}</span></div><h3>{exercise.prompt}</h3>{exercise.type === "choice" ? <div className="choice-grid">{exercise.options?.map((option) => <button key={option} className={selected === option ? "choice selected" : "choice"} onClick={() => { setSelected(option); setFeedback(null); }}>{option}</button>)}</div> : <input className="answer-input" value={selected} onChange={(event) => { setSelected(event.target.value); setFeedback(null); }} placeholder="Escribe tu respuesta" aria-label="Tu respuesta" />}{feedback === "wrong" && <p className="hint"><Lightbulb size={15} /> Pista: {exercise.hint}</p>}{feedback && <div className={`feedback ${feedback}`} aria-live="polite"><span className="feedback-icon">{feedback === "correct" ? <Check size={17} /> : <X size={17} />}</span><div><strong>{feedback === "correct" ? "¡Muy bien!" : "Casi, vuelve a mirarlo"}</strong><p>{feedback === "correct" ? exercise.explanation : `La respuesta esperada es ${exercise.answer}. ${exercise.explanation}`}</p></div></div>}<button className="button button-primary exercise-button" onClick={check} disabled={!selected.trim()}>{feedback === "correct" ? "Intentar de nuevo" : "Comprobar respuesta"}<ArrowRight size={16} /></button></div>;
}

function TopicPage({ completion, completed, toggleCompleted, recordAnswer }: { completion: number; completed: string[]; toggleCompleted: (slug: string) => void; recordAnswer: (correct: boolean, slug?: string) => void }) {
  const [, params] = useRoute("/tema/:slug");
  const topic = topicBySlug(params?.slug ?? "");
  if (!topic) return <NotFoundPage completion={completion} />;
  const isComplete = completed.includes(topic.slug); const currentIndex = topics.findIndex((item) => item.slug === topic.slug); const previous = topics[currentIndex - 1]; const next = topics[currentIndex + 1];
  return <main className="topic-page"><div className="container"><div className="breadcrumb"><Link href="/">Inicio</Link><ChevronRight size={14} /><Link href="/#temas">Temas</Link><ChevronRight size={14} /><span>{topic.title}</span></div><div className="topic-intro"><div><span className={`eyebrow eyebrow-${topic.accent}`}><span className="eyebrow-line" /> Módulo {String(topic.number).padStart(2, "0")} · {topic.label}</span><h1>{topic.title}</h1><p className="topic-lede">{topic.description}</p><div className="topic-meta"><span><Clock3 size={15} /> {topic.duration}</span><span><BookOpen size={15} /> {topic.lessons} lecciones</span><span className="level-chip">{topic.level}</span></div></div><div className={`topic-symbol ${accentMap[topic.accent]}`}><IconFor name={topic.icon} size={42} /><span>{String(topic.number).padStart(2, "0")}</span></div></div><div className="topic-layout"><article className="lesson-content"><div className="lesson-tabs"><a href="#entiende" className="active">01 Entiende</a><a href="#ejemplo">02 Mira un ejemplo</a><a href="#practica">03 Practica</a></div><section id="entiende" className="lesson-section"><span className="section-number">01</span><div><span className="eyebrow">La idea central</span><h2>Primero, <em>la intuición.</em></h2><p>{topic.explanation}</p><div className="formula-block"><span>{topic.formulaLabel}</span><strong>{topic.formula}</strong></div></div></section><section id="ejemplo" className="lesson-section example-section"><span className="section-number">02</span><div className="example-panel"><span className="eyebrow">Ejemplo resuelto</span><h2>{topic.example.question}</h2><div className="steps-list">{topic.example.steps.map((step, index) => <div className="step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><div className="example-result"><span>Resultado</span><strong>{topic.example.result}</strong></div></div></section><section className="lesson-section error-section"><span className="section-number">!</span><div className="error-note"><div className="note-icon"><CircleHelp size={18} /></div><div><span className="eyebrow">Error frecuente</span><p>{topic.error}</p></div></div></section><section id="practica" className="lesson-section practice-section"><span className="section-number">03</span><div><span className="eyebrow">Ahora es tu turno</span><h2>Hazlo <em>tuyo.</em></h2><ExerciseCard exercise={topic.exercise} slug={topic.slug} onAnswer={(correct) => recordAnswer(correct, topic.slug)} /></div></section><div className="topic-nav"><div>{previous && <Link href={`/tema/${previous.slug}`} className="topic-nav-link"><ChevronLeft size={17} /><span><small>Anterior</small><strong>{previous.title}</strong></span></Link>}</div><div>{next && <Link href={`/tema/${next.slug}`} className="topic-nav-link next"><span><small>Siguiente</small><strong>{next.title}</strong></span><ChevronRight size={17} /></Link>}</div></div></article><aside className="topic-aside"><div className="aside-sticky"><div className="aside-progress"><span className="eyebrow">Tu avance</span><ProgressBar value={isComplete ? 100 : 35} label={`Módulo ${String(topic.number).padStart(2, "0")} de 15`} /></div><button className={isComplete ? "button button-complete" : "button button-dark aside-button"} onClick={() => toggleCompleted(topic.slug)}>{isComplete ? <><Check size={16} /> Tema completado</> : <>Marcar como completado <Check size={16} /></>}</button><div className="aside-tip"><Lightbulb size={18} /><p><strong>Tip de estudio</strong><br />Explica el ejemplo en voz alta antes de pasar al ejercicio.</p></div></div></aside></div></div></main>;
}

function PracticePage({ completion, recordAnswer }: { completion: number; recordAnswer: (correct: boolean, slug?: string) => void }) {
  const [difficulty, setDifficulty] = useState<"Todos" | Difficulty>("Todos");
  const [selectedTopic, setSelectedTopic] = useState("Todos");
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(0);
  const pool = useMemo(() => topics.filter((topic) => (difficulty === "Todos" || topic.exercise.difficulty === difficulty) && (selectedTopic === "Todos" || topic.slug === selectedTopic)), [difficulty, selectedTopic]);
  const topic = pool[index % Math.max(pool.length, 1)] ?? topics[0];
  return <main><section className="practice-hero"><div className="container practice-hero-inner"><div><span className="eyebrow eyebrow-coral"><span className="eyebrow-line" /> Zona de práctica</span><h1>Entrena la idea,<br /><em>no solo el resultado.</em></h1><p>Elige un nivel, prueba una pregunta y recibe una pista útil cuando la necesites.</p></div><div className="practice-orbit"><div className="orbit-ring ring-one" /><div className="orbit-ring ring-two" /><span>∞</span></div></div></section><section className="container practice-layout"><aside className="practice-filters"><span className="eyebrow">Configura tu sesión</span><label>Por dificultad<select value={difficulty} onChange={(event) => { setDifficulty(event.target.value as "Todos" | Difficulty); setIndex(0); }}><option>Todos</option><option>Básico</option><option>Intermedio</option><option>Reto</option></select></label><label>Por tema<select value={selectedTopic} onChange={(event) => { setSelectedTopic(event.target.value); setIndex(0); }}><option value="Todos">Todos los temas</option>{topics.map((item) => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select></label><div className="practice-stats"><span><strong>{pool.length}</strong> preguntas disponibles</span><span><strong>{answered}</strong> respondidas en esta sesión</span></div><ProgressBar value={completion} label="Tu avance general" /></aside><div className="practice-main"><div className="practice-main-top"><span className="eyebrow">Pregunta {pool.length ? (index % pool.length) + 1 : 0} de {pool.length}</span><span className="practice-dots">{Math.min(pool.length, 5)} disponibles</span></div>{pool.length ? <ExerciseCard key={`${topic.exercise.id}-${index}`} exercise={topic.exercise} slug={topic.slug} onAnswer={(correct) => { setAnswered((value) => value + 1); recordAnswer(correct, topic.slug); }} /> : <div className="empty-state"><CircleHelp size={28} /><h3>No hay preguntas con esos filtros</h3><p>Prueba otra combinación de dificultad y tema.</p></div>}<div className="practice-next"><span>Cuando termines,</span><button className="button button-ghost" onClick={() => setIndex((value) => value + 1)}>Siguiente pregunta <ArrowRight size={16} /></button></div></div></section></main>;
}

function CalculatorPage({ completion }: { completion: number }) {
  const [mode, setMode] = useState<"evaluate" | "solve">("evaluate"); const [expression, setExpression] = useState("2x + 5"); const [x, setX] = useState("3"); const [equation, setEquation] = useState("3x + 4 = 19"); const [result, setResult] = useState<{ ok: boolean; value?: string; detail?: string; error?: string } | null>(null);
  const calculate = () => setResult(mode === "evaluate" ? evaluateExpression(expression, x) : solveLinearEquation(equation));
  return <main><section className="calculator-hero"><div className="container calculator-hero-inner"><div><span className="eyebrow eyebrow-coral"><span className="eyebrow-line" /> Herramienta de estudio</span><h1>Haz visible<br /><em>el paso que falta.</em></h1><p>Una calculadora sencilla para comprobar tu razonamiento, no para reemplazarlo.</p></div><div className="calculator-mark"><FunctionSquare size={52} strokeWidth={1.2} /><span>f(x)</span></div></div></section><section className="container calculator-layout"><div className="calculator-card"><div className="calc-tabs"><button className={mode === "evaluate" ? "active" : ""} onClick={() => { setMode("evaluate"); setResult(null); }}>Evaluar expresión</button><button className={mode === "solve" ? "active" : ""} onClick={() => { setMode("solve"); setResult(null); }}>Resolver ecuación</button></div>{mode === "evaluate" ? <div className="calc-form"><label>Expresión con x<input value={expression} onChange={(event) => setExpression(event.target.value)} placeholder="Ej: 2x + 5" /></label><label>Valor de x<input value={x} onChange={(event) => setX(event.target.value)} inputMode="decimal" /></label><div className="calc-examples"><span>Prueba con:</span><button onClick={() => { setExpression("x^2 - 4"); setX("3"); }}>x² − 4</button><button onClick={() => { setExpression("3x + 2"); setX("5"); }}>3x + 2</button></div></div> : <div className="calc-form"><label>Ecuación lineal<input value={equation} onChange={(event) => setEquation(event.target.value)} placeholder="Ej: 3x + 4 = 19" /></label><div className="calc-examples"><span>Prueba con:</span><button onClick={() => setEquation("2x + 6 = 14")}>2x + 6 = 14</button><button onClick={() => setEquation("5x - 10 = 0")}>5x − 10 = 0</button></div></div>}<button className="button button-primary calc-button" onClick={calculate}>Calcular <Sparkles size={16} /></button>{result && <div className={`calc-result ${result.ok ? "success" : "failure"}`}><div className="result-icon">{result.ok ? <Check size={19} /> : <X size={19} />}</div><div><span>{result.ok ? "Resultado" : "Revisa la entrada"}</span><strong>{result.ok ? result.value : result.error}</strong>{result.detail && <p>{result.detail}</p>}</div></div>}</div><aside className="calculator-aside"><div className="aside-tip large"><Lightbulb size={19} /><div><span className="eyebrow">Recuerda</span><p>Escribe multiplicaciones como <strong>2x</strong> y usa <strong>^</strong> para elevar: x^2.</p></div></div><div className="mini-progress"><span className="eyebrow">Tu recorrido</span><ProgressBar value={completion} label="Ruta de álgebra" /><Link href="/practica" className="text-link">Practicar una pregunta <ArrowRight size={15} /></Link></div></aside></section></main>;
}

function NotFoundPage({ completion }: { completion: number }) { return <main className="not-found"><div className="container"><span className="eyebrow eyebrow-coral"><span className="eyebrow-line" /> 404</span><h1>Esta página se fue<br /><em>a despejar.</em></h1><p>El enlace no existe, pero la ruta de álgebra sí sigue aquí.</p><Link href="/" className="button button-primary">Volver al inicio <ArrowRight size={16} /></Link></div></main>; }

function Router(progress: ReturnType<typeof useStudyProgress>) {
  return <Layout completion={progress.completion}><Switch><Route path="/" component={() => <HomePage completion={progress.completion} completed={progress.progress.completed} />} /><Route path="/tema/:slug" component={() => <TopicPage completion={progress.completion} completed={progress.progress.completed} toggleCompleted={progress.toggleCompleted} recordAnswer={progress.recordAnswer} />} /><Route path="/practica" component={() => <PracticePage completion={progress.completion} recordAnswer={progress.recordAnswer} />} /><Route path="/calculadora" component={() => <CalculatorPage completion={progress.completion} />} /><Route path="/404" component={() => <NotFoundPage completion={progress.completion} />} /><Route component={() => <NotFoundPage completion={progress.completion} />} /></Switch></Layout>;
}

function App() {
  const progress = useStudyProgress();
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><WouterRouter base={basePath}><Router {...progress} /></WouterRouter></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
