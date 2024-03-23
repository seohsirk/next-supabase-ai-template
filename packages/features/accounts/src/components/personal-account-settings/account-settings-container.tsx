import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { If } from '@kit/ui/if';

import { AccountDangerZone } from './account-danger-zone';
import { UpdateAccountDetailsFormContainer } from './update-account-details-form-container';
import { UpdateAccountImageContainer } from './update-account-image-container';
import { UpdateEmailFormContainer } from './update-email-form-container';
import { UpdatePasswordFormContainer } from './update-password-container';

export function PersonalAccountSettingsContainer(
  props: React.PropsWithChildren<{
    features: {
      enableAccountDeletion: boolean;
    };

    paths: {
      callback: string;
    };
  }>,
) {
  return (
    <div className={'flex w-full flex-col space-y-8 pb-32'}>
      <Card>
        <CardHeader>
          <CardTitle>Your Profile Picture</CardTitle>
        </CardHeader>

        <CardContent>
          <UpdateAccountImageContainer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Details</CardTitle>
        </CardHeader>

        <CardContent>
          <UpdateAccountDetailsFormContainer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update your Email</CardTitle>
        </CardHeader>

        <CardContent>
          <UpdateEmailFormContainer callbackPath={props.paths.callback} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update your Password</CardTitle>
        </CardHeader>

        <CardContent>
          <UpdatePasswordFormContainer callbackPath={props.paths.callback} />
        </CardContent>
      </Card>

      <If condition={props.features.enableAccountDeletion}>
        <Card className={'border-destructive border-2'}>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
          </CardHeader>

          <CardContent>
            <AccountDangerZone />
          </CardContent>
        </Card>
      </If>
    </div>
  );
}
