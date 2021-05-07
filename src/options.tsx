import React, { StrictMode } from 'react';
import { render } from 'react-dom';

import { Options } from './views/Options';

render(<StrictMode><Options /></StrictMode>, document.querySelector('#options'));
