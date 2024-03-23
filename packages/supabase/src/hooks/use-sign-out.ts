import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';
import { useRevalidateUserSession } from './use-user-session';

export function useSignOut() {
  const client = useSupabase();
  const revalidateUserSession = useRevalidateUserSession();

  return useMutation({
    mutationFn: async () => {
      await client.auth.signOut();
      await revalidateUserSession();
    },
  });
}
