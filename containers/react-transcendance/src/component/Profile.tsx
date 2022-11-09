import React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';

import UserStats from './UserStats'
import Historic from './Historic'

function Profile() {
  var placeholderName = "John Doe"
  var placeholderPic = ""
  var wins: number = 2
  var loss: number = 4
  var gamesPlayed: number = 6

  return (
    <Stack
	    className="Profile"
	    alignItems="center"
		>
		<Avatar alt={placeholderName} src={placeholderPic}/>
		<UserStats wins={wins} losses={loss} gamesPlayed ={gamesPlayed}/>
		<Historic></Historic>
    </Stack>
  );
}

export default Profile;
