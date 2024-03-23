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

### Send an email

```javascript
import { Mailer } from '@kit/mailers';

const mailer = new Mailer();

mailer.send({
    to: '',
    from: '',
    subject: 'Hello',
    text: 'Hello, World!'
});
```