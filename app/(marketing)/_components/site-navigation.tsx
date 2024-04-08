import Link from 'next/link';

import { Menu } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuList } from '@kit/ui/navigation-menu';
import { Trans } from '@kit/ui/trans';

import { SiteNavigationItem } from '~/(marketing)/_components/site-navigation-item';

const links = {
  Blog: {
    label: 'marketing:blog',
    path: '/blog',
  },
  Docs: {
    label: 'marketing:documentation',
    path: '/docs',
  },
  Pricing: {
    label: 'marketing:pricing',
    path: '/pricing',
  },
  FAQ: {
    label: 'marketing:faq',
    path: '/faq',
  },
};

export function SiteNavigation() {
  const NavItems = Object.values(links).map((item) => {
    return (
      <SiteNavigationItem key={item.path} path={item.path}>
        <Trans i18nKey={item.label} />
      </SiteNavigationItem>
    );
  });

  return (
    <>
      <div className={'hidden items-center lg:flex'}>
        <NavigationMenu>
          <NavigationMenuList
            className={
              'space-x-1.5 rounded-full px-1 py-2 shadow-sm dark:shadow-primary/20'
            }
          >
            {NavItems}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <div className={'flex items-center lg:hidden'}>
        <MobileDropdown />
      </div>
    </>
  );
}

function MobileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={'Open Menu'}>
        <Menu className={'h-9'} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {Object.values(links).map((item) => {
          const className = 'flex w-full h-full items-center';

          return (
            <DropdownMenuItem key={item.path}>
              <Link className={className} href={item.path}>
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
