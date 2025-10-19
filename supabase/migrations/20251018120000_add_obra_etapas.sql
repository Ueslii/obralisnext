-- Cria tabela de etapas das obras e vincula insumos a cada etapa

CREATE TABLE IF NOT EXISTS public.obra_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id UUID NOT NULL REFERENCES public.obras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  custo_previsto NUMERIC DEFAULT 0,
  custo_real NUMERIC DEFAULT 0,
  data_inicio DATE,
  data_fim DATE,
  ordem INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.obra_etapas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view obra etapas" ON public.obra_etapas;
CREATE POLICY "Authenticated users can view obra etapas"
  ON public.obra_etapas
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Managers can manage obra etapas" ON public.obra_etapas;
CREATE POLICY "Managers can manage obra etapas"
  ON public.obra_etapas
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR
    public.has_role(auth.uid(), 'engenheiro') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'responsavel_obra')
  );

CREATE TRIGGER update_obra_etapas_updated_at
  BEFORE UPDATE ON public.obra_etapas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.obra_insumos
  ADD COLUMN IF NOT EXISTS etapa_id UUID REFERENCES public.obra_etapas(id) ON DELETE SET NULL;
