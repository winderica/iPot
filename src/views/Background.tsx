import React, { FC, useEffect, useRef, useState } from 'react';
import { browser, Runtime } from 'webextension-polyfill-ts';

import { usePrevious } from '../hooks/usePrevious';

export const Background: FC = () => {
  const ref = useRef<HTMLAudioElement>(null);
  const [src, setSrc] = useState<string>();
  const prevSrc = usePrevious(src);
  const [port, setPort] = useState<Runtime.Port>();
  useEffect(() => {
    browser.runtime.onConnect.addListener((port) => {
      setPort(port);
      port.onMessage.addListener(async ({ event, payload }) => {
        if (!ref.current) {
          return;
        }
        switch (event) {
        case 'ping':
          port.postMessage({
            event: 'status',
            payload: ref.current.paused ? 'paused' : 'playing',
          });
          port.postMessage({
            event: 'totalTime',
            payload: ref.current.duration,
          });
          port.postMessage({
            event: 'currentTime',
            payload: ref.current.currentTime,
          });
          port.postMessage({
            event: 'volume',
            payload: ref.current.volume,
          });
          break;
        case 'load':
          prevSrc && URL.revokeObjectURL(prevSrc);
          setSrc(payload);
          await ref.current.play();
          break;
        case 'parse':
          // for await (const [name, handle] of (await get<FileSystemDirectoryHandle>('handle'))!.entries()) {
          //   if (handle.kind === 'directory') {
          //     continue;
          //   }
          //   if (name.endsWith('.mp3')) {
          //     await parseBlob(await handle.getFile());
          //   }
          // }
          break;
        case 'currentTime':
          ref.current.currentTime = payload;
          break;
        case 'play':
          await ref.current.play();
          break;
        case 'pause':
          ref.current.pause();
          break;
        case 'volume':
          ref.current.volume = payload;
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
        event: 'status',
        payload: 'playing',
      }))}
      onPause={() => port?.postMessage({
        event: 'status',
        payload: 'paused',
      })}
      onEnded={() => port?.postMessage({
        event: 'status',
        payload: 'ended',
      })}
      onDurationChange={(event) => port?.postMessage({
        event: 'totalTime',
        payload: event.currentTarget.duration,
      })}
      onTimeUpdate={(event) => port?.postMessage({
        event: 'currentTime',
        payload: event.currentTarget.currentTime,
      })}
    />
  );
};
