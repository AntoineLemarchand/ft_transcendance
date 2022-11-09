import React from 'react';
import Nav from './Nav'
import Home from './Home'

import { Stack } from '@mui/material'

function App() {
  return (
    <Stack justifyContent='center'>
	<Nav></Nav>
	<Home></Home>
    </Stack>
  );
}

export default App;
