import type { SupabaseClient } from '@supabase/supabase-js';

import { Database } from '@kit/supabase/database';

/**
 * @name ENFORCE_MFA
 * @description Set this constant to true if you want the SuperAdmin user to
 * sign in using MFA when accessing the Admin page
 */
const ENFORCE_MFA = false;

/**
 * @name isUserSuperAdmin
 * @description Checks if the current user is an admin by checking the
 * user_metadata.role field in Supabase Auth is set to a SuperAdmin role.
 */
const isUserSuperAdmin = async (params: {
  client: SupabaseClient<Database>;
  enforceMfa?: boolean;
}) => {
  const enforceMfa = params.enforceMfa ?? ENFORCE_MFA;
  const { data, error } = await params.client.auth.getUser();

  if (error) {
    return false;
  }

  // If we enforce MFA, we need to check that the user is MFA authenticated.
  if (enforceMfa) {
    const isMfaAuthenticated = await verifyIsMultiFactorAuthenticated(
      params.client,
    );

    if (!isMfaAuthenticated) {
      return false;
    }
  }

  const adminMetadata = data.user?.app_metadata;
  const role = adminMetadata?.role;

  return role === 'super-admin';
};

export default isUserSuperAdmin;

async function verifyIsMultiFactorAuthenticated(client: SupabaseClient) {
  const { data, error } =
    await client.auth.mfa.getAuthenticatorAssuranceLevel();

  if (error || !data) {
    return false;
  }

  return data.currentLevel === 'aal2';
}
