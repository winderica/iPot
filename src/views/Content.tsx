import { CssBaseline, StyledEngineProvider, ThemeProvider } from '@material-ui/core';
import React, { FC, StrictMode, useEffect, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { LyricWidget } from '../components/LyricWidget';
import { Event } from '../constants/enums';
import { Lyric, Port } from '../constants/types';
import { useTheme } from '../styles/theme';

export const Content: FC = () => {
  const theme = useTheme();
  const [lyric, setLyric] = useState<Lyric>();
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(Infinity);
  const [lineNumber, setLineNumber] = useState(-1);
  useEffect(() => {
    const port: Port = browser.runtime.connect();
    port.onMessage.addListener((m) => {
      switch (m.event) {
        case Event.lyric:
          setLyric(m.payload);
          break;
        case Event.lineNumber:
          setLineNumber(m.payload);
          break;
        case Event.currentTime:
          setCurrentTime(m.payload);
          break;
        case Event.totalTime:
          setTotalTime(m.payload);
          break;
      }
    });
  }, []);
  if (!lyric) {
    return null;
  }
  return (
    <StrictMode>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <CssBaseline>
            <LyricWidget
              line={lyric.lines[lineNumber]}
              nextTime={lyric.lines[lineNumber + 1]?.words[0].time ?? totalTime}
              currentTime={currentTime * 1000}
            />
          </CssBaseline>
        </ThemeProvider>
      </StyledEngineProvider>
    </StrictMode>
  );
};
