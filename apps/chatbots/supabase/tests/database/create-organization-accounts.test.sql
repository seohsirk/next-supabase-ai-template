begin;

create extension "basejump-supabase_test_helpers" version '0.0.6';

select
  no_plan();

--- we insert a user into auth.users and return the id into user_id to use
select
  tests.create_supabase_user('test1', 'test1@test.com');

select
  tests.create_supabase_user('test2');

-- Create an organization account
select
  tests.authenticate_as('test1');

select
  public.create_account('Test');

select
  row_eq($$
    select
      primary_owner_user_id, is_personal_account, slug, name from
	makerkit.get_account_by_slug('test') $$, row
	(tests.get_supabase_uid('test1'), false, 'test'::text,
	'Test'::varchar), 'Users can create an organization account');

-- Should be the primary owner of the organization account by default
select
  row_eq($$
    select
      account_role from public.accounts_memberships
      where
        account_id =(
          select
            id
          from public.accounts
          where
            slug = 'test')
	and user_id = tests.get_supabase_uid('test1') $$, row
	  ('owner'::public.account_role), 'The primary owner should have the owner role for the organization account');

-- Should be able to see the organization account
select
  isnt_empty($$
    select
      * from public.accounts
      where
        primary_owner_user_id = tests.get_supabase_uid('test1') $$, 'The primary owner should be able to see the organization account');

-- Others should not be able to see the organization account
select
  tests.authenticate_as('test2');

select
  is_empty($$
    select
      * from public.accounts
      where
        primary_owner_user_id = tests.get_supabase_uid('test1') $$, 'Other users should not be able to see the organization account');

-- should not have any role for the organization account
select
  is (public.has_role_on_account((
      select
        id
      from makerkit.get_account_by_slug('test'))),
    false,
    'Foreign users should not have any role for the organization account');

select
  *
from
  finish();

rollback;
