import { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * @name AdminAuthUserService
 * @description Service for performing admin actions on users in the system.
 * This service only interacts with the Supabase Auth Admin API.
 */
export class AdminAuthUserService {
  constructor(
    private readonly client: SupabaseClient<Database>,
    private readonly adminClient: SupabaseClient<Database>,
  ) {}

  async assertUserIsNotCurrentSuperAdmin(targetUserId: string) {
    const { data: user } = await this.client.auth.getUser();
    const currentUserId = user.user?.id;

    if (!currentUserId) {
      throw new Error(`Error fetching user`);
    }

    if (currentUserId === targetUserId) {
      throw new Error(
        `You cannot perform a destructive action on your own account as a Super Admin`,
      );
    }
  }

  async deleteUser(userId: string) {
    await this.assertUserIsNotCurrentSuperAdmin(userId);

    const deleteUserResponse =
      await this.adminClient.auth.admin.deleteUser(userId);

    if (deleteUserResponse.error) {
      throw new Error(`Error deleting user record or auth record.`);
    }
  }

  async banUser(userId: string) {
    await this.assertUserIsNotCurrentSuperAdmin(userId);

    return this.setBanDuration(userId, `876600h`);
  }

  async reactivateUser(userId: string) {
    await this.assertUserIsNotCurrentSuperAdmin(userId);

    return this.setBanDuration(userId, `none`);
  }

  async impersonateUser(userId: string) {
    const {
      data: { user },
      error,
    } = await this.adminClient.auth.admin.getUserById(userId);

    if (error ?? !user) {
      throw new Error(`Error fetching user`);
    }

    const email = user.email;

    if (!email) {
      throw new Error(`User has no email. Cannot impersonate`);
    }

    const { error: linkError, data } =
      await this.adminClient.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: {
          redirectTo: `/`,
        },
      });

    if (linkError ?? !data) {
      throw new Error(`Error generating magic link`);
    }

    const response = await fetch(data.properties?.action_link, {
      method: 'GET',
      redirect: 'manual',
    });

    const location = response.headers.get('Location');

    if (!location) {
      throw new Error(`Error generating magic link. Location header not found`);
    }

    const hash = new URL(location).hash.substring(1);
    const query = new URLSearchParams(hash);
    const accessToken = query.get('access_token');
    const refreshToken = query.get('refresh_token');

    if (!accessToken || !refreshToken) {
      throw new Error(
        `Error generating magic link. Tokens not found in URL hash.`,
      );
    }

    return {
      accessToken,
      refreshToken,
    };
  }

  private async setBanDuration(userId: string, banDuration: string) {
    await this.adminClient.auth.admin.updateUserById(userId, {
      ban_duration: banDuration,
    });
  }
}
