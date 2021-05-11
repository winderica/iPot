import { Slider } from '@material-ui/core';
import React, { FC, useEffect, useState } from 'react';

interface Props {
  disabled: boolean;
  totalTime: number;
  currentTime: number;
  onChange: (value: number) => void;
}

export const ProgressBar: FC<Props> = ({ disabled, totalTime, currentTime, onChange }) => {
  const [dragging, setDragging] = useState(false);
  const [time, setTime] = useState(0);
  useEffect(() => {
    !dragging && setTime(currentTime);
  }, [currentTime]);
  return (
    <Slider
      disabled={disabled}
      value={time}
      min={0}
      max={totalTime}
      onChange={(_, value) => {
        if (Array.isArray(value)) {
          return;
        }
        setTime(value);
        setDragging(true);
      }}
      onChangeCommitted={(_, value) => {
        if (Array.isArray(value)) {
          return;
        }
        onChange(value);
        setDragging(false);
      }}
      valueLabelDisplay='auto'
      valueLabelFormat={(i) => `${(~~(i / 60)).toString().padStart(2, '0')}:${(~~i % 60).toString().padStart(2, '0')}`}
    />
  );
};
