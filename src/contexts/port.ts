import { createContext } from 'react';

import { Port } from '@constants/types';

export const PortContext = createContext<Port | undefined>(undefined);
