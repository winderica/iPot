import { Box, Typography } from '@material-ui/core';
import React, { FC, useEffect, useRef } from 'react';
import clsx from 'clsx';

import { Lyric } from '@constants/types';
import { useStyles } from '@styles/lyricPanel';

interface Props {
  lyric?: Lyric;
  lineNumber: number;
}

const Panel: FC<Props & { container: HTMLElement }> = ({ lyric, lineNumber, container }) => {
  const classes = useStyles();

  useEffect(() => {
    (container.children[lineNumber] ?? container.children[0])?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [lineNumber, lyric]);

  return (
    <>
      {lyric?.lines.map(({ content }, i) => (
        <Typography key={i} align='center' className={clsx(lineNumber === i && classes.highlighted)}>{content}</Typography>
      ))}
    </>
  );
};

export const LyricPanel: FC<Props> = ({ lyric, lineNumber }) => {
  const ref = useRef<HTMLDivElement | null>(null);

  return (
    <Box ref={ref} py='50vh'>
      {ref.current && <Panel lyric={lyric} lineNumber={lineNumber} container={ref.current} />}
    </Box>
  );
};
