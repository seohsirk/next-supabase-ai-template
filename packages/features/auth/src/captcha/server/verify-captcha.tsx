import 'server-only';

const verifyEndpoint =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const secret = process.env.CAPTCHA_SECRET_TOKEN;

/**
 * Verify the CAPTCHA token with the CAPTCHA service
 * @param token
 */
export async function verifyCaptchaToken(token: string) {
  if (!secret) {
    throw new Error('CAPTCHA_SECRET_TOKEN is not set');
  }

  const res = await fetch(verifyEndpoint, {
    method: 'POST',
    body: `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`,
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await res.json();

  if (!data.success) {
    throw new Error('Invalid CAPTCHA token');
  }
}
