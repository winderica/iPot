import { Box, Grid, Typography } from '@material-ui/core';
import React, { FC, useCallback, useContext, useEffect, useState } from 'react';

import { Event } from '@constants/enums';
import { Lyric } from '@constants/types';
import { PortContext } from '@contexts/port';
import { usePrevious } from '@hooks/usePrevious';
import { useStyles } from '@styles/lyricPanel';

export const LyricPanel: FC = () => {
  const port = useContext(PortContext);
  const [lyricPanel, setLyricPanel] = useState<HTMLDivElement>();
  const [lyric, setLyric] = useState<Lyric>();
  const [lineNumber, setLineNumber] = useState(-1);
  const prevLineNumber = usePrevious(lineNumber, -1);
  const classes = useStyles();

  const ref = useCallback((lyricPanel: HTMLDivElement) => {
    setLyricPanel((prevLyricPanel) => {
      if (!prevLyricPanel && lyricPanel) {
        lyricPanel.children[prevLineNumber]?.classList.remove(classes.highlighted);
        lyricPanel.children[lineNumber]?.classList.add(classes.highlighted);
        lyricPanel.children[lineNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return lyricPanel;
    });
  }, [lineNumber, lyric]);
  useEffect(() => {
    if (!port) {
      return;
    }
    port.onMessage.addListener((m) => {
      switch (m.event) {
        case Event.lyric:
          setLyric(m.payload);
          break;
        case Event.lineNumber:
          setLineNumber(m.payload);
          break;
      }
    });
    port.postMessage({ event: Event.ping });
  }, [port]);
  useEffect(() => {
    if (!lyricPanel || prevLineNumber === lineNumber) {
      return;
    }
    lyricPanel.children[prevLineNumber]?.classList.remove(classes.highlighted);
    lyricPanel.children[lineNumber]?.classList.add(classes.highlighted);
    lyricPanel.children[lineNumber]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [lineNumber]);
  useEffect(()=> {
    if (!lyricPanel) {
      return;
    }
    lyricPanel.children[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [lyric]);

  return (
    <Grid item xs={3} height='100%' overflow='hidden'>
      <Box ref={ref} py='50vh'>
        {lyric?.lines.map(({ content }, i) => (
          <Typography key={i} align='center'>{content}</Typography>
        ))}
      </Box>
    </Grid>
  );
};
