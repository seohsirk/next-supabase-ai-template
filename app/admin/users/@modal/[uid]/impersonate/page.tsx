import { use } from 'react';

import getSupabaseServerComponentClient from '@packages/supabase/server-component-client';

import AdminGuard from '../../../../../../packages/admin/components/AdminGuard';
import ImpersonateUserConfirmationModal from '../components/ImpersonateUserConfirmationModal';

interface Params {
  params: {
    uid: string;
  };
}

function ImpersonateUserModalPage({ params }: Params) {
  const client = getSupabaseServerComponentClient({ admin: true });
  const { data, error } = use(client.auth.admin.getUserById(params.uid));

  if (!data || error) {
    throw new Error(`User not found`);
  }

  return <ImpersonateUserConfirmationModal user={data.user} />;
}

export default AdminGuard(ImpersonateUserModalPage);
