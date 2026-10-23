import pandemoniumSrc from '@/assets/art/pandemonium.webp'
import wrathSrc from '@/assets/art/wrath.webp'
import pompeiiSrc from '@/assets/art/pompeii.webp'
import sadakSrc from '@/assets/art/sadak.webp'
import delugeSrc from '@/assets/art/deluge.webp'
import wrathBandSrc from '@/assets/art/wrath-band.webp'
import wrathChipSrc from '@/assets/art/wrath-chip.webp'

export type ArtId = 'pandemonium' | 'wrath' | 'wrath-band' | 'wrath-chip' | 'pompeii' | 'sadak' | 'deluge'

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
  /** A crop of another painting: credits resolve to that painting, so it is credited once. */
  creditOf?: ArtId
}

const PUBLIC_DOMAIN_URL = 'https://creativecommons.org/publicdomain/mark/1.0/'

/** Shared by the full Wrath painting and its pre-cut crops (band, landing chip). */
const WRATH_CREDIT = {
  alt: 'A blood-red sun between collapsing mountains under a torn sky',
  title: 'The Great Day of His Wrath',
  artist: 'John Martin',
  year: 'about 1851',
  licenceName: 'public domain',
  licenceUrl: PUBLIC_DOMAIN_URL,
  sourceUrl: 'https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Great_Day_of_His_Wrath_-_Google_Art_Project.jpg',
}

export const ARTWORKS: Record<ArtId, Artwork> = {
  pandemonium: {
    id: 'pandemonium',
    src: pandemoniumSrc,
    width: 2000,
    height: 1335,
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
    ...WRATH_CREDIT,
    id: 'wrath',
    src: wrathSrc,
    width: 2000,
    height: 1291,
    focal: { desktop: '44% 34%', phone: '44% 34%' },
  },
  'wrath-band': {
    ...WRATH_CREDIT,
    id: 'wrath-band',
    src: wrathBandSrc,
    width: 2000,
    height: 400,
    focal: { desktop: '40% 50%', phone: '40% 50%' },
    creditOf: 'wrath',
  },
  'wrath-chip': {
    ...WRATH_CREDIT,
    id: 'wrath-chip',
    src: wrathChipSrc,
    width: 800,
    height: 240,
    focal: { desktop: '42% 50%', phone: '42% 50%' },
    creditOf: 'wrath',
  },
  pompeii: {
    id: 'pompeii',
    src: pompeiiSrc,
    width: 2000,
    height: 1245,
    alt: 'A burning red sky splits over a city on a far hill while people flee along a dark shore in the foreground',
    title: 'The Destruction of Pompeii and Herculaneum',
    artist: 'John Martin',
    year: '1822',
    licenceName: 'public domain',
    licenceUrl: PUBLIC_DOMAIN_URL,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Destruction_of_Pompeii_and_Herculaneum.jpg',
    focal: { desktop: '50% 42%', phone: '34% 50%' },
  },
  sadak: {
    id: 'sadak',
    src: sadakSrc,
    width: 1920,
    height: 2701,
    alt: 'A lone man in red clings to a rock at the foot of a black waterfall, under cliffs lit by a fiery sky',
    title: 'Sadak in Search of the Waters of Oblivion',
    artist: 'John Martin',
    year: '1812',
    licenceName: 'public domain',
    licenceUrl: PUBLIC_DOMAIN_URL,
    sourceUrl:
      'https://commons.wikimedia.org/wiki/File:John_Martin_-_Sadak_in_Search_of_the_Waters_of_Oblivion_-_1566-1983_-_Saint_Louis_Art_Museum.jpg',
    focal: { desktop: '52% 78%', phone: '52% 78%' },
  },
  deluge: {
    id: 'deluge',
    src: delugeSrc,
    width: 2000,
    height: 1302,
    alt: 'Black storm water heaves over a rock crowded with drowning people, under a dark sky lit by a pale sun and red fires',
    title: 'The Deluge',
    artist: 'John Martin',
    year: '1834',
    licenceName: 'public domain',
    licenceUrl: PUBLIC_DOMAIN_URL,
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:John_Martin_-_The_Deluge_-_Google_Art_Project.jpg',
    focal: { desktop: '62% 38%', phone: '70% 40%' },
  },
}

export function getArtwork(id: ArtId): Artwork {
  return ARTWORKS[id]
}
