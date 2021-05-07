import { get } from 'idb-keyval';
import React, { FC, useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event, Status } from '../constants/enums';
import { Music, Port } from '../constants/types';

export const Background: FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState<string>();
  const [, setPlaying] = useState<string>();
  const [ports, setPorts] = useState(new Set<Port>());
  useEffect(() => {
    browser.runtime.onConnect.addListener((port: Port) => {
      setPorts((prevPorts) => new Set(prevPorts.add(port)));
      port.onMessage.addListener(async (m) => {
        if (!ref.current) {
          return;
        }
        switch (m.event) {
          case Event.ping:
            port.postMessage({
              event: Event.status,
              payload: ref.current.paused ? Status.paused : Status.playing,
            });
            port.postMessage({
              event: Event.totalTime,
              payload: ref.current.duration,
            });
            port.postMessage({
              event: Event.currentTime,
              payload: ref.current.currentTime,
            });
            port.postMessage({
              event: Event.volume,
              payload: ref.current.volume,
            });
            break;
          case Event.load: {
            const last = await get<Music>('last');
            if (!last) {
              break;
            }
            const file = await last.musicFile.getFile();
            setPlaying((prevPlaying) => {
              if (last.name === prevPlaying) {
                return prevPlaying;
              }
              setSrc((prevSrc) => {
                prevSrc && URL.revokeObjectURL(prevSrc);
                return URL.createObjectURL(file);
              });
              return last.name;
            });
            await ref.current.play();
            break;
          }
          case Event.parse:
            // for await (const [name, handle] of (await get<FileSystemDirectoryHandle>('handle'))!.entries()) {
            //   if (handle.kind === 'directory') {
            //     continue;
            //   }
            //   if (name.endsWith('.mp3')) {
            //     await parseBlob(await handle.getFile());
            //   }
            // }
            break;
          case Event.currentTime:
            ref.current.currentTime = m.payload;
            break;
          case Event.play:
            await ref.current.play();
            break;
          case Event.pause:
            ref.current.pause();
            break;
          case Event.volume:
            ref.current.volume = m.payload;
            break;
        }
      });
      port.onDisconnect.addListener(() => {
        setPorts((prevPorts) => {
          prevPorts.delete(port);
          return new Set(prevPorts);
        });
      });
    });
  }, []);
  return (
    <audio
      src={src}
      ref={ref}
      onPlay={() => ports.forEach((port) => port.postMessage({
        event: Event.status,
        payload: Status.playing,
      }))}
      onPause={() => ports.forEach((port) => port.postMessage({
        event: Event.status,
        payload: Status.paused,
      }))}
      onEnded={() => ports.forEach((port) => port.postMessage({
        event: Event.status,
        payload: Status.ended,
      }))}
      onDurationChange={(event) => ports.forEach((port) => port.postMessage({
        event: Event.totalTime,
        payload: event.currentTarget.duration,
      }))}
      onTimeUpdate={(event) => ports.forEach((port) => port.postMessage({
        event: Event.currentTime,
        payload: event.currentTarget.currentTime,
      }))}
    />
  );
};
