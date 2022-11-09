import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
  mode: 'dark',
    primary: {
      main: '#fe8019',
    },
    secondary: {
      main: '#83a598',
    },
    background: {
      default: '#282828',
      paper: '#1d2021',
    },
    text: {
      primary: '#ebdbb2',
    },
    error: {
      main: '#cc241d',
    },
    warning: {
      main: '#fb4934',
    },
    info: {
      main: '#458588',
    },
    success: {
      main: '#b8bb26',
    },
  },
  /*
  typography: {
    fontFamily: 'IBM Plex Mono',
  },
  */
});
