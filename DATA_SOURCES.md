# Fuentes de Datos — VotoAbierto

Documentación técnica de todas las fuentes de datos utilizadas por la plataforma.

---

## JNE — Jurado Nacional de Elecciones

### API principal

Descubierta via ingeniería inversa del portal [Voto Informado](https://votoinformadoia.jne.gob.pe).

**Base URL:** `https://votoinformadoia.jne.gob.pe/ServiciosWeb`

**Proceso electoral:** `124` (Elecciones Generales 2026)

#### Endpoints utilizados

##### POST `/api/v1/ListaCandidatos/filtrar`

Devuelve candidatos con foto, antecedentes penales, DNI, plan de gobierno.

```json
{
  "idProcesoElectoral": 124,
  "idTipoEleccion": 1,
  "tipoAutoridad": 1,
  "pagina": 1,
  "cantidad": 200
}
```

| `idTipoEleccion` | Cargo |
|---|---|
| 1 | Presidente |
| 2 | Vicepresidente |
| 20 | Senador |
| 3 | Diputado |
| 21 | Parlamento Andino |

##### POST `/api/v1/plan-gobierno/resumen-por-organizacion`

Devuelve resumen del plan de gobierno por partido.

```json
{
  "idOrganizacionPolitica": 1366
}
```

#### API alternativa (scraper legacy)

```
https://web.jne.gob.pe/serviciovotoinformado/api/votoinf/listarCanditatos
```

Usada por `scripts/jne-scraper.js`. Mismos datos, diferente formato de respuesta.

### Fotos de candidatos

```
https://mpesije.jne.gob.pe/apidocs/<UUID>.jpg
```

Los UUIDs se obtienen del campo `urlFoto` del endpoint `ListaCandidatos`.

**IMPORTANTE:** Los UUIDs son específicos por candidato — no asumir orden posicional.

### Logos de partidos

```
https://sroppublico.jne.gob.pe/Consulta/Simbolo/GetSimbolo/<ID>
```

El `<ID>` corresponde al `idOrganizacionPolitica` de cada partido.

---

## Antecedentes penales

Los antecedentes son **declarados por los propios candidatos** ante el JNE como parte de su hoja de vida. No son resultado de una investigación independiente.

**Campos relevantes:**
- `sentenciaPenal` — booleano indicando si declara sentencia
- `sentenciaPenalDetalle` — array con:
  - `expediente` — número de expediente judicial
  - `fallo` — tipo de sentencia
  - `fuero` — fuero judicial (penal, civil, etc.)
  - `txComentario` — puede incluir información sobre apelaciones, anulaciones o absoluciones

**Nota:** El campo `txComentario` frecuentemente contiene contexto importante. Un candidato puede declarar una sentencia que luego fue anulada o revertida en apelación. VotoAbierto muestra toda la información disponible sin editorializar.

---

## Candidatos del Congreso

Misma API de JNE, diferentes valores de `idTipoEleccion`:

| Cámara | Registros | `idTipoEleccion` |
|---|---|---|
| Senado | 1,131 | 20 |
| Diputados | 4,106 | 3 |
| Parlamento Andino | 528 | 21 |

Los datos se almacenan en archivos separados:
- `data/senado-candidates.json`
- `data/diputados-candidates.json`
- `data/andino-candidates.json`

---

## Archivos de datos locales

| Archivo | Contenido | Fuente |
|---|---|---|
| `data/candidates.json` | 36 candidatos presidenciales con perfil completo | JNE API |
| `data/senado-candidates.json` | 1,131 candidatos al senado | JNE API |
| `data/diputados-candidates.json` | 4,106 candidatos a diputados | JNE API |
| `data/andino-candidates.json` | 528 candidatos al Parlamento Andino | JNE API |
| `data/candidate-positions.json` | Posiciones de candidatos en temas clave | Planes de gobierno (JNE) |
| `data/parties.json` | Partidos políticos registrados | JNE |
| `data/issues.json` | Definiciones de áreas temáticas | Equipo editorial |
| `data/regions.json` | 25 regiones con población y temas clave | INEI / equipo editorial |
| `data/regions-detail.json` | Detalle regional expandido | Equipo editorial |
| `data/districts.json` | Circunscripciones electorales | JNE |

---

## Datos NO disponibles actualmente

- **Bienes declarados** (declaración patrimonial) — en investigación, posiblemente en INFOGOB
- **Historial de votaciones legislativas** — no disponible en JNE API para candidatos actuales
- **Financiamiento de campaña** — ONPE actualiza durante la campaña, aún no publicado para 2026
- **Resultados en tiempo real** — ONPE habilitará API el día de las elecciones (12 abril 2026)

---

## Otras fuentes oficiales

| Fuente | URL | Uso |
|---|---|---|
| ONPE | https://onpe.gob.pe | Calendario electoral, resultados |
| INFOGOB | https://infogob.jne.gob.pe | Hojas de vida, historial electoral |
| RENIEC | https://reniec.gob.pe | Verificación de identidad |
| Congreso | https://congreso.gob.pe | Record legislativo de incumbentes |

---

## Protocolo de verificación

1. **Fuente primaria:** Documento oficial de JNE/ONPE/INFOGOB → `verified: true`
2. **Fuente secundaria:** Medio verificado + cruce con otra fuente → publicable con nota
3. **Solo una fuente:** Marcar como `unverifiable` o no publicar
4. **Afirmación de candidato:** Verificar contra fuentes oficiales → fact-check con veredicto
5. **Sin fuente:** Dejar `null` — nunca inventar, nunca asumir

Ver también: [docs/SOURCES.md](docs/SOURCES.md) para la lista completa de fuentes de verificación.

---

*Actualizado: 12 de marzo de 2026.*
