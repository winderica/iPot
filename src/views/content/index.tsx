import { StyledEngineProvider, ThemeProvider } from '@material-ui/core';
import { createGenerateClassName, StylesProvider } from '@material-ui/styles';
import React, { FC, StrictMode } from 'react';

import { Widget } from './Widget';

import { PortContext } from '@contexts/port';
import { usePort } from '@hooks/usePort';
import { useTheme } from '@styles/theme';

const generateClassName = createGenerateClassName({
  productionPrefix: 'iPot-jss-',
});

export const Content: FC = () => {
  const theme = useTheme();
  const port = usePort();
  return (
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <StylesProvider generateClassName={generateClassName}>
          <ThemeProvider theme={theme}>
            <PortContext.Provider value={port}>
              <Widget />
            </PortContext.Provider>
          </ThemeProvider>
        </StylesProvider>
      </StyledEngineProvider>
    </StrictMode>
  );
};
