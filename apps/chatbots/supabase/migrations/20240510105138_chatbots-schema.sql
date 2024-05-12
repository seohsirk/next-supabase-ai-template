create extension vector with schema extensions;

-- public.jobs_status
create type public.jobs_status as ENUM (
  'pending',
  'running',
  'completed',
  'failed'
);

-- public.sender
create type public.sender as ENUM (
  'user',
  'assistant'
);

-- public.message_type
create type public.message_type as ENUM (
  'ai',
  'db',
  'user'
);

-- Table: public.chatbots
create table if not exists public.chatbots (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  description varchar(1000),
  url text not null,
  site_name varchar(255) not null,
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_at timestamptz default now() not null,
  settings jsonb default '{
    "title": "AI Assistant",
    "branding": {
      "textColor": "#fff",
      "primaryColor": "#0a0a0a",
      "accentColor": "#0a0a0a"
    },
    "position": "bottom-right"
  }' not null
);

grant select, insert, update, delete on public.chatbots to authenticated;

-- RLS
alter table public.chatbots enable row level security;


-- Functions
-- public.has_role_on_chatbot
create or replace function public.has_role_on_chatbot(chatbot_id uuid)
returns bool
set search_path = ''
as $$
begin
    return exists (
        select 1 from public.chatbots where public.chatbots.id = chatbot_id and
         public.has_role_on_account(public.chatbots.account_id)
    );
end; $$
language plpgsql;

grant execute on function public.has_role_on_chatbot(uuid) to authenticated, service_role;

-- public.can_create_chatbot
create or replace function public.can_create_chatbot(target_account_id uuid)
returns bool
set search_path = ''
as $$
declare
    chatbot_count bigint;
    plan_variant_id text;
    quota bigint;
begin
    select count(*) into chatbot_count
    from public.chatbots
    where public.chatbots.account_id = target_account_id;

    select variant_id, max_chatbots
    from public.get_current_subscription_details(target_account_id)
    into plan_variant_id, quota;

    -- If no subscription is found, then the user is on the free plan
    if plan_variant_id is null then
        return chatbot_count < 1;
    end if;

    return chatbot_count < quota;
end; $$
language plpgsql;

grant execute on function public.can_create_chatbot(uuid) to authenticated, service_role;

-- SELECT(public.chatbots)
create policy read_chatbots
  on public.chatbots
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- INSERT(public.chatbots)
create policy insert_chatbots
  on public.chatbots
  for insert
  to authenticated
  with check (
    public.has_role_on_account(account_id) and
    public.can_create_chatbot(account_id)
);

-- UPDATE(public.chatbots)
create policy update_chatbots
  on public.chatbots
  for update
  to authenticated
  using (
    public.has_role_on_account(account_id)
  ) with check (
    public.has_role_on_account(account_id)
  );

-- DELETE(public.chatbots)
create policy delete_chatbots
  on public.chatbots
  for delete
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- Table: public.documents_embeddings
create table if not exists public.documents_embeddings (
  id uuid primary key default gen_random_uuid(),
  embedding vector (1536),
  content text not null,
  metadata jsonb default '{}' not null,
  created_at timestamptz default now() not null
);

alter table public.documents_embeddings enable row level security;

-- Table public.documents
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  hash text not null,
  chatbot_id uuid not null references public.chatbots on delete cascade,
  created_at timestamptz default now() not null
);

grant select, update, delete on public.documents to authenticated;
grant insert, select, update, delete on public.documents to service_role;

-- RLS
alter table public.documents enable row level security;

-- SELECT(public.documents)
create policy select_documents
  on public.documents
  for select
  to authenticated
  using (
    public.has_role_on_chatbot(chatbot_id)
  );

-- UPDATE(public.documents)
create policy update_documents
  on public.documents
  for update
  to authenticated
  using (
    public.has_role_on_chatbot(chatbot_id)
  ) with check (
    public.has_role_on_chatbot(chatbot_id)
  );

create policy delete_documents
  on public.documents
  for delete
  to authenticated
  using (
    public.has_role_on_chatbot(chatbot_id)
  );

-- Table public.conversations
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  reference_id varchar(16) not null,
  chatbot_id uuid not null references public.chatbots on delete cascade,
  user_email varchar(255),
  created_at timestamptz default now() not null
);

grant select, insert, update, delete on public.conversations to authenticated, service_role;

-- RLS
alter table public.conversations enable row level security;

-- Table public.messages
create table if not exists public.messages (
  id bigint generated by default as identity primary key,
  conversation_id uuid not null references public.conversations on delete cascade,
  chatbot_id uuid not null references public.chatbots on delete cascade,
  text varchar(2000) not null,
  sender sender not null,
  type message_type not null,
  created_at timestamptz default now() not null
);

grant select, insert, update, delete on public.messages to authenticated, service_role;

-- RLS
alter table public.messages enable row level security;

-- Table public.jobs
create table if not exists public.jobs (
  id bigint generated always as identity primary key,
  chatbot_id uuid not null references public.chatbots on delete cascade,
  account_id uuid not null references public.accounts on delete cascade,
  status jobs_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  tasks_count int not null default 0,
  tasks_completed_count int not null default 0,
  tasks_succeeded_count int not null default 0,

  unique (account_id, id)
);

grant select on public.jobs to authenticated;
grant insert, update, delete on public.jobs to service_role;

-- RLS
alter table public.jobs enable row level security;

-- SELECT(public.jobs)
create policy select_jobs
  on public.jobs
  for select
  to authenticated
  using (
    public.has_role_on_account(account_id)
  );

-- Table public.plans
create table if not exists public.plans (
  name text not null,
  variant_id varchar(255) not null,
  max_documents bigint not null,
  max_messages bigint not null,
  max_chatbots bigint not null,

  primary key (variant_id)
);

-- RLS
alter table public.plans enable row level security;

-- SELECT(public.plans)
create policy select_plans
  on public.plans
  for select
  to authenticated
  using (
    true
  );

-- Functions
create or replace function public.match_documents (
  query_embedding vector(1536),
  match_count int DEFAULT null,
  filter jsonb DEFAULT '{}'
) returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
#variable_conflict use_column
begin
  return query
  select
    id,
    content,
    metadata,
    1 - (documents_embeddings.embedding <=> query_embedding) as similarity
  from documents_embeddings
  where metadata @> filter
  order by documents_embeddings.embedding <=> query_embedding
  limit match_count;
end;
$$;

create index on public.documents_embeddings using hnsw (embedding vector_cosine_ops);

grant execute on function public.match_documents(vector, int, jsonb) to authenticated, service_role;

create or replace function public.get_current_subscription_details(target_account_id uuid)
returns table (
    period_starts_at timestamptz,
    period_ends_at timestamptz,
    variant_id varchar(255),
    interval_count int,
    max_documents bigint,
    max_messages bigint,
    max_chatbots bigint
) as $$
begin
    return query select
    subscription.period_starts_at,
    subscription.period_ends_at,
    item.variant_id,
    item.interval_count,
    plan.max_documents,
    plan.max_messages,
    plan.max_chatbots
    from public.subscriptions as subscription
    join public.subscription_items as item on subscription.id = item.subscription_id
    join public.plans as plan on item.variant_id = plan.variant_id
    where subscription.account_id = target_account_id
    and subscription.active = true
    group by subscription.period_starts_at, subscription.period_ends_at, item.interval_count, item.variant_id, plan.max_documents, plan.max_messages, plan.max_chatbots;
end;
$$ language plpgsql;

grant execute on function public.get_current_subscription_details(uuid) to authenticated, service_role;

create or replace function public.can_index_documents(target_account_id uuid, requested_documents bigint)
returns bool as $$
declare
    documents_quota bigint;
    total_documents bigint;
    plan_variant_id text;
begin
    select count(*) from public.documents
    join public.chatbots on public.chatbots.account_id = target_account_id
    where public.chatbots.account_id = target_account_id into total_documents;

    select variant_id, max_documents
    from public.get_current_subscription_details(target_account_id)
    into plan_variant_id, documents_quota;

    -- If no subscription is found, then the user is on the free plan
    -- and the quota is 50 documents
    if plan_variant_id is null then
        return requested_documents + total_documents <= 50;
    end if;

    return documents_quota >= requested_documents + total_documents;
end; $$
language plpgsql;

grant execute on function public.can_index_documents(uuid, bigint) to authenticated, service_role;

create or replace function public.can_respond_to_message(target_chatbot_id uuid)
returns bool as $$
declare
    period_start timestamptz;
    period_end timestamptz;
    variant_id varchar(255);
    subscription_interval int;
    messages_sent bigint;
    max_messages_quota bigint;
    target_account_id uuid;
begin
    -- select the account_id of the chatbot
    select account_id into target_account_id
    from public.chatbots
    where public.chatbots.id = target_chatbot_id;

    -- select the subscription period
    select period_starts_at, period_ends_at, interval_count, max_messages
    into period_start, period_end, subscription_interval, max_messages_quota
    from get_current_subscription_details(target_account_id);

    -- If no subscription is found, then the user is on the free plan
    -- and the quota is 200 messages per month
    if stripe_price_id is null then
        select count (*) from messages
        where chatbot = messages.chatbot_id
        and messages.type = 'ai'
        and created_at >= date_trunc('month', current_date - interval '1 month')
        and created_at < date_trunc('month', current_date)
        into messages_sent;

        return messages_sent < 200;
    end if;

    -- select the number of messages sent in the current period
    select count (*) from public.messages
    where target_chatbot_id = public.messages.chatbot_id
    and public.messages.type = 'ai'
    and now() between period_start
    and period_end
    into messages_sent;

    max_messages_quota := max_messages_quota / subscription_interval;

    return max_messages_quota > messages_sent;
end; $$
language plpgsql;

grant execute on function public.can_respond_to_message(uuid) to authenticated, service_role;