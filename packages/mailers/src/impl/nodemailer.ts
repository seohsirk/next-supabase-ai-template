import 'server-only';
import { z } from 'zod';

import { Mailer } from '../mailer';
import { MailerSchema } from '../mailer-schema';

type Config = z.infer<typeof MailerSchema>;

/**
 * A class representing a mailer using Nodemailer library.
 * @implements {Mailer}
 */
export class Nodemailer implements Mailer {
  async sendEmail(config: Config) {
    const transporter = await getSMTPTransporter();

    return transporter.sendMail(config);
  }
}

/**
 * @description SMTP Transporter for production use. Add your favorite email
 * API details (Mailgun, Sendgrid, etc.) to the appConfig.
 */
async function getSMTPTransporter() {
  const { createTransport } = await import('nodemailer');

  return createTransport(getSMTPConfiguration());
}

function getSMTPConfiguration() {
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
}
