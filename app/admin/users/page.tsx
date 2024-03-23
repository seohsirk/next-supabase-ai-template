import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import type UserData from '@kit/session/types/user-data';

import appConfig from '@/config/app.config';

import { PageBody } from '@/components/app/Page';

import AdminGuard from '../../../packages/admin/components/AdminGuard';
import AdminHeader from '../../../packages/admin/components/AdminHeader';
import getPageFromQueryParams from '../utils/get-page-from-query-param';
import UsersTable from './components/UsersTable';
import { getUsers } from './queries';

interface UsersAdminPageProps {
  searchParams: {
    page?: string;
  };
}

export const metadata = {
  title: `Users | ${appConfig.name}`,
};

async function UsersAdminPage({ searchParams }: UsersAdminPageProps) {
  const page = getPageFromQueryParams(searchParams.page);
  const perPage = 1;
  const { users, total } = await loadUsers(page, perPage);
  const pageCount = Math.ceil(total / perPage);

  return (
    <div className={'flex flex-1 flex-col'}>
      <AdminHeader>Users</AdminHeader>

      <PageBody>
        <UsersTable
          users={users}
          page={page}
          pageCount={pageCount}
          perPage={perPage}
        />
      </PageBody>
    </div>
  );
}

export default AdminGuard(UsersAdminPage);

async function loadAuthUsers(page = 1, perPage = 20) {
  const client = getSupabaseServerComponentClient({ admin: true });

  const response = await client.auth.admin.listUsers({
    page,
    perPage,
  });

  if (response.error) {
    throw response.error;
  }

  return response.data;
}

async function loadUsers(page = 1, perPage = 20) {
  const { users: authUsers, total } = await loadAuthUsers(page, perPage);

  const ids = authUsers.map((user) => user.id);
  const usersData = await getUsers(ids);

  const users = authUsers
    .map((user) => {
      const data = usersData.find((u) => u.id === user.id) as UserData;

      const banDuration =
        'banned_until' in user ? (user.banned_until as string) : 'none';

      return {
        id: user.id,
        email: user.email,
        phone: user.phone,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        lastSignInAt: user.last_sign_in_at,
        banDuration,
        data,
      };
    })
    .filter(Boolean);

  return {
    total,
    users,
  };
}
