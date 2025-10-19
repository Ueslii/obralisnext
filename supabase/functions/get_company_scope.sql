create or replace function public.get_company_scope()
returns table (
  construtora_id uuid,
  company_name text,
  role text,
  member_user_ids uuid[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := auth.uid();
begin
  if target is null then
    return;
  end if;

  return query
  select
    cm.construtora_id,
    c.nome as company_name,
    cm.role,
    coalesce(
      array_agg(distinct members.user_id) filter (where members.user_id is not null),
      array[]::uuid[]
    ) as member_user_ids
  from public.construtora_membros cm
  left join public.construtoras c
    on c.id = cm.construtora_id
  left join public.construtora_membros members
    on members.construtora_id = cm.construtora_id
  where cm.user_id = target
  group by cm.construtora_id, c.nome, cm.role
  order by min(cm.created_at)
  limit 1;
end;
$$;

revoke all on function public.get_company_scope() from public;
revoke execute on function public.get_company_scope() from anon;
grant execute on function public.get_company_scope() to authenticated;
