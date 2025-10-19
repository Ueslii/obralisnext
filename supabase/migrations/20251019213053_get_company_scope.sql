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
  with membership as (
    select cm.construtora_id, cm.role
    from public.construtora_membros cm
    where cm.user_id = target
    order by cm.created_at
    limit 1
  ),
  members as (
    select array_agg(cm.user_id) as ids
    from public.construtora_membros cm
    where cm.construtora_id = (select construtora_id from membership)
  )
  select
    m.construtora_id,
    c.nome as company_name,
    m.role,
    coalesce(mem.ids, array[]::uuid[])
  from membership m
  left join public.construtoras c on c.id = m.construtora_id
  left join members mem on true;
end;
$$;

grant execute on function public.get_company_scope() to anon, authenticated;
