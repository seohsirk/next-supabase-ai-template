import { withI18n } from '~/lib/i18n/with-i18n';

import { SiteFooter } from './components/site-footer';
import { SiteHeader } from './components/site-header';

function SiteLayout(props: React.PropsWithChildren) {
  return (
    <>
      <SiteHeader />

      {props.children}

      <SiteFooter />
    </>
  );
}

export default withI18n(SiteLayout);
