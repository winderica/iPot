import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Grid,
  IconButton,
  List,
  ListItem,
  Slider,
  Snackbar,
  Typography,
} from '@material-ui/core';
import {
  Forward10,
  Pause,
  PlayArrow,
  Replay10,
  SkipNext,
  SkipPrevious,
  VolumeMute,
  VolumeUp,
} from '@material-ui/icons';
import { get, set } from 'idb-keyval';
import React, { FC, useEffect, useReducer, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event, Status } from '../constants/enums';
import { Port } from '../constants/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { useStyles } from '../styles/options';
import { Lyric, parseLrc } from '../utils/lrc';

const port: Port = browser.runtime.connect();

interface Music {
  name: string;
  musicFile: FileSystemFileHandle;
  lyricFile?: FileSystemFileHandle;
}

export const Options: FC = () => {
  const lyricContainer = useRef<HTMLDivElement>(null);
  const [musics, setMusics] = useState<Music[]>([]);
  const [index, setIndex] = useReducer((prevIndex: number, [index, isDelta]: [number, boolean?]) => {
    if (isDelta) {
      index = prevIndex + index;
    }
    return musics[index] ? index : -1;
  }, -1);
  const [playing, setPlaying] = useState(false);
  const [lyric, setLyric] = useState<Lyric>();
  const [shouldPrompt, setShouldPrompt] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(Infinity);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const classes = useStyles();
  const [, setHighlighted] = useReducer((prevHighlighted: number, time: number) => {
    if (!lyricContainer.current) {
      return -1;
    }
    const lines = lyricContainer.current.children as unknown as HTMLElement[];
    const a = +(lines[prevHighlighted]?.dataset.time ?? Infinity);
    const b = +(lines[prevHighlighted + 1]?.dataset.time ?? Infinity);
    let l = Math.max(a <= time ? prevHighlighted : 0, 0);
    let r = Math.min(time < b ? prevHighlighted + 1 : Infinity, lines.length - 1);
    while (l < r) {
      const m = Math.ceil((l + r) / 2);
      if (+lines[m].dataset.time! <= time) {
        l = m;
      } else {
        r = m - 1;
      }
    }
    if (l === prevHighlighted) {
      return l;
    }
    lines[prevHighlighted]?.classList.remove(classes.highlighted);
    if (lines[l] && +lines[l].dataset.time! <= time) {
      lines[l].classList.add(classes.highlighted);
      lines[l].scrollIntoView({ behavior: 'smooth', block: 'center' });
      return l;
    }
    return -1;
  }, -1);
  useEffect(() => {
    port.onMessage.addListener((m) => {
      switch (m.event) {
        case Event.totalTime:
          setTotalTime(m.payload);
          break;
        case Event.currentTime:
          setCurrentTime(m.payload);
          setHighlighted(m.payload * 1000);
          break;
        case Event.status:
          switch (m.payload) {
            case Status.playing:
              setPlaying(true);
              break;
            case Status.paused:
              setPlaying(false);
              break;
            case Status.ended:
              setPlaying(false);
              setIndex([1, true]);
          }
          break;
        case Event.volume:
          setVolume(m.payload);
          break;
      }
    });
    port.postMessage({
      event: Event.ping,
    });
  }, []);
  useAsyncEffect(async () => {
    const directory = await get<FileSystemDirectoryHandle>('handle');
    if (!directory || await directory.queryPermission({ mode: 'read' }) !== 'granted') {
      setShouldPrompt(true);
      return;
    }
    const musics: Record<string, FileSystemFileHandle> = {};
    const lyrics: Record<string, FileSystemFileHandle> = {};
    for await (const [filename, handle] of directory.entries()) {
      if (handle.kind === 'directory') {
        continue;
      }
      const name = filename.slice(0, filename.lastIndexOf('.'));
      if (filename.endsWith('.lrc')) {
        lyrics[name] = handle;
      } else {
        musics[name] = handle;
      }
    }
    setMusics(Object.entries(musics).map(([name, musicFile]) => ({
      name,
      musicFile,
      lyricFile: lyrics[name],
    })));
    port.postMessage({
      event: Event.parse,
    });
  }, [shouldPrompt]);
  useAsyncEffect(async () => {
    if (!musics[index]) {
      return;
    }
    const { lyricFile, musicFile } = musics[index];
    setLyric(lyricFile ? parseLrc(await (await lyricFile.getFile()).text()) : undefined);
    port.postMessage({
      event: Event.load,
      payload: URL.createObjectURL(await musicFile.getFile()),
    });
    lyricContainer.current?.children[0]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [musics, index]);
  const changeTime = (time: number, isDelta?: boolean) => {
    setCurrentTime((prevTime) => {
      if (isDelta) {
        time = prevTime + time;
      }
      time = Math.min(Math.max(time, 0), totalTime);
      port.postMessage({
        event: Event.currentTime,
        payload: time,
      });
      return time;
    });
  };
  const changeVolume = (volume: number) => {
    setVolume(() => {
      port.postMessage({
        event: Event.volume,
        payload: volume,
      });
      return volume;
    });
    setMuted(false);
  };
  const toggleStatus = () => {
    index >= 0 && setPlaying((prevPlaying) => {
      port.postMessage({ event: prevPlaying ? Event.pause : Event.play });
      return !prevPlaying;
    });
  };
  const toggleMuted = () => {
    setMuted((prevMuted) => {
      port.postMessage({
        event: Event.volume,
        payload: prevMuted ? volume : 0,
      });
      return !prevMuted;
    });
  };
  return (
    <>
      <CssBaseline />
      <Snackbar open={shouldPrompt} autoHideDuration={null}>
        <Alert severity='info' action={<Button onClick={async () => {
          const directory = await get<FileSystemDirectoryHandle>('handle');
          if (directory) {
            await directory.requestPermission({ mode: 'read' });
          } else {
            await set('handle', await window.showDirectoryPicker());
          }
          setShouldPrompt(false);
        }}>load</Button>}>load</Alert>
      </Snackbar>
      <Grid container direction='column' wrap='nowrap' height='100vh' overflow='hidden'>
        <Grid container item minHeight={0} height='100%'>
          <Grid item xs={9} height='100%' overflow='auto'>
            <List>
              {musics.map((music, index) => (
                <ListItem button key={index} onClick={() => setIndex([index])}>{music.name}</ListItem>
              ))}
            </List>
          </Grid>
          <Grid item xs={3} height='100%' overflow='hidden'>
            <Box ref={lyricContainer} py='50vh'>
              {lyric?.lines.map(({ content, words }, i) => (
                <Typography key={i} align='center' data-time={words[0].time}>{content}</Typography>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Grid container item alignItems='center'>
          <Grid item>
            <IconButton onClick={() => setIndex([-1, true])}>
              <SkipPrevious />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => changeTime(currentTime - 10)}>
              <Replay10 />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={toggleStatus}>
              {playing ? <Pause /> : <PlayArrow />}
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => changeTime(currentTime + 10)}>
              <Forward10 />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={() => setIndex([1, true])}>
              <SkipNext />
            </IconButton>
          </Grid>
          <Grid item>
            <IconButton onClick={toggleMuted}>
              {muted || !volume ? <VolumeMute /> : <VolumeUp />}
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
            />
          </Grid>
          <Grid item container xs p={1}>
            <Slider
              value={currentTime}
              min={0}
              max={totalTime}
              onChange={(_, value) => !Array.isArray(value) && changeTime(value)}
              valueLabelDisplay='auto'
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
