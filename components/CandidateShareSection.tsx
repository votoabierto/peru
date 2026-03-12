'use client'

import ShareButtons from '@/components/ShareButtons'
import QRCodeModal from '@/components/QRCodeModal'

interface Props {
  candidateName: string
  candidateSlug: string
  partyName: string
}

export default function CandidateShareSection({ candidateName, candidateSlug, partyName }: Props) {
  const url = `/candidatos/${candidateSlug}`
  const text = `Conoce a ${candidateName} (${partyName}) antes del 12 de abril:`

  return (
    <section className="border border-[#E5E3DE] rounded-xl p-6 bg-[#F7F6F3] text-center">
      <h2 className="text-xl font-bold text-[#111111] mb-2">Comparte este perfil</h2>
      <p className="text-[#777777] text-sm mb-6">
        Ayuda a otros peruanos a conocer a los candidatos antes de votar el 12 de abril.
      </p>
      <div className="flex items-center justify-center gap-2">
        <ShareButtons url={url} text={text} />
        <QRCodeModal url={url} label={candidateName} />
      </div>
    </section>
  )
}
