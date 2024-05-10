import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@kit/supabase/hooks/use-supabase';
import {useCallback} from "react";

const QUERY_KEY = ['get_remaining_tokens'];

export function useFetchAvailableTokens() {
  const client = useSupabase();

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const { data, error } = await client.rpc('get_remaining_tokens');

      if (error) {
        throw error;
      }

      return data;
    },
  });
}

export function useRevalidateAvailableTokens() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    return queryClient.refetchQueries({
      queryKey: QUERY_KEY,
    });
  }, [queryClient]);
}
