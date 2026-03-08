# VotoClaro 🗳️

**Vota informado. Peru 2026.**

VotoClaro es una plataforma de información electoral **no-partidaria** para las elecciones generales del Perú del **12 de abril de 2026**. Combatimos la desinformación electoral poniendo datos verificados sobre candidatos, propuestas y hechos al alcance de todos los votantes peruanos.

> 67% de peruanos obtiene información política de WhatsApp y redes sociales. VotoClaro es la fuente de verdad que sí van a usar.

---

## Características

- **Perfiles de candidatos** — Todos los candidatos presidenciales, senatoriales y de diputados
- **Comparador** — Compara hasta 3 candidatos lado a lado en temas clave
- **Fact-checking** — Verificación de claims con veredictos claros (Verdadero / Falso / Engañoso)
- **Por región** — Candidatos y temas por las 24 regiones del Perú
- **Cuenta regresiva** — Días para el 12 de abril de 2026
- **Compartible** — Diseñado para WhatsApp y redes sociales

---

## Stack técnico

| Componente | Tecnología |
|-----------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Base de datos | Supabase (PostgreSQL) |
| Deploy | Vercel |
| Fuente | Inter (Google Fonts) |

---

## Setup local

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Cuenta en Supabase (gratuita)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/votoclaro/votoclaro-pe.git
cd votoclaro-pe

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.local.example .env.local
# → Editar .env.local con tus credenciales de Supabase

# 4. Aplicar migración de base de datos
# En tu dashboard de Supabase > SQL Editor > ejecutar:
# supabase/migrations/001_initial.sql

# 5. (Opcional) Cargar datos de candidatos
SUPABASE_URL=tu-url SUPABASE_SERVICE_ROLE_KEY=tu-key \
  npx tsx scripts/seed-candidates.ts

# 6. Correr en desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Variables de entorno

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key

# Solo para scripts de servidor (no exponer al cliente)
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

---

## Estructura del proyecto

```
votoclaro/
├── app/
│   ├── page.tsx              # Homepage
│   ├── candidatos/
│   │   ├── page.tsx          # Lista de candidatos
│   │   └── [id]/page.tsx     # Perfil de candidato
│   ├── regiones/page.tsx     # Mapa regional
│   ├── comparar/page.tsx     # Comparador
│   └── verificar/page.tsx    # Fact-checks
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── CandidateCard.tsx
│   ├── IssueStance.tsx
│   ├── FactCheckBadge.tsx
│   ├── CountdownTimer.tsx
│   └── RegionCard.tsx
├── lib/
│   ├── supabase.ts           # Cliente Supabase
│   ├── types.ts              # TypeScript types
│   ├── seed-data.ts          # Datos de candidatos (desarrollo)
│   └── regions-data.ts       # Datos de regiones
├── supabase/
│   └── migrations/
│       └── 001_initial.sql   # Schema inicial
├── scripts/
│   └── seed-candidates.ts    # Script de carga de datos
└── docs/
    ├── ROADMAP.md            # Plan de 5 semanas al día E
    └── SOURCES.md            # Fuentes de datos verificadas
```

---

## Cómo contribuir

### Formas de contribuir

**Datos (más importante ahora mismo)**
1. Verifica un perfil de candidato contra [INFOGOB](https://infogob.jne.gob.pe)
2. Abre un Issue con datos corregidos o faltantes
3. Envía un PR con datos de candidatos de tu región

**Fact-checking**
1. Identifica un claim verificable de un candidato
2. Busca 2+ fuentes independientes
3. Abre un Issue usando la plantilla de fact-check

**Técnico**
1. Fork del repositorio
2. `git checkout -b feature/tu-feature`
3. PR con descripción clara de cambios

### Principios editoriales
- **No-partidario:** No expresamos preferencias por ningún candidato
- **Dos fuentes:** Ningún dato sin 2 fuentes verificadas
- **Transparencia:** Cada dato lleva su fuente
- **Corrección:** Errores se corrigen públicamente con nota de corrección

---

## Elecciones 2026 — Contexto

| Dato | Valor |
|------|-------|
| Primera vuelta | 12 de abril de 2026 |
| Segunda vuelta | 7 de junio de 2026 (si aplica) |
| Candidatos presidenciales | 34-37 registrados |
| Senadores a elegir | 60 (primer Senado desde 1992) |
| Diputados a elegir | 130 |
| Distritos electorales | 27 |
| Regiones | 24 + Lima Provincias |

---

## Organismos electorales oficiales

- **JNE** (Jurado Nacional de Elecciones): [jne.gob.pe](https://jne.gob.pe)
- **ONPE** (Oficina Nacional de Procesos Electorales): [onpe.gob.pe](https://onpe.gob.pe)
- **INFOGOB** (Datos de candidatos): [infogob.jne.gob.pe](https://infogob.jne.gob.pe)

---

## Licencia

MIT License — libre para usar, modificar y distribuir con atribución.

---

**VotoClaro no está afiliado a ningún partido político, candidato o entidad gubernamental.**
*Construido por ciudadanos, para ciudadanos.*

*Plataforma lanzada en emergencia: marzo 2026 · Elecciones: 12 de abril de 2026*
