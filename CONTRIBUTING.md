# Contribuir a VotoAbierto

Gracias por tu interés en contribuir a VotoAbierto. Cada contribución ayuda a que más peruanos tengan acceso a información electoral verificada.

---

## Formas de contribuir

### 1. Corregir datos de candidatos

La forma más valiosa de contribuir. **No necesitas saber programar.**

1. Edita el archivo YAML correspondiente en `data/` (por ejemplo, `data/candidates.yaml`)
2. Ejecuta `node scripts/export-yaml.mjs` para sincronizar los cambios con JSON
3. Abre un Pull Request — los diffs de YAML son mucho más fáciles de revisar que JSON
4. **Incluye la fuente oficial** — sin URL de fuente = rechazo automático

#### Ejemplo de corrección

```
Candidato: Juan Pérez
Campo: career_summary
Fuente: https://infogob.jne.gob.pe/Candidato/...
Cambio: Corregir cargo anterior de "congresista" a "alcalde provincial"
```

### 2. Proponer un compromiso ciudadano

Los compromisos son propuestas cívicas que los candidatos pueden adoptar públicamente.

1. [Abre un issue](https://github.com/ApoEsp/votoclaro/issues/new?template=pledge.md) con la plantilla de compromiso
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

Usa las [plantillas de Issues](https://github.com/ApoEsp/votoclaro/issues) para reportar bugs o datos incorrectos.

### 6. Contribuir código

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/tu-mejora`
3. Haz tus cambios
4. Verifica: `npm run build` — debe pasar sin errores
5. Envía un Pull Request

---

## Convención de commits

- `feat: descripción` — nueva funcionalidad
- `fix: descripción` — corrección de bug
- `data: descripción` — adición o corrección de datos
- `docs: descripción` — cambio en documentación

---

## Fuentes de datos que aceptamos

| Prioridad | Fuente | Ejemplo |
|---|---|---|
| 1 (máxima) | JNE | Portal de candidatos, resoluciones |
| 2 | ONPE | Calendario electoral, financiamiento |
| 3 | INFOGOB | Hojas de vida, historial |
| 4 | Medio verificado | El Comercio, Ojo Público, RPP |
| 5 | Contribución ciudadana | Revisión manual requerida antes de publicar |

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

## Cómo verificar una afirmación

1. Busca el candidato en [JNE Voto Informado](https://votoinformadoia.jne.gob.pe)
2. Revisa su hoja de vida en [INFOGOB](https://infogob.jne.gob.pe)
3. Cruza con al menos un medio de comunicación verificado
4. Si el dato proviene solo de declaraciones del candidato, márquelo como `unverified`
5. Documenta la URL exacta de cada fuente utilizada

---

## Qué contribuciones NO aceptamos

- **Contenido político o partidario.** No opiniones, no recomendaciones de voto
- **Datos sin fuente verificable.** Sin URL de fuente = rechazo automático
- **"Correcciones" sesgadas.** Cambios que favorecen o perjudican a un candidato sin respaldo oficial
- **Información privada.** Datos personales que no sean de dominio público y relevancia electoral
- **Especulación.** Rumores, "se dice que", fuentes anónimas

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

## Código de conducta

Todas las interacciones se rigen por nuestro [Código de Conducta](CODE_OF_CONDUCT.md).

VotoAbierto es un espacio cívico. Todas las interacciones deben ser respetuosas, no partidarias, constructivas y honestas. Violaciones graves (desinformación intencional, manipulación de datos) resultan en bloqueo permanente.

---

## Licencia

Al contribuir a VotoAbierto, aceptas que tu contribución se publique bajo la [licencia MIT](LICENSE). Libre para usar, adaptar y replicar en otras elecciones — con atribución.
