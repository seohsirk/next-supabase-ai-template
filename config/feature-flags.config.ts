import { z } from 'zod';

const FeatureFlagsSchema = z.object({
  enableThemeToggle: z.boolean(),
  enableAccountDeletion: z.boolean(),
  enableTeamDeletion: z.boolean(),
  enableTeamAccounts: z.boolean(),
  enableTeamCreation: z.boolean(),
  enablePersonalAccountBilling: z.boolean(),
  enableTeamAccountBilling: z.boolean(),
});

const featuresFlagConfig = FeatureFlagsSchema.parse({
  enableThemeToggle: true,
  enableAccountDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ACCOUNT_DELETION,
    false,
  ),
  enableTeamDeletion: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_DELETION,
    false,
  ),
  enableTeamAccounts: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAM_ACCOUNTS,
    true,
  ),
  enableTeamCreation: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_TEAMS_CREATION,
    true,
  ),
  enablePersonalAccountBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_PERSONAL_ACCOUNT_BILLING,
    false,
  ),
  enableTeamAccountBilling: getBoolean(
    process.env.NEXT_PUBLIC_ENABLE_ORGANIZATION_BILLING,
    false,
  ),
} satisfies z.infer<typeof FeatureFlagsSchema>);

export default featuresFlagConfig;

function getBoolean(value: unknown, defaultValue: boolean) {
  if (typeof value === 'string') {
    return value === 'true';
  }

  return defaultValue;
}
