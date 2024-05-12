import { use } from 'react';

import Link from 'next/link';

import { Heading } from '@kit/ui/heading';

import { loadUserWorkspace } from '../_lib/server/load-user-workspace';
import { HomeAddAccountButton } from './home-add-account-button';

export function HomeAccountsList() {
  const { accounts } = use(loadUserWorkspace());

  if (!accounts.length) {
    return <HomeAccountsListEmptyState />;
  }

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {accounts.map((account) => (
          <Link
            className="flex h-36 rounded-lg bg-secondary/80 p-4 transition-all hover:bg-secondary/90 active:bg-secondary"
            key={account.id}
            href={`/home/${account.value}`}
          >
            <span className="text-sm font-medium">{account.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function HomeAccountsListEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-24">
      <div className="flex flex-col items-center space-y-1">
        <Heading level={2}>You don&apos;t have any teams yet.</Heading>

        <Heading
          className="font-sans font-medium text-muted-foreground"
          level={4}
        >
          Create a team to get started.
        </Heading>
      </div>

      <HomeAddAccountButton />
    </div>
  );
}
