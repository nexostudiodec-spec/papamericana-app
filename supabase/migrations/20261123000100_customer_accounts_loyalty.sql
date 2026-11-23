-- PAPAMERICANA customer accounts and stamp-card loyalty
alter table public.customers
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null,
  add column if not exists loyalty_qr_token uuid not null default gen_random_uuid(),
  add column if not exists loyalty_stamps integer not null default 0 check (loyalty_stamps >= 0),
  add column if not exists loyalty_enrolled_at timestamptz;

create unique index if not exists customers_auth_user_id_uidx on public.customers(auth_user_id) where auth_user_id is not null;
create unique index if not exists customers_loyalty_qr_token_uidx on public.customers(loyalty_qr_token);

create table if not exists public.loyalty_settings (
  id boolean primary key default true check (id = true),
  stamps_required integer not null default 6 check (stamps_required > 0),
  reward_description text not null default 'Premio por completar tu tarjeta',
  is_active boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.loyalty_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.loyalty_stamp_events (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  stamps integer not null default 1 check (stamps > 0),
  source text not null default 'online' check (source in ('online','in_store','adjustment')),
  note text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint loyalty_stamp_events_order_unique unique(order_id)
);

alter table public.loyalty_settings enable row level security;
alter table public.loyalty_stamp_events enable row level security;

create policy loyalty_settings_admin_manage on public.loyalty_settings for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());
create policy loyalty_settings_public_read on public.loyalty_settings for select to anon, authenticated using (is_active = true);
create policy loyalty_events_admin_read on public.loyalty_stamp_events for select to authenticated using (public.is_store_admin());
create policy loyalty_events_admin_manage on public.loyalty_stamp_events for all to authenticated using (public.is_store_admin()) with check (public.is_store_admin());

create policy customers_self_read on public.customers for select to authenticated using (auth_user_id = (select auth.uid()));
create policy orders_customer_read on public.orders for select to authenticated using (
  exists (select 1 from public.customers c where c.id = orders.customer_id and c.auth_user_id = (select auth.uid()))
);
create policy order_items_customer_read on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o join public.customers c on c.id = o.customer_id
  where o.id = order_items.order_id and c.auth_user_id = (select auth.uid()))
);

create or replace function public.claim_customer_account()
returns void language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_email text := lower(coalesce(auth.jwt() ->> 'email',''));
begin
  if v_uid is null or v_email = '' then raise exception 'Authenticated verified email required'; end if;
  with candidate as (
    select id from public.customers where lower(email) = v_email
      and (auth_user_id is null or auth_user_id = v_uid)
    order by created_at asc limit 1 for update
  )
  update public.customers c set auth_user_id = v_uid, updated_at = now()
  from candidate where c.id = candidate.id;
end;
$$;
revoke all on function public.claim_customer_account() from public, anon;
grant execute on function public.claim_customer_account() to authenticated;

create or replace function public.award_order_loyalty_stamp()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare inserted_customer_id uuid;
begin
  if new.status = 'completed' and new.payment_status = 'paid'
     and (old.status is distinct from new.status or old.payment_status is distinct from new.payment_status)
     and new.customer_id is not null then
    insert into public.loyalty_stamp_events(customer_id, order_id, stamps, source)
    values (new.customer_id, new.id, 1, 'online')
    on conflict (order_id) do nothing returning customer_id into inserted_customer_id;
    if inserted_customer_id is not null then
      update public.customers set loyalty_stamps = loyalty_stamps + 1,
        loyalty_enrolled_at = coalesce(loyalty_enrolled_at, now()), updated_at = now()
      where id = inserted_customer_id;
    end if;
  end if;
  return new;
end;
$$;
drop trigger if exists orders_award_loyalty_stamp on public.orders;
create trigger orders_award_loyalty_stamp after update of status, payment_status on public.orders
for each row execute function public.award_order_loyalty_stamp();

create or replace function public.register_in_store_loyalty_stamp(p_token uuid, p_note text default null)
returns void language plpgsql security definer set search_path = ''
as $$
declare v_uid uuid := auth.uid(); v_customer_id uuid;
begin
  if v_uid is null or not public.is_store_admin() then raise exception 'Not authorized'; end if;
  select id into v_customer_id from public.customers where loyalty_qr_token = p_token limit 1;
  if v_customer_id is null then raise exception 'Customer not found'; end if;
  insert into public.loyalty_stamp_events(customer_id, stamps, source, note, created_by)
  values (v_customer_id, 1, 'in_store', left(coalesce(p_note,'Compra presencial'),160), v_uid);
  update public.customers set loyalty_stamps = loyalty_stamps + 1,
    loyalty_enrolled_at = coalesce(loyalty_enrolled_at, now()), updated_at = now()
  where id = v_customer_id;
end;
$$;
revoke all on function public.register_in_store_loyalty_stamp(uuid,text) from public, anon;
grant execute on function public.register_in_store_loyalty_stamp(uuid,text) to authenticated;
