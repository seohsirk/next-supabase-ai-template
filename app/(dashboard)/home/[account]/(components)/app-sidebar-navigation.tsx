'use client';

import { SidebarDivider, SidebarGroup, SidebarItem } from '@kit/ui/sidebar';
import { Trans } from '@kit/ui/trans';

import { getOrganizationAccountSidebarConfig } from '~/config/organization-account-sidebar.config';

export function AppSidebarNavigation({
  account,
}: React.PropsWithChildren<{
  account: string;
}>) {
  return (
    <>
      {getOrganizationAccountSidebarConfig(account).routes.map(
        (item, index) => {
          if ('divider' in item) {
            return <SidebarDivider key={index} />;
          }

          if ('children' in item) {
            return (
              <SidebarGroup
                key={item.label}
                label={<Trans i18nKey={item.label} defaults={item.label} />}
                collapsible={item.collapsible}
                collapsed={item.collapsed}
              >
                {item.children.map((child) => {
                  return (
                    <SidebarItem
                      key={child.path}
                      end={child.end}
                      path={child.path}
                      Icon={child.Icon}
                    >
                      <Trans i18nKey={child.label} defaults={child.label} />
                    </SidebarItem>
                  );
                })}
              </SidebarGroup>
            );
          }

          return (
            <SidebarItem
              key={item.path}
              end={item.end}
              path={item.path}
              Icon={item.Icon}
            >
              <Trans i18nKey={item.label} defaults={item.label} />
            </SidebarItem>
          );
        },
      )}
    </>
  );
}

export default AppSidebarNavigation;
