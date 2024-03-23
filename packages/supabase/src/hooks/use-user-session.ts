import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

const queryKey = ['supabase:session'];

export function useUserSession() {
  const supabase = useSupabase();
  const queryFn = async () => {
    const { data, error } = await supabase.auth.getSession();
    console.log(data, error);
    if (error) {
      throw error;
    }

    return data.session;
  };

  return useQuery({ queryKey, queryFn });
}

export function useRevalidateUserSession() {
  const client = useQueryClient();

  return useCallback(
    () =>
      client.invalidateQueries({
        queryKey,
      }),
    [client],
  );
}
