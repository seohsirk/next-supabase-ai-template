import Link from 'next/link';

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
                <p className={'text-sm text-gray-500 dark:text-gray-400'}>
                  Add a short tagline about your product
                </p>
              </div>

              <div className={'flex text-xs text-gray-500 dark:text-gray-400'}>
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
              <div className={'flex flex-col space-y-4'}>
                <FooterSectionHeading>About</FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'#'}>Who we are</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'/blog'}>Blog</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'/contact'}>Contact</Link>
                  </FooterLink>
                </FooterSectionList>
              </div>
            </div>

            <div>
              <div className={'flex flex-col space-y-4'}>
                <FooterSectionHeading>Product</FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'/docs'}>Documentation</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'#'}>Help Center</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'#'}>Changelog</Link>
                  </FooterLink>
                </FooterSectionList>
              </div>
            </div>

            <div>
              <div className={'flex flex-col space-y-4'}>
                <FooterSectionHeading>Legal</FooterSectionHeading>

                <FooterSectionList>
                  <FooterLink>
                    <Link href={'#'}>Terms of Service</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'#'}>Privacy Policy</Link>
                  </FooterLink>
                  <FooterLink>
                    <Link href={'#'}>Cookie Policy</Link>
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
  return (
    <ul className={'flex flex-col space-y-4 text-gray-500 dark:text-gray-400'}>
      {props.children}
    </ul>
  );
}

function FooterLink(props: React.PropsWithChildren) {
  return (
    <li
      className={
        'text-sm [&>a]:transition-colors [&>a]:hover:text-gray-800' +
        ' dark:[&>a]:hover:text-white'
      }
    >
      {props.children}
    </li>
  );
}
