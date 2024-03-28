import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import { useUser } from '@kit/supabase/hooks/use-user';

const queryKey = ['personal-account:data'];

export function usePersonalAccountData() {
  const client = useSupabase();
  const user = useUser();

  const queryFn = async () => {
    if (!user.data?.id) {
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
      .eq('primary_owner_user_id', user.data?.id)
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
    enabled: !!user.data?.id,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
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
