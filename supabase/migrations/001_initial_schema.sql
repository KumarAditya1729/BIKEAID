create extension if not exists "pgcrypto";

create type public.app_role as enum ('customer', 'mechanic', 'garage_owner', 'admin', 'super_admin');
create type public.service_type as enum ('roadside_assistance', 'home_service');
create type public.bike_category as enum ('100cc', '150cc', '200-250cc', '350cc');
create type public.distance_slab as enum ('within_5km', 'within_10km');
create type public.request_status as enum (
  'draft',
  'submitted',
  'assigned',
  'accepted',
  'in_progress',
  'completed_pending_payment',
  'payment_pending_verification',
  'completed',
  'cancelled',
  'disputed'
);
create type public.mechanic_status as enum ('online', 'busy', 'offline', 'emergency_duty');
create type public.payment_method as enum ('cash', 'qr');
create type public.payment_status as enum ('pending', 'verified', 'disputed');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'customer',
  full_name text not null check (char_length(full_name) between 2 and 80),
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.garages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id),
  name text not null,
  phone text not null check (phone ~ '^[6-9][0-9]{9}$'),
  address text not null,
  city text not null default 'Bengaluru',
  is_verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.mechanics (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id),
  garage_id uuid references public.garages(id),
  status public.mechanic_status not null default 'offline',
  is_verified boolean not null default false,
  emergency_enabled boolean not null default false,
  payout_percentage numeric(5,2) not null default 60.00 check (payout_percentage between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  garage_id uuid references public.garages(id),
  assigned_mechanic_id uuid references public.mechanics(id),
  service_type public.service_type not null,
  bike_category public.bike_category not null,
  distance_slab public.distance_slab not null,
  pickup_address text not null,
  issue_description text not null,
  whatsapp_number text not null check (whatsapp_number ~ '^[6-9][0-9]{9}$'),
  status public.request_status not null default 'submitted',
  base_price integer not null check (base_price >= 0),
  visiting_charge integer not null check (visiting_charge in (100, 200)),
  estimated_total integer not null check (estimated_total >= 0),
  completion_otp_hash text,
  otp_verified_at timestamptz,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_photos (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  mechanic_id uuid not null references public.mechanics(id),
  phase text not null check (phase in ('before', 'after')),
  storage_path text not null,
  content_type text not null check (content_type in ('image/jpeg', 'image/png', 'image/webp')),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount integer not null check (amount > 0),
  mechanic_id uuid references public.mechanics(id),
  collected_at timestamptz,
  verified_by uuid references public.profiles(id),
  verified_at timestamptz,
  reference_note text,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id) on delete cascade,
  customer_id uuid not null references public.profiles(id),
  mechanic_id uuid references public.mechanics(id),
  garage_id uuid references public.garages(id),
  rating integer not null check (rating between 1 and 5),
  review text,
  created_at timestamptz not null default now()
);

create table public.disputes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id),
  opened_by uuid not null references public.profiles(id),
  status text not null default 'open' check (status in ('open', 'investigating', 'resolved', 'rejected')),
  reason text not null,
  resolution text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.fraud_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  request_id uuid references public.service_requests(id),
  event_type text not null,
  severity text not null check (severity in ('low', 'medium', 'high')),
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_table text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

create index idx_profiles_role on public.profiles(role);
create index idx_garages_owner on public.garages(owner_id);
create index idx_mechanics_garage_status on public.mechanics(garage_id, status);
create index idx_requests_customer on public.service_requests(customer_id, created_at desc);
create index idx_requests_mechanic_status on public.service_requests(assigned_mechanic_id, status);
create index idx_requests_garage_status on public.service_requests(garage_id, status);
create index idx_payments_status on public.payments(status, created_at desc);
create index idx_audit_entity on public.audit_logs(entity_table, entity_id);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('admin', 'super_admin')
    and is_active = true
  );
$$;

create or replace function public.is_garage_owner(target_garage_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.garages
    where id = target_garage_id
    and owner_id = auth.uid()
  );
$$;

create or replace function public.is_assigned_mechanic(target_mechanic_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.mechanics
    where id = target_mechanic_id
    and profile_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger mechanics_updated_at before update on public.mechanics for each row execute function public.set_updated_at();
create trigger service_requests_updated_at before update on public.service_requests for each row execute function public.set_updated_at();

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs(actor_id, action, entity_table, entity_id, before_data, after_data)
  values (
    auth.uid(),
    tg_op,
    tg_table_name,
    coalesce(new.id, old.id),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );
  return coalesce(new, old);
end;
$$;

create trigger audit_service_requests after insert or update or delete on public.service_requests for each row execute function public.write_audit_log();
create trigger audit_payments after insert or update or delete on public.payments for each row execute function public.write_audit_log();
create trigger audit_mechanics after insert or update or delete on public.mechanics for each row execute function public.write_audit_log();

alter table public.profiles enable row level security;
alter table public.garages enable row level security;
alter table public.mechanics enable row level security;
alter table public.service_requests enable row level security;
alter table public.service_photos enable row level security;
alter table public.payments enable row level security;
alter table public.ratings enable row level security;
alter table public.disputes enable row level security;
alter table public.fraud_logs enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles read own or admin" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profiles update own limited" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy "garage owner reads own garage" on public.garages for select using (owner_id = auth.uid() or public.is_admin());
create policy "admins manage garages" on public.garages for all using (public.is_admin()) with check (public.is_admin());

create policy "mechanic reads own row" on public.mechanics for select using (profile_id = auth.uid() or public.is_garage_owner(garage_id) or public.is_admin());
create policy "mechanic updates own availability" on public.mechanics for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy "garage owner manages garage mechanics" on public.mechanics for update using (public.is_garage_owner(garage_id)) with check (public.is_garage_owner(garage_id));
create policy "admins manage mechanics" on public.mechanics for all using (public.is_admin()) with check (public.is_admin());

create policy "customers create own requests" on public.service_requests for insert with check (customer_id = auth.uid());
create policy "request visibility by role" on public.service_requests for select using (
  customer_id = auth.uid()
  or public.is_assigned_mechanic(assigned_mechanic_id)
  or public.is_garage_owner(garage_id)
  or public.is_admin()
);
create policy "mechanic updates assigned request" on public.service_requests for update using (public.is_assigned_mechanic(assigned_mechanic_id)) with check (public.is_assigned_mechanic(assigned_mechanic_id));
create policy "admin manages requests" on public.service_requests for all using (public.is_admin()) with check (public.is_admin());

create policy "photo visibility by request access" on public.service_photos for select using (
  exists (
    select 1 from public.service_requests sr
    where sr.id = request_id
    and (
      sr.customer_id = auth.uid()
      or public.is_assigned_mechanic(sr.assigned_mechanic_id)
      or public.is_garage_owner(sr.garage_id)
      or public.is_admin()
    )
  )
);
create policy "mechanics insert own request photos" on public.service_photos for insert with check (public.is_assigned_mechanic(mechanic_id));

create policy "payment visibility by request access" on public.payments for select using (
  exists (
    select 1 from public.service_requests sr
    where sr.id = request_id
    and (
      sr.customer_id = auth.uid()
      or public.is_assigned_mechanic(sr.assigned_mechanic_id)
      or public.is_garage_owner(sr.garage_id)
      or public.is_admin()
    )
  )
);
create policy "mechanic marks collected payment" on public.payments for insert with check (public.is_assigned_mechanic(mechanic_id) and status = 'pending');
create policy "admins verify payments" on public.payments for update using (public.is_admin()) with check (public.is_admin());

create policy "customers rate completed requests" on public.ratings for insert with check (customer_id = auth.uid());
create policy "ratings visible to involved parties" on public.ratings for select using (
  customer_id = auth.uid()
  or exists (select 1 from public.mechanics m where m.id = mechanic_id and m.profile_id = auth.uid())
  or public.is_garage_owner(garage_id)
  or public.is_admin()
);

create policy "dispute visibility" on public.disputes for select using (
  opened_by = auth.uid()
  or exists (select 1 from public.service_requests sr where sr.id = request_id and (sr.customer_id = auth.uid() or public.is_assigned_mechanic(sr.assigned_mechanic_id) or public.is_garage_owner(sr.garage_id)))
  or public.is_admin()
);
create policy "users open own disputes" on public.disputes for insert with check (opened_by = auth.uid());
create policy "admins manage disputes" on public.disputes for update using (public.is_admin()) with check (public.is_admin());

create policy "admins read fraud logs" on public.fraud_logs for select using (public.is_admin());
create policy "admins write fraud logs" on public.fraud_logs for insert with check (public.is_admin());
create policy "admins read audit logs" on public.audit_logs for select using (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('service-photos', 'service-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;
