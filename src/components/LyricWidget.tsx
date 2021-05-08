import { Typography } from '@material-ui/core';
import React, { FC } from 'react';

import { Line } from '../constants/types';
import { useStyles } from '../styles/lyricWidget';

interface Props {
  line: Line;
  currentTime: number;
  nextTime: number;
}

export const LyricWidget: FC<Props> = ({ line }) => {
  const classes = useStyles();
  return (
    <div className={classes.line}>
      {line.words.map(({ content }, index) => (
        <Typography component='span' variant='h4' key={index}>{content}</Typography>
      ))}
    </div>
  );
};
