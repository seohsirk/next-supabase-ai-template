'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { TeamAccountDangerZone } from './team-account-danger-zone';
import { UpdateTeamAccountImage } from './update-team-account-image-container';
import { UpdateTeamAccountNameForm } from './update-team-account-name-form';

export function TeamAccountSettingsContainer(props: {
  account: {
    name: string;
    slug: string;
    id: string;
    pictureUrl: string | null;
    primaryOwnerUserId: string;
  };

  userId: string;

  paths: {
    teamAccountSettings: string;
  };
}) {
  return (
    <div className={'flex flex-col space-y-8'}>
      <Card>
        <CardHeader>
          <CardTitle>Team Logo</CardTitle>

          <CardDescription>
            Update your team's logo to make it easier to identify
          </CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamAccountImage account={props.account} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Account Settings</CardTitle>

          <CardDescription>Manage your team account settings</CardDescription>
        </CardHeader>

        <CardContent>
          <UpdateTeamAccountNameForm
            path={props.paths.teamAccountSettings}
            account={props.account}
          />
        </CardContent>
      </Card>

      <Card className={'border-destructive border-2'}>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>

          <CardDescription>
            Please be careful when making changes in this section as they are
            irreversible.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <TeamAccountDangerZone
            userIsPrimaryOwner={
              props.userId === props.account.primaryOwnerUserId
            }
            account={props.account}
          />
        </CardContent>
      </Card>
    </div>
  );
}
