'use client';

import { PageBody } from '@/components/app/Page';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';

function OrganizationsAdminPageError() {
  return (
    <PageBody>
      <Alert variant={'destructive'}>
        <AlertTitle>Could not load organizations</AlertTitle>
        <AlertDescription>
          There was an error loading the organizations. Please check your
          console errors.
        </AlertDescription>
      </Alert>
    </PageBody>
  );
}

export default OrganizationsAdminPageError;
