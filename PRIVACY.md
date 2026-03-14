# Política de Privacidad — VotoAbierto

> **TL;DR:** No almacenamos datos personales. Nunca. Ni siquiera tu IP.

## ¿Qué guardamos del quiz?

Cuando completas el quiz, guardamos únicamente:
- Tus respuestas a las 13 preguntas (valores numéricos por pregunta)
- Tu puntuación en los 3 ejes: económico, social e instituciones
- El candidato con mayor coincidencia y el porcentaje
- El tiempo que tomaste (para detectar bots — no para identificarte)
- Tu departamento, **solo si lo seleccionaste voluntariamente** (opcional)

## ¿Qué NO guardamos?

- Dirección IP (nunca, en ningún momento)
- Nombre, correo, teléfono — nada que te identifique
- Cookies de seguimiento
- Identificadores de dispositivo o navegador
- Historial de navegación

## ¿Cómo prevenimos duplicados sin guardar IPs?

Para evitar que una misma persona envíe múltiples respuestas, usamos **hash unidireccional**:

1. Tu IP llega temporalmente en memoria del servidor (nunca escrita a disco)
2. La combinamos con una clave secreta aleatoria conocida solo por nosotros
3. Aplicamos SHA-256 — una función matemática que no puede revertirse
4. Guardamos solo ese hash, nunca tu IP real

Es como tomar una huella dactilar de una huella dactilar — no puedes reconstruir el original.

Los hashes de deduplicación se eliminan automáticamente a los 30 días.
Los hashes están en una tabla separada que nunca se cruza con las respuestas del quiz.

## ¿Cuándo se publican los resultados?

Los resultados agregados se publican una vez que tengamos 1,000 respuestas o más.

Los resultados son siempre **agregados**: distribución de ejes, candidatos más elegidos,
participación por departamento. Nunca mostramos respuestas individuales.

## Código abierto como garantía

Todo el código que maneja tus datos es público y verificable en GitHub:
- Endpoint de envío: app/api/v1/quiz/submit/route.ts
- Endpoint de resultados: app/api/v1/quiz/results/route.ts
- Migración de base de datos: supabase/migrations/011_quiz_responses.sql

## Contacto

¿Preguntas sobre privacidad? Abre un issue en GitHub.

---
*Última actualización: Marzo 2026 · VotoAbierto es un proyecto de código abierto.*
