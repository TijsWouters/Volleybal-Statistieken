import { Paper } from "@mui/material";
import { useParams } from "react-router";
import ClubInfo from "./ClubInfo";
import ClubTeams from "./ClubTeams";
import { useClubData } from "@/query"

import "@/styles/club.css";
import Loading from "@/components/Loading";

export default function Club() {
  const { clubId } = useParams<{ clubId: string }>();


  const { data } = useClubData(clubId!)

  if (!data) return <Loading />

  return (
    <div className="club-page">
      <Paper elevation={4}>
        <ClubInfo club={data} />
      </Paper>
      <Paper elevation={4}>
        <ClubTeams teams={data.teams!} />
      </Paper>
    </div>
  )
}
