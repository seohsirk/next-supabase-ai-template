import { Page } from '@kit/ui/page';

import { HomeSidebar } from '~/(dashboard)/home/_components/home-sidebar';
import { withI18n } from '~/lib/i18n/with-i18n';

function UserHomeLayout({ children }: React.PropsWithChildren) {
  return <Page sidebar={<HomeSidebar />}>{children}</Page>;
}

export default withI18n(UserHomeLayout);
