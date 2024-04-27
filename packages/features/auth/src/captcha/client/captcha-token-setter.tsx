'use client';

import { useContext } from 'react';

import { Turnstile, TurnstileProps } from '@marsidev/react-turnstile';

import { Captcha } from './captcha-provider';

export function CaptchaTokenSetter(props: {
  siteKey: string | undefined;
  options?: TurnstileProps;
}) {
  const { setToken } = useContext(Captcha);

  if (!props.siteKey) {
    return null;
  }

  const options = props.options ?? {
    options: {
      size: 'invisible',
    },
  };

  return (
    <Turnstile siteKey={props.siteKey} onSuccess={setToken} {...options} />
  );
}
