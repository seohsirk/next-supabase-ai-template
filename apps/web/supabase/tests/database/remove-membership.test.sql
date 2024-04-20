begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

-- test

select * from finish();

rollback;