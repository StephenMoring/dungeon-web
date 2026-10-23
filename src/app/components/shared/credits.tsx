import { Fragment } from 'react'
import { getArtwork, type ArtId } from '@/app/art/registry'

interface CreditsProps {
  ids: ArtId[]
  className?: string
}

const LINK =
  'rounded-[4px] underline underline-offset-2 hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold'

export function Credits({ ids, className = '' }: CreditsProps) {
  // A crop is credited under its painting, and each painting once.
  const credited = [...new Set(ids.map((id) => getArtwork(id).creditOf ?? id))]

  return (
    <p className={`text-xs text-faint ${className}`}>
      Pictures:{' '}
      {credited.map((id, i) => {
        const art = getArtwork(id)
        return (
          <Fragment key={id}>
            {i > 0 && '; '}
            <a href={art.sourceUrl} className={LINK} target="_blank" rel="noreferrer">
              {`“${art.title}”`}
            </a>{' '}
            by {art.artist}, {art.year},{' '}
            <a href={art.licenceUrl} className={LINK} target="_blank" rel="noreferrer">
              {art.licenceName}
            </a>
            , via Wikimedia Commons
          </Fragment>
        )
      })}
    </p>
  )
}
