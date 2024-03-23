'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import useSupabase from '@kit/hooks/use-supabase';

import Spinner from '@/components/app/Spinner';

function ImpersonateUserAuthSetter({
  tokens,
}: React.PropsWithChildren<{
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}>) {
  const supabase = useSupabase();
  const router = useRouter();

  useEffect(() => {
    async function setAuth() {
      await supabase.auth.setSession({
        refresh_token: tokens.refreshToken,
        access_token: tokens.accessToken,
      });

      router.push('/dashboard');
    }

    void setAuth();
  }, [router, tokens, supabase.auth]);

  return (
    <div
      className={
        'flex h-screen w-screen flex-1 flex-col items-center justify-center'
      }
    >
      <div className={'flex flex-col items-center space-y-4'}>
        <Spinner />

        <div>
          <p>Setting up your session...</p>
        </div>
      </div>
    </div>
  );
}

export default ImpersonateUserAuthSetter;
