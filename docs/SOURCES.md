# VotoClaro — Fuentes de datos verificadas
## Peru 2026 Elections Data Sourcing Guide

> **Regla de oro:** Ningún dato se publica sin verificación de al menos 2 fuentes independientes.
> Todo dato lleva URL de fuente y fecha de acceso.

---

## 1. Autoridades Electorales Oficiales

### Jurado Nacional de Elecciones (JNE)
- **URL:** https://jne.gob.pe
- **Datos disponibles:**
  - Lista oficial de candidatos inscritos
  - Estado de inscripción de partidos
  - Infracciones electorales
  - Resoluciones de exclusión/admisión de candidatos
  - Educación cívica y normativa electoral
- **Acceso:** Portal web + CSV descargables en temporada electoral
- **Frecuencia de actualización:** Semanal durante campaña
- **Notas:** Fuente definitiva para elegibilidad. Ocasionalmente demora en publicar actualizaciones.

### Oficina Nacional de Procesos Electorales (ONPE)
- **URL:** https://onpe.gob.pe
- **Datos disponibles:**
  - Calendarios electorales oficiales
  - Listas de candidatos por partido y distrito
  - Resultados en tiempo real el día de las elecciones
  - Ubicación de mesas de votación
  - Financiamiento de campañas (reportes)
- **Acceso:** Portal web; API de resultados disponible en día de elecciones (2021)
- **Frecuencia:** Diaria en período electoral; resultados en tiempo real el 12 de abril
- **Notas:** Principal fuente técnica de datos electorales.

### INFOGOB — JNE Portal de información de organizaciones políticas
- **URL:** https://infogob.jne.gob.pe
- **Datos disponibles:**
  - Hojas de vida de candidatos (formato estandarizado)
  - Declaraciones juradas de bienes e ingresos
  - Historial electoral de candidatos
  - Información de partidos políticos
- **Acceso:** API REST disponible; también descarga masiva en CSV
- **Frecuencia:** Actualización al registrarse la candidatura
- **Notas:** **Fuente primaria para datos de candidatos.** Datos auto-declarados (no verificados por JNE).

### RENIEC — Registro Nacional de Identificación y Estado Civil
- **URL:** https://www.reniec.gob.pe
- **Datos disponibles:**
  - Verificación de identidad de candidatos
  - Información de padrón electoral
  - Ubicación de centros de votación por DNI
- **Acceso:** Consulta web por DNI; servicios de verificación para entidades

### CONGRESO DE LA REPÚBLICA
- **URL:** https://www.congreso.gob.pe
- **Datos disponibles:**
  - Historial de votaciones de congresistas incumbentes
  - Asistencia al hemiciclo
  - Proyectos de ley presentados
  - Grupos parlamentarios actuales
- **Acceso:** Portal de transparencia; descarga de datos en formato abierto
- **Notas:** Para verificar el record legislativo de candidatos que son congresistas actuales.

---

## 2. Datos de Integridad y Antecedentes

### SUNAT — Superintendencia Nacional de Aduanas y de Administración Tributaria
- **URL:** https://www.sunat.gob.pe
- **Datos disponibles:**
  - RUC de empresas vinculadas a candidatos
  - Información tributaria básica pública
- **Acceso:** Consulta por RUC/DNI
- **Uso:** Verificar declaraciones sobre empresas y activos.

### PODER JUDICIAL
- **URL:** https://www.pj.gob.pe
- **Datos disponibles:**
  - Consulta de expedientes judiciales
  - Sentencias publicadas
  - Estado de procesos penales
- **Acceso:** Portal de consulta por nombre/DNI
- **Notas:** Fuente definitiva para antecedentes penales.

### MINISTERIO PÚBLICO — FISCALÍA
- **URL:** https://www.fiscalia.gob.pe
- **Datos disponibles:**
  - Investigaciones fiscales abiertas (cuando son públicas)
  - Comunicados sobre casos de alto perfil
- **Acceso:** Portal web; comunicados de prensa

---

## 3. Encuestadoras y Sondeos

### Ipsos Perú
- **URL:** https://www.ipsos.com/es-pe
- **Frecuencia:** Mensual; semanal en período pre-electoral
- **Metodología:** Cara a cara + telefónica; muestras ~1,200 personas
- **Notas:** Encuestadora más citada y con mayor trayectoria en Perú.

### CPI (Compañía Peruana de Estudios de Mercados)
- **URL:** https://cpi.pe
- **Frecuencia:** Mensual
- **Metodología:** Encuestas presenciales urbanas y rurales

### DATUM Internacional
- **URL:** https://datum.pe
- **Frecuencia:** Mensual; a demanda
- **Notas:** Publica tablas comparativas entre encuestadoras.

### IEP — Instituto de Estudios Peruanos
- **URL:** https://iep.org.pe
- **Datos:** Encuesta Urpi (mensual), estudios de opinión pública
- **Notas:** Mayor rigurosidad metodológica; enfoque en elecciones y democracia.

> **Regla de uso:** Reportar el promedio de 3+ encuestadoras cuando sea posible. Nunca citar una sola encuesta como "la verdad". Incluir siempre margen de error y fecha de campo.

---

## 4. Medios de Comunicación (verificados)

### El Comercio
- **URL:** https://elcomercio.pe
- **Uso:** Cobertura política, debates, candidatos
- **Notas:** Diario de referencia; editorial de centro-derecha; periodismo de calidad.

### La República
- **URL:** https://larepublica.pe
- **Uso:** Cobertura política y social; investigación
- **Notas:** Centro-izquierda; sólida cobertura electoral.

### Ojo Público
- **URL:** https://ojopublico.pe
- **Uso:** Investigación, fact-checking, desinformación
- **Notas:** Mejor fuente para análisis de desinformación y financiamiento político.

### IDL-Reporteros
- **URL:** https://idlreporteros.pe
- **Uso:** Investigación judicial, anticorrupción
- **Notas:** Referencia para casos judiciales contra candidatos.

### RPP Noticias
- **URL:** https://rpp.pe
- **Uso:** Cobertura en tiempo real; debates presidenciales
- **Notas:** Radio/web de mayor alcance nacional.

---

## 5. Organizaciones de Monitoreo Electoral

### OEA — Misión de Observación Electoral
- **URL:** https://www.oas.org/es/sap/deco/
- **Datos:** Reportes de observación, comunicados sobre integridad del proceso
- **Frecuencia:** Reportes antes, durante y después de las elecciones

### International IDEA
- **URL:** https://www.idea.int/country/peru
- **Datos:** Análisis del sistema electoral peruano, datos comparados
- **Notas:** Referencia para explicar mecánicas del sistema bicameral y D'Hondt.

### Transparencia Perú
- **URL:** https://transparencia.org.pe
- **Datos:** Monitoreo de campaña, financiamiento de partidos
- **Notas:** Publicó reportes detallados en 2021; esperan hacer lo mismo en 2026.

---

## 6. Centros Académicos

### PUCP — Instituto de Ciencia Política
- **URL:** https://www.pucp.edu.pe/facultad/ciencias-sociales/
- **Uso:** Análisis electoral, encuestas, investigación sobre candidatos
- **Contacto:** Para datos y verificación académica

### IEP — Instituto de Estudios Peruanos
- **URL:** https://iep.org.pe
- **Uso:** Análisis sociodemográfico, estudios de opinión, contexto histórico

---

## 7. Organizaciones de Fact-Checking

### Ama Llula (coalición)
- **Socios:** El Filtro, Ojo Público, y otros
- **Uso:** Verificación colaborativa; buenas prácticas metodológicas
- **Notas:** Activos en 2021; buscar alianza formal para 2026.

### El Filtro
- **URL:** Buscar en redes / contacto directo
- **Especialidad:** Desinformación política peruana
- **Método:** IFCN-aligned fact-checking methodology

---

## 8. Cómo acceder a los datos de INFOGOB (API)

```bash
# Ejemplo de consulta de candidatos presidenciales
curl "https://infogob.jne.gob.pe/api/candidatos?cargo=presidente&eleccion=2026" \
  -H "Accept: application/json"

# Hojas de vida por ID de candidato
curl "https://infogob.jne.gob.pe/api/candidatos/{id}/hoja-de-vida"

# Declaraciones juradas
curl "https://infogob.jne.gob.pe/api/candidatos/{id}/declaracion-jurada"
```

> **Nota:** La disponibilidad de la API de INFOGOB varía. Tener siempre plan B con scraping
> del portal web mediante Playwright o Puppeteer.

---

## 9. Protocolo de verificación VotoClaro

1. **Fuente primaria:** Documento oficial del JNE/ONPE/INFOGOB → marca como `verified: true`
2. **Fuente secundaria:** Noticia de medio verificado + cruce con otra fuente → `verified: false` pero publicable
3. **Solo una fuente:** Marcar como `unverifiable` o no publicar
4. **Afirmación del candidato:** Verificar contra fuentes 1-2 → usar FactCheck con veredicto
5. **Datos desactualizados:** Añadir fecha de última verificación a cada registro

---

*Actualizado: 8 de marzo de 2026.*
*Próxima revisión: cuando ONPE publique la lista oficial definitiva de candidatos.*
