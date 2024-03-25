import Link from 'next/link';

import { PageHeader } from '@/components/app/Page';
import pathsConfig from '@/config/paths.config';
import { ArrowLeftIcon } from 'lucide-react';

import { Button } from '@kit/ui/button';

function AdminHeader({ children }: React.PropsWithChildren) {
  return (
    <PageHeader
      title={children}
      description={`Manage your app from the admin dashboard.`}
    >
      <Link href={pathsConfig.appHome}>
        <Button variant={'link'}>
          <ArrowLeftIcon className={'h-4'} />
          <span>Back to App</span>
        </Button>
      </Link>
    </PageHeader>
  );
}

export default AdminHeader;
