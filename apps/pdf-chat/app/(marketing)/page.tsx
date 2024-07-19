import Image from 'next/image';
import Link from 'next/link';

import {
  ArrowRightIcon,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Lock,
  Sparkle,
} from 'lucide-react';

import { PricingTable } from '@kit/billing-gateway/marketing';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'mt-4 flex flex-col space-y-24 py-16'}>
      <div className={'container mx-auto flex flex-col space-y-20'}>
        <div
          className={
            'flex flex-col items-center md:flex-row' +
            ' mx-auto flex-1 justify-center animate-in fade-in' +
            ' duration-500 zoom-in-95 slide-in-from-top-24'
          }
        >
          <div
            className={
              'flex w-full flex-1 flex-col items-center space-y-8 xl:space-y-12 2xl:space-y-14'
            }
          >
            <Pill new>
              <span>Chat with your PDFs with AI</span>
            </Pill>

            <div className={'flex flex-col items-center space-y-8 max-w-2xl'}>
              <HeroTitle>
                <span>Stop wasting time reading long PDFs</span>
              </HeroTitle>

              <div className={'flex flex-col'}>
                <Heading
                  level={3}
                  className={
                    'p-0 text-center font-sans text-2xl font-normal'
                  }
                >
                  <span>
                    Upload your PDFs and let us help you understand them. Our AI
                    is capable of answering your questions about your PDFs. Get
                    started for free.
                  </span>
                </Heading>
              </div>

              <MainCallToActionButton />
            </div>
          </div>
        </div>

        <div
          className={
            'mx-auto flex max-w-6xl justify-center py-12 animate-in fade-in ' +
            ' delay-300 duration-1000 slide-in-from-top-16 fill-mode-both'
          }
        >
          <Image
            priority
            className={
              'delay-250 rounded-lg border duration-1000 ease-out animate-in fade-in zoom-in-50 fill-mode-both'
            }
            width={1689}
            height={1057}
            src={`/images/dashboard.webp`}
            alt={`App Image`}
          />
        </div>
      </div>

      <div className={'container mx-auto'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-16 py-16'
          }
        >
          <div className={'flex flex-col items-center space-y-8 text-center'}>
            <Pill>Get started for free. No credit card required.</Pill>

            <div className={'flex flex-col space-y-2'}>
              <Heading level={1}>
                Fair pricing for all types of businesses
              </Heading>

              <Heading
                level={2}
                className={'font-sans font-normal text-muted-foreground'}
              >
                Get started on our free plan and upgrade when you are ready.
              </Heading>
            </div>
          </div>

          <div className={'w-full'}>
            <PricingTable
              config={billingConfig}
              paths={{
                signUp: pathsConfig.auth.signUp,
                return: pathsConfig.app.home,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Home);

function HeroTitle({ children }: React.PropsWithChildren) {
  return (
    <h1
      className={
        'hero-title flex flex-col space-y-1 text-center font-sans text-4xl font-semibold tracking-tighter dark:text-white sm:text-6xl lg:max-w-5xl lg:text-7xl xl:text-[5.125rem]'
      }
    >
      {children}
    </h1>
  );
}

function Pill(
  props: React.PropsWithChildren<{
    new?: boolean;
  }>,
) {
  return (
    <h2
      className={
        'space-x-2.5 rounded-full border border-gray-100 px-2 py-2.5 text-center text-sm font-medium text-transparent dark:border-primary/10'
      }
    >
      {props.new && (
        <span
          className={
            'rounded-2xl bg-primary px-2.5 py-1.5 text-sm font-semibold text-primary-foreground'
          }
        >
          New
        </span>
      )}
      <GradientSecondaryText>{props.children}</GradientSecondaryText>
    </h2>
  );
}

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-4'}>
      <Button
        className={
          'h-12 rounded-xl px-4 text-base font-semibold transition-all hover:shadow-2xl dark:shadow-primary/30'
        }
        asChild
      >
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>
              <Trans i18nKey={'common:getStarted'} />
            </span>

            <ArrowRightIcon
              className={
                'h-4 animate-in fade-in slide-in-from-left-8' +
                ' delay-1000 duration-1000 zoom-in fill-mode-both'
              }
            />
          </span>
        </Link>
      </Button>

      <Button
        variant={'link'}
        className={'h-12 rounded-xl px-4 text-base font-semibold'}
        asChild
      >
        <Link href={'/contact'}>
          <Trans i18nKey={'common:contactUs'} />
        </Link>
      </Button>
    </div>
  );
}

function GradientSecondaryText(
  props: React.PropsWithChildren<{
    className?: string;
  }>,
) {
  return (
    <span
      className={cn(
        'bg-gradient-to-r from-foreground/60 to-foreground bg-clip-text text-transparent',
        props.className,
      )}
    >
      {props.children}
    </span>
  );
}
