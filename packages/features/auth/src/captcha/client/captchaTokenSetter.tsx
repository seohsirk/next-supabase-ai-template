'use client';

import { useContext } from 'react';

import { Turnstile } from '@marsidev/react-turnstile';

import { Captcha } from './captcha-provider';

export function CaptchaTokenSetter(props: { siteKey: string | undefined }) {
  const { setToken } = useContext(Captcha);

  if (!props.siteKey) {
    return null;
  }

  return <Turnstile siteKey={props.siteKey} onSuccess={setToken} />;
}
