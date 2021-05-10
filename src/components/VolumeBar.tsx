import React, { FC } from 'react';
import { Slider } from '@material-ui/core';

interface Props {
  muted: boolean;
  volume: number;
  onVolumeChange: (volume: number) => void;
  onMutedChange: (muted: boolean) => void;
}

export const VolumeBar: FC<Props> = ({ muted, volume, onVolumeChange, onMutedChange }) => {
  return (
    <Slider
      value={muted ? 0 : volume}
      min={0}
      max={1}
      step={0.05}
      onChange={(_, value) => {
        if (Array.isArray(value)) {
          return;
        }
        onVolumeChange(value);
        muted && onMutedChange(false);
      }}
      valueLabelDisplay='auto'
      valueLabelFormat={(i) => ~~(i * 100)}
    />
  )
};
