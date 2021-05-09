import React from 'react';
import { render } from 'react-dom';

import { Content } from '@views/content';

const root = document.createElement('div');

document.body.append(root);
render(<Content />, root);
