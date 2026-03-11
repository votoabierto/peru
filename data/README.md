# Datos de VotoAbierto

Esta carpeta contiene los datos de candidatos, regiones y fact-checks de la plataforma.

**No necesitas saber programar para contribuir.** Solo edita los archivos JSON y envía un Pull Request.

## Archivos

| Archivo | Contenido |
|---------|-----------|
| `candidates.json` | Candidatos presidenciales (36 registrados ante el JNE) |
| `congress.json` | Candidatos al Congreso por región y partido |
| `regions.json` | Las 25 regiones del Perú con población y temas clave |
| `regions-detail.json` | Información detallada de cada región (capital, PBI, industrias) |
| `fact-checks.json` | Verificaciones de claims de candidatos |
| `positions.json` | Posiciones de candidatos en temas clave |
| `districts.json` | Distritos electorales |
| `parties.json` | Partidos políticos registrados |

## Como contribuir datos

1. Haz fork del repositorio
2. Edita el archivo JSON correspondiente
3. Asegurate de que el JSON sea valido (usa un validador online si no estas seguro)
4. Envia un Pull Request con el titulo `data: descripcion del cambio`
5. Incluye la fuente oficial del dato (JNE, INFOGOB, etc.)

## Reglas

- Todo dato debe tener al menos 2 fuentes verificadas
- Fuentes aceptadas: JNE, ONPE, INFOGOB, Poder Judicial, medios verificados
- No se publican datos sin fuente
- Los errores se corrigen con nota de correccion
