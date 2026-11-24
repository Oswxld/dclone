-- Dclone simulated balances only: not real funds or Deriv account data.
-- A cursor per client/mode avoids millions of one-second batch receipt rows.
create table if not exists public.dclone_sim_account_balances (
  user_id uuid not null references auth.users(id) on delete cascade,
  account_mode text not null check (account_mode in ('real','demo')),
  account_type text not null check (account_type in ('optionsUsd','cfdsUsd','walletUsd','walletUsdt','p2pUsd')),
  balance_cents bigint not null default 0 check (balance_cents >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, account_mode, account_type)
);
create table if not exists public.dclone_sim_balance_cursors (
  user_id uuid not null references auth.users(id) on delete cascade,
  account_mode text not null check (account_mode in ('real','demo')),
  client_id uuid not null,
  last_sequence bigint not null default 0 check (last_sequence >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, account_mode, client_id)
);

alter table public.dclone_sim_account_balances enable row level security;
alter table public.dclone_sim_balance_cursors enable row level security;
revoke all on public.dclone_sim_account_balances from anon, authenticated;
revoke all on public.dclone_sim_balance_cursors from anon, authenticated;
grant select on public.dclone_sim_account_balances to authenticated;
grant select on public.dclone_sim_balance_cursors to authenticated;
create policy "Read own simulated account balances" on public.dclone_sim_account_balances
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Read own simulated sync cursors" on public.dclone_sim_balance_cursors
  for select to authenticated using ((select auth.uid()) = user_id);

create or replace function public.dclone_sim_snapshot(p_client_id uuid)
returns jsonb language plpgsql security definer set search_path = ''
as $$
declare v_user uuid := auth.uid();
begin
  if v_user is null or p_client_id is null then raise exception 'Authentication required'; end if;
  -- Defaults are per-user; do not import old device-wide localStorage amounts.
  insert into public.dclone_sim_account_balances(user_id, account_mode, account_type, balance_cents)
  select v_user, modes.mode, accounts.account,
    case
      when modes.mode = 'real' and accounts.account = 'optionsUsd' then 990192
      when modes.mode = 'demo' and accounts.account = 'optionsUsd' then 1000000
      when accounts.account = 'cfdsUsd' then 1000000
      when modes.mode = 'real' and accounts.account = 'walletUsd' then 125000
      else 0
    end
  from (values ('real'),('demo')) as modes(mode)
  cross join (values ('optionsUsd'),('cfdsUsd'),('walletUsd'),('walletUsdt'),('p2pUsd')) as accounts(account)
  on conflict do nothing;
  insert into public.dclone_sim_balance_cursors(user_id, account_mode, client_id)
    values (v_user,'real',p_client_id),(v_user,'demo',p_client_id) on conflict do nothing;
  return jsonb_build_object(
    'balances',(select jsonb_agg(jsonb_build_object('mode',account_mode,'account',account_type,'cents',balance_cents))
      from public.dclone_sim_account_balances where user_id = v_user),
    'cursors',(select jsonb_object_agg(account_mode,last_sequence)
      from public.dclone_sim_balance_cursors where user_id = v_user and client_id = p_client_id)
  );
end $$;

create or replace function public.dclone_sim_apply_batch(
  p_client_id uuid, p_mode text, p_events jsonb
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_last bigint;
  v_event jsonb;
  v_seq bigint;
  v_kind text;
  v_account text;
  v_to text;
  v_delta bigint;
  v_current bigint;
begin
  if v_user is null or p_client_id is null then raise exception 'Authentication required'; end if;
  if p_mode not in ('real','demo') then raise exception 'Invalid account mode'; end if;
  if jsonb_typeof(p_events) is distinct from 'array'
     or jsonb_array_length(p_events) < 1 or jsonb_array_length(p_events) > 500
    then raise exception 'Invalid batch size'; end if;
  -- Serializes all wallets for the same user/mode, including separate devices.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user::text || ':' || p_mode, 0));
  insert into public.dclone_sim_balance_cursors(user_id,account_mode,client_id)
    values (v_user,p_mode,p_client_id) on conflict do nothing;
  select last_sequence into v_last from public.dclone_sim_balance_cursors
    where user_id = v_user and account_mode = p_mode and client_id = p_client_id for update;
  for v_event in select value from pg_catalog.jsonb_array_elements(p_events) loop
    if jsonb_typeof(v_event) <> 'object' then raise exception 'Invalid event'; end if;
    v_seq := (v_event->>'seq')::bigint;
    if v_seq is null or v_seq < 1 then raise exception 'Invalid event sequence'; end if;
    -- Acknowledged earlier sequences are not applied again, even after a timeout.
    if v_seq <= v_last then continue; end if;
    if v_seq <> v_last + 1 then raise exception 'Out-of-order balance batch'; end if;
    v_kind := v_event->>'kind';
    if v_kind = 'transfer' then
      v_account := v_event->>'from';
      v_to := v_event->>'to';
      v_delta := (v_event->>'amount_cents')::bigint;
      if v_delta is null or v_delta < 1 or v_delta > 1000000000000
         or v_account = v_to then raise exception 'Invalid transfer'; end if;
      if v_account not in ('optionsUsd','cfdsUsd','walletUsd','walletUsdt','p2pUsd')
         or v_to not in ('optionsUsd','cfdsUsd','walletUsd','walletUsdt','p2pUsd')
        then raise exception 'Invalid account'; end if;
      select balance_cents into v_current from public.dclone_sim_account_balances
        where user_id=v_user and account_mode=p_mode and account_type=v_account;
      if v_current is null or v_current < v_delta then raise exception 'Insufficient simulated balance'; end if;
      update public.dclone_sim_account_balances set balance_cents = balance_cents - v_delta, updated_at=now()
        where user_id=v_user and account_mode=p_mode and account_type=v_account;
      update public.dclone_sim_account_balances set balance_cents = balance_cents + v_delta, updated_at=now()
        where user_id=v_user and account_mode=p_mode and account_type=v_to;
    elsif v_kind in ('adjust','set') then
      v_account := v_event->>'account';
      v_delta := (v_event->>'cents')::bigint;
      if v_account not in ('optionsUsd','cfdsUsd','walletUsd','walletUsdt','p2pUsd')
        or v_delta is null or v_delta > 1000000000000 or v_delta < -1000000000000
        then raise exception 'Invalid adjustment'; end if;
      select balance_cents into v_current from public.dclone_sim_account_balances
        where user_id=v_user and account_mode=p_mode and account_type=v_account;
      if v_current is null then raise exception 'Missing account'; end if;
      if v_kind = 'set' then
        if v_delta < 0 then raise exception 'Negative simulated balance'; end if;
        update public.dclone_sim_account_balances set balance_cents=v_delta,updated_at=now()
          where user_id=v_user and account_mode=p_mode and account_type=v_account;
      else
        if v_current + v_delta < 0 then raise exception 'Insufficient simulated balance'; end if;
        update public.dclone_sim_account_balances set balance_cents=balance_cents+v_delta,updated_at=now()
          where user_id=v_user and account_mode=p_mode and account_type=v_account;
      end if;
    else
      raise exception 'Unknown balance event';
    end if;
    v_last := v_seq;
  end loop;
  update public.dclone_sim_balance_cursors set last_sequence=v_last,updated_at=now()
    where user_id=v_user and account_mode=p_mode and client_id=p_client_id;
  return jsonb_build_object('last_sequence',v_last,
    'balances',(select jsonb_agg(jsonb_build_object('account',account_type,'cents',balance_cents))
      from public.dclone_sim_account_balances where user_id=v_user and account_mode=p_mode));
end $$;

revoke all on function public.dclone_sim_snapshot(uuid) from public, anon;
revoke all on function public.dclone_sim_apply_batch(uuid,text,jsonb) from public, anon;
grant execute on function public.dclone_sim_snapshot(uuid) to authenticated;
grant execute on function public.dclone_sim_apply_batch(uuid,text,jsonb) to authenticated;