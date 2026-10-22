import pandemoniumSrc from '@/assets/art/pandemonium.jpg'
import wrathSrc from '@/assets/art/wrath.jpg'

export type ArtId = 'pandemonium' | 'wrath'

export interface Artwork {
  id: ArtId
  src: string
  width: number
  height: number
  alt: string
  title: string
  artist: string
  year: string
  licenceName: string
  licenceUrl: string
  sourceUrl: string
  focal: { desktop: string; phone: string }
  zoom?: number
}

const PUBLIC_DOMAIN_URL = 'https://creativecommons.org/publicdomain/mark/1.0/'

export const ARTWORKS: Record<ArtId, Artwork> = {
  pandemonium: {
    id: 'pandemonium',
    src: pandemoniumSrc,
    width: 2634,
    height: 1758,
    alt: 'An armoured warrior with shield and spear stands on a burning plain before a vast palace lit by torches, under a storm',
    title: 'Pandemonium',
    artist: 'John Martin',
    year: '1841',
    licenceName: 'public domain',
    licenceUrl: PUBLIC_DOMAIN_URL,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:Le_Pandemonium_-_John_Martin_-_Mus%C3%A9e_du_Louvre_Peintures_RF_2006_21_-_sans_cadre.jpg',
    focal: { desktop: '64% 55%', phone: '70% 50%' },
  },
  wrath: {
    id: 'wrath',
    src: wrathSrc,
    width: 3136,
    height: 2023,
    alt: 'A blood-red sun between collapsing mountains under a torn sky',
    title: 'The Great Day of His Wrath',
    artist: 'John Martin',
    year: 'about 1851',
    licenceName: 'public domain',
    licenceUrl: PUBLIC_DOMAIN_URL,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg',
    focal: { desktop: '44% 34%', phone: '44% 34%' },
    zoom: 1.9,
  },
}

export function getArtwork(id: ArtId): Artwork {
  return ARTWORKS[id]
}
