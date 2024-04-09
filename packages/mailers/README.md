# Mailers - @kit/mailers

This package is responsible for sending emails using a unified interface across the app.

The default mailer uses the `nodemailer` package to send emails. You can create custom mailers by extending the `Mailer` class.

Make sure the app installs the `@kit/mailers` package before using it.

```json
{
    "name": "my-app",
    "dependencies": {
        "@kit/mailers": "*"
    }
}
```

## Usage

By default, the package uses `nodemailer`. 

To use Cloudflare, please set the environment variable `MAILER_PROVIDER` to `cloudflare`.

```
MAILER_PROVIDER=cloudflare
```

### Send an email

```tsx
import { getMailer } from '@kit/mailers';

async function sendEmail() {
  const mailer = await getMailer();

  return mailer.sendEmail({
    to: '',
    from: '',
    subject: 'Hello',
    text: 'Hello, World!'
  });
}
```

If you're using the `cloudflare` provider, please also read the instructions of the package [Vercel Email](https://github.com/Sh4yy/vercel-email) to setup your Workers.