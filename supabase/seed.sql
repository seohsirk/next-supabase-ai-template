-- These webhooks are only for development purposes.
-- In production, you should manually create webhooks in the Supabase dashboard (or create a migration to do so).
-- We don't do it because you'll need to manually add your webhook URL and secret key.

-- this webhook will be triggered after every insert on the accounts_memberships table
create trigger "accounts_memberships_insert" after insert
on "public"."accounts_memberships" for each row
execute function "supabase_functions"."http_request"(
  'http://localhost:3000/api/database/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '1000'
);

-- this webhook will be triggered after every insert on the accounts_memberships table
create trigger "account_membership_delete" after insert
on "public"."accounts_memberships" for each row
execute function "supabase_functions"."http_request"(
  'http://localhost:3000/api/database/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '1000'
);

-- this webhook will be triggered after a delete on the subscriptions table
-- which should happen when a user deletes their account (and all their subscriptions)
create trigger "account_delete" after delete
on "public"."subscriptions" for each row
execute function "supabase_functions"."http_request"(
  'http://localhost:3000/api/database/webhook',
  'POST',
  '{"Content-Type":"application/json", "X-Supabase-Event-Signature":"WEBHOOKSECRET"}',
  '{}',
  '1000'
);