import { use } from 'react';

import { loadOrganizationWorkspace } from '~/(dashboard)/home/[account]/(lib)/load-workspace';
import featureFlagsConfig from '~/config/feature-flags.config';
import { withI18n } from '~/lib/i18n/with-i18n';

import {
  TeamAccountDangerZone,
  UpdateOrganizationForm,
} from '@kit/team-accounts/components';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { PageBody, PageHeader } from '@kit/ui/page';
import { Trans } from '@kit/ui/trans';

export const metadata = {
  title: 'Organization Settings',
};

const allowOrganizationDelete = featureFlagsConfig.enableOrganizationDeletion;

interface Params {
  params: {
    account: string;
  };
}

function OrganizationSettingsPage({ params }: Params) {
  const { account, user } = use(loadOrganizationWorkspace(params.account));

  return (
    <>
      <PageHeader
        title={<Trans i18nKey={'organization:settingsPageTitle'} />}
        description={<Trans i18nKey={'organization:settingsPageDescription'} />}
      />

      <PageBody>
        <div className={'mx-auto flex max-w-5xl flex-col space-y-4'}>
          <Card>
            <CardHeader>
              <CardTitle>
                <Trans i18nKey={'organization:generalTabLabel'} />
              </CardTitle>

              <CardDescription>
                <Trans i18nKey={'organization:generalTabLabelSubheading'} />
              </CardDescription>
            </CardHeader>

            <CardContent>
              <UpdateOrganizationForm
                accountId={account.id}
                accountName={account.name}
              />
            </CardContent>
          </Card>

          <If condition={allowOrganizationDelete}>
            <Card className={'border-2 border-destructive'}>
              <CardHeader>
                <CardTitle>
                  <Trans i18nKey={'organization:dangerZone'} />
                </CardTitle>
                <CardDescription>
                  <Trans i18nKey={'organization:dangerZoneSubheading'} />
                </CardDescription>
              </CardHeader>

              <CardContent>
                <TeamAccountDangerZone userId={user.id} account={account} />
              </CardContent>
            </Card>
          </If>
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(OrganizationSettingsPage);
