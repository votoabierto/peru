# Contribuir a VotoAbierto

Gracias por tu interés en contribuir a VotoAbierto. Cada contribución ayuda a que más peruanos tengan acceso a información electoral verificada.

---

## Contribuciones más necesarias

> **Estado actual (2026-03-14):** 0% de posiciones verificadas. 75% tienen score pero sin fuente. 25% completamente vacías. Cada contribución verificada mejora directamente la calidad del quiz.

### Candidatos presidenciales con más datos faltantes

| Candidato | Partido | Posiciones faltantes | Posiciones sin verificar |
|---|---|---|---|
| José Luna Gálvez | PP | 13 de 13 | 0 |
| Joaquín Massé Fernández | PDF | 13 de 13 | 0 |
| Mario Vizcarra | PPR | 10 de 13 | 3 |
| Ronald Atencio | AEV | 10 de 13 | 3 |
| Fiorella Molinelli | FYL | 8 de 13 | 5 |
| Paul Jaimes | PROG | 7 de 13 | 6 |
| Alfonso López-Chau | AN | 6 de 13 | 7 |
| Herbert Caller | PPP | 6 de 13 | 7 |
| Ricardo Belmont | PCO | 5 de 13 | 8 |
| Napoleón Becerra | PTE | 5 de 13 | 8 |

### Candidatos al Senado con más datos faltantes

| Candidato | Partido | Posiciones faltantes | Posiciones sin verificar |
|---|---|---|---|
| Mario Enrique Vizcarra Cornejo | PPR | 10 de 13 | 3 |
| Flavio Cruz Mamani | PL | 9 de 13 | 0 |
| Duberli Apolinar Rodriguez Tineo | AEV | 9 de 13 | 0 |
| Fiorella Giannina Molinelli Aristondo | FYL | 8 de 13 | 5 |
| Pablo Alfonso Lopez Chau Nava | AN | 6 de 13 | 7 |

### Otras contribuciones de alto impacto

1. **Verificar posiciones existentes** — 353 posiciones presidenciales + 186 del Congreso tienen score pero `verified: false`. Si encuentras la fuente oficial (plan de gobierno JNE, declaración pública con cita), márcala como `verified: true` con `source_url`
2. **Datos biográficos de candidatos al Congreso** — bio, imageUrl desde hojas de vida de JNE para senadores y diputados
3. **Traducción al Quechua** — nuevo contenido del quiz (ejes, preguntas, etiquetas) en `lib/i18n/qu.ts`
4. **Reportar errores** — abre un issue en GitHub

**Nota importante:** VotoAbierto es un espacio no partidario. No contribuyas opiniones políticas en código o datos. Si contribuyes porque apoyas u opones a un candidato específico, reconsidéralo — necesitamos contribuidores neutrales que prioricen la precisión sobre la narrativa.

---

## Protocolo de verificación de datos

### Qué cuenta como posición verificada

Una posición se marca `verified: true` cuando:
- El candidato **personalmente** ha expresado esa posición (no el partido en general)
- Existe una **fuente pública verificable** con URL directa
- La fuente es una declaración **individual**: entrevista, plan de gobierno con su nombre, tweet desde cuenta oficial, video con timestamp

### Qué NO cuenta como fuente válida

- Plan de gobierno genérico del partido (salvo que el candidato lo haya firmado explícitamente)
- Inferencia a partir de su partido político ("es de derecha, seguro apoya X")
- Rumores, "se dice que", fuentes anónimas
- Interpretación editorial de un medio
- Posiciones de elecciones anteriores (salvo que haya reafirmado)

### Cómo enviar un PR con datos

1. Edita `data/candidate-positions.json` o `data/congress-positions.json`
2. Para cada posición que actualices, incluye:
   - `score`: 1 a 5 (ver escala en `data/issues.json`)
   - `label`: descripción breve de la posición
   - `verified`: `true` solo si tienes fuente verificable
   - `source_url`: URL directa a la fuente
3. Ejecuta `python3 scripts/validate-positions-data.py` para verificar que no hay errores
4. Abre un Pull Request — la validación se ejecuta automáticamente en CI
5. Incluye en la descripción del PR: qué candidato, qué posición, y por qué ese score

### Validación automática (CI)

Cada PR que toca `data/*.json` se valida automáticamente:
- JSON bien formado
- Campos requeridos presentes
- Scores entre 1-5 o null
- Si `verified: true` → `source_url` y `label` obligatorios
- Sin IDs duplicados
- Formato de `candidate_id` correcto (minúsculas, guiones)

---

## Guía de contribución de datos

### Formato de candidate-positions.json

Cada candidato tiene este formato:

```json
{
  "candidate_id": "slug-del-candidato",
  "candidate_name": "Nombre Completo",
  "party": "Nombre del Partido",
  "party_abbreviation": "SIGLA",
  "role": "presidential",
  "department": null,
  "positions": {
    "economia_igv": {
      "score": 4,
      "label": "Descripción breve de la posición",
      "verified": true
    }
  },
  "axis_scores": {
    "economic": 65,
    "social": 42,
    "institutions": 58
  }
}
```

### Cómo agregar una posición

1. Busca la posición del candidato en su plan de gobierno (disponible en JNE) o en declaraciones públicas documentadas
2. Asigna un score de 1 a 5 según la escala de la pregunta (ver `data/issues.json` para las etiquetas de cada extremo)
3. Escribe un label descriptivo breve
4. Si la fuente es oficial (JNE, plan de gobierno), marca `verified: true`
5. Incluye la URL de la fuente en tu Pull Request

### Fuentes aceptadas

| Prioridad | Fuente | Ejemplo |
|---|---|---|
| 1 (máxima) | JNE | Portal de candidatos, plan de gobierno, resoluciones |
| 2 | ONPE | Calendario electoral, financiamiento |
| 3 | INFOGOB | Hojas de vida, historial |
| 4 | Medio verificado | El Comercio, Ojo Público, RPP — con URL exacta |
| 5 | Declaración pública | Video/entrevista con timestamp, tweet verificado |

**No se aceptan:** blogs, redes sociales no oficiales, "según fuentes cercanas", ni interpretaciones de posición.

---

## Formas de contribuir

### 1. Corregir datos de candidatos

La forma más valiosa de contribuir. **No necesitas saber programar.**

1. Edita el archivo YAML correspondiente en `data/` (por ejemplo, `data/candidates.yaml`)
2. Ejecuta `node scripts/export-yaml.mjs` para sincronizar los cambios con JSON
3. Abre un Pull Request — los diffs de YAML son mucho más fáciles de revisar que JSON
4. **Incluye la fuente oficial** — sin URL de fuente = rechazo automático

### 2. Proponer un compromiso ciudadano

Los compromisos son propuestas cívicas que los candidatos pueden adoptar públicamente.

1. [Abre un issue](https://github.com/votoabierto/peru/issues/new?template=pledge.md) con la plantilla de compromiso
2. Incluye: título, descripción, por qué es importante, cómo se mediría el cumplimiento
3. El equipo editorial revisa y, si cumple los criterios, lo agrega a `data/pledges.json`
4. Se notifica a los equipos de campaña para obtener respuestas

### 3. Traducir al Quechua

VotoAbierto soporta Quechua (qu) además de Español (es).

1. Edita `lib/i18n/qu.ts` — contiene todas las cadenas de UI traducibles
2. Agrega traducciones faltantes o corrige existentes
3. Envía un PR — idealmente con revisión de un hablante nativo

### 4. Usar la API para construir herramientas cívicas

La API pública está diseñada para que desarrolladores construyan sobre nuestros datos:

```bash
curl https://votoabierto.org/api/v1/candidates
curl https://votoabierto.org/api/v1/parties
curl https://votoabierto.org/api/v1/senate
curl https://votoabierto.org/api/v1/diputados
curl https://votoabierto.org/api/v1/andino
```

Sin autenticación. CORS abierto. Rate limit: 60 req/min. OpenAPI spec: `/api/v1/openapi.json`

### 5. Reportar errores

Usa las [plantillas de Issues](https://github.com/votoabierto/peru/issues) para reportar bugs o datos incorrectos.

### 6. Contribuir código

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/tu-mejora`
3. Haz tus cambios
4. Verifica: `npm run build` — debe pasar sin errores
5. Envía un Pull Request

---

## Desarrollo local

```bash
npm install       # Instalar dependencias
npm run dev       # Servidor de desarrollo
npm run build     # Build de producción (debe pasar antes del PR)
npm run lint      # Verificación de estilo
```

### Estilo de código

- **TypeScript strict mode** — no usar `any`
- **Tailwind CSS** para estilos — no CSS modules ni inline styles
- **Server Components por defecto** — `'use client'` solo cuando sea necesario

---

## Convención de commits

- `feat: descripción` — nueva funcionalidad
- `fix: descripción` — corrección de bug
- `data: descripción` — adición o corrección de datos
- `docs: descripción` — cambio en documentación

---

## Estándares de datos

Estos estándares son **obligatorios** para cualquier contribución de datos:

1. **NUNCA fabricar datos.** Si no existe información verificada, dejar el campo como `null`
2. **Toda afirmación necesita fuente.** El campo `source_url` es obligatorio para cualquier dato nuevo
3. **Si no hay fuente verificable → dejar `null`.** No inventar, no asumir, no "completar"
4. **Usar fuentes oficiales.** Prioridad: JNE > ONPE > INFOGOB > medio verificado
5. **Dos fuentes independientes** para claims que no provienen de una autoridad electoral
6. **Fecha de acceso.** Incluir cuándo se accedió a la fuente

---

## Qué contribuciones NO aceptamos

- **Contenido político o partidario.** No opiniones, no recomendaciones de voto
- **Datos sin fuente verificable.** Sin URL de fuente = rechazo automático
- **"Correcciones" sesgadas.** Cambios que favorecen o perjudican a un candidato sin respaldo oficial
- **Información privada.** Datos personales que no sean de dominio público y relevancia electoral
- **Especulación.** Rumores, "se dice que", fuentes anónimas

---

## Código de conducta

Todas las interacciones se rigen por nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

VotoAbierto es un espacio cívico. Todas las interacciones deben ser respetuosas, no partidarias, constructivas y honestas. Violaciones graves (desinformación intencional, manipulación de datos) resultan en bloqueo permanente.

---

## Licencia

Al contribuir a VotoAbierto, aceptas que tu contribución se publique bajo la [licencia MIT](LICENSE). Libre para usar, adaptar y replicar en otras elecciones — con atribución.
