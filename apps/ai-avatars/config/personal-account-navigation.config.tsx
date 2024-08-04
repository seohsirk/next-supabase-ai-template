import { CreditCard, Home, ImageIcon, User } from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'Models',
    path: pathsConfig.app.home,
    Icon: <Home className={iconClasses} />,
  },
  {
    label: 'Avatars',
    path: '/home/avatars',
    Icon: <ImageIcon className={iconClasses} />,
  },
  {
    label: 'common:routes.account',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <User className={iconClasses} />,
  },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    label: 'common:routes.billing',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
});
