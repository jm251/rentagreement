create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.agreements (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  status text not null check (status in ('draft', 'payment_initiated', 'paid', 'payment_failed')),
  agreement_number text unique,
  agreement_type text not null,
  usage_type text not null,
  language text not null default 'en',
  contact_name text,
  contact_email text not null,
  contact_phone text not null,
  landlord_name text not null,
  tenant_name text not null,
  city text not null,
  state text not null,
  pincode text not null,
  start_date date not null,
  end_date date not null,
  duration_months integer not null,
  monthly_rent_amount numeric not null,
  security_deposit_amount numeric not null,
  notice_period_months integer not null,
  lock_in_period_months integer,
  price_inr integer not null default 149,
  payment_amount_paise integer not null,
  payment_provider text not null default 'stripe',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  paid_at timestamptz,
  pdf_path text,
  pdf_url text,
  email_sent_at timestamptz,
  form_data jsonb not null,
  ai_clauses jsonb not null default '[]'::jsonb,
  hardcoded_clauses jsonb not null default '[]'::jsonb,
  final_clauses jsonb not null default '[]'::jsonb,
  html_snapshot text
);

alter table public.agreements drop column if exists access_token;

create index if not exists agreements_status_idx on public.agreements (status);
create index if not exists agreements_created_at_idx on public.agreements (created_at desc);
create index if not exists agreements_contact_email_idx on public.agreements (contact_email);
create index if not exists agreements_stripe_checkout_session_id_idx on public.agreements (stripe_checkout_session_id);

drop trigger if exists trg_agreements_set_updated_at on public.agreements;
create trigger trg_agreements_set_updated_at
before update on public.agreements
for each row
execute procedure public.set_updated_at();

alter table public.agreements enable row level security;

create table if not exists public.rate_limit_counters (
  scope text not null,
  identifier_hash text not null,
  count integer not null default 0,
  window_started_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (scope, identifier_hash)
);

drop trigger if exists trg_rate_limit_counters_set_updated_at on public.rate_limit_counters;
create trigger trg_rate_limit_counters_set_updated_at
before update on public.rate_limit_counters
for each row
execute procedure public.set_updated_at();

create or replace function public.consume_rate_limit(
  scope text,
  identifier_hash text,
  limit_count integer,
  window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  retry_after_seconds integer
)
language plpgsql
security definer
as $$
declare
  existing_record public.rate_limit_counters%rowtype;
  current_now timestamptz := timezone('utc', now());
  elapsed_seconds integer := 0;
  next_count integer := 0;
begin
  if limit_count <= 0 or window_seconds <= 0 then
    raise exception 'limit_count and window_seconds must be positive';
  end if;

  select *
  into existing_record
  from public.rate_limit_counters
  where public.rate_limit_counters.scope = consume_rate_limit.scope
    and public.rate_limit_counters.identifier_hash = consume_rate_limit.identifier_hash
  for update;

  if not found then
    insert into public.rate_limit_counters (scope, identifier_hash, count, window_started_at)
    values (consume_rate_limit.scope, consume_rate_limit.identifier_hash, 1, current_now);

    return query select true, greatest(limit_count - 1, 0), 0;
    return;
  end if;

  elapsed_seconds := greatest(
    floor(extract(epoch from (current_now - existing_record.window_started_at)))::integer,
    0
  );

  if elapsed_seconds >= window_seconds then
    update public.rate_limit_counters
    set count = 1,
        window_started_at = current_now
    where public.rate_limit_counters.scope = consume_rate_limit.scope
      and public.rate_limit_counters.identifier_hash = consume_rate_limit.identifier_hash;

    return query select true, greatest(limit_count - 1, 0), 0;
    return;
  end if;

  if existing_record.count >= limit_count then
    return query select false, 0, greatest(window_seconds - elapsed_seconds, 0);
    return;
  end if;

  next_count := existing_record.count + 1;

  update public.rate_limit_counters
  set count = next_count
  where public.rate_limit_counters.scope = consume_rate_limit.scope
    and public.rate_limit_counters.identifier_hash = consume_rate_limit.identifier_hash;

  return query select true, greatest(limit_count - next_count, 0), 0;
end;
$$;

do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'agreements'
  ) then
    insert into storage.buckets (id, name, public)
    values ('agreements', 'agreements', false);
  end if;
end $$;

-- Keep bucket private. Service role operations bypass RLS; do not add public read policies.
