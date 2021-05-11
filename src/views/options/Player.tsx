import { Alert, Button, Grid, IconButton, List, ListItem, Snackbar } from '@material-ui/core';
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

import { sendOne } from '@apis/index';
import { LyricPanel } from '@components/LyricPanel';
import { ProgressBar } from '@components/ProgressBar';
import { SettingsControls } from '@components/SettingsControls';
import { VolumeBar } from '@components/VolumeBar';
import { Event } from '@constants/enums';
import { Lyric, MessageHandler, MusicMetadata } from '@constants/types';
import { PortContext } from '@contexts/port';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { useStyles } from '@styles/options';

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
  const [lyric, setLyric] = useState<Lyric>();
  const [lineNumber, setLineNumber] = useState(-1);
  const classes = useStyles();
  useEffect(() => {
    if (!port) {
      return;
    }
    const handleMessage: MessageHandler = (m) => {
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
        case Event.playing:
          setPlaying(m.payload);
          break;
        case Event.muted:
          setMuted(m.payload);
          break;
        case Event.volume:
          setVolume(m.payload);
          break;
        case Event.lyric:
          setLyric(m.payload);
          break;
        case Event.lineNumber:
          setLineNumber(m.payload);
          break;
      }
    };
    port.onMessage.addListener(handleMessage);
    sendOne(port, Event.hello, undefined);
    return () => port.onMessage.removeListener(handleMessage);
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
    port && sendOne(port, Event.granted, undefined);
  }, [shouldPrompt]);
  if (!port) {
    return null;
  }
  const commitTime = (time: number) => sendOne(port, Event.currentTime, time);
  const changeIndex = (index: number) => () => sendOne(port, Event.index, index);
  const commitVolume = (volume: number) => sendOne(port, Event.volume, volume);
  const commitMuted = (muted: boolean) => sendOne(port, Event.muted, muted);
  const toggleStatus = () => sendOne(port, Event.playing, !playing);
  const disabled = index === undefined;
  return (
    <>
      <Snackbar
        open={shouldPrompt}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        autoHideDuration={null}
      >
        <Alert
          severity='info'
          classes={{
            root: classes.alert,
            action: classes.alertAction,
          }}
          action={
            <Button
              size='small'
              onClick={async () => {
                const directory = await get<FileSystemDirectoryHandle>('handle');
                if (directory) {
                  await directory.requestPermission({ mode: 'read' });
                } else {
                  await set('handle', await window.showDirectoryPicker());
                }
                setShouldPrompt(false);
              }}
            >
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
              {musics.map(({ name }, i) => (
                <ListItem button key={i} selected={index === i} onClick={changeIndex(i)}>{name}</ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={3} height='100%' overflow='hidden'>
            <LyricPanel lyric={lyric} lineNumber={lineNumber} />
          </Grid>
        </Grid>
        <Grid container item alignItems='center'>
          <Grid item>
            <IconButton disabled={!index} onClick={changeIndex(index! - 1)}>
              <SkipPrevious />
            </IconButton>
            <IconButton disabled={disabled} onClick={() => commitTime(currentTime - 10)}>
              <Replay10 />
            </IconButton>
            <IconButton disabled={disabled} onClick={toggleStatus}>
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
            <IconButton disabled={disabled} onClick={() => commitTime(currentTime + 10)}>
              <Forward10 />
            </IconButton>
            <IconButton disabled={disabled || index === musics.length - 1} onClick={changeIndex(index! + 1)}>
              <SkipNext />
            </IconButton>
            <IconButton onClick={() => commitMuted(!muted)}>
              {muted || !volume ? <VolumeMute /> : volume < 0.5 ? <VolumeDown /> : <VolumeUp />}
            </IconButton>
          </Grid>
          <Grid container item xs={1} mr={1}>
            <VolumeBar volume={volume} muted={muted} onVolumeChange={commitVolume} onMutedChange={commitMuted} />
          </Grid>
          <Grid container item xs ml={1}>
            <ProgressBar currentTime={currentTime} totalTime={totalTime} disabled={disabled} onChange={commitTime} />
          </Grid>
          <Grid item>
            <SettingsControls items={[]} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
