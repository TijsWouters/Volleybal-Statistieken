import { useEffect } from 'react'
import TeamInfo from './TeamInfo'

import '@/styles/team-overview.css'
import { useTeamData } from '@/query'

export default function TeamOverview() {
  const { data } = useTeamData()

  useEffect(() => {
    document.title = data!.fullTeamName
  }, [data!.fullTeamName])

  if (!data) {
    return null
  }

  return (
    <TeamInfo />
  )
}
