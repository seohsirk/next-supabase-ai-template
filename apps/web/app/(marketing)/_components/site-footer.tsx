import Link from 'next/link';

import { Trans } from '@kit/ui/trans';

import { AppLogo } from '~/components/app-logo';
import appConfig from '~/config/app.config';

const YEAR = new Date().getFullYear();

export function SiteFooter() {
  return (
    <footer className={'py-8 lg:py-24'}>
      <div className={'container mx-auto'}>
        <div className={'flex flex-col space-y-8 lg:flex-row lg:space-y-0'}>
          <div
            className={
              'flex w-full space-x-2 lg:w-4/12 xl:w-3/12' +
              ' xl:space-x-6 2xl:space-x-8'
            }
          >
            <div className={'flex flex-col space-y-4'}>
              <div>
                <AppLogo className={'w-[85px] md:w-[115px]'} />
              </div>

              <div>
                <p className={'text-sm text-muted-foreground'}>
                  Add a short tagline about your product
                </p>
              </div>

              <div className={'flex text-xs text-muted-foreground'}>
                <p>
                  © Copyright {YEAR} {appConfig.name}. All Rights Reserved.
                </p>
              </div>
            </div>
          </div>

          <div
            className={
              'flex flex-col space-y-8 lg:space-x-6 lg:space-y-0' +
              ' xl:space-x-16 2xl:space-x-20' +
              ' w-full lg:flex-row lg:justify-end'
            }
          >
            <div>
              <div className={'flex flex-col space-y-2.5'}>
                <FooterSectionHeading>
                  <Trans i18nKey={'marketing:about'} />
                </FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'/blog'}>
                      <Trans i18nKey={'marketing:blog'} />
                    </Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'/contact'}>
                      <Trans i18nKey={'marketing:contact'} />
                    </Link>
                  </FooterLink>
                </FooterSectionList>
              </div>
            </div>

            <div>
              <div className={'flex flex-col space-y-2.5'}>
                <FooterSectionHeading>
                  <Trans i18nKey={'marketing:product'} />
                </FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'/docs'}>
                      <Trans i18nKey={'marketing:documentation'} />
                    </Link>
                  </FooterLink>
                </FooterSectionList>
              </div>
            </div>

            <div>
              <div className={'flex flex-col space-y-2.5'}>
                <FooterSectionHeading>
                  <Trans i18nKey={'marketing:legal'} />
                </FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'/terms-of-service'}>
                      <Trans i18nKey={'marketing:tos'} />
                    </Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'/privacy-policy'}>
                      <Trans i18nKey={'marketing:privacyPolicy'} />
                    </Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'/cookie-policy'}>
                      <Trans i18nKey={'marketing:cookiePolicy'} />
                    </Link>
                  </FooterLink>
                </FooterSectionList>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSectionHeading(props: React.PropsWithChildren) {
  return (
    <p>
      <span className={'font-semibold'}>{props.children}</span>
    </p>
  );
}

function FooterSectionList(props: React.PropsWithChildren) {
  return <ul className={'flex flex-col space-y-2.5'}>{props.children}</ul>;
}

function FooterLink(props: React.PropsWithChildren) {
  return (
    <li
      className={
        'text-sm text-muted-foreground hover:underline [&>a]:transition-colors'
      }
    >
      {props.children}
    </li>
  );
}
