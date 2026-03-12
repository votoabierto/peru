# Contribuir a VotoAbierto

Gracias por tu interés en contribuir a VotoAbierto. Cada contribución ayuda a que más peruanos tengan acceso a información electoral verificada.

---

## Cómo contribuir datos

La forma más valiosa de contribuir es agregar o corregir datos de candidatos. **No necesitas saber programar.**

1. Abre el archivo correspondiente en `data/` (por ejemplo, `data/candidates.json`)
2. Agrega o corrige la información
3. **Incluye la fuente oficial** — campo `source_url` obligatorio
4. Envía un Pull Request con una descripción de qué cambió y por qué

### Ejemplo de corrección de datos

```
Candidato: Juan Pérez
Campo: career_summary
Fuente: https://infogob.jne.gob.pe/Candidato/...
Cambio: Corregir cargo anterior de "congresista" a "alcalde provincial"
```

---

## Cómo contribuir código

1. Haz fork del repositorio
2. Crea una rama: `git checkout -b feat/tu-mejora`
3. Haz tus cambios
4. Verifica: `npm run build` — debe pasar sin errores
5. Envía un Pull Request

### Convención de commits

- `feat: descripción` — nueva funcionalidad
- `fix: descripción` — corrección de bug
- `data: descripción` — adición o corrección de datos
- `docs: descripción` — cambio en documentación

---

## Corregir datos de candidatos (YAML)

Exportamos los datos clave en formato YAML para facilitar la revisión en Pull Requests:

1. Edita el archivo YAML correspondiente en `data/` (por ejemplo, `data/candidates.yaml`)
2. Ejecuta `node scripts/export-yaml.mjs` para sincronizar los cambios con JSON
3. Abre un Pull Request — los diffs de YAML son mucho más fáciles de revisar que JSON

### Fuentes de datos que aceptamos
- JNE datos oficiales (máxima confianza)
- Declaraciones de Infogob
- Redes sociales oficiales de candidatos
- Medios de comunicación verificados (incluir enlace)

---

## Estándares de datos

Estos estándares son **obligatorios** para cualquier contribución de datos:

1. **NUNCA fabricar datos.** Si no existe información verificada, dejar el campo como `null`
2. **Toda afirmación necesita fuente.** El campo `source_url` es obligatorio para cualquier dato nuevo
3. **Si no hay fuente verificable → dejar `null`.** No inventar, no asumir, no "completar"
4. **Usar fuentes oficiales.** Prioridad: JNE > ONPE > INFOGOB > medio verificado
5. **Dos fuentes independientes** para claims que no provienen de una autoridad electoral
6. **Fecha de acceso.** Incluir cuándo se accedió a la fuente

### Jerarquía de fuentes

| Prioridad | Fuente | Ejemplo |
|---|---|---|
| 1 (máxima) | JNE | Portal de candidatos, resoluciones |
| 2 | ONPE | Calendario electoral, financiamiento |
| 3 | INFOGOB | Hojas de vida, historial |
| 4 | Medio verificado | El Comercio, Ojo Público, RPP |
| 5 | Contribución ciudadana | Revisión manual requerida antes de publicar |

---

## Cómo verificar una afirmación

Paso a paso para verificar un dato antes de contribuirlo:

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

VotoAbierto es un espacio cívico. Todas las interacciones deben ser:

- **Respetuosas** — sin ataques personales ni lenguaje ofensivo
- **No partidarias** — sin proselitismo ni promoción de candidatos
- **Constructivas** — orientadas a mejorar la plataforma y la información
- **Honestas** — sin manipulación de datos ni desinformación intencional

Violaciones graves (desinformación intencional, manipulación de datos) resultan en bloqueo permanente.

---

## Licencia

Al contribuir a VotoAbierto, aceptas que tu contribución se publique bajo la [licencia MIT](LICENSE). Libre para usar, adaptar y replicar en otras elecciones — con atribución.
