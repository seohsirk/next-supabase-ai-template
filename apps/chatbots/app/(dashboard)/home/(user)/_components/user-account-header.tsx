import { PageHeader } from '@kit/ui/page';

import UserLayoutMobileNavigation from './user-layout-mobile-navigation';

export function UserAccountHeader(
  props: React.PropsWithChildren<{
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
  }>,
) {
  return (
    <PageHeader
      title={props.title}
      description={props.description}
      mobileNavigation={<UserLayoutMobileNavigation />}
    />
  );
}
