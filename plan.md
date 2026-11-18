# Plan de implementación — Algebrario adaptativo

## Objetivo
Convertir Algebrario en un curso interactivo y adaptativo de álgebra para grado décimo, conservando la estética de atlas editorial y haciendo que cada módulo conecte teoría, contexto, laboratorio y práctica.

## Decisiones de producto
- Mantener exactamente 15 temas en tres niveles: Inicio (1–4), Intermedio (5–11) y Reto (12–15).
- Usar la identidad visual actual: fondos cálidos, tipografía serif para conceptos, acentos por tema, tarjetas suaves y controles de alto contraste en modo oscuro.
- Mantener funcionamiento en GitHub Pages con `localStorage`; en Preview/publicación administrada usar Manus OAuth, tRPC y MySQL administrado para sincronizar cuentas.
- En GitHub Pages se muestra `Progreso local`, porque Pages no puede ejecutar el servidor tRPC ni OAuth; el modo de cuenta queda disponible en Preview/publicación administrada.

## Banco y motor de ejercicios
- `shared/data/ejercicios_algebrario_seed.json` conserva el archivo entregado: 150 filas, 15 temas, 10 ejercicios por tema.
- `scripts/seedExercises.ts` valida cantidades, cuatro opciones, una respuesta correcta y tres pistas antes de insertar de forma idempotente.
- `ExercisePlayer.tsx` sirve el banco semilla mientras la maestría es menor a 100%. Al llegar a 100% cambia a Práctica infinita.
- `server/routes/exerciseGenerator.ts` expone el generador parametrizado para Potencias, Factorización, Ecuaciones Lineales, Funciones Cuadráticas y Logaritmos; `shared/exerciseGenerator.ts` permite el fallback local de Pages.
- KaTeX renderiza los enunciados y las opciones en notación matemática, y cada distractor conserva su retroalimentación.

## Arquitectura
- `client/src/data/topics.ts`: catálogo y contenido pedagógico de los 15 módulos.
- `client/src/data/seedExercises.ts`: adaptador estático del JSON para Pages.
- `client/src/components/ExercisePlayer.tsx`: banco, modo infinito, rachas, maestría y tres pistas socráticas.
- `client/src/components/GeometricAlgebraVisualizer.tsx`: SVG 2D, balanza y laboratorio 3D con `OrbitControls`, arrastre, zoom y pausa/reanudación de giro.
- `client/src/hooks/useStudyProgress.ts`: maestría local, hidratación remota al iniciar sesión y guardado tRPC tolerante a fallos.
- `drizzle/schema.ts` + `drizzle/relations.ts`: `topics`, `exercises` y `user_progress`, incluyendo JSON de opciones y pistas.
- `server/routers.ts` + `server/db.ts`: catálogo semilla, generador infinito y progreso autenticado.

## Persistencia y cuenta
- La capacidad `database` quedó habilitada en el proyecto administrado.
- Se aplicaron migraciones y se cargaron 15 temas + 150 ejercicios; el seed es repetible y no duplica IDs.
- El encabezado usa Manus OAuth: iniciar sesión hidrata el progreso remoto y las respuestas actualizan `user_progress` por tema.

## Validación y entrega
- Ejecutar `pnpm run check`, `pnpm run build`, `pnpm test -- --run` y `git diff --check`.
- Verificar `/api/health`, `exercises.byTopic` con 10 filas y `exercises.infinite` con un ID parametrizado.
- Hacer commit en `main` del proyecto administrado y reflejar el mismo cambio en `serobel1412/Algebrario` para GitHub Pages.
