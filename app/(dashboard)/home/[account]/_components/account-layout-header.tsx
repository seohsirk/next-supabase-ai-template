import { PageHeader } from '@kit/ui/page';

import { AccountLayoutMobileNavigation } from '~/(dashboard)/home/[account]/_components/account-layout-mobile-navigation';

export function AccountLayoutHeader({
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
      mobileNavigation={<AccountLayoutMobileNavigation account={account} />}
    >
      {children}
    </PageHeader>
  );
}
