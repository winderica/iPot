import React, { FC, useContext, useEffect, useState } from 'react';

import { LyricLine } from '@components/LyricLine';
import { Event } from '@constants/enums';
import { Lyric } from '@constants/types';
import { PortContext } from '@contexts/port';

export const Widget: FC = () => {
  const port = useContext(PortContext);
  const [lyric, setLyric] = useState<Lyric>();
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(Infinity);
  const [lineNumber, setLineNumber] = useState(-1);
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
        case Event.currentTime:
          setCurrentTime(m.payload * 1000);
          break;
        case Event.totalTime:
          setTotalTime(m.payload * 1000);
          break;
      }
    });
    port.postMessage({ event: Event.ping });
  }, [port]);
  if (!lyric) {
    return null;
  }
  return (
    <LyricLine
      line={lyric.lines[lineNumber]}
      nextTime={lyric.lines[lineNumber + 1]?.words[0].time ?? totalTime}
      currentTime={currentTime}
    />
  );
};
