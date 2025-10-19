-- Ajustes de fornecedores
ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS prazo_medio_dias integer;

ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS avaliacao_qualidade numeric;

-- Nome do fornecedor armazenado diretamente no insumo
ALTER TABLE public.obra_insumos
  ADD COLUMN IF NOT EXISTS fornecedor_nome text;

-- Tabela para imprevistos das obras
CREATE TABLE IF NOT EXISTS public.obra_imprevistos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id uuid NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  valor numeric NOT NULL DEFAULT 0,
  categoria text,
  data date DEFAULT CURRENT_DATE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.obra_imprevistos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can view obra_imprevistos"
    ON public.obra_imprevistos
    FOR SELECT
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Managers can manage obra_imprevistos"
    ON public.obra_imprevistos
    FOR ALL
    USING (
      has_role(auth.uid(), 'admin') OR
      has_role(auth.uid(), 'engenheiro') OR
      has_role(auth.uid(), 'responsavel_obra')
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
