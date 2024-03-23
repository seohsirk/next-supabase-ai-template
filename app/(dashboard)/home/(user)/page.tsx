import { withI18n } from '~/lib/i18n/with-i18n';

import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

function UserHomePage() {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:homeTabLabel'} defaults={'Home'} />}
        description={
          <Trans
            i18nKey={'common:homeTabDescription'}
            defaults={'Welcome to your Home Page'}
          />
        }
      />

      <PageBody></PageBody>
    </>
  );
}

export default withI18n(UserHomePage);
