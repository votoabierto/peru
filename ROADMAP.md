# VotoAbierto — Hoja de Ruta de Datos

## Antes del debate (March 14-23)
- [ ] Completar posiciones verificadas para candidatos presidenciales con más gaps:
  - José Luna Gálvez (13/13 faltantes)
  - Joaquín Massé Fernández (13/13 faltantes)
  - Mario Vizcarra (10/13 faltantes)
  - Ronald Atencio (10/13 faltantes)
  - Fiorella Molinelli (8/13 faltantes)
- [ ] Investigar candidatos al Senado Tier 1 (pos 1-5 partidos principales):
  - Flavio Cruz Mamani — PL (9/13 faltantes)
  - Duberli Apolinar Rodriguez Tineo — AEV (9/13 faltantes)
  - Fiorella Giannina Molinelli Aristondo — FYL (8/13 faltantes)
- [ ] Verificar al menos 50 posiciones existentes con source_url

## Post-debate JNE seguridad (March 25 cron)
- Scraping automático de cobertura del debate del 24 de marzo
- Actualización de: seguridad_pena_muerte, seguridad_fuerzas_armadas, seguridad_narcotrafico
- ~20 candidatos presidenciales con posición neutral actualmente

## Post-debate JNE economía/institucional (April 1 cron)
- Scraping automático de debates restantes (30-31 marzo, 1 abril)
- Actualización de gaps económicos e institucionales:
  - economia_igv, economia_mineria, economia_inversion, economia_informal
  - educacion_meritocracia
  - inst_constitucion, inst_anticorrupcion, inst_fiscal
  - territorio_descentralizacion

## Cierre de datos (April 10)
- Congelación de datos — sin cambios a posiciones después de esta fecha
- Auditoría final de calidad: `python3 scripts/votoabierto-data-audit.py`
- Meta: >90% completeness, >50% verified

## Contribuciones de la comunidad
- Issues abiertos: generados con `python3 scripts/generate-contribution-issues.py`
- Formato requerido: score + label + source_url + verified:true
- Revisión: merge en < 24h si fuente válida
- Validación automática en CI: `python3 scripts/validate-positions-data.py`
