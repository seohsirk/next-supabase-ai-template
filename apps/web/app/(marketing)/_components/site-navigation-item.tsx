'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@kit/ui/navigation-menu';
import { cn, isRouteActive } from '@kit/ui/utils';

const getClassName = (path: string, currentPathName: string) => {
  const isActive = isRouteActive(path, currentPathName);

  return cn(`text-sm transition-all px-4 py-2 rounded-full font-medium`, {
    'bg-muted': isActive,
    'hover:bg-muted active:bg-muted/50': !isActive,
  });
};

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();

  return (
    <NavigationMenuItem key={path}>
      <Link className={getClassName(path, currentPathName)} href={path}>
        {children}
      </Link>
    </NavigationMenuItem>
  );
}
