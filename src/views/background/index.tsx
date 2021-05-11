import { get } from 'idb-keyval';
import React, { FC, useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { sendMultiple, sendOne } from '@apis/index';
import { SUPPORTED_AUDIO_FORMATS, SUPPORTED_LYRIC_FORMATS } from '@constants/consts';
import { Event } from '@constants/enums';
import { Lyric, Music, Port } from '@constants/types';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { parseLrc } from '@utils/parseLrc';

export const Background: FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [musics, setMusics] = useState<Music[]>([]);
  const [lyric, setLyric] = useState<Lyric>();
  const [lineNumber, setLineNumber] = useState(-1);
  const [src, setSrc] = useState<string>();
  const [index, setIndex] = useState<number>();
  const [activePorts, setActivePorts] = useState(new Set<Port>());
  const [newPort, setNewPort] = useState<Port>();
  useEffect(() => {
    browser.runtime.onConnect.addListener((port: Port) => {
      port.onMessage.addListener(async (m) => {
        switch (m.event) {
          case Event.hello:
            setNewPort(port);
            setActivePorts((prevPorts) => new Set(prevPorts).add(port));
            break;
          case Event.goodbye:
            setActivePorts((prevPorts) => {
              const newPorts = new Set(prevPorts);
              newPorts.delete(port);
              return newPorts;
            });
            break;
          case Event.index:
            setIndex(m.payload);
            break;
          case Event.currentTime:
            ref.current && (ref.current.currentTime = m.payload);
            break;
          case Event.playing:
            m.payload ? await ref.current?.play() : ref.current?.pause();
            break;
          case Event.volume:
            ref.current && (ref.current.volume = m.payload);
            break;
          case Event.muted:
            ref.current && (ref.current.muted = m.payload);
            break;
          case Event.granted: {
            if (ref.current?.src) {
              break;
            }
            const directory = await get<FileSystemDirectoryHandle>('handle');
            const musics: Record<string, FileSystemFileHandle> = {};
            const lyrics: Record<string, FileSystemFileHandle> = {};
            for await (const [filename, handle] of directory!.entries()) {
              if (handle.kind === 'directory') {
                continue;
              }
              const dot = filename.lastIndexOf('.');
              const name = filename.slice(0, dot);
              const extension = filename.slice(dot + 1);
              if (SUPPORTED_LYRIC_FORMATS.has(extension)) {
                lyrics[name] = handle;
              }
              if (SUPPORTED_AUDIO_FORMATS.has(extension)) {
                musics[name] = handle;
              }
            }
            setMusics(Object.entries(musics).map(([name, musicFile]) => ({
              name,
              musicFile,
              lyricFile: lyrics[name],
            })));
          }
        }
      });
    });
  }, []);
  useEffect(() => {
    if (newPort && ref.current) {
      sendOne(newPort, Event.playing, !ref.current.paused);
      sendOne(newPort, Event.totalTime, ref.current.duration);
      sendOne(newPort, Event.currentTime, ref.current.currentTime);
      sendOne(newPort, Event.volume, ref.current.volume);
      sendOne(newPort, Event.muted, ref.current.muted);
      sendOne(newPort, Event.lyric, lyric);
      sendOne(newPort, Event.lineNumber, lineNumber);
      sendOne(newPort, Event.musics, musics);
      sendOne(newPort, Event.index, index);
    }
  }, [newPort]);
  useEffect(() => sendMultiple(activePorts, Event.lyric, lyric), [lyric]);
  useEffect(() => sendMultiple(activePorts, Event.lineNumber, lineNumber), [lineNumber]);
  useEffect(() => sendMultiple(activePorts, Event.musics, musics), [musics]);
  useAsyncEffect(async () => {
    sendMultiple(activePorts, Event.index, index);
    setSrc((prevSrc) => {
      prevSrc && URL.revokeObjectURL(prevSrc);
      return undefined;
    });
    setLyric(undefined);
    if (index) {
      const { musicFile, lyricFile } = musics[index];
      setSrc(URL.createObjectURL(await musicFile.getFile()));
      setLyric(lyricFile ? parseLrc(await (await lyricFile.getFile()).text()) : undefined);
      await ref.current?.play();
    }
  }, [index]);
  const updateLineNumber = (time: number) => {
    setLineNumber((prevLine) => {
      if (!lyric) {
        return -1;
      }
      const times = lyric.lines.map(({ words }) => words[0].time);
      let l = times[prevLine] <= time ? prevLine : 0;
      let r = Math.min(time < (times[prevLine + 1] ?? Infinity) ? prevLine + 1 : Infinity, times.length - 1);
      while (l < r) {
        const m = Math.ceil((l + r) / 2);
        times[m] <= time ? (l = m) : (r = m - 1);
      }
      return times[l] <= time ? l : -1;
    });
  };
  return (
    <audio
      src={src}
      ref={ref}
      onPlay={() => sendMultiple(activePorts, Event.playing, true)}
      onPause={() => sendMultiple(activePorts, Event.playing, false)}
      onEnded={() => setIndex(index === undefined || index + 1 >= musics.length ? undefined : index + 1)}
      onDurationChange={({ currentTarget: { duration } }) => sendMultiple(activePorts, Event.totalTime, duration)}
      onTimeUpdate={({ currentTarget: { currentTime } }) => {
        updateLineNumber(currentTime * 1000);
        sendMultiple(activePorts, Event.currentTime, currentTime);
      }}
      onVolumeChange={({ currentTarget: { volume, muted } }) => {
        sendMultiple(activePorts, Event.volume, volume);
        sendMultiple(activePorts, Event.muted, muted);
      }}
    />
  );
};
