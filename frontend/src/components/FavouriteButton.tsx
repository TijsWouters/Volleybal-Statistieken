import { Button } from '@mui/material'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import { useContext } from 'react'

import { useFavourites } from '@/hooks/useFavourites'
import { TeamContext } from '@/pages/team/TeamRoutes'
import type { Data } from '@/query'

export default function FavouriteButton({ title, clubId, type }: { title: string, clubId?: string, type: 'team' | 'club' }) {
  const data = useContext(TeamContext)
  const url = type === 'team' ? `/${data.clubId}/${data.teamType}/${data.teamId}` : `/${clubId}`
  const { isFavourite, removeFavourite, addClubToFavourites, addTeamToFavourites } = useFavourites()

  function handleFavourite() {
    if (!data) return
    if (isFavourite(url)) {
      removeFavourite(url)
    }
    else {
      if (type === 'team') {
        addTeamToFavourites(title, url, getAllPlayedMatchIds(data))
      }
      else {
        addClubToFavourites(title, url, [])
      }
    }
  }

  return (
    <Button
      className="favourite-button"
      variant="outlined"
      onClick={handleFavourite}
    >
      {isFavourite(url) ? <FavoriteIcon /> : <FavoriteBorderIcon />}
      <p>{`${isFavourite(url) ? 'Verwijderen uit' : 'Toevoegen aan'} favorieten`}</p>
    </Button>
  )
}

function getAllPlayedMatchIds(data: Data): string[] {
  const matches = data.poules.flatMap(p => p.matches || [])
  const playedMatchIds = matches
    .filter(m => m.status.waarde.toLowerCase() === 'gespeeld')
    .filter(m => m.teams.some(t => t.team.includes(`${data.clubId}/${data.teamType}/${data.teamId}`)))
    .map(m => m.uuid)
  return playedMatchIds
}
