-- These webhooks are only for development purposes.
-- In production, you should manually create webhooks in the Supabase dashboard (or create a migration to do so).
-- We don't do it because you'll need to manually add your webhook URL and secret key.

-- this webhook will be triggered after deleting an account
create trigger "accounts_teardown" after delete
on "public"."accounts" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);

-- this webhook will be triggered after a delete on the subscriptions table
-- which should happen when a user deletes their account (and all their subscriptions)
create trigger "subscriptions_delete" after delete
on "public"."subscriptions" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);

-- this webhook will be triggered after every insert on the invitations table
-- which should happen when a user invites someone to their account
create trigger "invitations_insert" after insert
on "public"."invitations" for each row
execute function "supabase_functions"."http_request"(
  'http://host.docker.internal:3000/api/db/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '5000'
);