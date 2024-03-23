import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';

const queryKey = ['personal-account:data'];

export function usePersonalAccountData() {
  const client = useSupabase();

  const queryFn = async () => {
    const { data, error } = await client.auth.getSession();

    if (!data.session || error) {
      return null;
    }

    const response = await client
      .from('accounts')
      .select(
        `
        id,
        name,
        picture_url
    `,
      )
      .eq('primary_owner_user_id', data.session.user.id)
      .eq('is_personal_account', true)
      .single();

    if (response.error) {
      throw response.error;
    }

    return response.data;
  };

  return useQuery({
    queryKey,
    queryFn,
  });
}

export function useRevalidatePersonalAccountDataQuery() {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey,
      }),
    [queryClient],
  );
}
