import Link from 'next/link';

import type { DocumentationPage } from 'contentlayer/generated';

import { If } from '@kit/ui/if';
import { cn } from '@kit/ui/utils';

export function DocumentationPageLink({
  page,
  before,
  after,
}: React.PropsWithChildren<{
  page: DocumentationPage;
  before?: React.ReactNode;
  after?: React.ReactNode;
}>) {
  return (
    <Link
      className={cn(
        `flex w-full items-center space-x-8 rounded-xl p-6 font-medium text-current ring-2 ring-muted transition-all hover:ring-primary`,
        {
          'justify-start': before,
          'justify-end self-end': after,
        },
      )}
      href={`/docs/${page.resolvedPath}`}
    >
      <If condition={before}>{(node) => <>{node}</>}</If>

      <span className={'flex flex-col space-y-1.5'}>
        <span
          className={
            'text-xs font-semibold uppercase dark:text-gray-400' +
            ' text-gray-500'
          }
        >
          {before ? `Previous` : ``}
          {after ? `Next` : ``}
        </span>

        <span>{page.title}</span>
      </span>

      <If condition={after}>{(node) => <>{node}</>}</If>
    </Link>
  );
}
