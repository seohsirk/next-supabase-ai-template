import { z } from 'zod';

const confirmationSchema = z.object({
  confirmation: z.custom((value) => value === 'CONFIRM'),
});

const UserIdSchema = confirmationSchema.extend({
  userId: z.string().uuid(),
});

export const BanUserSchema = UserIdSchema;
export const ReactivateUserSchema = UserIdSchema;
export const ImpersonateUserSchema = UserIdSchema;
export const DeleteUserSchema = UserIdSchema;

export const DeleteAccountSchema = confirmationSchema.extend({
  accountId: z.string().uuid(),
});
