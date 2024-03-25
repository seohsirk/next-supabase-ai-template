import { PageBody } from '@/components/app/Page';
import appConfig from '@/config/app.config';
import AdminGuard from '@/packages/admin/components/AdminGuard';
import AdminHeader from '@/packages/admin/components/AdminHeader';

import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import { Input } from '@kit/ui/input';

import OrganizationsTable from './components/OrganizationsTable';
import { getOrganizations } from './queries';

interface OrganizationsAdminPageProps {
  searchParams: {
    page?: string;
    search?: string;
  };
}

export const metadata = {
  title: `Organizations | ${appConfig.name}`,
};

async function OrganizationsAdminPage({
  searchParams,
}: OrganizationsAdminPageProps) {
  const page = searchParams.page ? parseInt(searchParams.page, 10) : 1;
  const client = getSupabaseServerComponentClient({ admin: true });
  const perPage = 10;
  const search = searchParams.search || '';

  const { organizations, count } = await getOrganizations(
    client,
    search,
    page,
    perPage,
  );

  const pageCount = count ? Math.ceil(count / perPage) : 0;

  return (
    <div className={'flex flex-1 flex-col'}>
      <AdminHeader>Manage Organizations</AdminHeader>

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <form method={'GET'}>
            <Input
              name={'search'}
              defaultValue={search}
              placeholder={'Search Organization...'}
            />
          </form>

          <OrganizationsTable
            perPage={perPage}
            page={page}
            pageCount={pageCount}
            organizations={organizations}
          />
        </div>
      </PageBody>
    </div>
  );
}

export default AdminGuard(OrganizationsAdminPage);
