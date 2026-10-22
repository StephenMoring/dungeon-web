import { Fragment } from 'react'
import { getArtwork, type ArtId } from '@/app/art/registry'

interface CreditsProps {
  ids: ArtId[]
  className?: string
}

const LINK = 'underline underline-offset-2 hover:text-foreground'

export function Credits({ ids, className = '' }: CreditsProps) {
  return (
    <p className={`text-xs text-faint ${className}`}>
      Pictures:{' '}
      {ids.map((id, i) => {
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
