import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@material-ui/core';
import React, { FC, StrictMode } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Port } from '../constants/types';
import { PortContext } from '../contexts/port';
import { useTheme } from '../styles/theme';

import { Player } from './Player';

const port: Port = browser.runtime.connect();

export const Options: FC = () => {
  const theme = useTheme();
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
