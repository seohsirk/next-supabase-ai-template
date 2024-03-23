'use client';

import { useRouter } from 'next/navigation';

import featureFlagsConfig from '~/config/feature-flags.config';
import pathsConfig from '~/config/paths.config';

import { AccountSelector } from '@kit/accounts/account-selector';

const features = {
  enableOrganizationAccounts: featureFlagsConfig.enableOrganizationAccounts,
  enableOrganizationCreation: featureFlagsConfig.enableOrganizationCreation,
};

export function HomeSidebarAccountSelector(props: {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image: string | null;
  }>;

  collapsed: boolean;
}) {
  const router = useRouter();

  return (
    <AccountSelector
      collapsed={props.collapsed}
      accounts={props.accounts}
      features={features}
      onAccountChange={(value) => {
        if (value) {
          const path = pathsConfig.app.accountHome.replace('[account]', value);
          router.replace(path);
        }
      }}
    />
  );
}
