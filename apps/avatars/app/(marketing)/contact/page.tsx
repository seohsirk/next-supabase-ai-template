import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing.contact'),
  };
}

async function ContactPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div className={'mt-8'}>
      <div className={'container mx-auto'}>
        <SitePageHeader title={t(`marketing:contact`)} subtitle={``} />
      </div>
    </div>
  );
}

export default withI18n(ContactPage);
