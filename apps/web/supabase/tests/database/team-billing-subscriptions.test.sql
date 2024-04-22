begin;
create extension "basejump-supabase_test_helpers" version '0.0.6';

select no_plan();

select makerkit.set_identifier('primary_owner', 'test@makerkit.dev');
select makerkit.set_identifier('owner', 'owner@makerkit.dev');
select makerkit.set_identifier('member', 'member@makerkit.dev');
select makerkit.set_identifier('custom', 'custom@makerkit.dev');

-- Create a test account and billing customer
INSERT INTO public.billing_customers(account_id, provider, customer_id)
VALUES (makerkit.get_account_id_by_slug('makerkit'), 'stripe', 'cus_test');

-- Call the upsert_subscription function
SELECT public.upsert_subscription(makerkit.get_account_id_by_slug('makerkit'), 'cus_test', 'sub_test', true, 'active', 'stripe', false, 'usd', now(), now() + interval '1 month', '[
    {
        "product_id": "prod_test",
        "variant_id": "var_test",
        "type": "flat",
        "price_amount": 1000,
        "quantity": 1,
        "interval": "month",
        "interval_count": 1
    },
    {
        "product_id": "prod_test_2",
        "variant_id": "var_test_2",
        "type": "flat",
        "price_amount": 2000,
        "quantity": 2,
        "interval": "month",
        "interval_count": 1
    }
]');

-- Verify that the subscription items were created correctly
SELECT row_eq(
    $$ select count(*) from subscription_items where subscription_id = 'sub_test' $$,
    row(2::bigint),
    'The subscription items should be created'
);

-- Verify that the subscription was created correctly
SELECT is(
  (SELECT active FROM public.subscriptions WHERE id = 'sub_test'),
  true,
  'The subscription should be active'
);

SELECT is(
  (SELECT status FROM public.subscriptions WHERE id = 'sub_test'),
  'active',
  'The subscription status should be active'
);

-- Call the upsert_subscription function again to update the subscription
SELECT public.upsert_subscription(makerkit.get_account_id_by_slug('makerkit'), 'cus_test', 'sub_test', false, 'past_due', 'stripe', true, 'usd', now(), now() + interval '1 month', '[
    {
        "product_id": "prod_test",
        "variant_id": "var_test",
        "type": "flat",
        "price_amount": 2000,
        "quantity": 1,
        "interval": "month",
        "interval_count": 1
    },
    {
        "product_id": "prod_test_2",
        "variant_id": "var_test_2",
        "type": "flat",
        "price_amount": 2000,
        "quantity": 2,
        "interval": "year",
        "interval_count": 12
    }
]');

-- Verify that the subscription items were updated correctly
SELECT row_eq(
    $$ select price_amount from subscription_items where variant_id = 'var_test' $$,
    row('2000'::numeric),
    'The subscription items should be updated'
);

-- Verify that the subscription items were updated correctly
SELECT row_eq(
    $$ select interval from subscription_items where variant_id = 'var_test_2' $$,
    row('year'::varchar),
    'The subscription items should be updated'
);

-- Verify that the subscription was updated correctly
SELECT is(
  (SELECT active FROM public.subscriptions WHERE id = 'sub_test'),
  false,
  'The subscription should be inactive'
);

SELECT is(
  (SELECT status FROM public.subscriptions WHERE id = 'sub_test'),
  'past_due',
  'The subscription status should be past_due'
);

-- Call the upsert_subscription function again to update the subscription
SELECT public.upsert_subscription(tests.get_supabase_uid('primary_owner'), 'cus_test', 'sub_test', true, 'active', 'stripe', false, 'usd', now(), now() + interval '1 month', '[]');

-- Verify that the subscription was updated correctly
SELECT is(
  (SELECT active FROM public.subscriptions WHERE id = 'sub_test'),
  true,
  'The subscription should be active'
);

select tests.authenticate_as('member');

-- account can read their own subscription
SELECT isnt_empty(
  $$ select 1 from subscriptions where id = 'sub_test' $$,
    'The account can read their own subscription'
);

SELECT isnt_empty(
  $$ select * from subscription_items where subscription_id = 'sub_test' $$,
    'The account can read their own subscription items'
);

-- foreigners
select tests.create_supabase_user('foreigner');
select tests.authenticate_as('foreigner');

-- account cannot read other's subscription
SELECT is_empty(
  $$ select 1 from subscriptions where id = 'sub_test' $$,
   'The account cannot read the other account subscriptions'
);

SELECT is_empty(
  $$ select 1 from subscription_items where subscription_id = 'sub_test' $$,
    'The account cannot read the other account subscription items'
);

-- Finish the tests and clean up
select * from finish();

rollback;