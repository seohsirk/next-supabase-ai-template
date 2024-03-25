import { PricingTable } from '@kit/billing/components/pricing-table';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

export const metadata = {
  title: 'Pricing',
};

function PricingPage() {
  return (
    <div className={'container mx-auto'}>
      <div className={'my-8 flex flex-col space-y-16'}>
        <SitePageHeader
          title={'Pricing'}
          subtitle={'Our pricing is designed to scale with your business.'}
        />
      </div>

      <PricingTable paths={pathsConfig.auth} config={billingConfig} />
    </div>
  );
}

export default withI18n(PricingPage);
