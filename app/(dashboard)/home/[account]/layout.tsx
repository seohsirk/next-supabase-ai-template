import { use } from 'react';

import { parseSidebarStateCookie } from '@kit/shared/cookies/sidebar-state.cookie';
import { parseThemeCookie } from '@kit/shared/cookies/theme.cookie';
import { getSupabaseServerComponentClient } from '@kit/supabase/server-component-client';
import { Page } from '@kit/ui/page';

import { AppSidebar } from '~/(dashboard)/home/[account]/_components/app-sidebar';
import { loadTeamWorkspace } from '~/(dashboard)/home/[account]/_lib/load-team-account-workspace';
import { withI18n } from '~/lib/i18n/with-i18n';

interface Params {
  account: string;
}

function TeamWorkspaceLayout({
  children,
  params,
}: React.PropsWithChildren<{
  params: Params;
}>) {
  const [data, session] = use(
    Promise.all([loadTeamWorkspace(params.account), loadSession()]),
  );

  const ui = getUIStateCookies();
  const sidebarCollapsed = ui.sidebarState === 'collapsed';

  const accounts = data.accounts.map(({ name, slug, picture_url }) => ({
    label: name,
    value: slug,
    image: picture_url,
  }));

  return (
    <Page
      sidebar={
        <AppSidebar
          collapsed={sidebarCollapsed}
          account={params.account}
          session={session}
          accounts={accounts}
        />
      }
    >
      {children}
    </Page>
  );
}

export default withI18n(TeamWorkspaceLayout);

function getUIStateCookies() {
  return {
    theme: parseThemeCookie(),
    sidebarState: parseSidebarStateCookie(),
  };
}

async function loadSession() {
  const client = getSupabaseServerComponentClient();

  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}
