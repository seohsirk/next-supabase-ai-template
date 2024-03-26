import type { UserAttributes } from '@supabase/gotrue-js';

import { useMutation } from '@tanstack/react-query';

import { useSupabase } from './use-supabase';

type Params = UserAttributes & { redirectTo: string };

export function useUpdateUser() {
  const client = useSupabase();
  const mutationKey = ['supabase:user'];

  const mutationFn = async (attributes: Params) => {
    const { redirectTo, ...params } = attributes;

    const response = await client.auth.updateUser(params, {
      emailRedirectTo: redirectTo,
    });

    console.log(response);

    if (response.error) {
      throw response.error;
    }

    console.log('response.data:', response.data);

    return response.data;
  };

  return useMutation({
    mutationKey,
    mutationFn,
  });
}
