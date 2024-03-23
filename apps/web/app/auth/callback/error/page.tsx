import { redirect } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';
import { Trans } from '@kit/ui/trans';

interface Params {
  searchParams: {
    error: string;
  };
}

function AuthCallbackErrorPage({ searchParams }: Params) {
  const { error } = searchParams;

  // if there is no error, redirect the user to the sign-in page
  if (!error) {
    redirect('/auth/sign-in');
  }

  return (
    <div className={'flex flex-col space-y-4 py-4'}>
      <div>
        <Alert variant={'destructive'}>
          <AlertTitle>
            <Trans i18nKey={'auth:authenticationErrorAlertHeading'} />
          </AlertTitle>

          <AlertDescription>
            <Trans i18nKey={error} />
          </AlertDescription>
        </Alert>
      </div>

      <ResendLinkForm />

      <div className={'flex flex-col space-y-2'}>
        <Button variant={'ghost'}>
          <a href={'/auth/sign-in'}>
            <Trans i18nKey={'auth:signIn'} />
          </a>
        </Button>
      </div>
    </div>
  );
}

export default AuthCallbackErrorPage;
