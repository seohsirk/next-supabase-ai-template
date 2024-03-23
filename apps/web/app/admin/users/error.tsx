'use client';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';

import { PageBody } from '@/components/app/Page';

function UsersAdminPageError() {
  return (
    <PageBody>
      <Alert variant={'destructive'}>
        <AlertTitle>Could not load users</AlertTitle>
        <AlertDescription>
          There was an error loading the users. Please check your console
          errors.
        </AlertDescription>
      </Alert>
    </PageBody>
  );
}

export default UsersAdminPageError;
