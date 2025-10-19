-- Ensure enum exists
DO $$
BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'engenheiro', 'gestor', 'responsavel_obra');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- Ensure user_roles table and columns exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    CREATE TABLE public.user_roles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      role public.app_role NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      UNIQUE (user_id, role)
    );
  END IF;
END
$$;

ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID NOT NULL,
  ADD COLUMN IF NOT EXISTS role public.app_role NOT NULL,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function is already idempotent thanks to OR REPLACE
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policies for user_roles
DO $$
BEGIN
  CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Only admins can insert roles"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Only admins can update roles"
  ON public.user_roles
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Only admins can delete roles"
  ON public.user_roles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- fornecedores table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'fornecedores'
  ) THEN
    CREATE TABLE public.fornecedores (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nome TEXT NOT NULL,
      cnpj TEXT,
      contato TEXT,
      email TEXT,
      telefone TEXT,
      endereco TEXT,
      prazo_medio_dias INTEGER DEFAULT 7,
      observacoes TEXT,
      ativo BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

ALTER TABLE public.fornecedores
  ADD COLUMN IF NOT EXISTS nome TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS cnpj TEXT,
  ADD COLUMN IF NOT EXISTS contato TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS prazo_medio_dias INTEGER DEFAULT 7,
  ADD COLUMN IF NOT EXISTS observacoes TEXT,
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS user_id UUID;

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Anyone authenticated can view fornecedores"
  ON public.fornecedores
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins and gestores can manage fornecedores"
  ON public.fornecedores
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gestor')
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- fornecedor_entregas table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'fornecedor_entregas'
  ) THEN
    CREATE TABLE public.fornecedor_entregas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE CASCADE,
      obra_id TEXT NOT NULL,
      material TEXT NOT NULL,
      quantidade DECIMAL NOT NULL,
      unidade TEXT NOT NULL,
      valor_total DECIMAL NOT NULL,
      data_pedido DATE NOT NULL,
      data_entrega_prevista DATE,
      data_entrega_real DATE,
      status TEXT DEFAULT 'pendente',
      observacoes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

ALTER TABLE public.fornecedor_entregas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can view entregas"
  ON public.fornecedor_entregas
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins, gestores and engenheiros can manage entregas"
  ON public.fornecedor_entregas
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'engenheiro')
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- obra_comentarios table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'obra_comentarios'
  ) THEN
    CREATE TABLE public.obra_comentarios (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      obra_id TEXT NOT NULL,
      user_id UUID NOT NULL,
      tipo TEXT DEFAULT 'comentario',
      conteudo TEXT,
      foto_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

ALTER TABLE public.obra_comentarios ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can view comentarios"
  ON public.obra_comentarios
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can insert comentarios"
  ON public.obra_comentarios
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- obra_insumos table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename = 'obra_insumos'
  ) THEN
    CREATE TABLE public.obra_insumos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      obra_id TEXT NOT NULL,
      material TEXT NOT NULL,
      quantidade_total DECIMAL NOT NULL,
      quantidade_usada DECIMAL DEFAULT 0,
      unidade TEXT NOT NULL,
      valor_unitario DECIMAL,
      fornecedor_id UUID REFERENCES public.fornecedores(id),
      data_entrada DATE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
    );
  END IF;
END
$$;

ALTER TABLE public.obra_insumos
  ADD COLUMN IF NOT EXISTS fornecedor_id UUID REFERENCES public.fornecedores(id),
  ADD COLUMN IF NOT EXISTS data_entrada DATE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ADD COLUMN IF NOT EXISTS material TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS quantidade_total DECIMAL NOT NULL,
  ADD COLUMN IF NOT EXISTS quantidade_usada DECIMAL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS unidade TEXT NOT NULL,
  ADD COLUMN IF NOT EXISTS valor_unitario DECIMAL,
  ADD COLUMN IF NOT EXISTS obra_id TEXT NOT NULL;

ALTER TABLE public.obra_insumos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  CREATE POLICY "Authenticated users can view insumos"
  ON public.obra_insumos
  FOR SELECT
  TO authenticated
  USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE POLICY "Admins, engenheiros and responsaveis can manage insumos"
  ON public.obra_insumos
  FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'engenheiro') OR
    public.has_role(auth.uid(), 'responsavel_obra')
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  CREATE TRIGGER update_fornecedores_updated_at
    BEFORE UPDATE ON public.fornecedores
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;

DO $$
BEGIN
  CREATE TRIGGER update_obra_insumos_updated_at
    BEFORE UPDATE ON public.obra_insumos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN duplicate_object THEN NULL;
END
$$;
