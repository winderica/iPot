import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@material-ui/core';
import React, { FC, StrictMode } from 'react';

import { Player } from './Player';

import { PortContext } from '@contexts/port';
import { usePort } from '@hooks/usePort';
import { useTheme } from '@styles/theme';

export const Options: FC = () => {
  const theme = useTheme();
  const port = usePort();
  return (
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline>
            <PortContext.Provider value={port}>
              <Player />
            </PortContext.Provider>
          </CssBaseline>
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>
  );
};
