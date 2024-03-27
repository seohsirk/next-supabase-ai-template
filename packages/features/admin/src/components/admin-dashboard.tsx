import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

interface Data {
  usersCount: number;
  organizationsCount: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
}

export function AdminDashboard({
  data,
}: React.PropsWithChildren<{
  data: Data;
}>) {
  return (
    <div
      className={
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3' +
        ' xl:grid-cols-4'
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>

        <CardContent>
          <div className={'flex justify-between'}>
            <Figure>{data.usersCount}</Figure>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>

        <CardContent>
          <div className={'flex justify-between'}>
            <Figure>{data.organizationsCount}</Figure>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paying Customers</CardTitle>
        </CardHeader>

        <CardContent>
          <div className={'flex justify-between'}>
            <Figure>{data.activeSubscriptions}</Figure>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trials</CardTitle>
        </CardHeader>

        <CardContent>
          <div className={'flex justify-between'}>
            <Figure>{data.trialSubscriptions}</Figure>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Figure(props: React.PropsWithChildren) {
  return <div className={'text-3xl font-bold'}>{props.children}</div>;
}
