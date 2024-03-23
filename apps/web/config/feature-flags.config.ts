import { z } from 'zod';

const FeatureFlagsSchema = z.object({
  enableThemeSwitcher: z.boolean(),
  enableAccountDeletion: z.boolean(),
  enableOrganizationDeletion: z.boolean(),
  enableOrganizationAccounts: z.boolean(),
  enableOrganizationCreation: z.boolean(),
  enablePersonalAccountBilling: z.boolean(),
  enableOrganizationBilling: z.boolean(),
});

const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeSwitcher: true,
  enableAccountDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ACCOUNT_DELETION,
    false,
  ),
  enableOrganizationDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_DELETION,
    false,
  ),
  enableOrganizationAccounts: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_ACCOUNTS,
    true,
  ),
  enableOrganizationCreation: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_CREATION,
    true,
  ),
  enablePersonalAccountBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING,
    false,
  ),
  enableOrganizationBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_BILLING,
    false,
  ),
});

export default featuresFlagConfig;

function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return defaultValue;
}
