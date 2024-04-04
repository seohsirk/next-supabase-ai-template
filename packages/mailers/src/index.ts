import { z } from 'zod';

const MAILER_PROVIDER = z
  .enum(['nodemailer', 'cloudflare'])
  .default('nodemailer')
  .parse(process.env.MAILER_PROVIDER);

/**
 * @description A mailer interface that can be implemented by any mailer.
 * We export a single mailer implementation using Nodemailer. You can add more mailers or replace the existing one.
 * @example
 * ```ts
 * import { Mailer } from '@kit/mailers';
 *
 * const mailer = new Mailer();
 *
 * mailer.sendEmail({
 *  from: '',
 *  to: '',
 *  subject: 'Hello',
 *  text: 'Hello, World!'
 * });
 */
export const Mailer = await getMailer();

/**
 * @description Get the mailer based on the environment variable.
 */
async function getMailer() {
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
