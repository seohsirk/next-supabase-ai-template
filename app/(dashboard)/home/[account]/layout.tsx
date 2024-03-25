import { parseSidebarStateCookie } from '@kit/shared/cookies/sidebar-state.cookie';
import { parseThemeCookie } from '@kit/shared/cookies/theme.cookie';
import { Page } from '@kit/ui/page';

import { withI18n } from '~/lib/i18n/with-i18n';

import { AppSidebar } from './(components)/app-sidebar';
import { loadOrganizationWorkspace } from './(lib)/load-workspace';

interface Params {
  account: string;
}

async function OrganizationWorkspaceLayout({
  children,
  params,
}: React.PropsWithChildren<{
  params: Params;
}>) {
  const data = await loadOrganizationWorkspace(params.account);
  const ui = getUIStateCookies();
  const sidebarCollapsed = ui.sidebarState === 'collapsed';

  return (
    <Page
      sidebar={
        <AppSidebar
          collapsed={sidebarCollapsed}
          account={params.account}
          accounts={data.accounts.map(({ name, slug, picture_url }) => ({
            label: name,
            value: slug,
            image: picture_url,
          }))}
        />
      }
    >
      {children}
    </Page>
  );
}

export default withI18n(OrganizationWorkspaceLayout);

function getUIStateCookies() {
  return {
    theme: parseThemeCookie(),
    sidebarState: parseSidebarStateCookie(),
  };
}
