import { CreditCard, User, Book } from 'lucide-react';

import { NavigationConfigSchema } from '@kit/ui/navigation-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:routes.application',
    children: [
      {
        label: 'documents:documentsTabLabel',
        path: pathsConfig.app.home,
        Icon: <Book className={iconClasses} />,
        end: true,
      },
    ],
  },
  {
    label: 'common:routes.settings',
    children: [
      {
        label: 'common:routes.profile',
        path: pathsConfig.app.personalAccountSettings,
        Icon: <User className={iconClasses} />,
      },
      featureFlagsConfig.enablePersonalAccountBilling
        ? {
            label: 'common:routes.billing',
            path: pathsConfig.app.personalAccountBilling,
            Icon: <CreditCard className={iconClasses} />,
          }
        : undefined,
    ].filter((route) => !!route),
  },
] satisfies z.infer<typeof NavigationConfigSchema>['routes'];

export const personalAccountNavigationConfig = NavigationConfigSchema.parse({
  routes,
  style: process.env.NEXT_PUBLIC_USER_NAVIGATION_STYLE,
  sidebarCollapsed: process.env.NEXT_PUBLIC_HOME_SIDEBAR_COLLAPSED,
});
