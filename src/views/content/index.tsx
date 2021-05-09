import { StyledEngineProvider, ThemeProvider } from '@material-ui/core';
import React, { FC, StrictMode } from 'react';

import { Widget } from './Widget';

import { PortContext } from '@contexts/port';
import { usePort } from '@hooks/usePort';
import { useTheme } from '@styles/theme';

export const Content: FC = () => {
  const theme = useTheme();
  const port = usePort();
  return (
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <PortContext.Provider value={port}>
            <Widget />
          </PortContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>
  );
};
