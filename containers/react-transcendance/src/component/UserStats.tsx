import React from 'react';
import {Stack, Grid, Typography} from '@mui/material';

interface Userdata {
	wins: number;
	losses: number;
	gamesPlayed: number;
}

function UserStats({wins, losses, gamesPlayed}: Userdata) {
	const gridPadding = '.5rem';
	const ratioColor = '#928374';
	const winColor = '#b8bb26';
	const lossColor = '#fb4934';

	return (
	<Stack sx={{textAlign: 'center'}} className="UserStats">
	<Typography>Games played: {gamesPlayed}</Typography>
	<Grid container sx={{
		bgcolor: '#282828', 
		borderRadius: '1.5rem', 
		overflow: 'hidden',}}
	>
		<Grid item xs={12}
		sx={{bgcolor: ratioColor, padding: gridPadding}}>
		Win/Loss: {wins/losses}</Grid>
		<Grid item xs={6}
		sx={{bgcolor: winColor, padding: gridPadding}}>
		{wins}</Grid>
		<Grid item xs={6} 
		sx={{bgcolor: lossColor, padding: gridPadding}}>
		{losses}</Grid>
	</Grid>
	</Stack>
  );
}

export default UserStats;
