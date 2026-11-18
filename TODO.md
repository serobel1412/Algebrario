# Algebrario — resultados de la actualización

## Catálogo curricular estricto de 15 temas
- [x] Mantener exactamente los 15 temas: Lenguaje Algebraico, Potencias y Exponentes, Radicales, Polinomios, Productos Notables, Factorización, Fracciones Algebraicas, Ecuaciones Lineales, Desigualdades e Inecuaciones, Sistemas de Ecuaciones Lineales, Funciones Lineales, Funciones Cuadráticas, Sucesiones y Progresiones, Logaritmos y Ecuaciones Exponenciales y Problemas Aplicados.
- [x] Mantener los niveles Inicio (1–4), Intermedio (5–11) y Reto (12–15), incluyendo Cocientes Notables dentro del módulo de Productos Notables.

## Lección completa y ejes pedagógicos
- [x] Cada módulo muestra concepto teórico y propiedades, situación en la vida real, ejemplo resuelto paso a paso, laboratorio visual 2D/3D y práctica dinámica.
- [x] Las ecuaciones enseñan la propiedad uniforme: la misma operación se aplica a ambos lados; no usan “pasa al otro lado”.
- [x] Las explicaciones enseñan la jerarquía inversa de operaciones con la metáfora del desembalaje.
- [x] La factorización se recuerda en fracciones, desigualdades, cuadráticas y logaritmos.

## Laboratorio y práctica adaptativa
- [x] Crear e integrar `GeometricAlgebraVisualizer.tsx` con áreas 2D, volumen 3D y balanza geométrica.
- [x] Crear `ExercisePlayer.tsx` con ejercicios aleatorios, racha de tres respuestas correctas y niveles Inicio/Intermedio/Reto.
- [x] Cada pregunta de selección múltiple dispone de tres niveles de Pista Socrática formulados como preguntas.
- [x] La barra de maestría va de 0% a 100%; al 100% se puede practicar indefinidamente en Reto.

## Datos y persistencia
- [x] Actualizar `drizzle/schema.ts` y relaciones para `topics`, `exercises` y `user_progress`, incluyendo `socratic_hints` JSON y maestría.
- [x] Conectar guardado opcional mediante tRPC; conservar fallback local cuando no hay sesión o base disponible.
- [x] Mantener las rutas públicas declaradas y el tema claro/oscuro existente.

## Entrega
- [x] TypeScript, build, tests y diff sin errores.
- [x] Vista previa administrada responde por el puerto configurado.
- [x] Commit de la actualización en `main` del proyecto administrado.
- [x] Mismo cambio enviado a `serobel1412/Algebrario` para GitHub Pages.
