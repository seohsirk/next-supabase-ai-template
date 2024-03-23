import Image from 'next/image';
import Link from 'next/link';

import { ChevronRightIcon } from 'lucide-react';
import { withI18n } from '~/lib/i18n/with-i18n';

import { Button } from '@kit/ui/button';
import { Heading } from '@kit/ui/heading';

function Home() {
  return (
    <div className={'flex flex-col space-y-16'}>
      <div className={'container mx-auto'}>
        <div
          className={
            'my-12 flex flex-col items-center md:flex-row lg:my-16' +
            ' mx-auto flex-1 justify-center animate-in fade-in ' +
            ' duration-1000 slide-in-from-top-12'
          }
        >
          <div className={'flex w-full flex-1 flex-col items-center space-y-8'}>
            <Pill>
              <span>The leading SaaS Starter Kit for ambitious developers</span>
            </Pill>

            <HeroTitle>
              <span>The SaaS Solution for</span>
              <span>developers and founders</span>
            </HeroTitle>

            <div>
              <Heading
                level={3}
                className={'text-center font-medium text-muted-foreground'}
              >
                <span>Here you can write a short description of your SaaS</span>
              </Heading>

              <Heading
                level={3}
                className={'text-center font-medium text-muted-foreground'}
              >
                <span>
                  This subheading is usually laid out on multiple lines
                </span>
              </Heading>

              <Heading
                level={3}
                className={'text-center font-medium text-muted-foreground'}
              >
                <span>Impress your customers, straight to the point.</span>
              </Heading>
            </div>

            <div className={'flex flex-col items-center space-y-4'}>
              <MainCallToActionButton />

              <span className={'text-xs text-muted-foreground'}>
                Free plan. No credit card required.
              </span>
            </div>
          </div>
        </div>

        <div
          className={
            'mx-auto flex max-w-5xl justify-center py-12 animate-in fade-in ' +
            ' delay-300 duration-1000 slide-in-from-top-16 fill-mode-both'
          }
        >
          <Image
            priority
            className={
              'rounded-2xl' +
              ' shadow-primary/40 animate-in fade-in' +
              ' delay-300 duration-1000 ease-out zoom-in-50 fill-mode-both'
            }
            width={2688}
            height={1824}
            src={`/assets/images/dashboard-dark.webp`}
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

            <div className={'flex flex-col space-y-2.5'}>
              <Heading level={2}>The best tool in the space</Heading>

              <Heading level={3} className={'text-muted-foreground'}>
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
              <div className={'flex flex-col space-y-4'}>
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

              <div>
                <Button variant={'outline'}>
                  <span className={'flex items-center space-x-2'}>
                    <span>Get Started</span>
                    <ChevronRightIcon className={'h-3'} />
                  </span>
                </Button>
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
              <div className={'flex flex-col space-y-4'}>
                <Heading level={1}>Dashboard</Heading>

                <Heading level={2} className={'text-muted-foreground'}>
                  A fantastic dashboard to manage your SaaS business
                </Heading>

                <div>
                  Our dashboard offers an overview of your SaaS business. It
                  shows at a glance all you need to know about your business. It
                  is fully customizable and extendable.
                </div>
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

          <div className={'w-full'}></div>
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
        'text-center text-4xl md:text-5xl' +
        ' font-heading flex flex-col font-bold xl:text-7xl'
      }
    >
      {children}
    </h1>
  );
}

function Pill(props: React.PropsWithChildren) {
  return (
    <h2
      className={
        'inline-flex w-auto items-center space-x-2' +
        ' rounded-full bg-gradient-to-br dark:from-gray-200 dark:via-gray-400' +
        ' bg-clip-text px-4 py-2 text-center text-sm dark:to-gray-700' +
        ' border font-normal text-muted-foreground shadow-sm dark:text-transparent'
      }
    >
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
    <div className={'flex w-full flex-col space-y-8 lg:w-6/12'}>
      {props.children}
    </div>
  );
}

function RightFeatureContainer(props: React.PropsWithChildren) {
  return <div className={'flex w-full lg:w-6/12'}>{props.children}</div>;
}

function MainCallToActionButton() {
  return (
    <Button className={'rounded-full'}>
      <Link href={'/auth/sign-up'}>
        <span className={'flex items-center space-x-2'}>
          <span>Get Started</span>

          <ChevronRightIcon
            className={
              'h-4 animate-in fade-in slide-in-from-left-8' +
              ' delay-1000 duration-1000 zoom-in fill-mode-both'
            }
          />
        </span>
      </Link>
    </Button>
  );
}
