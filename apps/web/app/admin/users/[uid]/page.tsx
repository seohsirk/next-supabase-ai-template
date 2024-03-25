import Link from 'next/link';

import { PageBody } from '@/components/app/Page';
import configuration from '@/config/app.config';
import type MembershipRole from '@/lib/organizations/types/membership-role';
import { ChevronRightIcon } from 'lucide-react';

import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Label } from '@kit/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

import RoleBadge from '../../../(app)/[account]/account/organization/components/RoleBadge';
import AdminGuard from '../../../../packages/admin/components/AdminGuard';
import AdminHeader from '../../../../packages/admin/components/AdminHeader';
import UserActionsDropdown from './components/UserActionsDropdown';

interface Params {
  params: {
    uid: string;
  };
}

export const metadata = {
  title: `Manage User | ${configuration.name}`,
};

async function AdminUserPage({ params }: Params) {
  const uid = params.uid;

  const data = await loadData(uid);
  const { auth, user } = data;
  const displayName = user?.displayName;
  const authUser = auth?.user;
  const email = authUser?.email;
  const phone = authUser?.phone;
  const organizations = data.organizations ?? [];

  const isBanned = Boolean(
    authUser && 'banned_until' in authUser && authUser.banned_until !== 'none',
  );

  return (
    <div className={'flex flex-1 flex-col'}>
      <AdminHeader>Manage User</AdminHeader>

      <PageBody>
        <div className={'flex flex-col space-y-6'}>
          <div className={'flex justify-between'}>
            <Breadcrumbs displayName={displayName ?? email ?? ''} />

            <div>
              <UserActionsDropdown uid={uid} isBanned={isBanned} />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>

            <CardContent>
              <div className={'flex items-center space-x-2'}>
                <div>
                  <Label>Status</Label>
                </div>

                <div className={'inline-flex'}>
                  {isBanned ? (
                    <Badge variant={'destructive'}>Banned</Badge>
                  ) : (
                    <Badge variant={'success'}>Active</Badge>
                  )}
                </div>
              </div>

              <Label>
                Display name
                <Input
                  className={'max-w-sm'}
                  defaultValue={displayName ?? ''}
                  disabled
                />
              </Label>

              <Label>
                Email
                <Input
                  className={'max-w-sm'}
                  defaultValue={email ?? ''}
                  disabled
                />
              </Label>

              <Label>
                Phone number
                <Input
                  className={'max-w-sm'}
                  defaultValue={phone ?? ''}
                  disabled
                />
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Organization ID</TableHead>
                    <TableHead>UUID</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {organizations.map((membership) => {
                    const organization = membership.organization;
                    const href = `/admin/organizations/${organization.uuid}/members`;

                    return (
                      <TableRow key={membership.id}>
                        <TableCell>{organization.id}</TableCell>
                        <TableCell>{organization.uuid}</TableCell>

                        <TableCell>
                          <Link className={'hover:underline'} href={href}>
                            {organization.name}
                          </Link>
                        </TableCell>

                        <TableCell>
                          <div className={'inline-flex'}>
                            <RoleBadge role={membership.role} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </PageBody>
    </div>
  );
}

export default AdminGuard(AdminUserPage);

async function loadData(uid: string) {
  const client = getSupabaseServerComponentClient({ admin: true });
  const authUser = client.auth.admin.getUserById(uid);

  const userData = client
    .from('users')
    .select(
      `
      id,
      displayName: display_name,
      photoURL: photo_url,
      onboarded
  `,
    )
    .eq('id', uid)
    .single();

  const organizationsQuery = client
    .from('memberships')
    .select<
      string,
      {
        id: number;
        role: MembershipRole;
        organization: {
          id: number;
          uuid: string;
          name: string;
        };
      }
    >(
      `
        id,
        role,
        organization: organization_id !inner (
          id, 
          uuid,
          name
        )
    `,
    )
    .eq('user_id', uid);

  const [auth, user, organizations] = await Promise.all([
    authUser,
    userData,
    organizationsQuery,
  ]);

  return {
    auth: auth.data,
    user: user.data,
    organizations: organizations.data,
  };
}

function Breadcrumbs(
  props: React.PropsWithChildren<{
    displayName: string;
  }>,
) {
  return (
    <div className={'flex items-center space-x-1 p-2 text-xs'}>
      <Link href={'/admin'}>Admin</Link>
      <ChevronRightIcon className={'w-3'} />
      <Link href={'/admin/users'}>Users</Link>
      <ChevronRightIcon className={'w-3'} />
      <span>{props.displayName}</span>
    </div>
  );
}
