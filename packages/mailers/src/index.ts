import { Nodemailer } from './impl/nodemailer';

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
export const Mailer = Nodemailer;
