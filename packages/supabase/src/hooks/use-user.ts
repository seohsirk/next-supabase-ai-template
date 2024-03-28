import { useRouter } from 'next/navigation';

import type { User } from '@supabase/supabase-js';

import { useQuery } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

const queryKey = ['supabase:user'];

export function useUser(initialData?: User | null) {
  const client = useSupabase();
  const router = useRouter();

  const queryFn = async () => {
    const response = await client.auth.getUser();

    // this is most likely a session error or the user is not logged in
    if (response.error) {
      throw router.replace('/');
    }

    if (response.data?.user) {
      return response.data.user;
    }

    return Promise.reject('Unexpected result format');
  };

  return useQuery({
    queryFn,
    queryKey,
    initialData,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
