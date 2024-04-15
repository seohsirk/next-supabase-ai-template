import { useCallback } from 'react';

import { useBaselimeRum } from '@baselime/react-rum';

export function useCaptureException() {
  const { captureException } = useBaselimeRum();

  return useCallback(
    (error: Error) => captureException(error),
    [captureException],
  );
}
