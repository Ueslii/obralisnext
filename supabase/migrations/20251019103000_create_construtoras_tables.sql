create extension if not exists "pgcrypto";

create type public.convite_status as enum ('pending', 'accepted', 'declined', 'expired');

create table public.construtoras (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  identificador text unique,
  segmento text,
  porte text,
  metadata jsonb,
  owner_id uuid not null references auth.users (id) on delete cascade,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger set_construtoras_updated_at
before update on public.construtoras
for each row
execute function public.set_updated_at();

create table public.construtora_membros (
  id uuid primary key default gen_random_uuid(),
  construtora_id uuid not null references public.construtoras (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'member',
  cargo text,
  invited_by uuid references auth.users (id) on delete set null,
  accepted_at timestamptz,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

create unique index construtora_membros_unique on public.construtora_membros (construtora_id, user_id);

create table public.construtora_convites (
  id uuid primary key default gen_random_uuid(),
  construtora_id uuid not null references public.construtoras (id) on delete cascade,
  email text not null,
  cargo_sugerido text,
  token uuid not null default gen_random_uuid(),
  status public.convite_status not null default 'pending',
  expires_at timestamptz not null default timezone('utc', now()) + interval '7 days',
  invited_by uuid references auth.users (id) on delete set null,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  responded_at timestamptz
);

create unique index construtora_convites_token_key on public.construtora_convites (token);
create unique index construtora_convites_pending_email_idx
  on public.construtora_convites (construtora_id, email)
  where status = 'pending';

create view public.construtoras_public
with (security_invoker = true)
as
  select id, nome, identificador
  from public.construtoras;

grant select on public.construtoras_public to anon, authenticated;

alter table public.construtoras enable row level security;
alter table public.construtora_membros enable row level security;
alter table public.construtora_convites enable row level security;

create policy construtoras_owner_insert
on public.construtoras
for insert
with check (auth.uid() = owner_id);

create policy construtoras_owner_update
on public.construtoras
for update
using (auth.uid() = owner_id);

create policy construtoras_owner_delete
on public.construtoras
for delete
using (auth.uid() = owner_id);

create policy construtoras_members_select
on public.construtoras
for select
using (
  owner_id = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtoras.id
      and m.user_id = auth.uid()
  )
);

create policy membros_select
on public.construtora_membros
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_membros.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_membros.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy membros_insert
on public.construtora_membros
for insert
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_membros.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_membros.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy membros_update
on public.construtora_membros
for update
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_membros.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_membros.construtora_id
      and c.owner_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_membros.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_membros.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy membros_delete
on public.construtora_membros
for delete
using (
  auth.uid() = user_id
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_membros.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_membros.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy convites_select
on public.construtora_convites
for select
using (
  email = auth.email()
  or created_by = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_convites.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_convites.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy convites_insert
on public.construtora_convites
for insert
with check (
  (created_by = auth.uid() and email = auth.email())
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_convites.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_convites.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy convites_update
on public.construtora_convites
for update
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_convites.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_convites.construtora_id
      and c.owner_id = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_convites.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_convites.construtora_id
      and c.owner_id = auth.uid()
  )
);

create policy convites_delete
on public.construtora_convites
for delete
using (
  created_by = auth.uid()
  or exists (
    select 1
    from public.construtora_membros m
    where m.construtora_id = construtora_convites.construtora_id
      and m.user_id = auth.uid()
      and m.role in ('admin', 'owner')
  )
  or exists (
    select 1
    from public.construtoras c
    where c.id = construtora_convites.construtora_id
      and c.owner_id = auth.uid()
  )
);

create or replace function public.notify_construtora_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform supabase_functions.http_request(
    'notify-invite',
    'POST',
    jsonb_build_object(
      'inviteId', new.id,
      'construtoraId', new.construtora_id,
      'email', new.email,
      'cargoSugerido', new.cargo_sugerido,
      'invitedBy', new.invited_by,
      'createdBy', new.created_by
    ),
    jsonb_build_object('Content-Type', 'application/json')
  );
  return new;
exception
  when others then
    raise notice 'Falha ao acionar notify-invite: %', SQLERRM;
    return new;
end;
$$;

create trigger notify_construtora_invite_trigger
after insert on public.construtora_convites
for each row
execute function public.notify_construtora_invite();
