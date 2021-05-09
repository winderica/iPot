import { useEffect, useState } from 'react';
import { browser } from 'webextension-polyfill-ts';

import { Port } from '@constants/types';

export const usePort = () => {
  const [port, setPort] = useState<Port | undefined>(browser.runtime.connect());
  useEffect(() => {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setPort(browser.runtime.connect());
      } else {
        setPort((prevPort) => {
          prevPort?.disconnect();
          return undefined;
        });
      }
    });
  }, []);
  return port;
};
