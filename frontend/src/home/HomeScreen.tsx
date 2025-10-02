import { Grid, Paper, Stack } from '@mui/material'
import TeamSearch from './TeamSearch'

export default function HomeScreen() {
	return (
		<div className="home-screen-container">
			<Grid container spacing={2} sx={{ height: '80%', width: '80%' }}>
				<Grid size={6} sx={{ height: '100%' }}>
					<Paper sx={{ height: '100%', boxSizing: 'border-box' }}>
						<TeamSearch />
					</Paper>
				</Grid>
				<Grid size={6}>
					<Stack spacing={2} sx={{ height: '100%' }}>
						<Paper sx={{ flex: 1 }}>TODO: favourite teams</Paper>
						<Paper sx={{ flex: 1 }}>TODO: recently viewed</Paper>
					</Stack>
				</Grid>
			</Grid>
		</div>
	)
}