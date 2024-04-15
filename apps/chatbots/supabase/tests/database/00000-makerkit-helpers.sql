create schema if not exists makerkit;

-- anon, authenticated, and service_role should have access to tests schema
grant USAGE on schema makerkit to anon, authenticated, service_role;

-- Don't allow public to execute any functions in the tests schema
alter default PRIVILEGES in schema makerkit revoke execute on FUNCTIONS from public;

-- Grant execute to anon, authenticated, and service_role for testing purposes
alter default PRIVILEGES in schema makerkit grant execute on FUNCTIONS to anon,
  authenticated, service_role;

create or replace function makerkit.get_account_by_slug(
  account_slug text
)
  returns setof accounts
  as $$
begin

    return query
      select
        *
      from
        accounts
      where
        slug = account_slug;

end;

$$ language PLPGSQL;

select
  *
from
  finish();

rollback;
