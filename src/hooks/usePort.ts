import { useEffect, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Event } from '@constants/enums';
import { Port } from '@constants/types';

export const usePort = () => {
  const [port, setPort] = useState<Port | undefined>(browser.runtime.connect());
  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        port?.postMessage({ event: Event.hello });
      } else {
        port?.postMessage({ event: Event.goodbye });
      }
    });
    port?.onDisconnect.addListener(() => {
      setPort(undefined);
    });
  }, []);
  return port;
};
