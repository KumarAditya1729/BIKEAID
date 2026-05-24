-- Hardening pass after full database audit.
-- The application now writes through server-side APIs with service-role access,
-- so direct authenticated table mutations are intentionally narrow.

drop policy if exists "customers create own requests" on public.service_requests;
drop policy if exists "mechanic updates assigned request" on public.service_requests;
drop policy if exists "mechanic updates own availability" on public.mechanics;
drop policy if exists "garage owner manages garage mechanics" on public.mechanics;
drop policy if exists "mechanic marks collected payment" on public.payments;
drop policy if exists "customers rate completed requests" on public.ratings;
drop policy if exists "mechanics insert own request photos" on public.service_photos;
drop policy if exists "users open own disputes" on public.disputes;

-- No replacement insert/update policies are created for operational tables.
-- Customers, mechanics, and garage owners must mutate operational records
-- through server API routes or future security-definer RPCs. This prevents
-- direct Supabase anon-key calls from bypassing OTP, pricing, payout,
-- assignment, and payment verification workflows.

create unique index if not exists idx_profiles_email_unique
on public.profiles (lower(email))
where email is not null;

create unique index if not exists idx_service_photos_request_phase_mechanic
on public.service_photos (request_id, mechanic_id, phase);

alter table public.service_requests
  add constraint service_requests_pickup_address_length check (char_length(pickup_address) between 10 and 500),
  add constraint service_requests_issue_description_length check (char_length(issue_description) between 5 and 1000);

alter table public.payments
  add constraint payments_reference_note_length check (reference_note is null or char_length(reference_note) <= 500);

alter table public.disputes
  add constraint disputes_reason_length check (char_length(reason) between 5 and 1000),
  add constraint disputes_resolution_length check (resolution is null or char_length(resolution) <= 1000);

alter table public.ratings
  add constraint ratings_review_length check (review is null or char_length(review) <= 1000);

create or replace function public.validate_request_transition()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    return new;
  end if;

  if old.status = new.status then
    return new;
  end if;

  if old.status = 'submitted' and new.status in ('assigned', 'cancelled', 'disputed') then
    return new;
  elsif old.status = 'assigned' and new.status in ('accepted', 'submitted', 'cancelled', 'disputed') then
    return new;
  elsif old.status = 'accepted' and new.status in ('in_progress', 'completed_pending_payment', 'cancelled', 'disputed') then
    return new;
  elsif old.status = 'in_progress' and new.status in ('completed_pending_payment', 'cancelled', 'disputed') then
    return new;
  elsif old.status = 'completed_pending_payment' and new.status in ('payment_pending_verification', 'disputed') then
    return new;
  elsif old.status = 'payment_pending_verification' and new.status in ('completed', 'disputed') then
    return new;
  elsif old.status = 'disputed' and new.status in ('completed', 'cancelled') then
    return new;
  end if;

  raise exception 'invalid service request status transition from % to %', old.status, new.status
    using errcode = 'check_violation';
end;
$$;

drop trigger if exists validate_service_request_transition on public.service_requests;
create trigger validate_service_request_transition
before update on public.service_requests
for each row execute function public.validate_request_transition();

create or replace function public.validate_service_request_consistency()
returns trigger
language plpgsql
as $$
declare
  mechanic_garage_id uuid;
begin
  if new.assigned_mechanic_id is not null then
    select garage_id into mechanic_garage_id
    from public.mechanics
    where id = new.assigned_mechanic_id;

    if mechanic_garage_id is null then
      raise exception 'assigned mechanic must belong to a garage'
        using errcode = 'check_violation';
    end if;

    if new.garage_id is null or new.garage_id <> mechanic_garage_id then
      raise exception 'assigned mechanic must belong to request garage'
        using errcode = 'check_violation';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_service_request_consistency on public.service_requests;
create trigger validate_service_request_consistency
before insert or update on public.service_requests
for each row execute function public.validate_service_request_consistency();

create or replace function public.validate_payment_consistency()
returns trigger
language plpgsql
as $$
begin
  if new.mechanic_id is not null and not exists (
    select 1
    from public.service_requests sr
    where sr.id = new.request_id
    and sr.assigned_mechanic_id = new.mechanic_id
  ) then
    raise exception 'payment mechanic must match assigned request mechanic'
      using errcode = 'check_violation';
  end if;

  if new.status = 'verified' and (new.verified_by is null or new.verified_at is null) then
    raise exception 'verified payments require verifier and verified timestamp'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_payment_consistency on public.payments;
create trigger validate_payment_consistency
before insert or update on public.payments
for each row execute function public.validate_payment_consistency();

create or replace function public.validate_rating_consistency()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.service_requests sr
    where sr.id = new.request_id
    and sr.customer_id = new.customer_id
    and sr.status = 'completed'
    and (new.mechanic_id is null or new.mechanic_id = sr.assigned_mechanic_id)
    and (new.garage_id is null or new.garage_id = sr.garage_id)
  ) then
    raise exception 'rating must match a completed request owned by customer'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_rating_consistency on public.ratings;
create trigger validate_rating_consistency
before insert or update on public.ratings
for each row execute function public.validate_rating_consistency();

create or replace function public.validate_photo_consistency()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.service_requests sr
    where sr.id = new.request_id
    and sr.assigned_mechanic_id = new.mechanic_id
  ) then
    raise exception 'photo mechanic must match assigned request mechanic'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_photo_consistency on public.service_photos;
create trigger validate_photo_consistency
before insert or update on public.service_photos
for each row execute function public.validate_photo_consistency();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata_phone text;
begin
  metadata_phone := nullif(new.raw_user_meta_data ->> 'phone', '');

  insert into public.profiles (id, role, full_name, phone, email)
  values (
    new.id,
    'customer',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New Customer'),
    case
      when metadata_phone ~ '^[6-9][0-9]{9}$' then metadata_phone
      else '9999999999'
    end,
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger audit_profiles after insert or update or delete on public.profiles for each row execute function public.write_audit_log();
create trigger audit_garages after insert or update or delete on public.garages for each row execute function public.write_audit_log();
create trigger audit_service_photos after insert or update or delete on public.service_photos for each row execute function public.write_audit_log();
create trigger audit_ratings after insert or update or delete on public.ratings for each row execute function public.write_audit_log();
create trigger audit_disputes after insert or update or delete on public.disputes for each row execute function public.write_audit_log();
create trigger audit_fraud_logs after insert or update or delete on public.fraud_logs for each row execute function public.write_audit_log();

create or replace view public.admin_revenue_analytics
with (security_invoker = true)
as
select
  date_trunc('day', p.verified_at) as day,
  count(*) filter (where p.status = 'verified') as verified_payment_count,
  coalesce(sum(p.amount) filter (where p.status = 'verified'), 0) as verified_revenue,
  count(*) filter (where p.status = 'pending') as pending_payment_count,
  count(*) filter (where p.status = 'disputed') as disputed_payment_count
from public.payments p
group by 1;

create or replace view public.admin_request_funnel
with (security_invoker = true)
as
select
  status,
  count(*) as total
from public.service_requests
group by status;

revoke all on public.admin_revenue_analytics from anon, authenticated;
revoke all on public.admin_request_funnel from anon, authenticated;
