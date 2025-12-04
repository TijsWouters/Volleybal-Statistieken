import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorderRounded'
import FavoriteIcon from '@mui/icons-material/FavoriteRounded'
import { IconButton } from '@mui/material'
import { useFavourites } from '@/hooks/useFavourites'
import { useClubData, useTeamData, type Data } from '@/query'
import { useLocation } from 'react-router'

export default function FavouriteButton() {
  const location = useLocation()
  let type: string = ''
  if (location.pathname.startsWith('/team/')) {
    type = 'team'
  }
  else if (location.pathname.startsWith('/club/')) {
    type = 'club'
  }

  const { data: teamData } = useTeamData()
  const { data: clubData } = useClubData()
  const { isFavourite, removeFavourite, addClubToFavourites, addTeamToFavourites } = useFavourites()

  const url = type === 'team' ? `/${teamData?.clubId}/${teamData?.teamType}/${teamData?.teamId}` : `/${clubData?.organisatiecode}`
  function handleFavourite() {
    if (isFavourite(url)) {
      removeFavourite(url)
    }
    else {
      if (type === 'team' && teamData) {
        addTeamToFavourites(teamData.fullTeamName, url, getAllPlayedMatchIds(teamData!))
      }
      else if (type === 'club' && clubData) {
        addClubToFavourites(clubData.naam, url, [])
      }
    }
  }

  return (
    <IconButton
      size="large"
      edge="end"
      color="inherit"
      className="ignore-transition"
      style={{ viewTransitionName: 'favourite-button' }}
    >
      {isFavourite(url)
        ? (
            <FavoriteIcon onClick={handleFavourite} className="text-accent" />
          )
        : (
            <FavoriteBorderIcon onClick={handleFavourite} />
          )}
    </IconButton>
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
