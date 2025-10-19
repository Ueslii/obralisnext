-- Ensure 'usuario' exists in app_role enum
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'app_role'
  ) THEN
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'usuario';
    EXCEPTION
      WHEN duplicate_object THEN NULL;
      WHEN others THEN
        -- ignore if already present or cannot add in this context
        NULL;
    END;
  END IF;
END
$$;

-- Create financial entries table aligned with application code
CREATE TABLE IF NOT EXISTS public.lancamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID REFERENCES public.obras(id) ON DELETE SET NULL,
  membro_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  tipo public.lancamento_tipo NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data TIMESTAMPTZ NOT NULL,
  etapa TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lancamentos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can view lancamentos"
  ON public.lancamentos FOR SELECT
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins and gestores can manage lancamentos"
  ON public.lancamentos FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'gestor')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TRIGGER update_lancamentos_updated_at
  BEFORE UPDATE ON public.lancamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END
$$;

-- Optional: copy data from legacy table if present
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'lancamentos_financeiros'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.lancamentos LIMIT 1
  ) THEN
    INSERT INTO public.lancamentos (id, tipo, categoria, descricao, valor, data, etapa, user_id, created_at, updated_at)
    SELECT
      lf.id,
      lf.tipo,
      lf.categoria,
      lf.descricao,
      lf.valor,
      (lf.data::timestamp at time zone 'UTC')::timestamptz,
      lf.etapa,
      lf.user_id,
      lf.created_at,
      lf.updated_at
    FROM public.lancamentos_financeiros lf
    ON CONFLICT (id) DO NOTHING;
  END IF;
END
$$;

