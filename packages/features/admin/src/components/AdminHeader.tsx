import Link from 'next/link';

import { ArrowLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { PageHeader } from '@kit/ui/page';

function AdminHeader({
  children,
  paths,
}: React.PropsWithChildren<{
  appHome: string;
  paths: {
    appHome: string;
  };
}>) {
  return (
    <PageHeader
      title={children}
      description={`Manage your app from the admin dashboard.`}
    >
      <Link href={paths.appHome}>
        <Button variant={'link'}>
          <ArrowLeft className={'h-4'} />
          <span>Back to App</span>
        </Button>
      </Link>
    </PageHeader>
  );
}

export default AdminHeader;
