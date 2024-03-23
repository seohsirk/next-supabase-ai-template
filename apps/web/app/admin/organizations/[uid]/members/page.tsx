import { use } from 'react';

import Link from 'next/link';

import { ChevronRightIcon } from 'lucide-react';

import AdminHeader from '@packages/admin/components/AdminHeader';
import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import appConfig from '@/config/app.config';

import { PageBody } from '@/components/app/Page';

import getPageFromQueryParams from '../../../utils/get-page-from-query-param';
import { getMembershipsByOrganizationUid } from '../../queries';
import OrganizationsMembersTable from './components/OrganizationsMembersTable';

interface AdminMembersPageParams {
  params: {
    uid: string;
  };

  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: `Members | ${appConfig.name}`,
};

function AdminMembersPage(params: AdminMembersPageParams) {
  const adminClient = getSupabaseServerComponentClient({ admin: true });
  const uid = params.params.uid;
  const perPage = 20;
  const page = getPageFromQueryParams(params.searchParams.page);

  const { data: memberships, count } = use(
    getMembershipsByOrganizationUid(adminClient, { uid, page, perPage }),
  );

  const pageCount = count ? Math.ceil(count / perPage) : 0;

  return (
    <div className={'flex flex-1 flex-col'}>
      <AdminHeader>Manage Members</AdminHeader>

      <PageBody>
        <div className={'flex flex-col space-y-4'}>
          <Breadcrumbs />

          <OrganizationsMembersTable
            page={page}
            perPage={perPage}
            pageCount={pageCount}
            memberships={memberships}
          />
        </div>
      </PageBody>
    </div>
  );
}

export default AdminMembersPage;

function Breadcrumbs() {
  return (
    <div className={'flex items-center space-x-2 p-2 text-xs'}>
      <div className={'flex items-center space-x-1.5'}>
        <Link href={'/admin'}>Admin</Link>
      </div>

      <ChevronRightIcon className={'w-3'} />

      <Link href={'/admin/organizations'}>Organizations</Link>

      <ChevronRightIcon className={'w-3'} />

      <span>Members</span>
    </div>
  );
}
