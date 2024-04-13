import { z } from 'zod';

/**
 * @name getServiceRoleKey
 * @description Get the Supabase Service Role Key.
 * ONLY USE IN SERVER-SIDE CODE. DO NOT EXPOSE THIS TO CLIENT-SIDE CODE.
 */
export function getServiceRoleKey() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `[Dev Only] You are using the Supabase Service Role. Make sure it's the right call.`,
    );
  }

  return z.string().min(1).parse(serviceRoleKey);
}
