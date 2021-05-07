import React, { StrictMode } from 'react';
import { render } from 'react-dom';
import { browser } from 'webextension-polyfill-ts';

import { Background } from './views/Background';

browser.runtime.onInstalled.addListener(async () => {
  await browser.tabs.create({ url: browser.runtime.getURL('pages/options.html'), active: false });
});

render(<StrictMode><Background /></StrictMode>, document.querySelector('#background'));
