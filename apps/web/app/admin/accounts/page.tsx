import { AdminGuard } from '@kit/admin/components/admin-guard';
import { PageBody, PageHeader } from '@kit/ui/page';

function AccountsPage() {
  return (
    <>
      <PageHeader title={'Accounts'} />
      <PageBody></PageBody>;
    </>
  );
}

export default AdminGuard(AccountsPage);
