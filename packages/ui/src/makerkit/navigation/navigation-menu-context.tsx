import { createContext } from 'react';

import type { NavigationMenuProps } from './navigation-menu';

export const NavigationMenuContext = createContext<NavigationMenuProps>({});
