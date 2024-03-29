import { z } from 'zod';

export const LeaveTeamAccountSchema = z.object({
  accountId: z.string(),
  confirmation: z.custom((value) => value === 'LEAVE'),
});
