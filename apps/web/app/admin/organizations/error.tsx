'use client';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';

import { PageBody } from '@/components/app/Page';

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
