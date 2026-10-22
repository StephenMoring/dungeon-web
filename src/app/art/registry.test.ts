import { describe, expect, it } from 'vitest'
import { ARTWORKS, getArtwork } from './registry'

describe('art registry', () => {
  it('zooms the wrath painting', () => {
    expect(getArtwork('wrath').zoom).toBe(1.9)
  })

  it('gives every artwork alt text and a source url', () => {
    for (const art of Object.values(ARTWORKS)) {
      expect(art.alt).not.toBe('')
      expect(art.sourceUrl).not.toBe('')
    }
  })
})
