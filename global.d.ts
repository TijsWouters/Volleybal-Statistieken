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
  'pdRegeling'?: PDRegeling
  'teruggetrokken'?: boolean
}

interface PDRegeling {
  '@type': string
  '@id': string
  'promotieHoogste'?: number
  'promotieLaagste'?: number
  'promotiewedstrijdenHoogste'?: number
  'promotiewedstrijdenLaagste'?: number
  'handhavingHoogste'?: number
  'handhavingLaagste'?: number
  'degradatiewedstrijdenHoogste'?: number
  'degradatiewedstrijdenLaagste'?: number
  'degradatieHoogste'?: number
  'degradatieLaagste'?: number
  'aantalPromotie'?: number
  'aantalPromotiewedstrijden'?: number
  'aantalHandhaving'?: number
  'aantalDegradatiewedstrijden'?: number
  'aantalDegradatie'?: number
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
  'teruggetrokken'?: boolean
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

interface Location {
  '@context': string
  '@id': string
  '@type': string
  'naam': string
  'adres': Address
  'telefoon': string
  'plaats': string
}

interface RouteResponse {
  clubInfo: Club
  locationData: Location
}

interface Address {
  '@id': string
  '@type': string
  'straat': string
  'huisnummer': number
  'postcode': string
  'plaats': string
  'land': string
  'lengtegraad': string
  'breedtegraad': string
  'gevalideerd': boolean
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

interface DetailedMatchInfo extends Match {
  strengthDifference: number | null
  strengthDifferenceWithoutCurrent: number | null
  fullTeamName: string
  otherEncounters: Match[]
  neutral: boolean
  puntentelmethode: string
  pouleLink: string
}

interface DetailedPouleInfo extends Poule {
  fullTeamName: string
  clubId: string
  teamType: string
  teamId: string
  bt: BTModel
  teams: DetailedTeamInfo[]
  timePoints: number[]
  dataAtTimePoints: Record<string, DataAtTimePoint>[]
  mostSurprisingResults: Match[]
  showData: boolean
  predictedEndResults: Team[]
  endPositionChances: Record<string, number[]>
  consistencyScores: Record<string, number>
}

interface DetailedTeamInfo extends Team {
  matchWinRate: number
  setWinRate: number
  pointWinRate: number
}

interface DataAtTimePoint {
  points: number
  position: number | null
  strength: number | null
}

interface Puntentelmethode {
  '@id': string
  '@type': string
  'mogelijkeUitslagen': MogelijkeUitslag[]
  'omschrijving': string
  'afkorting': string
  'minimumPuntenReguliereSet': number
  'minimumPuntenBeslissendeSet': number
  'minimumVerschilReguliereSet': number
  'minimumVerschilBeslissendeSet': number
  'heeftVerdubbeldeWeergave': boolean
}

interface MogelijkeUitslag {
  '@type': string
  '@id': string
  'setsA': number
  'setsB': number
  'puntenA': number
  'puntenB': number
}
