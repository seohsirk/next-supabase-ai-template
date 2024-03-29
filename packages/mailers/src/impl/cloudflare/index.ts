import 'server-only';
import { z } from 'zod';

import { Mailer } from '../../mailer';
import { MailerSchema } from '../../schema/mailer.schema';

type Config = z.infer<typeof MailerSchema>;

/**
 * A class representing a mailer using Cloudflare's Workers.
 * @implements {Mailer}
 */
export class CloudflareMailer implements Mailer {
  async sendEmail(config: Config) {
    // make lint happy for now
    await Promise.resolve();

    console.log('Sending email with Cloudflare Workers', config);
    throw new Error('Not implemented');
  }
}
