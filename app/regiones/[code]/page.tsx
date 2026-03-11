import { notFound } from 'next/navigation';
import { REGIONS_DATA } from '@/lib/regions-data';
import { getCandidates, getCongressCandidates, getPositions } from '@/lib/data';
import { RegionIssueMatrix } from '@/components/RegionIssueMatrix';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateStaticParams() {
  return REGIONS_DATA.map(r => ({ code: r.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const region = REGIONS_DATA.find(r => r.code.toLowerCase() === code.toLowerCase());
  if (!region) return { title: 'Región no encontrada — VotoAbierto' };
  return {
    title: `${region.name} — VotoAbierto`,
    description: region.description,
  };
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
}

export default async function RegionPage({ params }: Props) {
  const { code } = await params;
  const region = REGIONS_DATA.find(r => r.code.toLowerCase() === code.toLowerCase());
  if (!region) notFound();

  const [allCandidates, congressCandidates, allPositions] = await Promise.all([
    getCandidates(),
    getCongressCandidates(),
    getPositions(),
  ]);

  // Filter congress candidates by region code (CongressCandidate.region is a 3-letter code)
  const regionalCongress = congressCandidates.filter(
    (c) => c.region.toUpperCase() === code.toUpperCase()
  );

  // Top presidential candidates (by polling) for issue matrix
  const topPresidential = [...allCandidates]
    .filter(c => c.role === 'president')
    .sort((a, b) => (b.polling_percentage ?? 0) - (a.polling_percentage ?? 0))
    .slice(0, 5);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="bg-[#F7F6F3] border-b border-[#E5E3DE]">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-[#777777] text-sm font-medium px-3 py-1 bg-[#F7F6F3] border border-[#E5E3DE] rounded-full">
              {region.code}
            </span>
            <a href="/regiones" className="text-[#777777] text-sm hover:text-[#1A56A0] transition-colors">
              ← Todas las regiones
            </a>
          </div>
          <h1 className="text-4xl font-bold text-[#111111] mb-2">{region.name}</h1>
          <p className="text-[#1A56A0] text-lg mb-4">Capital: {region.capital}</p>
          <p className="text-[#777777] max-w-2xl leading-relaxed">{region.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
        {/* Stats grid */}
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Población', value: formatNumber(region.population), icon: '👥' },
              { label: 'Superficie', value: `${formatNumber(region.area_km2)} km²`, icon: '🗺️' },
              { label: 'PBI per cápita', value: `US$ ${formatNumber(region.gdp_per_capita_usd)}`, icon: '💰' },
              { label: 'Escaños en Congreso', value: region.congressional_seats.toString(), icon: '🏛️' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className="text-[#111111] font-bold text-lg">{stat.value}</div>
                <div className="text-[#777777] text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Key issues */}
        <section>
          <h2 className="text-2xl font-bold text-[#111111] mb-4">Principales problemas</h2>
          <div className="flex flex-wrap gap-3">
            {region.key_issues.map(issue => (
              <span
                key={issue}
                className="px-4 py-2 bg-[#F7F6F3] border border-[#E5E3DE] rounded-full text-[#4B5563] text-sm font-medium"
              >
                {issue}
              </span>
            ))}
          </div>
        </section>

        {/* Main industries */}
        <section>
          <h2 className="text-2xl font-bold text-[#111111] mb-4">Economía regional</h2>
          <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-6">
            <h3 className="text-[#777777] text-sm font-medium uppercase tracking-wide mb-3">Principales industrias</h3>
            <div className="flex flex-wrap gap-3">
              {region.main_industries.map(ind => (
                <span key={ind} className="px-3 py-1.5 bg-[#EEEDE9] border border-[#E5E3DE] rounded-lg text-[#111111] text-sm capitalize">
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Candidate issue matrix */}
        <section>
          <h2 className="text-2xl font-bold text-[#111111] mb-2">Propuestas para {region.name}</h2>
          <p className="text-[#777777] text-sm mb-6">
            Cómo se posicionan los principales candidatos ante los problemas clave de esta región
          </p>
          <RegionIssueMatrix
            region={region}
            candidates={topPresidential}
            allPositions={allPositions}
          />
        </section>

        {/* Congressional candidates */}
        <section>
          <h2 className="text-2xl font-bold text-[#111111] mb-2">
            Candidatos al Congreso por {region.name}
          </h2>
          <p className="text-[#777777] text-sm mb-6">
            {region.congressional_seats} escaño{region.congressional_seats > 1 ? 's' : ''} disponible{region.congressional_seats > 1 ? 's' : ''} para esta región
          </p>

          {regionalCongress.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regionalCongress.map((c) => (
                <div key={c.id} className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#EEEDE9] flex items-center justify-center text-sm font-bold text-[#111111] flex-shrink-0">
                    {c.full_name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-[#111111] font-medium text-sm">{c.full_name}</div>
                    <div className="text-[#777777] text-xs">{c.party}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#F7F6F3] border border-[#E5E3DE] rounded-xl p-8 text-center">
              <p className="text-[#777777]">
                Datos de candidatos al Congreso por región próximamente.
              </p>
              <p className="text-[#777777] text-sm mt-2">
                El ONPE publica las listas definitivas 90 días antes de las elecciones.
              </p>
            </div>
          )}
        </section>

        {/* Back link */}
        <div className="pt-4 border-t border-[#E5E3DE]">
          <a
            href="/regiones"
            className="text-[#777777] hover:text-[#1A56A0] transition-colors text-sm"
          >
            ← Ver todas las regiones
          </a>
        </div>
      </div>
    </main>
  );
}
