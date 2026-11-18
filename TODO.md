# Algebrario — resultados de la actualización

## Currículo y banco semilla
- [x] Mantener exactamente los 15 temas y sus niveles Inicio (1–4), Intermedio (5–11) y Reto (12–15).
- [x] Incorporar `ejercicios_algebrario_seed.json` al repositorio como fuente versionada.
- [x] Validar e importar 150 ejercicios: 10 por tema, cuatro opciones, una respuesta correcta y tres pistas socráticas.
- [x] Guardar en la base las opciones con retroalimentación y las pistas con enfoque y nivel.

## Práctica adaptativa e infinita
- [x] Servir el banco semilla mientras la maestría del tema sea menor a 100%.
- [x] Activar “Práctica infinita” al llegar a 100% de maestría.
- [x] Implementar el generador parametrizado para temas 2, 6, 8, 12 y 14 en `server/routes/exerciseGenerator.ts`.
- [x] Renderizar enunciados y opciones con KaTeX y mostrar feedback específico del distractor.
- [x] Mantener tres niveles de Pista Socrática como preguntas: Lectura Estructural, Propiedad Uniforme / Factorización y Verificación.

## Laboratorio y experiencia visual
- [x] Mantener laboratorios SVG 2D, balanza y volumen 3D.
- [x] Permitir rotación 3D con mouse/dedo, zoom y pausa/reanudación de auto-rotación mediante OrbitControls.
- [x] Reforzar contraste claro/oscuro, estados de feedback, controles y lectura matemática.

## Cuenta y persistencia
- [x] Habilitar la base administrada y aplicar migraciones.
- [x] Cargar y verificar 15 temas y 150 ejercicios en MySQL.
- [x] Añadir Manus OAuth visible en Preview/publicación administrada.
- [x] Hidratar el progreso remoto al iniciar sesión y conservar fallback local en GitHub Pages.

## Validación y entrega
- [x] `pnpm run check`, `pnpm run build`, tests y `git diff --check` sin errores.
- [x] `/api/health` responde correctamente.
- [x] tRPC devuelve 10 filas por tema y genera retos infinitos.
- [x] Commit final de esta actualización en `main` del proyecto administrado.
- [x] Mismo cambio enviado a `serobel1412/Algebrario` para GitHub Pages.
