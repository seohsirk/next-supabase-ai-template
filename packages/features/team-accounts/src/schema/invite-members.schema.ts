import { z } from 'zod';

const InviteSchema = z.object({
  email: z.string().email(),
  role: z.string().min(1),
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
