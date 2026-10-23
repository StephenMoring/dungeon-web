import pandemoniumSrc from '@/assets/art/pandemonium.jpg'
import wrathSrc from '@/assets/art/wrath.jpg'
import pompeiiSrc from '@/assets/art/pompeii.jpg'
import sadakSrc from '@/assets/art/sadak.jpg'
import delugeSrc from '@/assets/art/deluge.jpg'

export type ArtId = 'pandemonium' | 'wrath' | 'pompeii' | 'sadak' | 'deluge'

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
  pompeii: {
    id: 'pompeii',
    src: pompeiiSrc,
    width: 2012,
    height: 1252,
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
    width: 3840,
    height: 2499,
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
