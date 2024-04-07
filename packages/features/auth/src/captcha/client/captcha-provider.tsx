'use client';

import { createContext, useState } from 'react';

export const Captcha = createContext<{
  token: string;
  setToken: (token: string) => void;
}>({
  token: '',
  setToken: (_: string) => {
    // do nothing
    return '';
  },
});

export function CaptchaProvider(props: { children: React.ReactNode }) {
  const [token, setToken] = useState<string>('');

  return (
    <Captcha.Provider value={{ token, setToken }}>
      {props.children}
    </Captcha.Provider>
  );
}
