# Plan de implementación — Algebrario adaptativo

## Objetivo
Convertir Algebrario en un curso interactivo y adaptativo de álgebra para grado décimo, conservando la estética editorial actual y ampliando cada módulo con teoría, contexto, ejemplo paso a paso, laboratorio geométrico y práctica socrática.

## Decisiones de producto
- Mantener exactamente 15 temas en tres niveles: Inicio (1–4), Intermedio (5–11) y Reto (12–15).
- Reutilizar la identidad visual actual como un **atlas editorial de estudio**: fondos cálidos, tipografía serif para conceptos, acentos por tema y tarjetas con bordes suaves.
- Sustituir las pestañas rígidas por una página de módulo continua con barra de maestría, navegación por anclas y bloques de aprendizaje.
- Usar la propiedad uniforme de la igualdad y la factorización como lenguaje transversal en los datos de lección, ejemplos y pistas.
- Mantener funcionamiento offline/local con `localStorage`; cuando exista sesión y backend, ofrecer mutaciones tRPC para sincronización.

## Arquitectura
- `client/src/data/topics.ts`: catálogo estricto de 15 temas, secciones pedagógicas, ejercicios y pistas socráticas.
- `client/src/components/ExercisePlayer.tsx`: motor de preguntas, racha consecutiva, niveles adaptativos, tres pistas y feedback.
- `client/src/components/GeometricAlgebraVisualizer.tsx`: visualizador SVG 2D y laboratorio 3D sin bloquear la experiencia si WebGL no está disponible.
- `client/src/hooks/useStudyProgress.ts`: maestría por tema, dificultad, racha y persistencia local.
- `client/src/App.tsx` + `client/src/index.css`: integración de módulo, práctica y dashboard.
- `drizzle/schema.ts` + `drizzle/relations.ts`: tablas de temas, ejercicios y progreso de usuario con JSON de pistas.
- `server/routers.ts` + `server/storage.ts`: procedimientos tRPC opcionales para leer catálogo y guardar intentos/progreso autenticado.

## Contenido y pedagogía
Cada tema tendrá cuatro bloques visibles: concepto y propiedades, situación real, ejemplo resuelto y laboratorio geométrico; la práctica adaptativa aparece integrada al final y también en `/practica`. Todas las explicaciones de ecuaciones usarán “la misma operación a ambos lados” y la metáfora del desembalaje. Las pistas serán preguntas, nunca soluciones directas.

## Laboratorio geométrico
- 2D: áreas de bloques para términos `x²`, `xy`, `x` y `1`, con modo de multiplicación/factorización.
- 3D: cubo desmontable conceptual para `(a + b)³`, con controles `a` y `b`, renderizado progresivo y fallback textual accesible.
- Balanza de igualdad: representación 2D para ecuaciones y desigualdades.

## Persistencia
El frontend seguirá siendo útil sin base de datos. Si el usuario está autenticado y el servidor dispone de conexión, se enviarán intentos y maestría mediante tRPC; las mutaciones fallidas no interrumpirán la práctica local.

## Entrega
Validar TypeScript, build, rutas y health check; hacer commit en `main` del proyecto administrado y reflejar el mismo commit en `serobel1412/Algebrario` para que GitHub Actions publique GitHub Pages.
