'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { enhanceAction } from '@kit/next/actions';
import { getSupabaseServerActionClient } from '@kit/supabase/server-actions-client';

import { enhanceAdminAction } from './enhance-admin-action';
import {
  BanUserSchema,
  DeleteAccountSchema,
  DeleteUserSchema,
  ImpersonateUserSchema,
  ReactivateUserSchema,
} from './schema/admin-actions.schema';
import { AdminAccountsService } from './services/admin-accounts.service';
import { AdminAuthUserService } from './services/admin-auth-user.service';

/**
 * @name banUserAction
 * @description Ban a user from the system.
 */
export const banUserAction = enhanceAdminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();

      await service.banUser(userId);

      revalidateAdmin();

      return {
        success: true,
      };
    },
    {
      schema: BanUserSchema,
    },
  ),
);

/**
 * @name reactivateUserAction
 * @description Reactivate a user in the system.
 */
export const reactivateUserAction = enhanceAdminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();

      await service.reactivateUser(userId);

      revalidateAdmin();

      return {
        success: true,
      };
    },
    {
      schema: ReactivateUserSchema,
    },
  ),
);

/**
 * @name impersonateUserAction
 * @description Impersonate a user in the system.
 */
export const impersonateUserAction = enhanceAdminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();

      return await service.impersonateUser(userId);
    },
    {
      schema: ImpersonateUserSchema,
    },
  ),
);

/**
 * @name deleteUserAction
 * @description Delete a user from the system.
 */
export const deleteUserAction = enhanceAdminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();

      await service.deleteUser(userId);

      revalidateAdmin();

      return redirect('/admin/accounts');
    },
    {
      schema: DeleteUserSchema,
    },
  ),
);

/**
 * @name deleteAccountAction
 * @description Delete an account from the system.
 */
export const deleteAccountAction = enhanceAdminAction(
  enhanceAction(
    async ({ accountId }) => {
      const service = getAdminAccountsService();

      await service.deleteAccount(accountId);

      revalidateAdmin();

      return redirect('/admin/accounts');
    },
    {
      schema: DeleteAccountSchema,
    },
  ),
);

function getAdminAuthService() {
  const client = getSupabaseServerActionClient();
  const adminClient = getSupabaseServerActionClient({ admin: true });

  return new AdminAuthUserService(client, adminClient);
}

function getAdminAccountsService() {
  const adminClient = getSupabaseServerActionClient({ admin: true });

  return new AdminAccountsService(adminClient);
}

function revalidateAdmin() {
  revalidatePath('/admin', 'layout');
}
