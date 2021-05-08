import { get } from 'idb-keyval';
import React, { FC, useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event, Status } from '../constants/enums';
import { Lyric, Message, Music, Port } from '../constants/types';
import { useAsyncEffect } from '../hooks/useAsyncEffect';
import { usePrevious } from '../hooks/usePrevious';
import { parseLrc } from '../utils/parseLrc';

type MessageMap = {
  [P in Message['event']]: Extract<Message, { event: P }>['payload']
};

const sendMultiple = <E extends keyof MessageMap>(ports: Iterable<Port>, event: E, payload: MessageMap[E]) => {
  for (const port of ports) {
    // if (!port.sender?.tab?.active) {
    //   continue;
    // }
    port.postMessage({ event, payload } as Message);
  }
};

export const Background: FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [musics, setMusics] = useState<Music[]>([]);
  const [lyric, setLyric] = useState<Lyric>();
  const [lineNumber, setLineNumber] = useState(-1);
  const [src, setSrc] = useState<string>();
  const [index, setIndex] = useState<number>();
  const [ports, setPorts] = useState(new Set<Port>());
  const prevPorts = usePrevious(ports, new Set());
  useEffect(() => {
    browser.runtime.onConnect.addListener((port: Port) => {
      setPorts((prevPorts) => {
        const newPorts = new Set(prevPorts);
        newPorts.add(port);
        return newPorts;
      });
      port.onMessage.addListener(async (m) => {
        if (!ref.current) {
          return;
        }
        switch (m.event) {
          case Event.index:
            setIndex(m.payload);
            break;
          case Event.currentTime:
            ref.current.currentTime = m.payload;
            break;
          case Event.status:
            m.payload === Status.play ? await ref.current.play() : ref.current.pause();
            break;
          case Event.volume:
            ref.current.volume = m.payload;
            break;
          case Event.granted: {
            if (ref.current.src) {
              break;
            }
            const directory = await get<FileSystemDirectoryHandle>('handle');
            const musics: Record<string, FileSystemFileHandle> = {};
            const lyrics: Record<string, FileSystemFileHandle> = {};
            for await (const [filename, handle] of directory!.entries()) {
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
          }
        }
      });
      port.onDisconnect.addListener(() => {
        setPorts((prevPorts) => {
          const newPorts = new Set(prevPorts);
          newPorts.delete(port);
          return newPorts;
        });
      });
    });
  }, []);
  useEffect(() => {
    if (prevPorts.size >= ports.size || !ref.current) {
      return;
    }
    const newPorts = [...ports].filter((port) => !prevPorts.has(port));
    sendMultiple(newPorts, Event.status, ref.current.paused ? Status.pause : Status.play);
    sendMultiple(newPorts, Event.totalTime, ref.current.duration);
    sendMultiple(newPorts, Event.currentTime, ref.current.currentTime);
    sendMultiple(newPorts, Event.volume, ref.current.volume);
    sendMultiple(newPorts, Event.lineNumber, lineNumber);
    sendMultiple(newPorts, Event.lyric, lyric);
    sendMultiple(newPorts, Event.musics, musics);
    sendMultiple(newPorts, Event.index, index);
  }, [ports]);
  useEffect(() => sendMultiple(ports, Event.lyric, lyric), [lyric]);
  useEffect(() => sendMultiple(ports, Event.lineNumber, lineNumber), [lineNumber]);
  useEffect(() => sendMultiple(ports, Event.musics, musics), [musics]);
  useAsyncEffect(async () => {
    sendMultiple(ports, Event.index, index);
    if (index === undefined) {
      setSrc((prevSrc) => {
        prevSrc && URL.revokeObjectURL(prevSrc);
        return undefined;
      });
      setLyric(undefined);
      ref.current && (ref.current.currentTime = 0);
    } else {
      const { musicFile, lyricFile } = musics[index];
      const music = await musicFile.getFile();
      setSrc((prevSrc) => {
        prevSrc && URL.revokeObjectURL(prevSrc);
        return URL.createObjectURL(music);
      });
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
      onPlay={() => sendMultiple(ports, Event.status, Status.play)}
      onPause={() => sendMultiple(ports, Event.status, Status.pause)}
      onEnded={() => setIndex((prevIndex) => {
        return prevIndex === undefined || prevIndex + 1 >= musics.length ? undefined : prevIndex + 1;
      })}
      onDurationChange={({ currentTarget: { duration } }) => sendMultiple(ports, Event.totalTime, duration)}
      onTimeUpdate={({ currentTarget: { currentTime } }) => {
        updateLineNumber(currentTime * 1000);
        sendMultiple(ports, Event.currentTime, currentTime);
      }}
    />
  );
};
