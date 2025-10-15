-- Criar enums apenas se não existirem
DO $$ BEGIN
  CREATE TYPE public.obra_status AS ENUM ('planejada', 'em_andamento', 'concluida', 'atrasada');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.lancamento_tipo AS ENUM ('despesa', 'receita');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.membro_status AS ENUM ('ativo', 'inativo', 'ferias');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE public.entrega_status AS ENUM ('pendente', 'em_transito', 'entregue', 'cancelado');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Tabela de perfis de usuário (se não existir)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Obras
CREATE TABLE IF NOT EXISTS public.obras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT,
  status obra_status DEFAULT 'planejada',
  responsavel TEXT,
  prazo DATE,
  progresso NUMERIC DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  custo_previsto NUMERIC DEFAULT 0,
  custo_real NUMERIC DEFAULT 0,
  descricao TEXT,
  data_inicio DATE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_obra TEXT NOT NULL,
  tipo_obra TEXT NOT NULL,
  area NUMERIC NOT NULL,
  localizacao TEXT,
  status TEXT DEFAULT 'em_elaboracao',
  responsavel_tecnico TEXT,
  data_emissao DATE DEFAULT CURRENT_DATE,
  custo_por_m2 NUMERIC DEFAULT 0,
  encargos NUMERIC DEFAULT 0,
  margem_administrativa NUMERIC DEFAULT 0,
  margem_contingencia NUMERIC DEFAULT 0,
  margem_lucro NUMERIC DEFAULT 0,
  impostos NUMERIC DEFAULT 0,
  custo_base NUMERIC DEFAULT 0,
  custo_materiais NUMERIC DEFAULT 0,
  custo_mao_obra NUMERIC DEFAULT 0,
  custo_transporte NUMERIC DEFAULT 0,
  custo_extras NUMERIC DEFAULT 0,
  subtotal NUMERIC DEFAULT 0,
  custo_total NUMERIC DEFAULT 0,
  observacoes_tecnicas TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Insumos do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_insumos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
  material TEXT NOT NULL,
  unidade TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  preco_unitario NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Mão de Obra do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_mao_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
  funcao TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  horas_previstas NUMERIC NOT NULL,
  valor_hora NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Transporte do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_transporte (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL,
  quantidade NUMERIC NOT NULL,
  custo_unitario NUMERIC NOT NULL,
  total NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Despesas Extras do Orçamento
CREATE TABLE IF NOT EXISTS public.orcamento_despesas_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id TEXT,
  obra_nome TEXT,
  tipo lancamento_tipo NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data DATE NOT NULL,
  etapa TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Membros da Equipe
CREATE TABLE IF NOT EXISTS public.equipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  funcao TEXT NOT NULL,
  valor_hora NUMERIC NOT NULL,
  telefone TEXT,
  email TEXT,
  obra_atual TEXT,
  status membro_status DEFAULT 'ativo',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.obra_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_mao_obra ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_transporte ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_despesas_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor_entregas ENABLE ROW LEVEL SECURITY;

-- ========================
-- RLS POLICIES - PROFILES
-- ========================
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- ========================
-- RLS POLICIES - OBRAS
-- ========================
DROP POLICY IF EXISTS "Authenticated users can view obras" ON public.obras;
CREATE POLICY "Authenticated users can view obras"
  ON public.obras FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can insert obras" ON public.obras;
CREATE POLICY "Admins, engenheiros and gestores can insert obras"
  ON public.obras FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can update obras" ON public.obras;
CREATE POLICY "Admins, engenheiros and gestores can update obras"
  ON public.obras FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can delete obras" ON public.obras;
CREATE POLICY "Admins, engenheiros and gestores can delete obras"
  ON public.obras FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

-- ========================
-- RLS POLICIES - ORCAMENTOS
-- ========================
DROP POLICY IF EXISTS "Authenticated users can view orcamentos" ON public.orcamentos;
CREATE POLICY "Authenticated users can view orcamentos"
  ON public.orcamentos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can insert orcamentos" ON public.orcamentos;
CREATE POLICY "Admins, engenheiros and gestores can insert orcamentos"
  ON public.orcamentos FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can update orcamentos" ON public.orcamentos;
CREATE POLICY "Admins, engenheiros and gestores can update orcamentos"
  ON public.orcamentos FOR UPDATE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

DROP POLICY IF EXISTS "Admins, engenheiros and gestores can delete orcamentos" ON public.orcamentos;
CREATE POLICY "Admins, engenheiros and gestores can delete orcamentos"
  ON public.orcamentos FOR DELETE
  USING (
    has_role(auth.uid(), 'admin') OR 
    has_role(auth.uid(), 'engenheiro') OR 
    has_role(auth.uid(), 'gestor')
  );

-- ========================
-- RLS POLICIES - ORCAMENTO RELACIONADOS
-- ========================
DROP POLICY IF EXISTS "Anyone authenticated can view orcamento_insumos" ON public.orcamento_insumos;
CREATE POLICY "Anyone authenticated can view orcamento_insumos"
  ON public.orcamento_insumos FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage orcamento_insumos" ON public.orcamento_insumos;
CREATE POLICY "Admins and gestores can manage orcamento_insumos"
  ON public.orcamento_insumos FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'engenheiro'));

DROP POLICY IF EXISTS "Anyone authenticated can view orcamento_mao_obra" ON public.orcamento_mao_obra;
CREATE POLICY "Anyone authenticated can view orcamento_mao_obra"
  ON public.orcamento_mao_obra FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage orcamento_mao_obra" ON public.orcamento_mao_obra;
CREATE POLICY "Admins and gestores can manage orcamento_mao_obra"
  ON public.orcamento_mao_obra FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'engenheiro'));

DROP POLICY IF EXISTS "Anyone authenticated can view orcamento_transporte" ON public.orcamento_transporte;
CREATE POLICY "Anyone authenticated can view orcamento_transporte"
  ON public.orcamento_transporte FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage orcamento_transporte" ON public.orcamento_transporte;
CREATE POLICY "Admins and gestores can manage orcamento_transporte"
  ON public.orcamento_transporte FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'engenheiro'));

DROP POLICY IF EXISTS "Anyone authenticated can view orcamento_despesas_extras" ON public.orcamento_despesas_extras;
CREATE POLICY "Anyone authenticated can view orcamento_despesas_extras"
  ON public.orcamento_despesas_extras FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage orcamento_despesas_extras" ON public.orcamento_despesas_extras;
CREATE POLICY "Admins and gestores can manage orcamento_despesas_extras"
  ON public.orcamento_despesas_extras FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor') OR has_role(auth.uid(), 'engenheiro'));

-- ========================
-- RLS POLICIES - LANCAMENTOS_FINANCEIROS
-- ========================
DROP POLICY IF EXISTS "Authenticated users can view lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Authenticated users can view lancamentos"
  ON public.lancamentos_financeiros FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Admins and gestores can manage lancamentos"
  ON public.lancamentos_financeiros FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- ========================
-- RLS POLICIES - EQUIPES
-- ========================
DROP POLICY IF EXISTS "Authenticated users can view equipes" ON public.equipes;
CREATE POLICY "Authenticated users can view equipes"
  ON public.equipes FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins and gestores can manage equipes" ON public.equipes;
CREATE POLICY "Admins and gestores can manage equipes"
  ON public.equipes FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'gestor'));

-- ========================
-- TRIGGERS
-- ========================

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_obras_updated_at ON public.obras;
CREATE TRIGGER update_obras_updated_at BEFORE UPDATE ON public.obras
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_orcamentos_updated_at ON public.orcamentos;
CREATE TRIGGER update_orcamentos_updated_at BEFORE UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_lancamentos_updated_at ON public.lancamentos_financeiros;
CREATE TRIGGER update_lancamentos_updated_at BEFORE UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_equipes_updated_at ON public.equipes;
CREATE TRIGGER update_equipes_updated_at BEFORE UPDATE ON public.equipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_obra_insumos_updated_at ON public.obra_insumos;
CREATE TRIGGER update_obra_insumos_updated_at BEFORE UPDATE ON public.obra_insumos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar perfil automaticamente no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    NEW.email
  );
  
  -- Criar role padrão de usuário
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'usuario');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();