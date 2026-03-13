# Datos de VotoAbierto

Esta carpeta contiene los datos de candidatos, regiones y fact-checks de la plataforma.

**No necesitas saber programar para contribuir.** Solo edita los archivos JSON y envía un Pull Request.

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `candidates.json` | Candidatos presidenciales (36 registrados ante el JNE) |
| `candidate-positions.json` | Posiciones de candidatos en 13 temas + axis_scores por eje |
| `issues.json` | 13 preguntas del quiz con axis, axis_inverted, axis_weight |
| `senate-candidates.json` | 1,131 candidatos al Senado |
| `diputados-candidates.json` | 4,106 candidatos a Diputados |
| `andino-candidates.json` | 528 candidatos al Parlamento Andino |
| `parties.json` | Partidos políticos registrados |
| `pledges.json` | Compromisos ciudadanos y respuestas de candidatos |
| `public-office-records.json` | Registros de cargos públicos de candidatos |
| `regions.json` | Las 25 regiones del Perú con población y temas clave |
| `regions-detail.json` | Información detallada de cada región (capital, PBI, industrias) |
| `fact-checks.json` | Verificaciones de claims de candidatos |
| `positions.json` | Posiciones de candidatos en temas clave (legacy) |
| `districts.json` | Distritos electorales |
| `candidates.yaml` | Mirror YAML de candidates.json (para revisión de PRs) |
| `parties.yaml` | Mirror YAML de parties.json (para revisión de PRs) |

## Quiz: estructura de datos

### issues.json

Contiene las 13 preguntas activas del quiz. Cada pregunta incluye:

```json
{
  "key": "economia_igv",
  "question": "¿Se debería reducir el IGV...?",
  "axis": "economic",
  "axis_inverted": false,
  "axis_weight": 1.23
}
```

- `axis` — a qué eje pertenece (`economic`, `social`, `institutions`)
- `axis_inverted` — si la escala de respuesta está invertida para este eje
- `axis_weight` — peso calculado por desviación estándar de las respuestas de los 36 candidatos. Las preguntas con mayor dispersión de respuestas discriminan mejor entre candidatos y pesan más

### candidate-positions.json

Posiciones de cada candidato en los temas del quiz:

```json
{
  "candidate_id": "slug",
  "role": "presidential",
  "department": null,
  "positions": {
    "economia_igv": { "score": 4, "label": "...", "verified": true }
  },
  "axis_scores": { "economic": 65, "social": 42, "institutions": 58 }
}
```

- `role` — tipo de candidato (`presidential`, `senate`, `diputados`, `andino`)
- `department` — `null` para presidenciales (se muestran siempre), nombre del departamento para candidatos al Congreso
- `axis_scores` — posición del candidato en cada eje (0-100), calculada a partir de sus posiciones ponderadas

### Cómo se calcula axis_weight

Para cada pregunta:
1. Se toman los scores de los 36 candidatos que tienen posición documentada
2. Se calcula la desviación estándar de esos scores
3. Mayor desviación = mayor peso (la pregunta discrimina mejor entre candidatos)

Preguntas donde todos los candidatos opinan lo mismo tienen peso bajo. Preguntas polarizantes tienen peso alto.

### Preguntas removidas

7 preguntas fueron removidas del quiz original de 20 porque:
- Más de 50% de candidatos tenían `null` en su posición, o
- La desviación estándar era muy baja (no discriminaban entre candidatos)

Para reactivar una pregunta removida:
1. Agrega posiciones verificadas para esa pregunta en `candidate-positions.json` hasta que ≥15 candidatos tengan datos
2. Recalcula los axis_weights
3. Agrégala de vuelta a `issues.json`

## Cómo contribuir datos

1. Haz fork del repositorio
2. Edita el archivo JSON correspondiente
3. Asegúrate de que el JSON sea válido (usa un validador online si no estás seguro)
4. Envía un Pull Request con el título `data: descripción del cambio`
5. Incluye la fuente oficial del dato (JNE, INFOGOB, etc.)

## Reglas

- Todo dato debe tener fuente verificada
- Fuentes aceptadas: JNE, ONPE, INFOGOB, Poder Judicial, medios verificados
- No se publican datos sin fuente
- Si no hay fuente → dejar `null`. Nunca inventar, nunca asumir
