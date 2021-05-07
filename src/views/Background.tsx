import React, { FC, useEffect, useRef, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event, Status } from '../constants/enums';
import { Port } from '../constants/types';
import { usePrevious } from '../hooks/usePrevious';

export const Background: FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState<string>();
  const prevSrc = usePrevious(src);
  const [port, setPort] = useState<Port>();
  useEffect(() => {
    browser.runtime.onConnect.addListener((port: Port) => {
      setPort(port);
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
          case Event.load:
            prevSrc && URL.revokeObjectURL(prevSrc);
            setSrc(m.payload);
            await ref.current.play();
            break;
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
        setPort(undefined);
      });
    });
  }, []);
  return (
    <audio
      src={src}
      ref={ref}
      onPlay={() => port?.postMessage(({
        event: Event.status,
        payload: Status.playing,
      }))}
      onPause={() => port?.postMessage({
        event: Event.status,
        payload: Status.paused,
      })}
      onEnded={() => port?.postMessage({
        event: Event.status,
        payload: Status.ended,
      })}
      onDurationChange={(event) => port?.postMessage({
        event: Event.totalTime,
        payload: event.currentTarget.duration,
      })}
      onTimeUpdate={(event) => port?.postMessage({
        event: Event.currentTime,
        payload: event.currentTarget.currentTime,
      })}
    />
  );
};
