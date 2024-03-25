import Link from 'next/link';

import { MenuIcon } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@kit/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@kit/ui/navigation-menu';

const links = {
  SignIn: {
    label: 'Sign In',
    path: '/auth/sign-in',
  },
  Blog: {
    label: 'Blog',
    path: '/blog',
  },
  Docs: {
    label: 'Documentation',
    path: '/docs',
  },
  Pricing: {
    label: 'Pricing',
    path: '/pricing',
  },
  FAQ: {
    label: 'FAQ',
    path: '/faq',
  },
};

export function SiteNavigation() {
  const className = `hover:underline text-sm`;

  return (
    <>
      <div className={'hidden items-center lg:flex'}>
        <NavigationMenu>
          <NavigationMenuList className={'space-x-2.5'}>
            <NavigationMenuItem>
              <Link className={className} href={links.Blog.path}>
                {links.Blog.label}
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link className={className} href={links.Docs.path}>
                {links.Docs.label}
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link className={className} href={links.Pricing.path}>
                {links.Pricing.label}
              </Link>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Link className={className} href={links.FAQ.path}>
                {links.FAQ.label}
              </Link>
            </NavigationMenuItem>
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
        <MenuIcon className={'h-9'} />
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
