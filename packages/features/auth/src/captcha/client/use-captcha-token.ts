import { useContext } from 'react';

import { Captcha } from './captcha-provider';

export function useCaptchaToken() {
  const context = useContext(Captcha);

  if (!context) {
    throw new Error(`useCaptchaToken must be used within a CaptchaProvider`);
  }

  return context.token;
}
