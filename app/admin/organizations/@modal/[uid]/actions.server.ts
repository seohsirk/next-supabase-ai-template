'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { Logger } from '@kit/shared/logger';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { withAdminSession } from '~/admin/lib/actions-utils';

const getClient = () => getSupabaseServerActionClient({ admin: true });

export const deleteOrganizationAction = withAdminSession(
  async ({ id }: { id: number; csrfToken: string }) => {
    const client = getClient();

    Logger.info({ id }, `Admin requested to delete Organization`);

    await deleteOrganization(client, {
      organizationId: id,
    });

    revalidatePath('/admin/organizations', 'page');

    Logger.info({ id }, `Organization account deleted`);

    redirect('/admin/organizations');
  },
);
