import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';
import { If } from '@kit/ui/if';
import { Trans } from '@kit/ui/trans';

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
          <CardTitle>
            <Trans i18nKey={'account:accountImage'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:accountImageDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateAccountImageContainer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:name'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:nameDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateAccountDetailsFormContainer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:updateEmailCardTitle'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:updateEmailCardDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateEmailFormContainer callbackPath={props.paths.callback} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Trans i18nKey={'account:updatePasswordCardTitle'} />
          </CardTitle>

          <CardDescription>
            <Trans i18nKey={'account:updatePasswordCardDescription'} />
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdatePasswordFormContainer callbackPath={props.paths.callback} />
        </CardContent>
      </Card>

      <If condition={props.features.enableAccountDeletion}>
        <Card className={'border-destructive border-2'}>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey={'account:dangerZone'} />
            </CardTitle>

            <CardDescription>
              <Trans i18nKey={'account:dangerZoneDescription'} />
            </CardDescription>
          </CardHeader>

          <CardContent>
            <AccountDangerZone />
          </CardContent>
        </Card>
      </If>
    </div>
  );
}
