import { useState, type CSSProperties } from 'react'
import { getArtwork, type ArtId } from '@/app/art/registry'

interface ArtImageProps {
  id: ArtId
  className?: string
  /** The page's main above-the-fold painting: fetch eagerly at high priority. Everything else lazy-loads. */
  priority?: boolean
}

export function ArtImage({ id, className = '', priority = false }: ArtImageProps) {
  const art = getArtwork(id)
  const [failed, setFailed] = useState(false)

  // Inline style only carries data into CSS custom properties; all styling stays in Tailwind classes.
  const vars = {
    '--art-pos-desktop': art.focal.desktop,
    '--art-pos-phone': art.focal.phone,
    '--art-zoom': art.zoom ?? 1,
  } as CSSProperties

  // React 18 has no fetchPriority prop, so the lowercase HTML attribute is passed through a spread.
  const loadingProps = priority
    ? { loading: 'eager' as const, fetchpriority: 'high' }
    : { loading: 'lazy' as const, decoding: 'async' as const }

  return (
    <div className={`relative overflow-hidden bg-background ${className}`} style={vars}>
      {!failed && (
        <img
          src={art.src}
          width={art.width}
          height={art.height}
          alt={art.alt}
          {...loadingProps}
          onError={() => setFailed(true)}
          className="h-full w-full object-cover [object-position:var(--art-pos-desktop)] max-[759px]:[object-position:var(--art-pos-phone)] [transform-origin:var(--art-pos-desktop)] max-[759px]:[transform-origin:var(--art-pos-phone)] [transform:scale(var(--art-zoom))] [filter:brightness(.85)_contrast(1.05)]"
        />
      )}
    </div>
  )
}
