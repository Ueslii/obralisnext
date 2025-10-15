export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      equipes: {
        Row: {
          created_at: string | null
          email: string | null
          funcao: string
          id: string
          nome: string
          obra_atual: string | null
          status: Database["public"]["Enums"]["membro_status"] | null
          telefone: string | null
          updated_at: string | null
          user_id: string
          valor_hora: number
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          funcao: string
          id?: string
          nome: string
          obra_atual?: string | null
          status?: Database["public"]["Enums"]["membro_status"] | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
          valor_hora: number
        }
        Update: {
          created_at?: string | null
          email?: string | null
          funcao?: string
          id?: string
          nome?: string
          obra_atual?: string | null
          status?: Database["public"]["Enums"]["membro_status"] | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
          valor_hora?: number
        }
        Relationships: []
      }
      fornecedor_entregas: {
        Row: {
          created_at: string | null
          data_entrega_prevista: string | null
          data_entrega_real: string | null
          data_pedido: string
          fornecedor_id: string | null
          id: string
          material: string
          obra_id: string
          observacoes: string | null
          quantidade: number
          status: string | null
          unidade: string
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido: string
          fornecedor_id?: string | null
          id?: string
          material: string
          obra_id: string
          observacoes?: string | null
          quantidade: number
          status?: string | null
          unidade: string
          valor_total: number
        }
        Update: {
          created_at?: string | null
          data_entrega_prevista?: string | null
          data_entrega_real?: string | null
          data_pedido?: string
          fornecedor_id?: string | null
          id?: string
          material?: string
          obra_id?: string
          observacoes?: string | null
          quantidade?: number
          status?: string | null
          unidade?: string
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "fornecedor_entregas_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedores: {
        Row: {
          ativo: boolean | null
          cnpj: string | null
          contato: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          prazo_medio_dias: number | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cnpj?: string | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          prazo_medio_dias?: number | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cnpj?: string | null
          contato?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          prazo_medio_dias?: number | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      lancamentos_financeiros: {
        Row: {
          categoria: string
          created_at: string | null
          data: string
          descricao: string
          etapa: string | null
          id: string
          obra_id: string | null
          obra_nome: string | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at: string | null
          user_id: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data: string
          descricao: string
          etapa?: string | null
          id?: string
          obra_id?: string | null
          obra_nome?: string | null
          tipo: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at?: string | null
          user_id: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data?: string
          descricao?: string
          etapa?: string | null
          id?: string
          obra_id?: string | null
          obra_nome?: string | null
          tipo?: Database["public"]["Enums"]["lancamento_tipo"]
          updated_at?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      obra_comentarios: {
        Row: {
          conteudo: string | null
          created_at: string | null
          foto_url: string | null
          id: string
          obra_id: string
          tipo: string | null
          user_id: string
        }
        Insert: {
          conteudo?: string | null
          created_at?: string | null
          foto_url?: string | null
          id?: string
          obra_id: string
          tipo?: string | null
          user_id: string
        }
        Update: {
          conteudo?: string | null
          created_at?: string | null
          foto_url?: string | null
          id?: string
          obra_id?: string
          tipo?: string | null
          user_id?: string
        }
        Relationships: []
      }
      obra_insumos: {
        Row: {
          data_entrada: string | null
          fornecedor_id: string | null
          id: string
          material: string
          obra_id: string
          quantidade_total: number
          quantidade_usada: number | null
          unidade: string
          updated_at: string | null
          valor_unitario: number | null
        }
        Insert: {
          data_entrada?: string | null
          fornecedor_id?: string | null
          id?: string
          material: string
          obra_id: string
          quantidade_total: number
          quantidade_usada?: number | null
          unidade: string
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Update: {
          data_entrada?: string | null
          fornecedor_id?: string | null
          id?: string
          material?: string
          obra_id?: string
          quantidade_total?: number
          quantidade_usada?: number | null
          unidade?: string
          updated_at?: string | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "obra_insumos_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedores"
            referencedColumns: ["id"]
          },
        ]
      }
      obras: {
        Row: {
          created_at: string | null
          custo_previsto: number | null
          custo_real: number | null
          data_inicio: string | null
          descricao: string | null
          endereco: string | null
          id: string
          nome: string
          prazo: string | null
          progresso: number | null
          responsavel: string | null
          status: Database["public"]["Enums"]["obra_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custo_previsto?: number | null
          custo_real?: number | null
          data_inicio?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          nome: string
          prazo?: string | null
          progresso?: number | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["obra_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          custo_previsto?: number | null
          custo_real?: number | null
          data_inicio?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          prazo?: string | null
          progresso?: number | null
          responsavel?: string | null
          status?: Database["public"]["Enums"]["obra_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      orcamento_despesas_extras: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          orcamento_id: string
          valor: number
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          orcamento_id: string
          valor: number
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          orcamento_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_despesas_extras_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_insumos: {
        Row: {
          created_at: string | null
          id: string
          material: string
          orcamento_id: string
          preco_unitario: number
          quantidade: number
          total: number
          unidade: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material: string
          orcamento_id: string
          preco_unitario: number
          quantidade: number
          total: number
          unidade: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material?: string
          orcamento_id?: string
          preco_unitario?: number
          quantidade?: number
          total?: number
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_insumos_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_mao_obra: {
        Row: {
          created_at: string | null
          funcao: string
          horas_previstas: number
          id: string
          orcamento_id: string
          quantidade: number
          total: number
          valor_hora: number
        }
        Insert: {
          created_at?: string | null
          funcao: string
          horas_previstas: number
          id?: string
          orcamento_id: string
          quantidade: number
          total: number
          valor_hora: number
        }
        Update: {
          created_at?: string | null
          funcao?: string
          horas_previstas?: number
          id?: string
          orcamento_id?: string
          quantidade?: number
          total?: number
          valor_hora?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_mao_obra_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamento_transporte: {
        Row: {
          created_at: string | null
          custo_unitario: number
          id: string
          orcamento_id: string
          quantidade: number
          tipo: string
          total: number
        }
        Insert: {
          created_at?: string | null
          custo_unitario: number
          id?: string
          orcamento_id: string
          quantidade: number
          tipo: string
          total: number
        }
        Update: {
          created_at?: string | null
          custo_unitario?: number
          id?: string
          orcamento_id?: string
          quantidade?: number
          tipo?: string
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamento_transporte_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      orcamentos: {
        Row: {
          area: number
          created_at: string | null
          custo_base: number | null
          custo_extras: number | null
          custo_mao_obra: number | null
          custo_materiais: number | null
          custo_por_m2: number | null
          custo_total: number | null
          custo_transporte: number | null
          data_emissao: string | null
          encargos: number | null
          id: string
          impostos: number | null
          localizacao: string | null
          margem_administrativa: number | null
          margem_contingencia: number | null
          margem_lucro: number | null
          nome_obra: string
          observacoes_tecnicas: string | null
          responsavel_tecnico: string | null
          status: string | null
          subtotal: number | null
          tipo_obra: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          area: number
          created_at?: string | null
          custo_base?: number | null
          custo_extras?: number | null
          custo_mao_obra?: number | null
          custo_materiais?: number | null
          custo_por_m2?: number | null
          custo_total?: number | null
          custo_transporte?: number | null
          data_emissao?: string | null
          encargos?: number | null
          id?: string
          impostos?: number | null
          localizacao?: string | null
          margem_administrativa?: number | null
          margem_contingencia?: number | null
          margem_lucro?: number | null
          nome_obra: string
          observacoes_tecnicas?: string | null
          responsavel_tecnico?: string | null
          status?: string | null
          subtotal?: number | null
          tipo_obra: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          area?: number
          created_at?: string | null
          custo_base?: number | null
          custo_extras?: number | null
          custo_mao_obra?: number | null
          custo_materiais?: number | null
          custo_por_m2?: number | null
          custo_total?: number | null
          custo_transporte?: number | null
          data_emissao?: string | null
          encargos?: number | null
          id?: string
          impostos?: number | null
          localizacao?: string | null
          margem_administrativa?: number | null
          margem_contingencia?: number | null
          margem_lucro?: number | null
          nome_obra?: string
          observacoes_tecnicas?: string | null
          responsavel_tecnico?: string | null
          status?: string | null
          subtotal?: number | null
          tipo_obra?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          id: string
          nome: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          nome?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "engenheiro" | "gestor" | "responsavel_obra"
      entrega_status: "pendente" | "em_transito" | "entregue" | "cancelado"
      lancamento_tipo: "despesa" | "receita"
      membro_status: "ativo" | "inativo" | "ferias"
      obra_status: "planejada" | "em_andamento" | "concluida" | "atrasada"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "engenheiro", "gestor", "responsavel_obra"],
      entrega_status: ["pendente", "em_transito", "entregue", "cancelado"],
      lancamento_tipo: ["despesa", "receita"],
      membro_status: ["ativo", "inativo", "ferias"],
      obra_status: ["planejada", "em_andamento", "concluida", "atrasada"],
    },
  },
} as const
