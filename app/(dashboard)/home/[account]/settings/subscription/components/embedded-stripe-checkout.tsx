'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Close as DialogPrimitiveClose } from '@radix-ui/react-dialog';
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { XIcon } from 'lucide-react';

import pricingConfig, {
  StripeCheckoutDisplayMode,
} from '@/config/pricing.config';

import { cn } from '@/lib/utils';

import If from '@/components/app/If';
import LogoImage from '@/components/app/Logo/LogoImage';
import Trans from '@/components/app/Trans';

const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    'Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable. Did you forget to add it to your .env file?',
  );
}

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

export default function EmbeddedStripeCheckout({
  clientSecret,
  onClose,
}: React.PropsWithChildren<{
  clientSecret: string;
  onClose?: () => void;
}>) {
  return (
    <EmbeddedCheckoutPopup key={clientSecret} onClose={onClose}>
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={{ clientSecret }}
      >
        <EmbeddedCheckout className={'EmbeddedCheckoutClassName'} />
      </EmbeddedCheckoutProvider>
    </EmbeddedCheckoutPopup>
  );
}

function EmbeddedCheckoutPopup({
  onClose,
  children,
}: React.PropsWithChildren<{
  onClose?: () => void;
}>) {
  const [open, setOpen] = useState(true);

  const displayMode = pricingConfig.displayMode;
  const isPopup = displayMode === StripeCheckoutDisplayMode.Popup;
  const isOverlay = displayMode === StripeCheckoutDisplayMode.Overlay;

  const className = cn({
    [`bg-white p-4 max-h-[98vh] overflow-y-auto shadow-transparent border border-gray-200 dark:border-dark-700`]:
      isPopup,
    [`bg-background !flex flex-col flex-1 fixed top-0 !max-h-full !max-w-full left-0 w-screen h-screen border-transparent shadow-transparent py-4 px-8`]:
      isOverlay,
  });

  const close = () => {
    setOpen(false);

    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      defaultOpen
      open={open}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose();
        }

        setOpen(open);
      }}
    >
      <DialogContent
        className={className}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <If condition={isOverlay}>
          <div className={'mb-8'}>
            <div className={'flex items-center justify-between'}>
              <LogoImage />

              <Button onClick={close} variant={'outline'}>
                <Trans i18nKey={'common:cancel'} />
              </Button>
            </div>
          </div>
        </If>

        <If condition={isPopup}>
          <DialogPrimitiveClose asChild>
            <Button
              size={'icon'}
              className={'absolute right-4 top-2 flex items-center'}
              aria-label={'Close Checkout'}
              onClick={close}
            >
              <XIcon className={'h-6 text-gray-900'} />

              <span className="sr-only">
                <Trans i18nKey={'common:cancel'} />
              </span>
            </Button>
          </DialogPrimitiveClose>
        </If>

        <div
          className={cn({
            [`flex-1 rounded-xl bg-white p-8`]: isOverlay,
          })}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}
