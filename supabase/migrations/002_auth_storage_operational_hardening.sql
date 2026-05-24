create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, full_name, phone, email)
  values (
    new.id,
    'customer',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), 'New Customer'),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), '9999999999'),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create policy "users insert own customer profile" on public.profiles
for insert
with check (id = auth.uid() and role = 'customer');

create policy "service photo objects readable by involved parties" on storage.objects
for select
using (
  bucket_id = 'service-photos'
  and exists (
    select 1
    from public.service_photos sp
    join public.service_requests sr on sr.id = sp.request_id
    where sp.storage_path = name
    and (
      sr.customer_id = auth.uid()
      or public.is_assigned_mechanic(sr.assigned_mechanic_id)
      or public.is_garage_owner(sr.garage_id)
      or public.is_admin()
    )
  )
);

create or replace view public.admin_revenue_analytics as
select
  date_trunc('day', p.verified_at) as day,
  count(*) filter (where p.status = 'verified') as verified_payment_count,
  coalesce(sum(p.amount) filter (where p.status = 'verified'), 0) as verified_revenue,
  count(*) filter (where p.status = 'pending') as pending_payment_count,
  count(*) filter (where p.status = 'disputed') as disputed_payment_count
from public.payments p
group by 1;

create or replace view public.admin_request_funnel as
select
  status,
  count(*) as total
from public.service_requests
group by status;
