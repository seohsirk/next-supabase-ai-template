'use client';

import { useMemo } from 'react';

import { ArrowDown, ArrowUp, Menu } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, XAxis } from 'recharts';

import { Badge } from '@kit/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@kit/ui/table';

export default function DashboardDemo() {
  const mrr = useMemo(() => generateDemoData(), []);
  const visitors = useMemo(() => generateDemoData(), []);
  const returningVisitors = useMemo(() => generateDemoData(), []);
  const churn = useMemo(() => generateDemoData(), []);
  const netRevenue = useMemo(() => generateDemoData(), []);
  const fees = useMemo(() => generateDemoData(), []);
  const newCustomers = useMemo(() => generateDemoData(), []);
  const tickets = useMemo(() => generateDemoData(), []);
  const activeUsers = useMemo(() => generateDemoData(), []);

  return (
    <div className={'flex flex-col space-y-6 pb-36'}>
      <div
        className={
          'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3' +
          ' 2xl:grid-cols-4'
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Monthly Recurring Revenue</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{`$${mrr[1]}`}</Figure>
              <Trend trend={'up'}>20%</Trend>
            </div>

            <Chart data={mrr[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{`$${netRevenue[1]}`}</Figure>
              <Trend trend={'up'}>12%</Trend>
            </div>

            <Chart data={netRevenue[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fees</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{`$${fees[1]}`}</Figure>
              <Trend trend={'up'}>9%</Trend>
            </div>

            <Chart data={fees[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Customers</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{`${newCustomers[1]}`}</Figure>
              <Trend trend={'down'}>-25%</Trend>
            </div>

            <Chart data={newCustomers[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visitors</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{visitors[1]}</Figure>
              <Trend trend={'down'}>-4.3%</Trend>
            </div>

            <Chart data={visitors[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Returning Visitors</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{returningVisitors[1]}</Figure>
              <Trend trend={'stale'}>10%</Trend>
            </div>

            <Chart data={returningVisitors[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Churn</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{churn[1]}%</Figure>
              <Trend trend={'up'}>-10%</Trend>
            </div>

            <Chart data={churn[0]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{tickets[1]}</Figure>
              <Trend trend={'up'}>-30%</Trend>
            </div>

            <Chart data={tickets[0]} />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Active Users</CardTitle>
          </CardHeader>

          <CardContent>
            <div className={'flex justify-between'}>
              <Figure>{activeUsers[1]}</Figure>
              <Trend trend={'up'}>10%</Trend>
            </div>

            <Chart data={activeUsers[0]} />
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>

          <CardContent>
            <CustomersTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateDemoData() {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat('en-us', {
    month: 'long',
    year: '2-digit',
  });

  const data: { value: string; name: string }[] = [];

  for (let n = 8; n > 0; n -= 1) {
    const date = new Date(today.getFullYear(), today.getMonth() - n, 1);

    data.push({
      name: formatter.format(date),
      value: (Math.random() * 10).toFixed(1),
    });
  }

  const lastValue = data[data.length - 1]?.value;

  return [data, lastValue] as [typeof data, string];
}

function Chart(
  props: React.PropsWithChildren<{ data: { value: string; name: string }[] }>,
) {
  return (
    <div className={'h-36'}>
      <ResponsiveContainer width={'100%'} height={'100%'}>
        <LineChart width={400} height={100} data={props.data}>
          <Line
            className={'text-primary'}
            type="monotone"
            dataKey="value"
            stroke="currentColor"
            strokeWidth={2.5}
            dot={false}
          />

          <XAxis
            style={{ fontSize: 9 }}
            axisLine={false}
            tickSize={0}
            dataKey="name"
            height={15}
            dy={10}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CustomersTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Plan</TableHead>
          <TableHead>MRR</TableHead>
          <TableHead>Logins</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        <TableRow>
          <TableCell>Pippin Oddo</TableCell>
          <TableCell>Pro</TableCell>
          <TableCell>$100.2</TableCell>
          <TableCell>920</TableCell>
          <TableCell>
            <BadgeWithTrend trend={'up'}>Healthy</BadgeWithTrend>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Väinö Pánfilo</TableCell>
          <TableCell>Basic</TableCell>
          <TableCell>$40.6</TableCell>
          <TableCell>300</TableCell>
          <TableCell>
            <BadgeWithTrend trend={'stale'}>Possible Churn</BadgeWithTrend>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Giorgos Quinten</TableCell>
          <TableCell>Pro</TableCell>
          <TableCell>$2004.3</TableCell>
          <TableCell>1000</TableCell>
          <TableCell>
            <BadgeWithTrend trend={'up'}>Healthy</BadgeWithTrend>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell>Adhelm Otis</TableCell>
          <TableCell>Basic</TableCell>
          <TableCell>$0</TableCell>
          <TableCell>10</TableCell>
          <TableCell>
            <BadgeWithTrend trend={'down'}>Churned</BadgeWithTrend>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

function BadgeWithTrend(props: React.PropsWithChildren<{ trend: string }>) {
  const className = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-destructive';
      case 'stale':
        return 'text-orange-500';
    }
  }, [props.trend]);

  return (
    <Badge variant={'outline'}>
      <span className={className}>{props.children}</span>
    </Badge>
  );
}

function Figure(props: React.PropsWithChildren) {
  return <div className={'text-4xl font-bold'}>{props.children}</div>;
}

function Trend(
  props: React.PropsWithChildren<{
    trend: 'up' | 'down' | 'stale';
  }>,
) {
  const Icon = useMemo(() => {
    switch (props.trend) {
      case 'up':
        return <ArrowUp className={'h-4 text-green-500'} />;
      case 'down':
        return <ArrowDown className={'h-4 text-destructive'} />;
      case 'stale':
        return <Menu className={'h-4 text-orange-500'} />;
    }
  }, [props.trend]);

  return (
    <div>
      <BadgeWithTrend trend={props.trend}>
        <span className={'flex items-center space-x-0.5'}>
          {Icon}
          <span>{props.children}</span>
        </span>
      </BadgeWithTrend>
    </div>
  );
}
