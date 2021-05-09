import React, { StrictMode } from 'react';
import { render } from 'react-dom';

import { Popup } from '@views/popup';

render(<StrictMode><Popup /></StrictMode>, document.querySelector('#popup'));
