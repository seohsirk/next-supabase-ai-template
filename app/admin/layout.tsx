import { Page } from '@kit/ui/page';

import { AdminSidebar } from '~/admin/_components/admin-sidebar';

export const metadata = {
  title: `Admin`,
};

export default function AdminLayout(props: React.PropsWithChildren) {
  return <Page sidebar={<AdminSidebar />}>{props.children}</Page>;
}
