# VotoAbierto — Roadmap de lanzamiento
## Sprint de 5 semanas hacia las elecciones · 12 de abril de 2026

---

## Semana 1 — 8–14 marzo 2026: Plataforma viva con top candidatos presidenciales

### Objetivos
- [ ] Deploy en Vercel (producción en votoabierto.pe y votoabierto.org)
- [ ] Supabase creado y migración 001 aplicada
- [ ] 10 candidatos presidenciales principales con perfiles completos
- [ ] 3 posiciones por candidato verificadas (seguridad, economía, educación)
- [ ] 6 fact checks publicados
- [ ] Dominio votoabierto.pe registrado y apuntado
- [ ] Google Analytics / Plausible configurado
- [ ] Meta tags OG para compartir en WhatsApp y redes

### Métricas de éxito
- Sitio cargando en < 2s
- Al menos 500 visitas en la primera semana (orgánico + WhatsApp)
- 0 errores JS en consola

---

## Semana 2 — 15–21 marzo 2026: Los 34 candidatos presidenciales

### Objetivos
- [ ] Completar perfiles de los 34 candidatos presidenciales registrados ante el JNE
- [ ] Scraper de datos de INFOGOB (declaraciones juradas, hojas de vida)
- [ ] Al menos 5 posiciones por candidato presidencial
- [ ] Candidatos a senado: primeras 30 listas nacionales
- [ ] Página de comparación funcionando con Supabase real
- [ ] Imagen OG dinámica por candidato (para WhatsApp preview)
- [ ] Versión mobile optimizada y testeada

### Tareas técnicas
- API route `/api/candidates` con paginación
- Server Components con data real de Supabase
- Generación estática (ISR) para perfiles de candidatos

### Métricas de éxito
- 34 perfiles presidenciales con foto y bio
- 20+ fact checks publicados

---

## Semana 3 — 22–28 marzo 2026: Candidatos al congreso por región

### Objetivos
- [ ] Candidatos a diputados: 27 distritos electorales, 130 escaños
- [ ] Sistema de crowdsourcing verificado (formulario para ciudadanos)
- [ ] Alianzas universitarias activas: PUCP, UNMSM, UNI (verificación de datos)
- [ ] Mapa interactivo de regiones con datos reales
- [ ] Buscador de candidatos por región funcionando en Supabase
- [ ] Comparador con 3 candidatos funcionando end-to-end

### Tareas técnicas
- Formulario de contribución ciudadana (con moderación editorial)
- Full-text search en Supabase (pg_trgm)
- Filtros URL-encoded para compartir búsquedas por WhatsApp

### Métricas de éxito
- 100+ candidatos congresales cargados
- 3+ alianzas universitarias firmadas
- 5,000+ visitas acumuladas

---

## Semana 4 — 29 marzo – 4 abril 2026: Máquina de fact-checking activa

### Objetivos
- [ ] 50+ fact checks publicados (candidatos presidenciales y congresales)
- [ ] Pipeline de fact-checking: formulario → revisión editorial → publicación
- [ ] Contenido para redes sociales: posts diarios en Instagram y X
- [ ] Tarjetas de fact check compartibles en WhatsApp
- [ ] Alianza con Ojo Público, El Filtro, IDL-Reporteros para contenido
- [ ] Newsletter semanal lanzado
- [ ] Monitoreo de desinformación en WhatsApp activo

### Contenido
- 2 fact checks diarios durante los debates presidenciales
- "Hoja de ruta de los candidatos" — PDF descargable por cada presidencial
- Guía del votante: ¿Cómo votar el 12 de abril? (proceso, mesas, RENIEC)

### Métricas de éxito
- 50+ fact checks
- 10,000+ visitas semanales
- Cobertura de al menos 1 medio de comunicación nacional

---

## Semana del día electoral — 5–12 abril 2026: Cobertura en vivo

### Objetivos
- [ ] Feed de resultados ONPE en tiempo real (integración con API ONPE si disponible)
- [ ] Página de resultados con barra de progreso de actas procesadas
- [ ] Dashboard de tendencias por región
- [ ] Proyecciones basadas en resultados parciales
- [ ] Alerta anti-desinformación: "¿Es verdad que...?" durante el conteo

### Tareas técnicas
- WebSocket o polling cada 30s para resultados ONPE
- Caché agresivo de resultados (Redis o Supabase Realtime)
- CDN edge caching para soportar tráfico de pico

### Contingencias
- Plan B si ONPE no publica API: scraping del portal oficial
- Infra escalada en Vercel Pro para tráfico del día E

### Métricas de éxito
- Uptime 99.9% en día de elecciones
- 50,000+ visitas el 12 de abril
- Citado por al menos 3 medios de comunicación como fuente de resultados

---

## Post-elecciones (segunda vuelta si aplica) — 13 abril – 7 junio 2026

### Objetivos
- [ ] Análisis de resultados de primera vuelta por región
- [ ] Perfil de los dos candidatos en segunda vuelta (comparación profunda)
- [ ] Fact-checking intensificado del período de campaña de segunda vuelta
- [ ] Guía explicativa: ¿Qué cambia en segunda vuelta?
- [ ] Seguimiento de la composición del nuevo Congreso (senadores + diputados)

---

## Equipo y recursos necesarios

| Rol | Responsabilidad | Semana inicio |
|-----|----------------|---------------|
| Desarrollador full-stack | Plataforma técnica | S1 |
| Editor de datos | Carga y verificación de candidatos | S1 |
| Fact-checker (x2) | Verificación de claims | S2 |
| Community manager | Redes sociales + WhatsApp | S3 |
| Diseñador | Gráficas para redes | S3 |

## Fuentes de financiamiento
- NED (National Endowment for Democracy)
- USAID / IFES
- Open Society Foundations
- Alianzas con universidades (recursos en especie)
- Donaciones ciudadanas (Ko-fi o similar)

---

*Actualizado: 8 de marzo de 2026. Próxima revisión: 15 de marzo de 2026.*
