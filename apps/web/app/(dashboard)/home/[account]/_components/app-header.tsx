import { PageHeader } from '@kit/ui/page';

import { MobileAppNavigation } from '~/(dashboard)/home/[account]/_components/mobile-app-navigation';

export function AppHeader({
  children,
  title,
  description,
  account,
}: React.PropsWithChildren<{
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  account: string;
}>) {
  return (
    <PageHeader
      title={title}
      description={description}
      mobileNavigation={<MobileAppNavigation slug={account} />}
    >
      {children}
    </PageHeader>
  );
}
