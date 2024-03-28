/*
 * -------------------------------------------------------
 * Supabase SaaS Starter Kit Schema
 * This is the schema for the Supabase SaaS Starter Kit.
 * It includes the schema for accounts, account roles, role permissions, memberships, invitations, subscriptions, and more.
 * -------------------------------------------------------
 */
/*
 * -------------------------------------------------------
 * Section: Revoke default privileges from public schema
 * We will revoke all default privileges from public schema on functions to prevent public access to them
 * -------------------------------------------------------
 */
create extension if not exists "unaccent";

-- Create a private Makerkit schema
create schema if not exists kit;

grant USAGE on schema kit to authenticated,
authenticated;

-- We remove all default privileges from public schema on functions to prevent public access to them
alter default privileges
revoke
execute on functions
from
  public;

revoke all on schema public
from
  public;

revoke all PRIVILEGES on database "postgres"
from
  "anon";

revoke all PRIVILEGES on schema "public"
from
  "anon";

revoke all PRIVILEGES on schema "storage"
from
  "anon";

revoke all PRIVILEGES on all SEQUENCES in schema "public"
from
  "anon";

revoke all PRIVILEGES on all SEQUENCES in schema "storage"
from
  "anon";

revoke all PRIVILEGES on all FUNCTIONS in schema "public"
from
  "anon";

revoke all PRIVILEGES on all FUNCTIONS in schema "storage"
from
  "anon";

revoke all PRIVILEGES on all TABLES in schema "public"
from
  "anon";

revoke all PRIVILEGES on all TABLES in schema "storage"
from
  "anon";

-- We remove all default privileges from public schema on functions to prevent public access to them by default
alter default privileges in schema public
revoke
execute on functions
from
  anon,
  authenticated;

-- we allow the authenticated role to execute functions in the public schema
grant usage on schema public to authenticated;

-- we allow the service_role role to execute functions in the public schema
grant usage on schema public to service_role;

/*
 * -------------------------------------------------------
 * Section: Enums
 * We create the enums for the schema
 * -------------------------------------------------------
 */
/*
* Roles
- We create the roles for the Supabase MakerKit. These roles are used to manage the permissions for the accounts
- The roles are 'owner' and 'member'.
- You can add more roles as needed.
*/
create type public.account_role as enum('owner', 'member');

/*
* Permissions
- We create the permissions for the Supabase MakerKit. These permissions are used to manage the permissions for the roles
- The permissions are 'roles.manage', 'billing.manage', 'settings.manage', 'members.manage', and 'invites.manage'.
- You can add more permissions as needed.
*/
create type public.app_permissions as enum(
  'roles.manage',
  'billing.manage',
  'settings.manage',
  'members.manage',
  'invites.manage'
);

/*
* Subscription Status
- We create the subscription status for the Supabase MakerKit. These statuses are used to manage the status of the subscriptions
- The statuses are 'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired', and 'paused'.
- You can add more statuses as needed.
*/
create type public.subscription_status as ENUM(
  'active',
  'trialing',
  'past_due',
  'canceled',
  'unpaid',
  'incomplete',
  'incomplete_expired',
  'paused'
);

/*
* Billing Provider
- We create the billing provider for the Supabase MakerKit. These providers are used to manage the billing provider for the accounts and organizations
- The providers are 'stripe', 'lemon-squeezy', and 'paddle'.
- You can add more providers as needed.
*/
create type public.billing_provider as ENUM('stripe', 'lemon-squeezy', 'paddle');

/*
 * -------------------------------------------------------
 * Section: App Configuration
 * We create the configuration for the Supabase MakerKit to enable or disable features
 * -------------------------------------------------------
 */
create table if not exists
  public.config (
    enable_organization_accounts boolean default true not null,
    enable_account_billing boolean default true not null,
    enable_organization_billing boolean default true not null,
    billing_provider public.billing_provider default 'stripe' not null
  );

comment on table public.config is 'Configuration for the Supabase MakerKit.';

comment on column public.config.enable_account_billing is 'Enable billing for individual accounts';

comment on column public.config.enable_organization_accounts is 'Enable organization accounts';

comment on column public.config.enable_organization_billing is 'Enable billing for organizations';

comment on column public.config.billing_provider is 'The billing provider to use for accounts and organizations';

alter table public.config enable row level security;

-- create config row
insert into
  public.config (
    enable_organization_accounts,
    enable_account_billing,
    enable_organization_billing
  )
values
  (true, true, true);

-- Open up access to config table for authenticated users and service_role
grant
select
  on public.config to authenticated,
  service_role;

-- RLS on the config table
-- Authenticated users can read the config
create policy "public config can be read by authenticated users" on public.config for
select
  to authenticated using (true);

create
or replace function public.get_config () returns json as $$
declare
  result record;
begin
  select
    *
  from
    public.config
  limit 1 into result;
  return row_to_json(result);
end;
$$ language plpgsql;

-- Automatically set timestamps on tables when a row is inserted or updated
create
or replace function public.trigger_set_timestamps () returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    new.created_at = now();
    new.updated_at = now();
  else
    new.updated_at = now();
    new.created_at = old.created_at;
  end if;
  return NEW;
end
$$ language plpgsql;

-- Automatically set user tracking on tables when a row is inserted or updated
create
or replace function public.trigger_set_user_tracking () returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    new.created_by = auth.uid();
    new.updated_by = auth.uid();
  else
    new.updated_by = auth.uid();
    new.created_by = old.created_by;
  end if;
  return NEW;
end
$$ language plpgsql;

grant
execute on function public.get_config () to authenticated,
service_role;

create
or replace function public.is_set (field_name text) returns boolean as $$
declare
  result boolean;
begin
  execute format('select %I from public.config limit 1', field_name) into result;
  return result;
end;
$$ language plpgsql;

grant
execute on function public.is_set (text) to authenticated;

/*
 * -------------------------------------------------------
 * Section: Accounts
 * We create the schema for the accounts. Accounts are the top level entity in the Supabase MakerKit. They can be organizations or personal accounts.
 * -------------------------------------------------------
 */
-- Accounts table
create table if not exists
  public.accounts (
    id uuid unique not null default extensions.uuid_generate_v4 (),
    primary_owner_user_id uuid references auth.users on delete cascade not null default auth.uid (), -- Auth ID in Supabase Auth
    name varchar(255) not null,
    slug text unique,
    email varchar(320) unique,
    is_personal_account boolean default false not null,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    created_by uuid references auth.users,
    updated_by uuid references auth.users,
    picture_url varchar(1000),
    primary key (id)
  );

comment on table public.accounts is 'Accounts are the top level entity in the Supabase MakerKit. They can be organizations or personal accounts.';

comment on column public.accounts.is_personal_account is 'Whether the account is a personal account or not';

comment on column public.accounts.name is 'The name of the account';

comment on column public.accounts.slug is 'The slug of the account';

comment on column public.accounts.primary_owner_user_id is 'The primary owner of the account';

comment on column public.accounts.email is 'The email of the account. For organizations, this is the email of the organization (if any)';

-- Enable RLS on the accounts table
alter table "public"."accounts" enable row level security;

-- Open up access to accounts
grant
select
,
  insert,
update,
delete on table public.accounts to authenticated,
service_role;

-- constraint that conditionally allows nulls on the slug ONLY if personal_account is true
alter table public.accounts
add constraint accounts_slug_null_if_personal_account_true check (
  (
    is_personal_account = true
    and slug is null
  )
  or (
    is_personal_account = false
    and slug is not null
  )
);

-- constraint to ensure that the primary_owner_user_id is unique for personal accounts
create unique index unique_personal_account on public.accounts (primary_owner_user_id)
where
  is_personal_account = true;

-- RLS on the accounts table
-- SELECT: Users can read their own accounts
create policy accounts_read_self on public.accounts for
select
  to authenticated using (auth.uid () = primary_owner_user_id);

-- UPDATE: Team owners can update their accounts
create policy accounts_self_update on public.accounts
for update
  to authenticated using (auth.uid () = primary_owner_user_id)
with
  check (auth.uid () = primary_owner_user_id);

-- Functions
create function public.is_account_owner (account_id uuid) returns boolean as $$
  select
    exists(
      select
        1
      from
        public.accounts
      where
        id = is_account_owner.account_id
        and primary_owner_user_id = auth.uid());
$$ language sql;

create
or replace function kit.protect_account_fields () returns trigger as $$
begin
  if current_user in('authenticated', 'anon') then
    if new.id <> old.id
      or new.is_personal_account <> old.is_personal_account
      or new.primary_owner_user_id <> old.primary_owner_user_id
      or new.email <> old.email then
      raise exception 'You do not have permission to update this field';
    end if;
  end if;

  return NEW;
end
$$ language plpgsql;

-- trigger to protect account fields
create trigger protect_account_fields before
update on public.accounts for each row
execute function kit.protect_account_fields ();

create
or replace function kit.add_current_user_to_new_account () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
  if new.primary_owner_user_id = auth.uid() then
    insert into public.accounts_memberships(
      account_id,
      user_id,
      account_role)
    values(
      new.id,
      auth.uid(),
      'owner');
  end if;
  return NEW;
end;
$$;

-- trigger the function whenever a new account is created
create trigger "add_current_user_to_new_account"
after insert on public.accounts for each row
execute function kit.add_current_user_to_new_account ();

-- create a trigger to update the account email when the primary owner email is updated
create
or replace function kit.handle_update_user_email () returns trigger language plpgsql security definer
set
  search_path = public as $$
begin
  update public.accounts set email = new.email where primary_owner_user_id = new.id and is_personal_account = true;
  return new;
end;
$$;

-- trigger the function every time a user email is updated
-- only if the user is the primary owner of the account and the account is personal account
create trigger "on_auth_user_updated"
after
update of email on auth.users for each row
execute procedure kit.handle_update_user_email ();

/*
 * -------------------------------------------------------
 * Section: Memberships
 * We create the schema for the memberships. Memberships are the memberships for an account. For example, a user might be a member of an account with the role 'owner'.
 * -------------------------------------------------------
 */
-- Account Memberships table
create table if not exists
  public.accounts_memberships (
    user_id uuid references auth.users on delete cascade not null,
    account_id uuid references public.accounts (id) on delete cascade not null,
    account_role public.account_role not null,
    created_at timestamp default current_timestamp not null,
    updated_at timestamp default current_timestamp not null,
    created_by uuid references auth.users,
    updated_by uuid references auth.users,
    primary key (user_id, account_id)
  );

comment on table public.accounts_memberships is 'The memberships for an account';

comment on column public.accounts_memberships.account_id is 'The account the membership is for';

comment on column public.accounts_memberships.account_role is 'The role for the membership';

-- Open up access to accounts_memberships table for authenticated users and service_role
grant
select
,
  insert,
update,
delete on table public.accounts_memberships to service_role;

-- Enable RLS on the accounts_memberships table
alter table public.accounts_memberships enable row level security;

create
or replace function public.has_role_on_account (
  account_id uuid,
  account_role public.account_role default null
) returns boolean language sql security definer
set
  search_path = public as $$
  select
    exists(
      select
        1
      from
        public.accounts_memberships membership
      where
        membership.user_id = auth.uid()
        and membership.account_id = has_role_on_account.account_id
        and(membership.account_role = has_role_on_account.account_role
          or has_role_on_account.account_role is null));
$$;

grant
execute on function public.has_role_on_account (uuid, public.account_role) to authenticated;

create
or replace function public.is_team_member (account_id uuid, user_id uuid) returns boolean language sql security definer
set
  search_path = public as $$
  select
    exists(
      select
        1
      from
        public.accounts_memberships membership
      where
        public.has_role_on_account(account_id) and
        membership.user_id = is_team_member.user_id and
        membership.account_id = is_team_member.account_id);
$$;

grant
execute on function public.is_team_member (uuid, uuid) to authenticated;

-- Functions
-- Function to check if a user can remove a member from an account
create or replace function kit.can_remove_account_member (target_team_account_id uuid, user_id uuid) returns boolean as $$
declare
  permission_granted boolean;
  target_user_role public.account_role;
begin
    -- validate the auth user has the required permission on the account
    -- to manage members of the account
    select public.has_permission (auth.uid (), target_team_account_id, 'members.manage'::app_permissions) into permission_granted;

    if not permission_granted then
        raise exception 'You do not have permission to remove a member from this account';
    end if;

    -- users cannot remove themselves from the account with this function
    if can_remove_account_member.user_id = auth.uid () then
        raise exception 'You cannot remove yourself from the account';
    end if;

    -- retrieve the user target role in the account
    select
        account_role
    into
        target_user_role
    from
        public.accounts_memberships as membership
    where
        membership.account_id = target_team_account_id
        and membership.user_id = can_remove_account_member.user_id;

    -- check if the target user is the owner of the account
    if target_user_role = 'owner' then
        raise exception 'You cannot remove the primary owner from the account';
    end if;

    return true;

    end;

$$ language plpgsql;

grant execute on function kit.can_remove_account_member (uuid, uuid) to authenticated, service_role;

-- RLS
-- SELECT: Users can read their team members account memberships
create policy accounts_memberships_read_self on public.accounts_memberships for
select
  to authenticated using (user_id = auth.uid ());

-- SELECT: Users can read their team members account memberships
create policy accounts_memberships_team_read on public.accounts_memberships for
select
  to authenticated using (is_team_member (account_id, user_id));

-- RLS on the accounts table
-- SELECT: Users can read the team accounts they are a member of
create policy accounts_read_team on public.accounts for
select
  to authenticated using (
    has_role_on_account (id)
  );

-- DELETE: Users can remove themselves from an account
create policy accounts_memberships_delete_self on public.accounts_memberships for
delete
  to authenticated using (user_id = auth.uid ());

-- DELETE: Users with the required role can remove members from an account
create policy accounts_memberships_delete on public.accounts_memberships for
delete
  to authenticated using (kit.can_remove_account_member (account_id, user_id));

-- SELECT (public.accounts): Team members can read accounts of the team they are a member of
create policy accounts_team_read ON public.accounts
for select
to authenticated
using (
  exists (
    select 1 from public.accounts_memberships as membership
    where public.is_team_member(membership.account_id, id)
  )
);

/*
 * -------------------------------------------------------
 * Section: Account Roles
 * We create the schema for the account roles. Account roles are the roles for an account.
 * -------------------------------------------------------
 */
-- Account Roles table
create table
  public.account_roles (
    id bigint generated by default as identity primary key,
    account_id uuid references public.accounts (id) on delete cascade not null,
    role public.account_role not null,
    unique (account_id, role)
  );

comment on table public.account_roles is 'The roles for an account';

comment on column public.account_roles.account_id is 'The account the role is for';

comment on column public.account_roles.role is 'The role for the account';

-- Open up access to account roles
grant
select
,
  insert,
update,
delete on table public.account_roles to authenticated,
service_role;

-- Enable RLS on the account_roles table
alter table public.account_roles enable row level security;

-- RLS
-- SELECT: Users can read account roles of an account they are a member of
create policy account_roles_read_self on public.account_roles for
select
  to authenticated using (has_role_on_account (account_id));

/*
 * -------------------------------------------------------
 * Section: Role Permissions
 * We create the schema for the role permissions. Role permissions are the permissions for a role.
 * For example, the 'owner' role might have the 'roles.manage' permission.
 * -------------------------------------------------------
 */
-- Create table for roles permissions
create table if not exists
  public.role_permissions (
    id bigint generated by default as identity primary key,
    role public.account_role not null,
    permission app_permissions not null,
    unique (role, permission)
  );

comment on table public.role_permissions is 'The permissions for a role';

comment on column public.role_permissions.role is 'The role the permission is for';

comment on column public.role_permissions.permission is 'The permission for the role';

-- Open up access to accounts
grant
select
,
  insert,
update,
delete on table public.role_permissions to authenticated,
service_role;

-- Create a function to check if a user has a permission
create function public.has_permission (
  user_id uuid,
  account_id uuid,
  permission_name app_permissions
) returns boolean as $$
begin
    return exists(
        select
        1
        from
        public.accounts_memberships
        join public.role_permissions on accounts_memberships.account_role = role_permissions.role
        where
        accounts_memberships.user_id = has_permission.user_id
        and accounts_memberships.account_id = has_permission.account_id
        and role_permissions.permission = has_permission.permission_name);
    end;

$$ language plpgsql;

grant execute on function public.has_permission (uuid, uuid, public.app_permissions) to authenticated, service_role;

-- Enable RLS on the role_permissions table
alter table public.role_permissions enable row level security;

-- RLS
-- Authenticated Users can read their permissions
create policy role_permissions_read on public.role_permissions for
select
  to authenticated using (true);

/*
 * -------------------------------------------------------
 * Section: Invitations
 * We create the schema for the invitations. Invitations are the invitations for an account sent to a user to join the account.
 * -------------------------------------------------------
 */
create table if not exists
  public.invitations (
    id serial primary key,
    email varchar(255) not null,
    account_id uuid references public.accounts (id) on delete cascade not null,
    invited_by uuid references auth.users on delete cascade not null,
    role public.account_role not null,
    invite_token varchar(255) unique not null,
    created_at timestamp default current_timestamp not null,
    updated_at timestamp default current_timestamp not null,
    expires_at timestamp default current_timestamp + interval '7 days' not null
  );

comment on table public.invitations is 'The invitations for an account';

comment on column public.invitations.account_id is 'The account the invitation is for';

comment on column public.invitations.invited_by is 'The user who invited the user';

comment on column public.invitations.role is 'The role for the invitation';

comment on column public.invitations.invite_token is 'The token for the invitation';

-- Open up access to invitations table for authenticated users and service_role
grant
select
,
  insert,
update,
delete on table public.invitations to service_role;

-- Enable RLS on the invitations table
alter table public.invitations enable row level security;

create
or replace function check_organization_account () returns trigger as $$
begin
  if(
    select
      is_personal_account
    from
      public.accounts
    where
      id = new.account_id) then
    raise exception 'Account must be an organization account';
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger only_organization_accounts_check before insert
or
update on public.invitations for each row
execute procedure check_organization_account ();

-- RLS
-- SELECT: Users can read invitations to users of an account they are a member of
create policy invitations_read_self on public.invitations for
select
  to authenticated using (has_role_on_account (account_id));

-- INSERT: Users can create invitations to users of an account they are a member of
-- and have the 'invites.manage' permission
create policy invitations_create_self on public.invitations for
insert
  to authenticated with check (
    has_role_on_account (account_id)
    and public.has_permission (auth.uid (), account_id, 'invites.manage'::app_permissions));

-- Functions
-- Function to accept an invitation to an account
create or replace function accept_invitation(token text, user_id uuid) returns void as $$
declare
  target_account_id uuid;
  target_role public.account_role;
begin
    select
        account_id,
        role
    into
        target_account_id,
        target_role
    from
        public.invitations
    where
        invite_token = token;

    insert into
        public.accounts_memberships(
        user_id,
        account_id,
        account_role)
    values
        (accept_invitation.user_id, target_account_id, target_role);

    delete from
        public.invitations
    where
        invite_token = token;
    end;
$$ language plpgsql;

grant execute on function accept_invitation (uuid) to service_role;

/*
 * -------------------------------------------------------
 * Section: Billing Customers
 * We create the schema for the billing customers. Billing customers are the customers for an account in the billing provider. For example, a user might have a customer in the billing provider with the customer ID 'cus_123'.
 * -------------------------------------------------------
 */
-- Account Subscriptions table
create table
  public.billing_customers (
    account_id uuid references public.accounts (id) on delete cascade not null,
    id serial primary key,
    email text,
    provider public.billing_provider not null,
    customer_id text not null
  );

comment on table public.billing_customers is 'The billing customers for an account';

comment on column public.billing_customers.account_id is 'The account the billing customer is for';

comment on column public.billing_customers.provider is 'The provider of the billing customer';

comment on column public.billing_customers.customer_id is 'The customer ID for the billing customer';

-- Open up access to billing_customers table for authenticated users and service_role
grant
select
,
  insert,
update,
delete on table public.billing_customers to service_role;

-- Enable RLS on billing_customers table
alter table public.billing_customers enable row level security;

grant
select
  on table public.billing_customers to authenticated;

-- RLS
-- SELECT: Users can read account subscriptions on an account they are a member of
create policy billing_customers_read_self on public.billing_customers for
select
  to authenticated using (account_id = auth.uid() or has_role_on_account (account_id));

/*
 * -------------------------------------------------------
 * Section: Subscriptions
 * We create the schema for the subscriptions. Subscriptions are the subscriptions for an account to a product. For example, a user might have a subscription to a product with the status 'active'.
 * -------------------------------------------------------
 */
-- Subscriptions table
create table if not exists
  public.subscriptions (
    account_id uuid references public.accounts (id) on delete cascade not null,
    billing_customer_id int references public.billing_customers on delete cascade not null,
    id text not null primary key,
    status public.subscription_status not null,
    active bool not null,
    billing_provider public.billing_provider not null,
    product_id varchar(255) not null,
    variant_id varchar(255) not null,
    price_amount numeric,
    cancel_at_period_end bool not null,
    currency varchar(3) not null,
    interval varchar(255) not null,
    interval_count integer not null check (interval_count > 0),
    created_at timestamptz not null default current_timestamp,
    updated_at timestamptz not null default current_timestamp,
    period_starts_at timestamptz,
    period_ends_at timestamptz,
    trial_starts_at timestamptz,
    trial_ends_at timestamptz
  );

comment on table public.subscriptions is 'The subscriptions for an account';

comment on column public.subscriptions.account_id is 'The account the subscription is for';

comment on column public.subscriptions.billing_provider is 'The provider of the subscription';

comment on column public.subscriptions.product_id is 'The product ID for the subscription';

comment on column public.subscriptions.variant_id is 'The variant ID for the subscription';

comment on column public.subscriptions.price_amount is 'The price amount for the subscription';

comment on column public.subscriptions.cancel_at_period_end is 'Whether the subscription will be canceled at the end of the period';

comment on column public.subscriptions.currency is 'The currency for the subscription';

comment on column public.subscriptions.interval is 'The interval for the subscription';

comment on column public.subscriptions.interval_count is 'The interval count for the subscription';

comment on column public.subscriptions.status is 'The status of the subscription';

comment on column public.subscriptions.period_starts_at is 'The start of the current period for the subscription';

comment on column public.subscriptions.period_ends_at is 'The end of the current period for the subscription';

comment on column public.subscriptions.trial_starts_at is 'The start of the trial period for the subscription';

comment on column public.subscriptions.trial_ends_at is 'The end of the trial period for the subscription';

-- Open up access to subscriptions table for authenticated users and service_role
grant
select
,
  insert,
update,
delete on table public.subscriptions to service_role;

grant select on table public.subscriptions to authenticated;

-- Enable RLS on subscriptions table
alter table public.subscriptions enable row level security;

-- RLS
-- SELECT: Users can read account subscriptions on an account they are a member of
create policy subscriptions_read_self on public.subscriptions for
select
  to authenticated using (has_role_on_account (account_id) or account_id = auth.uid ());

-- Functions

create or replace function public.add_subscription (
  account_id uuid,
  subscription_id text,
  active bool,
  status public.subscription_status,
  billing_provider public.billing_provider,
  product_id varchar(255),
  variant_id varchar(255),
  price_amount numeric,
  cancel_at_period_end bool,
  currency varchar(3),
  "interval" varchar(255),
  interval_count integer,
  period_starts_at timestamptz,
  period_ends_at timestamptz,
  trial_starts_at timestamptz,
  trial_ends_at timestamptz,
  customer_id varchar(255)
) returns public.subscriptions as $$
declare
  new_subscription public.subscriptions;
  new_billing_customer_id int;
begin
    insert into public.billing_customers(
        account_id,
        provider,
        customer_id)
    values (
        account_id,
        billing_provider,
        customer_id)
    returning
        id into new_billing_customer_id;

    insert into public.subscriptions(
        account_id,
        billing_customer_id,
        id,
        active,
        status,
        billing_provider,
        product_id,
        variant_id,
        price_amount,
        cancel_at_period_end,
        currency,
        interval,
        interval_count,
        period_starts_at,
        period_ends_at,
        trial_starts_at,
        trial_ends_at)
    values (
        account_id,
        new_billing_customer_id,
        subscription_id,
        active,
        status,
        billing_provider,
        product_id,
        variant_id,
        price_amount,
        cancel_at_period_end,
        currency,
        interval,
        interval_count,
        period_starts_at,
        period_ends_at,
        trial_starts_at,
        trial_ends_at)
    returning
        * into new_subscription;
    return new_subscription;
    end;
$$ language plpgsql;

grant execute on function public.add_subscription (
  uuid,
  text,
  boolean,
  public.subscription_status,
  public.billing_provider,
  varchar,
  varchar,
  numeric,
  boolean,
  varchar,
  varchar,
  integer,
  timestamptz,
  timestamptz,
  timestamptz,
  timestamptz,
  varchar
) to service_role;

/*
 * -------------------------------------------------------
 * Section: Functions
 * -------------------------------------------------------
 */
-- Create a function to slugify a string
create
or replace function kit.slugify ("value" text) returns text as $$
  -- removes accents (diacritic signs) from a given string --
  with "unaccented" as(
    select
      unaccent("value") as "value"
),
-- lowercases the string
"lowercase" as(
  select
    lower("value") as "value"
  from
    "unaccented"
),
-- remove single and double quotes
"removed_quotes" as(
  select
    regexp_replace("value", '[''"]+', '', 'gi') as "value"
  from
    "lowercase"
),
-- replaces anything that's not a letter, number, hyphen('-'), or underscore('_') with a hyphen('-')
"hyphenated" as(
  select
    regexp_replace("value", '[^a-z0-9\\-_]+', '-', 'gi') as "value"
  from
    "removed_quotes"
),
-- trims hyphens('-') if they exist on the head or tail of the string
"trimmed" as(
  select
    regexp_replace(regexp_replace("value", '\-+$', ''), '^\-', '') as
      "value" from "hyphenated"
)
    select
      "value"
    from
      "trimmed";
$$ language SQL strict immutable;

grant
execute on function kit.slugify (text) to service_role,
authenticated;

create function kit.set_slug_from_account_name () returns trigger language plpgsql as $$
declare
  sql_string varchar;
  tmp_slug varchar;
  increment integer;
  tmp_row record;
  tmp_row_count integer;
begin
  tmp_row_count = 1;
  increment = 0;
  while tmp_row_count > 0 loop
    if increment > 0 then
      tmp_slug = kit.slugify(new.name || ' ' || increment::varchar);
    else
      tmp_slug = kit.slugify(new.name);
    end if;

    sql_string = format('select count(1) cnt from accounts where slug = ''' || tmp_slug || '''; ');

    for tmp_row in execute (sql_string)
      loop
        raise notice '%', tmp_row;
        tmp_row_count = tmp_row.cnt;
      end loop;

    increment = increment +1;
  end loop;

  new.slug := tmp_slug;
  return NEW;
end
$$;

-- Create a trigger to set the slug from the account name
create trigger "set_slug_from_account_name" before insert on public.accounts for each row when (
  NEW.name is not null
  and NEW.slug is null
  and NEW.is_personal_account = false
)
execute procedure kit.set_slug_from_account_name ();

-- Create a trigger when a name is updated to update the slug
create trigger "update_slug_from_account_name" before
update on public.accounts for each row when (
  NEW.name is not null
  and NEW.name <> OLD.name
  and NEW.is_personal_account = false
)
execute procedure kit.set_slug_from_account_name ();

-- Create a function to setup a new user with a personal account
create function kit.setup_new_user () returns trigger language plpgsql security definer
set
  search_path = public as $$
declare
  user_name text;
begin
  if new.raw_user_meta_data ->> 'display_name' is not null then
    user_name := new.raw_user_meta_data ->> 'display_name';
  end if;

  if user_name is null and new.email is not null then
    user_name := split_part(new.email, '@', 1);
  end if;

  if user_name is null then
    user_name := '';
  end if;

  insert into public.accounts(
    id,
    primary_owner_user_id,
    name,
    is_personal_account,
    email)
  values (
    new.id,
    new.id,
    user_name,
    true,
    new.email);

  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure kit.setup_new_user ();

create
or replace function public.create_account (account_name text) returns public.accounts as $$
declare
  new_account public.accounts;
begin
  insert into public.accounts(
    name,
    is_personal_account)
  values (
    account_name,
    false)
returning
  * into new_account;
  return new_account;
end;
$$ language plpgsql;

grant
execute on function public.create_account (text) to authenticated, service_role;

-- RLS
-- Authenticated users can create organization accounts
create policy create_org_account on public.accounts for insert to authenticated
with
  check (
    public.is_set ('enable_organization_accounts')
    and public.accounts.is_personal_account = false
  );

create
or replace function public.create_invitation (
  account_id uuid,
  email text,
  role public.account_role
) returns public.invitations as $$
declare
  new_invitation public.invitations;
  invite_token text;
begin
  invite_token := extensions.uuid_generate_v4();

  insert into public.invitations(
    email,
    account_id,
    invited_by,
    role,
    invite_token)
  values (
    email,
    account_id,
    auth.uid(),
    role,
    invite_token)
returning
  * into new_invitation;

  return new_invitation;

end;

$$ language plpgsql;

create
or replace function public.get_user_accounts () returns setof public.accounts as $$
begin
  select
    id,
    name,
    picture_url
  from
    public.accounts
    join public.accounts_memberships on accounts.id = accounts_memberships.account_id
  where
    accounts_memberships.user_id = auth.uid();
end;
$$ language plpgsql;

-- we create a view to load the general app data for the authenticated user
-- which includes the user's accounts, memberships, and roles, and relative subscription status
create or replace view
  public.user_account_workspace as
select
  accounts.id as id,
  accounts.name as name,
  accounts.picture_url as picture_url,
  subscriptions.status as subscription_status
from
  public.accounts
  left join public.subscriptions on accounts.id = subscriptions.account_id
where
  primary_owner_user_id = auth.uid ()
  and accounts.is_personal_account = true;

grant
select
  on public.user_account_workspace to authenticated,
  service_role;

create or replace view
  public.user_accounts as
select
  accounts.id as id,
  accounts.name as name,
  accounts.picture_url as picture_url,
  accounts.slug as slug,
  accounts_memberships.account_role as role
from
  public.accounts
  join public.accounts_memberships on accounts.id = accounts_memberships.account_id
where
  accounts_memberships.user_id = auth.uid ()
  and accounts.is_personal_account = false;

grant
select
  on public.user_accounts to authenticated,
  service_role;

create
or replace function public.organization_account_workspace (account_slug text) returns table (
  id uuid,
  name varchar(255),
  picture_url varchar(1000),
  slug text,
  role public.account_role,
  primary_owner_user_id uuid,
  subscription_status public.subscription_status,
  permissions public.app_permissions[]
) as $$
begin
  return QUERY
  select
    accounts.id,
    accounts.name,
    accounts.picture_url,
    accounts.slug,
    accounts_memberships.account_role,
    accounts.primary_owner_user_id,
    subscriptions.status,
    array_agg(role_permissions.permission)
  from
    public.accounts
    join public.accounts_memberships on accounts.id = accounts_memberships.account_id
    left join public.subscriptions on accounts.id = subscriptions.account_id
    left join public.role_permissions on accounts_memberships.account_role =
      role_permissions.role
  where
    accounts.slug = account_slug
    and public.accounts_memberships.user_id = auth.uid()
  group by
    accounts.id,
    accounts_memberships.account_role,
    subscriptions.status;
end;
$$ language plpgsql;

grant
execute on function public.organization_account_workspace (text) to authenticated,
service_role;

CREATE
OR REPLACE FUNCTION public.get_account_members (account_slug text) RETURNS TABLE (
  id uuid,
  user_id uuid,
  account_id uuid,
  role public.account_role,
  primary_owner_user_id uuid,
  name varchar,
  email varchar,
  picture_url varchar,
  created_at timestamp,
  updated_at timestamp
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT acc.id, am.user_id, am.account_id, am.account_role, a.primary_owner_user_id, acc.name, acc.email, acc.picture_url, am.created_at, am.updated_at
    FROM public.accounts_memberships am
    JOIN public.accounts a ON a.id = am.account_id
    JOIN public.accounts acc on acc.id = am.user_id
    WHERE a.slug = account_slug;
END;
$$;

grant
execute on function public.get_account_members (text) to authenticated,
service_role;

create or replace function public.get_account_invitations(account_slug text) returns table (
  id integer,
  email varchar(255),
  account_id uuid,
  invited_by uuid,
  role public.account_role,
  created_at timestamp,
  updated_at timestamp,
  inviter_name varchar,
  inviter_email varchar
) as $$
begin
  return query
  select
    invitation.id,
    invitation.email,
    invitation.account_id,
    invitation.invited_by,
    invitation.role,
    invitation.created_at,
    invitation.updated_at,
    account.name,
    account.email
  from
    public.invitations as invitation
  join public.accounts as account on invitation.account_id = account.id
  where
    account.slug = account_slug;
end;
$$ language plpgsql;

grant execute on function public.get_account_invitations (text) to authenticated, service_role;

CREATE TYPE kit.invitation AS (
  email text,
  role public.account_role
);

-- Then, modify your function to use this type
CREATE OR REPLACE FUNCTION public.add_invitations_to_account(account_slug text, invitations kit.invitation[])
RETURNS public.invitations[] AS $$
DECLARE
  new_invitation public.invitations;
  all_invitations public.invitations[] := ARRAY[]::public.invitations[];
  invite_token text;
  email text;
  role public.account_role;
BEGIN
  FOREACH email, role IN ARRAY invitations
  LOOP
    invite_token := extensions.uuid_generate_v4();

    INSERT INTO public.invitations(
      email,
      account_id,
      invited_by,
      role,
      invite_token)
    VALUES (
      email,
      (SELECT id FROM public.accounts WHERE slug = account_slug),
      auth.uid(),
      role,
      invite_token)
    RETURNING *
    INTO new_invitation;

    all_invitations := array_append(all_invitations, new_invitation);
  END LOOP;

  RETURN all_invitations;
END;
$$ LANGUAGE plpgsql;

grant execute on function public.add_invitations_to_account (text, kit.invitation[]) to authenticated, service_role;

-- Storage
-- Account Image
insert into
  storage.buckets (id, name, PUBLIC)
values
  ('account_image', 'account_image', true);

create or replace function kit.get_storage_filename_as_uuid (name text) returns uuid as $$
begin
  return replace(
    storage.filename (name),
    concat('.', storage.extension (name)),
    ''
  )::uuid;
end;
$$ language plpgsql;

grant execute on function kit.get_storage_filename_as_uuid (text) to authenticated, service_role;

-- RLS policies for storage
create policy account_image on storage.objects for all using (
  bucket_id = 'account_image'
  and kit.get_storage_filename_as_uuid(name) = auth.uid () or
    public.has_role_on_account(kit.get_storage_filename_as_uuid(name))
)
with
  check (
    bucket_id = 'account_image'
    and kit.get_storage_filename_as_uuid(name) = auth.uid () or
     public.has_permission(auth.uid(), kit.get_storage_filename_as_uuid(name), 'settings.manage')
  );