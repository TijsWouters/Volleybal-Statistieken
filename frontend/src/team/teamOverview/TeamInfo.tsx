import { Typography } from "@mui/material";


export default function TeamInfo({ data }: { data: any }) {
	return (
		<>
			<Typography variant="h3" gutterBottom color="primary">
				{data ? data.fullTeamName : 'Loading...'}
			</Typography>
		</>
	)
}