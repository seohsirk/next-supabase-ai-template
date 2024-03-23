import { AppLogo } from '~/components/app-logo';

import { AuthLayoutShell } from '@kit/auth/shared';

function InvitePageLayout({ children }: React.PropsWithChildren) {
  return <AuthLayoutShell Logo={AppLogo}>{children}</AuthLayoutShell>;
}

export default InvitePageLayout;
