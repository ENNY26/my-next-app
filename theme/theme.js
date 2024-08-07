// src/theme/theme.js
import { createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  typography: {
    h1: {
      fontSize: '4rem',
      fontWeight: 'bold',
      textAlign: 'center',
    },
  },
  components: {
    MuiBox: {
      styleOverrides: {
        root: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding:'100px',
        backgroundColor: '#121212',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          margin: '0.5rem',
          '&:hover': {
            backgroundColor: '#333',
          },
        },
      },
    },
  },
});

export default darkTheme;
