'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { Database } from '@kit/supabase/database';
import { Button } from '@kit/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@kit/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';

import { createInvitationsAction } from '../../actions/account-invitations-server-actions';
import { InviteMembersSchema } from '../../schema/invite-members.schema';
import { MembershipRoleSelector } from '../membership-role-selector';

type InviteModel = ReturnType<typeof createEmptyInviteModel>;

type Role = Database['public']['Enums']['account_role'];

export function InviteMembersDialogContainer({
  account,
  children,
}: React.PropsWithChildren<{
  account: string;
}>) {
  const [pending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen} modal>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Invite Members to Organization</DialogTitle>

          <DialogDescription>
            Invite members to your organization by entering their email and
            role.
          </DialogDescription>
        </DialogHeader>

        <InviteMembersForm
          pending={pending}
          onSubmit={(data) => {
            startTransition(async () => {
              await createInvitationsAction({
                account,
                invitations: data.invitations,
              });

              setIsOpen(false);
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function InviteMembersForm({
  onSubmit,
  pending,
}: {
  onSubmit: (data: { invitations: InviteModel[] }) => void;
  pending: boolean;
}) {
  const { t } = useTranslation('organization');

  const form = useForm({
    resolver: zodResolver(InviteMembersSchema),
    shouldUseNativeValidation: true,
    reValidateMode: 'onSubmit',
    defaultValues: {
      invitations: [createEmptyInviteModel()],
    },
  });

  const fieldArray = useFieldArray({
    control: form.control,
    name: 'invitations',
  });

  return (
    <Form {...form}>
      <form
        className={'flex flex-col space-y-8'}
        data-test={'invite-members-form'}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col space-y-4">
          {fieldArray.fields.map((field, index) => {
            const emailInputName = `invitations.${index}.email` as const;
            const roleInputName = `invitations.${index}.role` as const;

            return (
              <div key={field.id}>
                <div className={'flex items-end space-x-0.5 md:space-x-2'}>
                  <div className={'w-7/12'}>
                    <FormField
                      name={emailInputName}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>{t('emailLabel')}</FormLabel>

                            <FormControl>
                              <Input
                                data-test={'invite-email-input'}
                                placeholder="member@email.com"
                                type="email"
                                required
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className={'w-4/12'}>
                    <FormField
                      name={roleInputName}
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>Role</FormLabel>

                            <FormControl>
                              <MembershipRoleSelector
                                value={field.value}
                                onChange={(role) => {
                                  form.setValue(field.name, role);
                                }}
                              />
                            </FormControl>
                          </FormItem>
                        );
                      }}
                    />
                  </div>

                  <div className={'flex w-[60px] justify-end'}>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={'outline'}
                            size={'icon'}
                            type={'button'}
                            disabled={fieldArray.fields.length <= 1}
                            data-test={'remove-invite-button'}
                            aria-label={t('removeInviteButtonLabel')}
                            onClick={() => {
                              fieldArray.remove(index);
                              form.clearErrors(emailInputName);
                            }}
                          >
                            <X className={'h-4 lg:h-5'} />
                          </Button>
                        </TooltipTrigger>

                        <TooltipContent>
                          {t('removeInviteButtonLabel')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </div>
            );
          })}

          <div>
            <Button
              data-test={'append-new-invite-button'}
              type={'button'}
              variant={'outline'}
              size={'sm'}
              disabled={pending}
              onClick={() => {
                fieldArray.append(createEmptyInviteModel());
              }}
            >
              <span className={'flex items-center space-x-2'}>
                <Plus className={'h-4'} />

                <span>
                  <Trans i18nKey={'organization:addAnotherMemberButtonLabel'} />
                </span>
              </span>
            </Button>
          </div>
        </div>

        <Button disabled={pending}>
          {pending ? 'Inviting...' : 'Invite Members'}
        </Button>
      </form>
    </Form>
  );
}

function createEmptyInviteModel() {
  return { email: '', role: 'member' as Role };
}
