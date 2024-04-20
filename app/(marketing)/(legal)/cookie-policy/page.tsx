import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { createI18nServerInstance } from '~/lib/i18n/i18n.server';
import { withI18n } from '~/lib/i18n/with-i18n';

export async function generateMetadata() {
  const { t } = await createI18nServerInstance();

  return {
    title: t('marketing:cookiePolicy'),
  };
}

async function CookiePolicyPage() {
  const { t } = await createI18nServerInstance();

  return (
    <div>
      <div className={'container mx-auto'}>
        <SitePageHeader
          title={t(`marketing:cookiePolicy`)}
          subtitle={`This is the cookie policy page. It's a great place to put information about the cookies your site uses.`}
        />
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
