import { useEffect, useState } from 'react'

import type { SearchResult } from './Search'
import SearchResultsList from './SearchResultsList'

import CLUB_COORDINATES from '@/assets/clubCoordinates.json'

type ClubCoordinate = {
  breedtegraad: number
  lengtegraad: number
  naam: string
  organisatiecode: number
}

export default function Nearby() {
  const geoLocation = window.navigator.geolocation

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [orderedClubs, setOrderedClubs] = useState<ClubCoordinate[]>([])

  useEffect(() => {
    if (geoLocation) {
      geoLocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setOrderedClubs(orderByDistance({ lat: latitude, lng: longitude }, CLUB_COORDINATES as unknown as ClubCoordinate[]))
          setError(null)
          setLoading(false)
        },
        (error) => {
          setError('Locatie niet beschikbaar: ' + error.message)
          setLoading(false)
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000, // accept a recent cached fix
        },
      )
    }
  }, [geoLocation])

  return (
    <div className="nearby-container">
      <SearchResultsList results={orderedClubs.map(clubToSearchResult)} loading={loading} error={error} />
    </div>
  )
}

function clubToSearchResult(club: ClubCoordinate) {
  return {
    title: club.naam,
    type: 'club',
    url: `/${club.organisatiecode}`,
  } as SearchResult
}

function orderByDistance(userCoords: { lat: number, lng: number }, clubs: ClubCoordinate[]) {
  function getDistance(coord1: { lat: number, lng: number }, coord2: { lat: number, lng: number }) {
    const R = 6371e3 // meters
    const φ1 = coord1.lat * Math.PI / 180 // φ in radians
    const φ2 = coord2.lat * Math.PI / 180 // φ in radians
    const Δφ = (coord2.lat - coord1.lat) * Math.PI / 180
    const Δλ = (coord2.lng - coord1.lng) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2)
      + Math.cos(φ1) * Math.cos(φ2)
      * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // meters
  }
  return clubs.slice().sort((a, b) => {
    const distA = getDistance(userCoords, { lat: a.breedtegraad, lng: a.lengtegraad })
    const distB = getDistance(userCoords, { lat: b.breedtegraad, lng: b.lengtegraad })
    return distA - distB
  })
}
