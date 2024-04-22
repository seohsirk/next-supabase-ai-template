'use client';

import { useEffect, useState } from 'react';

import { CaretSortIcon, PersonIcon } from '@radix-ui/react-icons';
import { CheckCircle, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Button } from '@kit/ui/button';
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@kit/ui/command';
import { If } from '@kit/ui/if';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Separator } from '@kit/ui/separator';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import { CreateTeamAccountDialog } from '../../../team-accounts/src/components/create-team-account-dialog';
import { usePersonalAccountData } from '../hooks/use-personal-account-data';

interface AccountSelectorProps {
  accounts: Array<{
    label: string | null;
    value: string | null;
    image?: string | null;
  }>;

  features: {
    enableTeamCreation: boolean;
  };

  selectedAccount?: string;
  collapsed?: boolean;

  onAccountChange: (value: string | undefined) => void;
}

const PERSONAL_ACCOUNT_SLUG = 'personal';

export function AccountSelector({
  accounts,
  selectedAccount,
  onAccountChange,
  features = {
    enableTeamCreation: true,
  },
  collapsed = false,
}: React.PropsWithChildren<AccountSelectorProps>) {
  const [open, setOpen] = useState<boolean>(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);

  const [value, setValue] = useState<string>(
    selectedAccount ?? PERSONAL_ACCOUNT_SLUG,
  );

  const { t } = useTranslation('teams');
  const personalData = usePersonalAccountData();

  useEffect(() => {
    setValue(selectedAccount ?? PERSONAL_ACCOUNT_SLUG);
  }, [selectedAccount]);

  const Icon = (props: { item: string }) => {
    return (
      <CheckCircle
        className={cn(
          'ml-auto h-4 w-4',
          value === props.item ? 'opacity-100' : 'opacity-0',
        )}
      />
    );
  };

  const selected = accounts.find((account) => account.value === value);
  const pictureUrl = personalData.data?.picture_url;

  const PersonalAccountAvatar = () =>
    pictureUrl ? (
      <UserAvatar pictureUrl={pictureUrl} />
    ) : (
      <PersonIcon className="h-4 w-4" />
    );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            data-test={'account-selector-trigger'}
            size={collapsed ? 'icon' : 'default'}
            variant="ghost"
            role="combobox"
            aria-expanded={open}
            className={cn('dark:shadow-primary/10 group w-full border px-4', {
              'justify-between': !collapsed,
              'justify-center': collapsed,
            })}
          >
            <If
              condition={selected}
              fallback={
                <span className={'flex items-center space-x-2'}>
                  <PersonalAccountAvatar />

                  <span
                    className={cn({
                      hidden: collapsed,
                    })}
                  >
                    <Trans i18nKey={'teams:personalAccount'} />
                  </span>
                </span>
              }
            >
              {(account) => (
                <span className={'flex items-center space-x-2'}>
                  <Avatar
                    className={
                      'group-hover:border-border h-6 w-6 border border-transparent'
                    }
                  >
                    <AvatarImage src={account.image ?? undefined} />

                    <AvatarFallback>
                      {account.label ? account.label[0] : ''}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className={cn({
                      hidden: collapsed,
                    })}
                  >
                    {account.label}
                  </span>
                </span>
              )}
            </If>

            <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder={t('searchAccount')} className="h-9" />

            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => onAccountChange(undefined)}
                  value={PERSONAL_ACCOUNT_SLUG}
                >
                  <PersonalAccountAvatar />

                  <span className={'ml-2'}>
                    <Trans i18nKey={'teams:personalAccount'} />
                  </span>

                  <Icon item={PERSONAL_ACCOUNT_SLUG} />
                </CommandItem>
              </CommandGroup>

              <CommandSeparator />

              <If condition={accounts.length > 0}>
                <CommandGroup
                  heading={
                    <Trans
                      i18nKey={'teams:yourTeams'}
                      values={{ teamsCount: accounts.length }}
                    />
                  }
                >
                  {(accounts ?? []).map((account) => (
                    <CommandItem
                      data-test={'account-selector-team'}
                      data-name={account.label}
                      data-slug={account.value}
                      className={cn(
                        'group flex justify-between transition-colors',
                        {
                          ['bg-muted']: value === account.value,
                        },
                      )}
                      key={account.value}
                      value={account.value ?? ''}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue);
                        setOpen(false);

                        if (onAccountChange) {
                          onAccountChange(currentValue);
                        }
                      }}
                    >
                      <div className={'flex items-center'}>
                        <Avatar
                          className={cn(
                            'mr-2 h-6 w-6 border border-transparent',
                            {
                              ['border-border']: value === account.value,
                              ['group-hover:border-border ']:
                                value !== account.value,
                            },
                          )}
                        >
                          <AvatarImage src={account.image ?? undefined} />

                          <AvatarFallback>
                            {account.label ? account.label[0] : ''}
                          </AvatarFallback>
                        </Avatar>

                        <span className={'mr-2 max-w-[165px] truncate'}>
                          {account.label}
                        </span>
                      </div>

                      <Icon item={account.value ?? ''} />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </If>
            </CommandList>
          </Command>

          <Separator />

          <If condition={features.enableTeamCreation}>
            <Button
              data-test={'create-team-account-trigger'}
              variant="ghost"
              className="w-full justify-start"
              onClick={() => {
                setIsCreatingAccount(true);
                setOpen(false);
              }}
            >
              <Plus className="mr-3 h-4 w-4" />

              <span>
                <Trans i18nKey={'teams:createTeam'} />
              </span>
            </Button>
          </If>
        </PopoverContent>
      </Popover>

      <If condition={features.enableTeamCreation}>
        <CreateTeamAccountDialog
          isOpen={isCreatingAccount}
          setIsOpen={setIsCreatingAccount}
        />
      </If>
    </>
  );
}

function UserAvatar(props: { pictureUrl?: string }) {
  return (
    <Avatar className={'h-6 w-6'}>
      <AvatarImage src={props.pictureUrl} />
    </Avatar>
  );
}
