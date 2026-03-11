export default function ContributionNotice() {
  return (
    <div className="border border-[#E5E3DE] rounded-lg p-4 bg-[#F7F6F3] text-center">
      <p className="text-[#444444] text-sm">
        Los candidatos individuales al Senado y Cámara de Diputados se añaden mediante contribuciones de la comunidad.
        <br />
        <a href="https://github.com/votoabierto/peru/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] underline">
          ¿Cómo contribuir con datos verificados?
        </a>
        {' · '}
        <a href="https://votoinformado.jne.gob.pe" target="_blank" rel="noopener noreferrer" className="text-[#1A56A0] underline">
          Ver lista oficial en JNE
        </a>
      </p>
    </div>
  )
}
