import { useEffect } from 'react';

import { captureException } from '../capture-exception';

export function useCaptureException(error: Error) {
  useEffect(() => {
    void captureException(error);
  }, [error]);

  return null;
}
