import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { withI18n } from '~/lib/i18n/with-i18n';

function CookiePolicyPage() {
  return (
    <div>
      <div className={'container mx-auto'}>
        <SitePageHeader
          title={`Cookie Policy`}
          subtitle={`This is the cookie policy page. It's a great place to put information about the cookies your site uses.`}
        />
      </div>
    </div>
  );
}

export default withI18n(CookiePolicyPage);
