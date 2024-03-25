import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

import { withI18n } from '~/lib/i18n/with-i18n';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'common:yourAccountTabLabel'} />}
        description={'Manage your account settings'}
      />

      <PageBody>{props.children}</PageBody>
    </>
  );
}

export default withI18n(UserSettingsLayout);
