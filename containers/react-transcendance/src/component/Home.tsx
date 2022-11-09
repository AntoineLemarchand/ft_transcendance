import React from 'react';

import { Stack, Typography, Box } from '@mui/material'

function Home() {
  return (
  <Stack textAlign='center' sx={{
	  alignItems: 'center'
	  }}>
  <Box sx={{ width: 'auto', borderBottom: 4}}>
  <Typography
	  variant='h3'
	  mt={2}
	  sx={{borderBottom: 0}}
	  >ft_transcendance</Typography>
  </Box>
  </Stack>
      );
}

export default Home;
