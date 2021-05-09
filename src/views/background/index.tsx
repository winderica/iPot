import { get } from 'idb-keyval';
import React, { FC, useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event, Status } from '@constants/enums';
import { Lyric, Message, Music, Port } from '@constants/types';
import { useAsyncEffect } from '@hooks/useAsyncEffect';
import { parseLrc } from '@utils/parseLrc';

type MessageMap = {
  [P in Message['event']]: Extract<Message, { event: P }>['payload'];
};

const sendOne = <E extends keyof MessageMap>(port: Port, event: E, payload: MessageMap[E]) => {
  port.postMessage({ event, payload } as Message);
};

const sendMultiple = <E extends keyof MessageMap>(ports: Iterable<Port>, event: E, payload: MessageMap[E]) => {
  for (const port of ports) {
    sendOne(port, event, payload);
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
  const [newPort, setNewPort] = useState<Port>();
  useEffect(() => {
    browser.runtime.onConnect.addListener((port: Port) => {
      setNewPort(port);
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
    newPort?.onMessage.addListener((m) => {
      if (m.event === Event.ping && ref.current) {
        sendOne(newPort, Event.status, ref.current.paused ? Status.pause : Status.play);
        sendOne(newPort, Event.totalTime, ref.current.duration);
        sendOne(newPort, Event.currentTime, ref.current.currentTime);
        sendOne(newPort, Event.volume, ref.current.volume);
        sendOne(newPort, Event.lineNumber, lineNumber);
        sendOne(newPort, Event.lyric, lyric);
        sendOne(newPort, Event.musics, musics);
        sendOne(newPort, Event.index, index);
      }
    });
  }, [newPort]);
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
