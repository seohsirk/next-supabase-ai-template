'use server';

import { revalidatePath } from 'next/cache';

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
 * @name banUser
 * @description Ban a user from the system.
 */
export const banUser = enhanceAdminAction(
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
 * @name reactivateUser
 * @description Reactivate a user in the system.
 */
export const reactivateUser = enhanceAdminAction(
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
 * @name impersonateUser
 * @description Impersonate a user in the system.
 */
export const impersonateUser = enhanceAdminAction(
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
 * @name deleteUser
 * @description Delete a user from the system.
 */
export const deleteUser = enhanceAdminAction(
  enhanceAction(
    async ({ userId }) => {
      const service = getAdminAuthService();

      await service.deleteUser(userId);

      revalidateAdmin();

      return {
        success: true,
      };
    },
    {
      schema: DeleteUserSchema,
    },
  ),
);

/**
 * @name deleteAccount
 * @description Delete an account from the system.
 */
export const deleteAccount = enhanceAdminAction(
  enhanceAction(
    async ({ accountId }) => {
      const service = getAdminAccountsService();

      await service.deleteAccount(accountId);

      revalidateAdmin();

      return {
        success: true,
      };
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
