import React from 'react';
import { render } from 'react-dom';

import { Content } from './views/Content';

const root = document.createElement('div');

document.body.append(root);
render(<Content />, root);
