alter table public.lancamentos
  add column if not exists membro_id uuid references public.membros(id) on delete set null;

create index if not exists lancamentos_membro_id_idx
  on public.lancamentos (membro_id);

