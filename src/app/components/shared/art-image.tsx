import { useState, type CSSProperties } from 'react'
import { getArtwork, type ArtId } from '@/app/art/registry'

interface ArtImageProps {
  id: ArtId
  className?: string
}

export function ArtImage({ id, className = '' }: ArtImageProps) {
  const art = getArtwork(id)
  const [failed, setFailed] = useState(false)

  // Inline style only carries data into CSS custom properties; all styling stays in Tailwind classes.
  const vars = {
    '--art-pos-desktop': art.focal.desktop,
    '--art-pos-phone': art.focal.phone,
    '--art-zoom': art.zoom ?? 1,
  } as CSSProperties

  return (
    <div className={`relative overflow-hidden bg-background ${className}`} style={vars}>
      {!failed && (
        <img
          src={art.src}
          width={art.width}
          height={art.height}
          alt={art.alt}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover [object-position:var(--art-pos-desktop)] max-[759px]:[object-position:var(--art-pos-phone)] [transform-origin:var(--art-pos-desktop)] max-[759px]:[transform-origin:var(--art-pos-phone)] [transform:scale(var(--art-zoom))] [filter:brightness(.85)_contrast(1.05)]"
        />
      )}
    </div>
  )
}
