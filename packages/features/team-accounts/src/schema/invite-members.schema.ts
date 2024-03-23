import { z } from 'zod';

import { Database } from '@kit/supabase/database';

type Role = Database['public']['Enums']['account_role'];

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.custom<Role>(() => z.string().min(1)),
});

export const InviteMembersSchema = z
  .object({
    invitations: InviteSchema.array(),
  })
  .refine((data) => {
    if (!data.invitations.length) {
      return {
        message: 'At least one invite is required',
        path: ['invites'],
      };
    }

    const emails = data.invitations.map((member) => member.email.toLowerCase());
    const uniqueEmails = new Set(emails);

    if (emails.length !== uniqueEmails.size) {
      return {
        message: 'Duplicate emails are not allowed',
        path: ['invites'],
      };
    }

    return true;
  });
