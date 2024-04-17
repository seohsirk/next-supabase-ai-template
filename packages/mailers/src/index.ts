import { z } from 'zod';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare', 'resend'])
  .default('nodemailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description Get the mailer based on the environment variable.
 */
export async function getMailer() {
  switch (process.env.MAILER_PROVIDER as typeof MAILER_PROVIDER) {
    case 'nodemailer': {
      if (process.env.NEXT_RUNTIME !== 'edge') {
        const { Nodemailer } = await import('./impl/nodemailer');

        return new Nodemailer();
      } else {
        throw new Error('Nodemailer is not available on the edge runtime side');
      }
    }

    case 'cloudflare': {
      const { CloudflareMailer } = await import('./impl/cloudflare');

      return new CloudflareMailer();
    }

    case 'resend': {
      const { ResendMailer } = await import('./impl/resend');

      return new ResendMailer();
    }

    default:
      throw new Error(`Invalid mailer: ${MAILER_PROVIDER as string}`);
  }
}
