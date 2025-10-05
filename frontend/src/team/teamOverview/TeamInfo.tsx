import { Typography, Link, Stack } from "@mui/material";
import { Link as RouterLink } from "react-router";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function TeamInfo({ data }: { data: any }) {
	return (
		<>
			<Link component={RouterLink} to={`/`}>
				<Stack alignItems="center" direction="row" gap={1}>
					<ArrowBackIcon />
					Terug naar zoeken
				</Stack>
			</Link>
			<Typography variant="h3" gutterBottom color="primary">
				{data ? data.fullTeamName : 'Loading...'}
			</Typography>
		</>
	)
}