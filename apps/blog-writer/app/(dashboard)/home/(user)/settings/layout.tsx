import { Trans } from '@kit/ui/trans';

import { UserAccountHeader } from '~/(dashboard)/home/(user)/_components/user-account-header';
import { withI18n } from '~/lib/i18n/with-i18n';

function UserSettingsLayout(props: React.PropsWithChildren) {
  return (
    <>
      <UserAccountHeader
        title={<Trans i18nKey={'common:yourAccountTabLabel'} />}
        description={'Manage your account settings'}
      />

      {props.children}
    </>
  );
}

export default withI18n(UserSettingsLayout);
