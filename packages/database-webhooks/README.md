# Database Webhooks - @kit/database-webhooks

This package is responsible for handling webhooks from database changes.

For example:
1. when an account is deleted, we handle the cleanup of all related data in the third-party services.
2. when a user is invited, we send an email to the user.
3. when an account member is added, we update the subscription in the third-party services