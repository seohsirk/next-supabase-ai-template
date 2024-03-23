import { z } from 'zod';

const confirmationString = 'TRANSFER';

export const TransferOwnershipConfirmationSchema = z
  .object({
    confirmation: z.string(),
  })
  .refine((data) => data.confirmation === confirmationString, {
    message: `Confirmation must be ${confirmationString}`,
    path: ['confirmation'],
  });
