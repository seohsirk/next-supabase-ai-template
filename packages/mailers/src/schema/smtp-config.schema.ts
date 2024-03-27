import { z } from 'zod';

/*
const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;
  const host = process.env.EMAIL_HOST;
  const port = Number(process.env.EMAIL_PORT);
  const secure = process.env.EMAIL_TLS !== 'false';

  // validate that we have all the required appConfig
  if (!user || !pass || !host || !port) {
    throw new Error(
      `Missing email configuration. Please add the following environment variables:
      EMAIL_USER
      EMAIL_PASSWORD
      EMAIL_HOST
      EMAIL_PORT
      `,
    );
  }

  return {
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  };
 */

export const SmtpConfigSchema = z.object({
  user: z.string({
    description:
      'This is the email account to send emails from. This is specific to the email provider.',
  }),
  pass: z.string({
    description: 'This is the password for the email account',
  }),
  host: z.string({
    description: 'This is the SMTP host for the email provider',
  }),
  port: z.number({
    description:
      'This is the port for the email provider. Normally 587 or 465.',
  }),
  secure: z.boolean(),
});
