import { z } from 'zod';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare'])
  .default('nodemailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (MAILER_PROVIDER) {
    case 'nodemailer': {
      const { Nodemailer } = await import('./impl/nodemailer');

      return new Nodemailer();
    }

    case 'cloudflare': {
      const { CloudflareMailer } = await import('./impl/cloudflare');

      return new CloudflareMailer();
    }

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}
