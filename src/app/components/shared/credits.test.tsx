import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Credits } from './credits'
import { getArtwork } from '@/app/art/registry'

describe('Credits', () => {
  it('links each painting title to its source', () => {
    render(<Credits ids={['pandemonium', 'wrath']} />)
    expect(screen.getByRole('link', { name: '“Pandemonium”' })).toHaveAttribute(
      'href',
      getArtwork('pandemonium').sourceUrl,
    )
    expect(screen.getByRole('link', { name: '“The Great Day of His Wrath”' })).toHaveAttribute(
      'href',
      getArtwork('wrath').sourceUrl,
    )
    expect(screen.getAllByRole('link', { name: 'public domain' })).toHaveLength(2)
  })
})
