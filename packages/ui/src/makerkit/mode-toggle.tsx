'use client';

import { useMemo } from 'react';

import { CheckCircle, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '../shadcn/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '../shadcn/dropdown-menu';
import { If } from './if';
import { Trans } from './trans';

const MODES = ['light', 'dark', 'system'];

export function ModeToggle() {
  const { setTheme } = useTheme();

  const Items = useMemo(() => {
    return MODES.map((mode) => {
      return (
        <DropdownMenuItem
          key={mode}
          onClick={() => {
            setTheme(mode);
          }}
        >
          <Trans i18nKey={`common:${mode}Theme`} />
        </DropdownMenuItem>
      );
    });
  }, [setTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1rem] w-[1rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1rem] w-[1rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{Items}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SubMenuModeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  const MenuItems = useMemo(
    () =>
      ['light', 'dark', 'system'].map((item) => {
        return (
          <DropdownMenuItem
            className={'justify-between'}
            key={item}
            onClick={() => {
              setTheme(item);
            }}
          >
            <Trans i18nKey={`common:${item}Theme`} />

            <If condition={theme === item}>
              <CheckCircle className={'mr-2 h-3'} />
            </If>
          </DropdownMenuItem>
        );
      }),
    [setTheme, theme],
  );

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        <span className={'flex w-full items-center space-x-2'}>
          {resolvedTheme === 'light' ? (
            <Sun className={'h-5'} />
          ) : (
            <Moon className={'h-5'} />
          )}

          <span>
            <Trans i18nKey={'common:theme'} />
          </span>
        </span>
      </DropdownMenuSubTrigger>

      <DropdownMenuSubContent>{MenuItems}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
