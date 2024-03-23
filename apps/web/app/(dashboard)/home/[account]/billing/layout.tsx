import { notFound } from 'next/navigation';

import featureFlagsConfig from '~/config/feature-flags.config';

function OrganizationAccountBillingLayout(props: React.PropsWithChildren) {
  const isEnabled = featureFlagsConfig.enableOrganizationBilling;

  if (!isEnabled) {
    notFound();
  }

  return <>{props.children}</>;
}

export default OrganizationAccountBillingLayout;
