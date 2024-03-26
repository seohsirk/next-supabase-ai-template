'use client';

import { useCallback } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { z } from 'zod';

import { useUpdateAccountData } from '@kit/accounts/hooks/use-update-account';
import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Trans } from '@kit/ui/trans';

const Schema = z.object({
  name: z.string().min(1).max(255),
});

export const UpdateOrganizationForm = (props: {
  accountId: string;
  accountName: string;
}) => {
  const updateAccountData = useUpdateAccountData(props.accountId);
  const { t } = useTranslation('organization');

  const form = useForm({
    resolver: zodResolver(Schema),
    defaultValues: {
      name: props.accountName,
    },
  });

  const updateOrganizationData = useCallback(
    (data: { name: string }) => {
      const promise = updateAccountData.mutateAsync(data);

      toast.promise(promise, {
        loading: t(`updateOrganizationLoadingMessage`),
        success: t(`updateOrganizationSuccessMessage`),
        error: t(`updateOrganizationErrorMessage`),
      });
    },
    [t, updateAccountData],
  );

  return (
    <div className={'space-y-8'}>
      <Form {...form}>
        <form
          className={'flex flex-col space-y-4'}
          onSubmit={form.handleSubmit((data) => {
            updateOrganizationData(data);
          })}
        >
          <FormField
            name={'name'}
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey={'teams:organizationNameInputLabel'} />
                  </FormLabel>

                  <FormControl>
                    <Input
                      data-test={'organization-name-input'}
                      required
                      placeholder={''}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          ></FormField>

          <div>
            <Button
              className={'w-full md:w-auto'}
              data-test={'update-organization-submit-button'}
              disabled={updateAccountData.isPending}
            >
              <Trans i18nKey={'teams:updateOrganizationSubmitLabel'} />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
