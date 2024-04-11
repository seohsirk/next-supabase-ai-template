BEGIN;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

--- we insert a user into auth.users and return the id into user_id to use

select tests.create_supabase_user('test1', 'test1@test.com');

select tests.create_supabase_user('test2');

-- Create an organization account

select tests.authenticate_as('test1');

select public.create_account('Test');


select * from finish();

ROLLBACK;