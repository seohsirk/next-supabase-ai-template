import { AdminDashboard } from '@kit/admin/components/admin-dashboard';
import { PageBody, PageHeader } from '@kit/ui/page';

export default function AdminPage() {
  return (
    <>
      <PageHeader title={'Admin'} description={`Your SaaS stats at a glance`} />

      <PageBody>
        <AdminDashboard />
      </PageBody>
    </>
  );
}
