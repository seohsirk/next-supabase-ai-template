import { PricingTable } from '@kit/billing-gateway/components';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export const generateMetadata = async () => {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:pricing'),
  };
};

async function PricingPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div className={'container mx-auto mt-8 flex flex-col space-y-12'}>
      <SitePageHeader
        title={t('marketing:pricing')}
        subtitle={t('marketing:pricingSubtitle')}
      />

      <PricingTable paths={pathsConfig.auth} config={billingConfig} />
    </div>
  );
}

export default withI18n(PricingPage);
