-- Ensure orcamentos table has an updated_at column used by triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'orcamentos'
      AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.orcamentos
      ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END
$$;

ALTER TABLE public.orcamentos
  ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.orcamentos
SET updated_at = COALESCE(updated_at, now());

-- Harden the helper to skip tables without updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  IF to_jsonb(NEW) ? 'updated_at' THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Make obra_etapas policy allow INSERT/UPDATE writes under the same conditions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'obra_etapas'
  ) THEN
    DROP POLICY IF EXISTS "Managers can manage obra etapas" ON public.obra_etapas;

    CREATE POLICY "Managers can manage obra etapas"
      ON public.obra_etapas
      FOR ALL
      USING (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'engenheiro')
        OR public.has_role(auth.uid(), 'gestor')
        OR public.has_role(auth.uid(), 'responsavel_obra')
        OR EXISTS (
          SELECT 1
          FROM public.obras o
          WHERE o.id = obra_etapas.obra_id
            AND o.user_id = auth.uid()
        )
      )
      WITH CHECK (
        public.has_role(auth.uid(), 'admin')
        OR public.has_role(auth.uid(), 'engenheiro')
        OR public.has_role(auth.uid(), 'gestor')
        OR public.has_role(auth.uid(), 'responsavel_obra')
        OR EXISTS (
          SELECT 1
          FROM public.obras o
          WHERE o.id = obra_etapas.obra_id
            AND o.user_id = auth.uid()
        )
      );
  END IF;
END
$$;
