-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'engenheiro', 'gestor', 'responsavel_obra');

-- Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função de segurança para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
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

-- Políticas RLS
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de fornecedores
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

ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view fornecedores"
ON public.fornecedores
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and gestores can manage fornecedores"
ON public.fornecedores
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor')
);

-- Tabela de entregas de fornecedores
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

ALTER TABLE public.fornecedor_entregas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view entregas"
ON public.fornecedor_entregas
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins, gestores and engenheiros can manage entregas"
ON public.fornecedor_entregas
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'gestor') OR
  public.has_role(auth.uid(), 'engenheiro')
);

-- Tabela de comentários e fotos das obras
CREATE TABLE public.obra_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  obra_id TEXT NOT NULL,
  user_id UUID NOT NULL,
  tipo TEXT DEFAULT 'comentario',
  conteudo TEXT,
  foto_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.obra_comentarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view comentarios"
ON public.obra_comentarios
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert comentarios"
ON public.obra_comentarios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tabela de insumos por obra
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

ALTER TABLE public.obra_insumos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view insumos"
ON public.obra_insumos
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins, engenheiros and responsaveis can manage insumos"
ON public.obra_insumos
FOR ALL
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'engenheiro') OR
  public.has_role(auth.uid(), 'responsavel_obra')
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_fornecedores_updated_at
  BEFORE UPDATE ON public.fornecedores
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_obra_insumos_updated_at
  BEFORE UPDATE ON public.obra_insumos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();