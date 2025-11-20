import { useFavourites } from '@/hooks/useFavourites'
import { Navigate } from 'react-router'

export default function Index() {
  const { favourites } = useFavourites()

  if (favourites.length > 0) {
    return <Navigate to="/home/favourites" replace />
  }

  return <Navigate to="/home/teams" replace />
}
