'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Menu } from 'lucide-react';

import { Cms } from '@kit/cms';
import { isBrowser } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { cn } from '@kit/ui/utils';

const DocsNavLink: React.FC<{
  label: string;
  url: string;
  level: number;
  activePath: string;
}> = ({ label, url, level, activePath }) => {
  const isCurrent = url == activePath;
  const isFirstLevel = level === 0;

  return (
    <div className={getNavLinkClassName(isCurrent, isFirstLevel)}>
      <Link
        className="flex h-full max-w-full grow items-center space-x-2"
        href={url}
      >
        <span className="block max-w-full truncate">{label}</span>
      </Link>
    </div>
  );
};

const Node: React.FC<{
  node: Cms.ContentItem;
  level: number;
  activePath: string;
}> = ({ node, level, activePath }) => {
  return (
    <>
      <DocsNavLink
        label={node.title}
        url={node.url}
        level={level}
        activePath={activePath}
      />

      {(node.children ?? []).length > 0 && (
        <Tree
          pages={node.children ?? []}
          level={level + 1}
          activePath={activePath}
        />
      )}
    </>
  );
};

function Tree({
  pages,
  level,
  activePath,
}: {
  pages: Cms.ContentItem[];
  level: number;
  activePath: string;
}) {
  return (
    <div className={cn('w-full space-y-2.5 pl-3', level > 0 ? 'border-l' : '')}>
      {pages.map((treeNode, index) => (
        <Node
          key={index}
          node={treeNode}
          level={level}
          activePath={activePath}
        />
      ))}
    </div>
  );
}

export function DocsNavigation({ pages }: { pages: Cms.ContentItem[] }) {
  const activePath = usePathname().replace('/docs/', '');

  return (
    <>
      <aside
        style={{
          height: `calc(100vh - 64px)`,
        }}
        className="sticky top-2 hidden w-80 shrink-0 border-r p-4 lg:flex"
      >
        <Tree pages={pages} level={0} activePath={activePath} />
      </aside>

      <div className={'lg:hidden'}>
        <FloatingDocumentationNavigation
          pages={pages}
          activePath={activePath}
        />
      </div>
    </>
  );
}

function getNavLinkClassName(isCurrent: boolean, isFirstLevel: boolean) {
  return cn(
    'group flex h-8 items-center justify-between space-x-2 whitespace-nowrap rounded-md px-3 text-sm leading-none transition-colors',
    {
      [`bg-muted`]: isCurrent,
      [`hover:bg-muted`]: !isCurrent,
      [`font-semibold`]: isFirstLevel,
      [`font-normal`]: !isFirstLevel && isCurrent,
      [`hover:text-foreground-muted`]: !isFirstLevel && !isCurrent,
    },
  );
}

function FloatingDocumentationNavigation({
  pages,
  activePath,
}: React.PropsWithChildren<{
  pages: Cms.ContentItem[];
  activePath: string;
}>) {
  const body = useMemo(() => {
    return isBrowser() ? document.body : null;
  }, []);

  const [isVisible, setIsVisible] = useState(false);

  const enableScrolling = (element: HTMLElement) =>
    (element.style.overflowY = '');

  const disableScrolling = (element: HTMLElement) =>
    (element.style.overflowY = 'hidden');

  // enable/disable body scrolling when the docs are toggled
  useEffect(() => {
    if (!body) {
      return;
    }

    if (isVisible) {
      disableScrolling(body);
    } else {
      enableScrolling(body);
    }
  }, [isVisible, body]);

  // hide docs when navigating to another page
  useEffect(() => {
    setIsVisible(false);
  }, [activePath]);

  const onClick = () => {
    setIsVisible(!isVisible);
  };

  return (
    <>
      <If condition={isVisible}>
        <div
          className={
            'fixed left-0 top-0 z-10 h-screen w-full p-4' +
            ' flex flex-col space-y-4 overflow-auto bg-white dark:bg-background'
          }
        >
          <Heading level={1}>Table of Contents</Heading>

          <Tree pages={pages} level={0} activePath={activePath} />
        </div>
      </If>

      <Button
        className={'fixed bottom-5 right-5 z-10 h-16 w-16 rounded-full'}
        onClick={onClick}
      >
        <Menu className={'h-8'} />
      </Button>
    </>
  );
}
