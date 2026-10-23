import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ArtImage } from './art-image'
import { getArtwork } from '@/app/art/registry'

describe('ArtImage', () => {
  it('renders the painting with its alt text', () => {
    render(<ArtImage id="pandemonium" />)
    expect(screen.getByRole('img', { name: getArtwork('pandemonium').alt })).toBeInTheDocument()
  })

  it('hides the img on error but keeps the wrapper', () => {
    const { container } = render(<ArtImage id="pandemonium" className="h-40" />)
    fireEvent.error(screen.getByRole('img'))
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.firstElementChild).toHaveClass('bg-background', 'h-40')
  })

  it('lazy-loads and decodes off the main thread by default', () => {
    render(<ArtImage id="deluge" />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'lazy')
    expect(img).toHaveAttribute('decoding', 'async')
  })

  it('loads eagerly at high priority when priority is set', () => {
    render(<ArtImage id="pandemonium" priority />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('loading', 'eager')
    expect(img).toHaveAttribute('fetchpriority', 'high')
  })
})
