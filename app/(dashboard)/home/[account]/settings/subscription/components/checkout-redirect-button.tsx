'use client';

import { useEffect } from 'react';

import { useFormState, useFormStatus } from 'react-dom';

import { ChevronRightIcon } from 'lucide-react';

import { isBrowser } from '@kit/shared/utils';
import { Button } from '@kit/ui/button';
import { cn } from '@kit/ui/utils';

export function CheckoutRedirectButton({
  children,
  onCheckoutCreated,
  ...props
}): React.PropsWithChildren<{
  disabled?: boolean;
  stripePriceId?: string;
  recommended?: boolean;
  organizationUid: string;
  onCheckoutCreated?: (clientSecret: string) => void;
}> {
  const [state, formAction] = useFormState(createCheckoutAction, {
    clientSecret: '',
  });

  useEffect(() => {
    if (state.clientSecret && onCheckoutCreated) {
      onCheckoutCreated(state.clientSecret);
    }
  }, [state.clientSecret, onCheckoutCreated]);

  return (
    <form data-test={'checkout-form'} action={formAction}>
      <CheckoutFormData
        organizationUid={props.organizationUid}
        priceId={props.stripePriceId}
      />

      <SubmitCheckoutButton
        disabled={props.disabled}
        recommended={props.recommended}
      >
        {children}
      </SubmitCheckoutButton>
    </form>
  );
}

function SubmitCheckoutButton(
  props: React.PropsWithChildren<{
    recommended?: boolean;
    disabled?: boolean;
  }>,
) {
  const { pending } = useFormStatus();

  return (
    <Button
      className={cn({
        'bg-primary text-primary-foreground dark:bg-white dark:text-gray-900':
          props.recommended,
      })}
      variant={props.recommended ? 'custom' : 'outline'}
      disabled={props.disabled ?? pending}
    >
      <span className={'flex items-center space-x-2'}>
        <span>{props.children}</span>

        <ChevronRightIcon className={'h-4'} />
      </span>
    </Button>
  );
}

function CheckoutFormData(
  props: React.PropsWithChildren<{
    organizationUid: string | undefined;
    priceId: string | undefined;
  }>,
) {
  return (
    <>
      <input
        type="hidden"
        name={'organizationUid'}
        defaultValue={props.organizationUid}
      />

      <input type="hidden" name={'returnUrl'} defaultValue={getReturnUrl()} />
      <input type="hidden" name={'priceId'} defaultValue={props.priceId} />
    </>
  );
}

function getReturnUrl() {
  return isBrowser()
    ? [window.location.origin, window.location.pathname].join('')
    : undefined;
}
