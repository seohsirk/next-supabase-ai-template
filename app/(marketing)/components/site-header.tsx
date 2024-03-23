import { SiteHeaderAccountSection } from '~/(marketing)/components/site-header-account-section';
import { SiteNavigation } from '~/(marketing)/components/site-navigation';
import { AppLogo } from '~/components/app-logo';

export function SiteHeader() {
  return (
    <div className={'container mx-auto'}>
      <div className="flex h-16 items-center justify-between">
        <div className={'w-4/12'}>
          <AppLogo />
        </div>

        <div className={'hidden w-4/12 justify-center lg:flex'}>
          <SiteNavigation />
        </div>

        <div className={'flex flex-1 items-center justify-end space-x-4'}>
          <div className={'flex items-center'}></div>

          <SiteHeaderAccountSection />

          <div className={'flex lg:hidden'}>
            <SiteNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}
