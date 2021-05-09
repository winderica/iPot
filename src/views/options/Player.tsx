import { Alert, Button, Grid, IconButton, List, ListItem, Slider, Snackbar } from '@material-ui/core';
import {
  Forward10,
  Pause,
  PlayArrow,
  Replay10,
  SkipNext,
  SkipPrevious,
  VolumeDown,
  VolumeMute,
  VolumeUp,
} from '@material-ui/icons';
import { get, set } from 'idb-keyval';
import React, { FC, useContext, useEffect, useState } from 'react';

import { LyricPanel } from '../components/LyricPanel';
import { Event, Status } from '../constants/enums';
import { MusicMetadata } from '../constants/types';
import { PortContext } from '../contexts/port';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { useStyles } from '../styles/options';

export const Player: FC = () => {
  const port = useContext(PortContext);
  const [musics, setMusics] = useState<MusicMetadata[]>([]);
  const [index, setIndex] = useState<number>();
  const [playing, setPlaying] = useState(false);
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(Infinity);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const classes = useStyles();
  useEffect(() => {
    if (!port) {
      return;
    }
    port.onMessage.addListener((m) => {
      switch (m.event) {
        case Event.musics:
          setMusics(m.payload);
          break;
        case Event.index:
          setIndex(m.payload);
          break;
        case Event.totalTime:
          setTotalTime(m.payload);
          break;
        case Event.currentTime:
          setCurrentTime(m.payload);
          break;
        case Event.status:
          setPlaying(m.payload === Status.play);
          break;
        case Event.volume:
          setVolume(m.payload);
          break;
      }
    });
    port.postMessage({ event: Event.ping });
  }, [port]);
  useAsyncEffect(async () => {
    if (shouldPrompt) {
      return;
    }
    const directory = await get<FileSystemDirectoryHandle>('handle');
    if (!directory || await directory.queryPermission({ mode: 'read' }) !== 'granted') {
      setShouldPrompt(true);
      return;
    }
    port?.postMessage({ event: Event.granted });
  }, [shouldPrompt]);
  const changeTime = (time: number, isDelta?: boolean) => () => {
    setCurrentTime((prevTime) => {
      if (isDelta) {
        time += prevTime;
      }
      time = Math.min(Math.max(time, 0), totalTime);
      port?.postMessage({ event: Event.currentTime, payload: time });
      return time;
    });
  };
  const changeIndex = (index: number, isDelta?: boolean) => () => {
    setIndex((prevIndex) => {
      if (isDelta) {
        if (prevIndex === undefined) {
          return undefined;
        }
        index += prevIndex;
      }
      port?.postMessage({ event: Event.index, payload: index });
      return index;
    });
  };
  const changeVolume = (volume: number) => {
    port?.postMessage({ event: Event.volume, payload: volume });
    setVolume(volume);
    setMuted(false);
  };
  const toggleStatus = () => {
    setPlaying((prevPlaying) => {
      port?.postMessage({ event: Event.status, payload: prevPlaying ? Status.pause : Status.play });
      return !prevPlaying;
    });
  };
  const toggleMuted = () => {
    setMuted((prevMuted) => {
      port?.postMessage({ event: Event.volume, payload: prevMuted ? volume : 0 });
      return !prevMuted;
    });
  };
  const disabled = index === undefined;
  return (
    <>
      <Snackbar open={shouldPrompt} autoHideDuration={null}>
        <Alert
          severity='info'
          classes={{
            root: classes.alert,
            action: classes.alertAction,
          }}
          action={
            <Button size='small' onClick={async () => {
              const directory = await get<FileSystemDirectoryHandle>('handle');
              if (directory) {
                await directory.requestPermission({ mode: 'read' });
              } else {
                await set('handle', await window.showDirectoryPicker());
              }
              setShouldPrompt(false);
            }}>
              load
            </Button>
          }
        >
          Permission is required for native filesystem access
        </Alert>
      </Snackbar>
      <Grid container direction='column' wrap='nowrap' height='100vh' overflow='hidden'>
        <Grid container item minHeight={0} height='100%'>
          <Grid item xs={9} height='100%' overflow='auto'>
            <List>
              {musics.map(({ name }, index) => (
                <ListItem button key={index} onClick={changeIndex(index)}>{name}</ListItem>
              ))}
            </List>
          </Grid>
          <LyricPanel />
        </Grid>
        <Grid container item alignItems='center'>
          <Grid item>
            <IconButton disabled={!index} onClick={changeIndex(-1, true)}>
              <SkipPrevious />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton disabled={disabled} onClick={changeTime(currentTime - 10)}>
              <Replay10 />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton disabled={disabled} onClick={toggleStatus}>
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton disabled={disabled} onClick={changeTime(currentTime + 10)}>
              <Forward10 />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton disabled={disabled || index === musics.length - 1} onClick={changeIndex(1, true)}>
              <SkipNext />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={toggleMuted}>
              {muted || !volume ? <VolumeMute /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
            </IconButton>
          </Grid>
          <Grid item container xs={1} p={1}>
            <Slider
              value={muted ? 0 : volume}
              min={0}
              max={1}
              step={0.05}
              onChange={(_, value) => !Array.isArray(value) && changeVolume(value)}
              valueLabelDisplay='auto'
              valueLabelFormat={(i) => ~~(i * 100)}
            />
          </Grid>
          <Grid item container xs p={1}>
            <Slider
              disabled={disabled}
              value={currentTime}
              min={0}
              max={totalTime}
              onChange={(event, value) => event instanceof MouseEvent && !Array.isArray(value) && changeTime(value)()}
              valueLabelDisplay='auto'
              valueLabelFormat={(i) =>
                `${(~~(i / 60)).toString().padStart(2, '0')}:${(~~i % 60).toString().padStart(2, '0')}`
              }
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
