import loadDynamic from 'next/dynamic';

import { Plus } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { PageBody } from '@kit/ui/page';
import Spinner from '@kit/ui/spinner';
import { Trans } from '@kit/ui/trans';

import { AppHeader } from '~/(dashboard)/home/[account]/_components/app-header';
import { withI18n } from '~/lib/i18n/with-i18n';

const DashboardDemo = loadDynamic(
  () => import('./_components/dashboard-demo'),
  {
    ssr: false,
    loading: () => (
      <div
        className={
          'flex h-full flex-1 flex-col items-center justify-center space-y-4' +
          ' py-24'
        }
      >
        <Spinner />

        <div>
          <Trans i18nKey={'common:loading'} />
        </div>
      </div>
    ),
  },
);

export const metadata = {
  title: 'Organization Account Home',
};

function OrganizationAccountHomePage({
  params,
}: {
  params: {
    account: string;
  };
}) {
  return (
    <>
      <AppHeader
        title={<Trans i18nKey={'common:dashboardTabLabel'} />}
        description={<Trans i18nKey={'common:dashboardTabDescription'} />}
        account={params.account}
      >
        <Button>
          <Plus className={'mr-2 h-4'} />
          <span>Add Widget</span>
        </Button>
      </AppHeader>

      <PageBody>
        <DashboardDemo />
      </PageBody>
    </>
  );
}

export default withI18n(OrganizationAccountHomePage);
