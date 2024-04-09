import Image from 'next/image';
import Link from 'next/link';

import { ChevronRight, Sparkle } from 'lucide-react';

import { PricingTable } from '@kit/billing-gateway/components';
import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';

import billingConfig from '~/config/billing.config';
import pathsConfig from '~/config/paths.config';
import { withI18n } from '~/lib/i18n/with-i18n';

function Home() {
  return (
    <div className={'flex flex-col space-y-24 py-16'}>
      <div className={'container mx-auto flex flex-col space-y-24'}>
        <div
          className={
            'flex flex-col items-center md:flex-row' +
            ' mx-auto flex-1 justify-center animate-in fade-in ' +
            ' duration-1000 slide-in-from-top-12'
          }
        >
          <div
            className={
              'flex w-full flex-1 flex-col items-center space-y-8 xl:space-y-12 2xl:space-y-14'
            }
          >
            <Pill>
              <span>The leading SaaS Starter Kit for ambitious developers</span>
            </Pill>

            <div className={'flex flex-col items-center space-y-8'}>
              <HeroTitle>
                <span>The SaaS Starter Kit</span>

                <span>
                  <span>for ambitious developers</span>
                </span>
              </HeroTitle>

              <div>
                <Heading
                  level={3}
                  className={'text-center font-medium text-muted-foreground'}
                >
                  <span>Build and launch a SaaS in days, not months</span>
                </Heading>

                <Heading
                  level={3}
                  className={'text-center font-medium text-muted-foreground'}
                >
                  <span>
                    <span>Focus on your business, not on the tech</span>
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
              'rounded-lg border delay-500 duration-1000 ease-out animate-in fade-in zoom-in-50 fill-mode-both'
            }
            width={3069}
            height={1916}
            src={`/assets/images/dashboard-demo.webp`}
            alt={`App Image`}
          />
        </div>
      </div>

      <div className={'container mx-auto'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-24 py-16'
          }
        >
          <div
            className={
              'flex max-w-3xl flex-col items-center space-y-8 text-center'
            }
          >
            <Pill>
              <span>A modern, scalable, and secure SaaS Starter Kit</span>
            </Pill>

            <div className={'flex flex-col space-y-1'}>
              <Heading level={2}>The best tool in the space</Heading>

              <Heading
                level={3}
                className={'font-medium text-muted-foreground'}
              >
                Unbeatable Features and Benefits for Your SaaS Business
              </Heading>
            </div>
          </div>
        </div>
      </div>

      <div className={'container mx-auto'}>
        <div className={'flex flex-col space-y-4'}>
          <FeatureShowcaseContainer>
            <LeftFeatureContainer>
              <div className={'flex flex-col space-y-1'}>
                <Heading level={2}>Authentication</Heading>

                <Heading level={3} className={'text-muted-foreground'}>
                  Secure and Easy-to-Use Authentication for Your SaaS Website
                  and API
                </Heading>
              </div>

              <div>
                Our authentication system is built on top of the
                industry-leading PaaS such as Supabase and Firebase. It is
                secure, easy-to-use, and fully customizable. It supports
                email/password, social logins, and more.
              </div>
            </LeftFeatureContainer>

            <RightFeatureContainer>
              <Image
                className="rounded-2xl"
                src={'/assets/images/sign-in.webp'}
                width={'626'}
                height={'683'}
                alt={'Sign In'}
              />
            </RightFeatureContainer>
          </FeatureShowcaseContainer>

          <FeatureShowcaseContainer>
            <LeftFeatureContainer>
              <Image
                className="rounded-2xl"
                src={'/assets/images/dashboard.webp'}
                width={'887'}
                height={'743'}
                alt={'Dashboard'}
              />
            </LeftFeatureContainer>

            <RightFeatureContainer>
              <div className={'flex flex-col space-y-1'}>
                <Heading level={2}>Dashboard</Heading>

                <Heading level={3} className={'text-muted-foreground'}>
                  A fantastic dashboard to manage your SaaS business
                </Heading>
              </div>

              <div>
                Our dashboard offers an overview of your SaaS business. It shows
                at a glance all you need to know about your business. It is
                fully customizable and extendable.
              </div>
            </RightFeatureContainer>
          </FeatureShowcaseContainer>
        </div>
      </div>

      <div className={'container mx-auto'}>
        <div
          className={
            'flex flex-col items-center justify-center space-y-16 py-16'
          }
        >
          <div className={'flex flex-col items-center space-y-8 text-center'}>
            <Pill>
              Get started for free. No credit card required. Cancel anytime.
            </Pill>

            <div className={'flex flex-col space-y-1'}>
              <Heading level={2}>
                Ready to take your SaaS business to the next level?
              </Heading>

              <Heading level={3} className={'text-muted-foreground'}>
                Get started on our free plan and upgrade when you are ready.
              </Heading>
            </div>
          </div>

          <div className={'w-full'}>
            <PricingTable
              config={billingConfig}
              paths={{
                signUp: pathsConfig.auth.signUp,
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
        'flex flex-col text-center text-4xl font-bold tracking-tight sm:text-6xl'
      }
    >
      {children}
    </h1>
  );
}

function Pill(props: React.PropsWithChildren) {
  return (
    <h2 className={'rounded-full border px-4 py-2 text-sm'}>
      <Sparkle className={'inline-block h-4'} />
      {props.children}
    </h2>
  );
}

function FeatureShowcaseContainer(props: React.PropsWithChildren) {
  return (
    <div
      className={
        'flex flex-col items-center justify-between lg:flex-row' +
        ' lg:space-x-24'
      }
    >
      {props.children}
    </div>
  );
}

function LeftFeatureContainer(props: React.PropsWithChildren) {
  return (
    <div className={'flex w-full flex-col space-y-6 lg:w-6/12'}>
      {props.children}
    </div>
  );
}

function RightFeatureContainer(props: React.PropsWithChildren) {
  return (
    <div className={'flex w-full flex-col space-y-6 lg:w-6/12'}>
      {props.children}
    </div>
  );
}

function MainCallToActionButton() {
  return (
    <div className={'flex space-x-2'}>
      <Button>
        <Link href={'/auth/sign-up'}>
          <span className={'flex items-center space-x-0.5'}>
            <span>Get Started</span>

            <ChevronRight
              className={
                'h-5 animate-in fade-in slide-in-from-left-8' +
                ' delay-1000 duration-1000 zoom-in fill-mode-both'
              }
            />
          </span>
        </Link>
      </Button>

      <Button variant={'ghost'}>
        <Link href={'/auth/sign-in'}>
          <span>Sign In</span>
        </Link>
      </Button>
    </div>
  );
}
