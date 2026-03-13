# Contribuir a VotoAbierto

Gracias por tu interés en contribuir a VotoAbierto. Cada contribución ayuda a que más peruanos tengan acceso a información electoral verificada.

---

## Contribuciones más necesarias

Estas son las áreas donde más impacto puedes tener:

1. **Completar posiciones de candidatos** — 7 preguntas fueron removidas del quiz porque no hay suficientes datos de candidatos. Agregar posiciones verificadas para esas preguntas las reactiva. Ver `data/candidate-positions.json`
2. **Verificar posiciones existentes** — muchas posiciones tienen `verified: false`. Si encuentras la fuente oficial (plan de gobierno JNE, declaración pública con cita), márcala como `verified: true` con la URL de fuente
3. **Datos biográficos de candidatos al Congreso** — bio, imageUrl desde hojas de vida de JNE para senadores y diputados
4. **Traducción al Quechua** — nuevo contenido del quiz (ejes, preguntas, etiquetas) en `lib/i18n/qu.ts`
5. **Reportar errores** — abre un issue en GitHub

**Nota importante:** VotoAbierto es un espacio no partidario. No contribuyas opiniones políticas en código o datos. Si contribuyes porque apoyas u opones a un candidato específico, reconsidéralo — necesitamos contribuidores neutrales que prioricen la precisión sobre la narrativa.

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
