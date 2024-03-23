import { CreditCardIcon, HomeIcon, UserIcon } from 'lucide-react';
import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { SidebarConfigSchema } from '@kit/ui/sidebar-schema';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'common:homeTabLabel',
    path: pathsConfig.app.home,
    Icon: <HomeIcon className={iconClasses} />,
    end: true,
  },
  {
    label: 'common:yourAccountTabLabel',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <UserIcon className={iconClasses} />,
  },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCardIcon className={iconClasses} />,
  });
}

export const personalAccountSidebarConfig = SidebarConfigSchema.parse({
  routes,
});
