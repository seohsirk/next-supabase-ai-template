import { useQuery } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

export function useUser() {
  const client = useSupabase();
  const queryKey = ['user'];

  const queryFn = async () => {
    const response = await client.auth.getUser();

    if (response.error) {
      return Promise.reject(response.error);
    }

    if (response.data?.user) {
      return response.data.user;
    }

    return Promise.reject('Unexpected result format');
  };

  return useQuery({
    queryFn,
    queryKey,
  });
}
