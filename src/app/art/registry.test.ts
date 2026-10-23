import { describe, expect, it } from 'vitest'
import { ARTWORKS, getArtwork, type ArtId } from './registry'

const EVERY_ID: ArtId[] = ['pandemonium', 'wrath', 'pompeii', 'sadak', 'deluge']

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

  it('credits every ArtId with a title, artist, licence and source page', () => {
    expect(Object.keys(ARTWORKS).sort()).toEqual([...EVERY_ID].sort())
    for (const id of EVERY_ID) {
      const art = getArtwork(id)
      expect(art.id).toBe(id)
      expect(art.title).not.toBe('')
      expect(art.artist).not.toBe('')
      expect(art.licenceUrl).toMatch(/^https:\/\//)
      expect(art.sourceUrl).toMatch(/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/)
    }
  })
})
