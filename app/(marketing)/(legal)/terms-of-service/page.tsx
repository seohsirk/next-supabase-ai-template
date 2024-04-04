import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

function TermsOfServicePage() {
  return (
    <div className={'mt-8'}>
      <div className={'container mx-auto'}>
        <SitePageHeader title={`Terms of Service`} subtitle={``} />
      </div>
    </div>
  );
}

export default withI18n(TermsOfServicePage);
