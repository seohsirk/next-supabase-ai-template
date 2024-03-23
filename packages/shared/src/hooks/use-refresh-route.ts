import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

/**
 * @name useRefreshRoute
 * @description Refresh the current page. Useful for when you need to
 * refresh the data on a page after a mutation. This is a temporary
 * workaround until Next.js adds mutations
 */
function useRefreshRoute() {
  const router = useRouter();

  return useCallback(() => {
    router.refresh();
  }, [router]);
}

export default useRefreshRoute;
