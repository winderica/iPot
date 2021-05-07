import { createMuiTheme, responsiveFontSizes } from '@material-ui/core';
import { blue } from '@material-ui/core/colors';
import { useMemo } from 'react';

export const useTheme = (darkMode?: boolean) => useMemo(() => responsiveFontSizes(createMuiTheme({
  palette: {
    mode: darkMode ? 'dark' : 'light',
    primary: {
      main: blue[700],
    },
  },
})), [darkMode]);
