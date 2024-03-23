import { z } from 'zod';

export const LeaveTeamAccountSchema = z.object({
  accountId: z.string(),
  userId: z.string(),
});
