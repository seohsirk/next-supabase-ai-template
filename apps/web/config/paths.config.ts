import { z } from 'zod';

const PathsSchema = z.object({
  auth: z.object({
    signIn: z.string(),
    signUp: z.string(),
    verifyMfa: z.string(),
    callback: z.string(),
    passwordReset: z.string(),
    passwordUpdate: z.string(),
  }),
  app: z.object({
    home: z.string(),
    personalAccountSettings: z.string(),
    personalAccountBilling: z.string(),
    accountHome: z.string(),
    accountSettings: z.string(),
    accountBilling: z.string(),
    accountMembers: z.string(),
  }),
});

const pathsConfig = PathsSchema.parse({
  auth: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyMfa: '/auth/verify',
    callback: '/auth/callback',
    passwordReset: '/auth/password-reset',
    passwordUpdate: '/password-reset',
  },
  app: {
    home: '/home',
    personalAccountSettings: '/home/account',
    personalAccountBilling: '/home/billing',
    accountHome: '/home/[account]',
    accountSettings: `/home/[account]/settings`,
    accountBilling: `/home/[account]/billing`,
    accountMembers: `/home/[account]/members`,
  },
});

export default pathsConfig;
