-- Move the MVP operating default from Bengaluru to Noida.
-- Historical rows keep their city unless updated explicitly by operations.

alter table public.garages
  alter column city set default 'Noida';
