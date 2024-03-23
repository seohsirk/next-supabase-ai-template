import {
  CreditCardIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';
import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { SidebarConfigSchema } from '@kit/ui/sidebar-schema';

const iconClasses = 'w-4';

const routes = (account: string) => [
  {
    label: 'common:dashboardTabLabel',
    path: pathsConfig.app.accountHome.replace('[account]', account),
    Icon: <LayoutDashboardIcon className={iconClasses} />,
    end: true,
  },
  {
    label: 'common:settingsTabLabel',
    collapsible: false,
    children: [
      {
        label: 'common:settingsTabLabel',
        path: createPath(pathsConfig.app.accountSettings, account),
        Icon: <SettingsIcon className={iconClasses} />,
      },
      {
        label: 'common:accountMembers',
        path: createPath(pathsConfig.app.accountMembers, account),
        Icon: <UsersIcon className={iconClasses} />,
      },
      featureFlagsConfig.enableOrganizationBilling
        ? {
            label: 'common:billingTabLabel',
            path: createPath(pathsConfig.app.accountBilling, account),
            Icon: <CreditCardIcon className={iconClasses} />,
          }
        : undefined,
    ].filter(Boolean),
  },
];

export function getOrganizationAccountSidebarConfig(account: string) {
  return SidebarConfigSchema.parse({
    routes: routes(account),
  });
}

function createPath(path: string, account: string) {
  return path.replace('[account]', account);
}
