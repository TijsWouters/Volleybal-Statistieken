interface Club {
  '@context': string
  '@id': string
  '@type': string
  'regio': string
  'organisatiecode': string
  'kvknummer': string
  'naam': string
  'officielenaam': string
  'vestigingsplaats': string
  'lengtegraad': string
  'breedtegraad': string
  'gemeente': string
  'provincie': string
  'oprichting': string
  'website': string
  'email': string
  'telefoon': string
}

interface Poule {
  '@id': string
  '@type': string
  'poule': string
  'team': string
  'indelingsletter': string
  'positie': number
  'gespeeld': number
  'punten': number
  'wedstrijdenWinst': number
  'wedstrijdenVerlies': number
  'setsVoor': number
  'setsTegen': number
  'puntenVoor': number
  'puntenTegen': number
  'kampioen': boolean
  'pouleopmerkingen': any[]
  'omschrijving': string
  'virtueleStatus': string
  'name': string
  'puntentelmethode': string
  'teams': Team[]
  'matches': Match[]
  'standberekening': boolean
}

interface Team {
  '@id': string
  '@type': string
  'poule': string
  'team': string
  'indelingsletter': string
  'positie': number
  'gespeeld': number
  'punten': number
  'wedstrijdenWinst': number
  'wedstrijdenVerlies': number
  'setsVoor': number
  'setsTegen': number
  'puntenVoor': number
  'puntenTegen': number
  'kampioen': boolean
  'omschrijving': string
  'virtueleStatus': string
  'standpositietekst'?: string
}

interface Match {
  '@id': string
  '@type': string
  'uuid': string
  'wedstrijdleiding': string
  'code': string
  'lengte': number
  'urlDwf': string
  'poule': string
  'teams': Team[]
  'datum': string
  'tijdstip': string
  'speelveld': string
  'speelzaal': string
  'sporthal': string
  'status': Status
  'livestreamGepland': boolean
  'pouleName': string
  'eindstand': [number, number] | null
  'setstanden': Set[] | null
  'prediction'?: Record<string, number> | null
}

interface Set {
  '@type': string
  '@id': string
  'set': number
  'puntenA': number
  'puntenB': number
}

interface Status {
  waarde: string // TODO: make enum
  omschrijving: string
}

interface ApiResponse {
  club: Club
  poules: Poule[]
}

interface ClubWithTeams extends Club {
  teams: TeamForClub[]
}

interface TeamForClub {
  '@id': string
  '@type': string
  'uuid': string
  'seizoen': string
  'vereniging': string
  'volgnummer': number
  'naam': string
  'standpositietekst': string
  'sortableRank': string
}
