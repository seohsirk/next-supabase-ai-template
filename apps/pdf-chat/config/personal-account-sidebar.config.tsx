import {Book, CreditCard, User} from 'lucide-react';

import { SidebarConfigSchema } from '@kit/ui/sidebar-schema';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

const iconClasses = 'w-4';

const routes = [
  {
    label: 'documents:documentsTabLabel',
    path: pathsConfig.app.home,
    Icon: <Book className={iconClasses} />,
    end: true,
  },
  {
    label: 'account:accountTabLabel',
    path: pathsConfig.app.personalAccountSettings,
    Icon: <User className={iconClasses} />,
  },
];

if (featureFlagsConfig.enablePersonalAccountBilling) {
  routes.push({
    label: 'common:billingTabLabel',
    path: pathsConfig.app.personalAccountBilling,
    Icon: <CreditCard className={iconClasses} />,
  });
}

export const personalAccountSidebarConfig = SidebarConfigSchema.parse({
  routes,
});
