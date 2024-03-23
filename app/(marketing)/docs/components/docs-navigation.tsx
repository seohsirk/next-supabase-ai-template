'use client';

import { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ChevronDownIcon, MenuIcon } from 'lucide-react';

import { isBrowser } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { If } from '@kit/ui/if';
import { cn } from '@kit/ui/utils';

import type { ProcessedDocumentationPage } from '../utils/build-documentation-tree';

const DocsNavLink: React.FC<{
  label: string;
  url: string;
  level: number;
  activePath: string;
  collapsible: boolean;
  collapsed: boolean;
  toggleCollapsed: () => void;
}> = ({
  label,
  url,
  level,
  activePath,
  collapsible,
  collapsed,
  toggleCollapsed,
}) => {
  const isCurrent = url == activePath;
  const isFirstLevel = level === 0;

  return (
    <div className={getNavLinkClassName(isCurrent, isFirstLevel)}>
      <Link
        className="flex h-full max-w-full grow items-center space-x-2"
        href={`/docs/${url}`}
      >
        <span className="block max-w-full truncate">{label}</span>
      </Link>

      {collapsible && (
        <button
          aria-label="Toggle children"
          onClick={toggleCollapsed}
          className="mr-2 shrink-0 px-2 py-1"
        >
          <span
            className={`block w-2.5 ${collapsed ? '-rotate-90 transform' : ''}`}
          >
            <ChevronDownIcon className="h-4 w-4" />
          </span>
        </button>
      )}
    </div>
  );
};

const Node: React.FC<{
  node: ProcessedDocumentationPage;
  level: number;
  activePath: string;
}> = ({ node, level, activePath }) => {
  const [collapsed, setCollapsed] = useState<boolean>(node.collapsed ?? false);
  const toggleCollapsed = () => setCollapsed(!collapsed);

  useEffect(() => {
    if (
      activePath == node.resolvedPath ||
      node.children.map((_) => _.resolvedPath).includes(activePath)
    ) {
      setCollapsed(false);
    }
  }, [activePath, node.children, node.resolvedPath]);

  return (
    <>
      <DocsNavLink
        label={node.label}
        url={node.resolvedPath}
        level={level}
        activePath={activePath}
        collapsible={node.collapsible}
        collapsed={collapsed}
        toggleCollapsed={toggleCollapsed}
      />

      {node.children.length > 0 && !collapsed && (
        <Tree tree={node.children} level={level + 1} activePath={activePath} />
      )}
    </>
  );
};

function Tree({
  tree,
  level,
  activePath,
}: {
  tree: ProcessedDocumentationPage[];
  level: number;
  activePath: string;
}) {
  return (
    <div className={cn('w-full space-y-2.5 pl-3', level > 0 ? 'border-l' : '')}>
      {tree.map((treeNode, index) => (
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

export default function DocsNavigation({
  tree,
}: {
  tree: ProcessedDocumentationPage[];
}) {
  const activePath = usePathname().replace('/docs/', '');

  return (
    <>
      <aside
        style={{
          height: `calc(100vh - 64px)`,
        }}
        className="sticky top-2 hidden w-80 shrink-0 border-r p-4 lg:flex"
      >
        <Tree tree={tree} level={0} activePath={activePath} />
      </aside>

      <div className={'lg:hidden'}>
        <FloatingDocumentationNavigation tree={tree} activePath={activePath} />
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
  tree,
  activePath,
}: React.PropsWithChildren<{
  tree: ProcessedDocumentationPage[];
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

          <Tree tree={tree} level={0} activePath={activePath} />
        </div>
      </If>

      <Button
        className={'fixed bottom-5 right-5 z-10 h-16 w-16 rounded-full'}
        onClick={onClick}
      >
        <MenuIcon className={'h-8'} />
      </Button>
    </>
  );
}
