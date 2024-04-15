import { use } from 'react';

import { Page } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';

import { AccountLayoutSidebar } from './_components/account-layout-sidebar';
import { loadTeamWorkspace } from './_lib/server/team-account-workspace.loader';

interface Params {
  account: string;
}

function TeamWorkspaceLayout({
  children,
  params,
}: React.PropsWithChildren<{
  params: Params;
}>) {
  const data = use(loadTeamWorkspace(params.account));

  const accounts = data.accounts.map(({ name, slug, picture_url }) => ({
    label: name,
    value: slug,
    image: picture_url,
  }));

  return (
    <Page
      sidebar={
        <AccountLayoutSidebar
          collapsed={false}
          account={params.account}
          accounts={accounts}
          user={data.session?.user ?? null}
        />
      }
    >
      {children}
    </Page>
  );
}

export default withI18n(TeamWorkspaceLayout);
