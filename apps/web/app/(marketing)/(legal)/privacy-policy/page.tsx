import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

function PrivacyPolicyPage() {
  return (
    <div className={'mt-8'}>
      <div className={'container mx-auto'}>
        <SitePageHeader title={`Privacy Policy`} subtitle={``} />
      </div>
    </div>
  );
}

export default withI18n(PrivacyPolicyPage);
