export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      alertas: {
        Row: {
          created_at: string;
          descricao: string | null;
          id: string;
          lido: boolean | null;
          obra_id: string | null;
          severidade: string | null;
          titulo: string;
          tipo: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          descricao?: string | null;
          id?: string;
          lido?: boolean | null;
          obra_id?: string | null;
          severidade?: string | null;
          titulo: string;
          tipo?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          descricao?: string | null;
          id?: string;
          lido?: boolean | null;
          obra_id?: string | null;
          severidade?: string | null;
          titulo?: string;
          tipo?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alertas_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alertas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      construtora_convites: {
        Row: {
          cargo_sugerido: string | null;
          construtora_id: string;
          created_at: string;
          created_by: string;
          email: string;
          expires_at: string;
          id: string;
          invited_by: string | null;
          responded_at: string | null;
          status: Database["public"]["Enums"]["convite_status"];
          token: string;
        };
        Insert: {
          cargo_sugerido?: string | null;
          construtora_id: string;
          created_at?: string;
          created_by: string;
          email: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["convite_status"];
          token?: string;
        };
        Update: {
          cargo_sugerido?: string | null;
          construtora_id?: string;
          created_at?: string;
          created_by?: string;
          email?: string;
          expires_at?: string;
          id?: string;
          invited_by?: string | null;
          responded_at?: string | null;
          status?: Database["public"]["Enums"]["convite_status"];
          token?: string;
        };
        Relationships: [
          {
            foreignKeyName: "construtora_convites_construtora_id_fkey";
            columns: ["construtora_id"];
            isOneToOne: false;
            referencedRelation: "construtoras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtora_convites_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtora_convites_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      construtora_membros: {
        Row: {
          accepted_at: string | null;
          cargo: string | null;
          construtora_id: string;
          created_at: string;
          created_by: string;
          id: string;
          invited_by: string | null;
          role: string;
          user_id: string;
        };
        Insert: {
          accepted_at?: string | null;
          cargo?: string | null;
          construtora_id: string;
          created_at?: string;
          created_by: string;
          id?: string;
          invited_by?: string | null;
          role?: string;
          user_id: string;
        };
        Update: {
          accepted_at?: string | null;
          cargo?: string | null;
          construtora_id?: string;
          created_at?: string;
          created_by?: string;
          id?: string;
          invited_by?: string | null;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "construtora_membros_construtora_id_fkey";
            columns: ["construtora_id"];
            isOneToOne: false;
            referencedRelation: "construtoras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtora_membros_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtora_membros_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtora_membros_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      construtoras: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          identificador: string | null;
          metadata: Json | null;
          nome: string;
          owner_id: string;
          porte: string | null;
          segmento: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          identificador?: string | null;
          metadata?: Json | null;
          nome: string;
          owner_id: string;
          porte?: string | null;
          segmento?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          identificador?: string | null;
          metadata?: Json | null;
          nome?: string;
          owner_id?: string;
          porte?: string | null;
          segmento?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "construtoras_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "construtoras_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      entregas: {
        Row: {
          created_at: string;
          data_entrega: string | null;
          fornecedor_id: string | null;
          id: string;
          material: string | null;
          obra_id: string | null;
          quantidade: number | null;
          status: string | null;
          unidade: string | null;
          user_id: string | null;
          valor_total: number | null;
        };
        Insert: {
          created_at?: string;
          data_entrega?: string | null;
          fornecedor_id?: string | null;
          id?: string;
          material?: string | null;
          obra_id?: string | null;
          quantidade?: number | null;
          status?: string | null;
          unidade?: string | null;
          user_id?: string | null;
          valor_total?: number | null;
        };
        Update: {
          created_at?: string;
          data_entrega?: string | null;
          fornecedor_id?: string | null;
          id?: string;
          material?: string | null;
          obra_id?: string | null;
          quantidade?: number | null;
          status?: string | null;
          unidade?: string | null;
          user_id?: string | null;
          valor_total?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "entregas_fornecedor_id_fkey";
            columns: ["fornecedor_id"];
            isOneToOne: false;
            referencedRelation: "fornecedores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entregas_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "entregas_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      fornecedores: {
        Row: {
          categoria: string | null;
          cnpj: string | null;
          contato: string | null;
          created_at: string;
          email: string | null;
          id: string;
          nome: string;
          telefone: string | null;
          user_id: string | null;
        };
        Insert: {
          categoria?: string | null;
          cnpj?: string | null;
          contato?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          nome: string;
          telefone?: string | null;
          user_id?: string | null;
        };
        Update: {
          categoria?: string | null;
          cnpj?: string | null;
          contato?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          nome?: string;
          telefone?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fornecedores_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      lancamentos: {
        Row: {
          categoria: string;
          created_at: string;
          data: string;
          descricao: string;
          etapa: string | null;
          id: string;
          obra_id: string | null;
          membro_id: string | null;
          tipo: string;
          user_id: string | null;
          valor: number;
        };
        Insert: {
          categoria: string;
          created_at?: string;
          data: string;
          descricao: string;
          etapa?: string | null;
          id?: string;
          obra_id?: string | null;
          membro_id?: string | null;
          tipo: string;
          user_id?: string | null;
          valor: number;
        };
        Update: {
          categoria?: string;
          created_at?: string;
          data?: string;
          descricao?: string;
          etapa?: string | null;
          id?: string;
          obra_id?: string | null;
          membro_id?: string | null;
          tipo?: string;
          user_id?: string | null;
          valor?: number;
        };
        Relationships: [
          {
            foreignKeyName: "lancamentos_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lancamentos_membro_id_fkey";
            columns: ["membro_id"];
            isOneToOne: false;
            referencedRelation: "membros";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lancamentos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      membros: {
        Row: {
          created_at: string;
          email: string | null;
          funcao: string | null;
          id: string;
          nome: string;
          obra_atual: string | null;
          status: string | null;
          telefone: string | null;
          updated_at: string | null;
          user_id: string | null;
          valor_hora: number | null;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          funcao?: string | null;
          id?: string;
          nome: string;
          obra_atual?: string | null;
          status?: string | null;
          telefone?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          valor_hora?: number | null;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          funcao?: string | null;
          id?: string;
          nome?: string;
          obra_atual?: string | null;
          status?: string | null;
          telefone?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
          valor_hora?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "membros_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      obras: {
        Row: {
          created_at: string;
          custo_previsto: number | null;
          custo_real: number | null;
          data_inicio: string | null;
          descricao: string | null;
          endereco: string | null;
          id: string;
          nome: string;
          prazo: string | null;
          progresso: number | null;
          responsavel: string | null;
          status: string;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          custo_previsto?: number | null;
          custo_real?: number | null;
          data_inicio?: string | null;
          descricao?: string | null;
          endereco?: string | null;
          id?: string;
          nome: string;
          prazo?: string | null;
          progresso?: number | null;
          responsavel?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          custo_previsto?: number | null;
          custo_real?: number | null;
          data_inicio?: string | null;
          descricao?: string | null;
          endereco?: string | null;
          id?: string;
          nome?: string;
          prazo?: string | null;
          progresso?: number | null;
          responsavel?: string | null;
          status?: string;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "obras_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      obra_etapas: {
        Row: {
          created_at: string;
          custo_previsto: number | null;
          custo_real: number | null;
          data_fim: string | null;
          data_inicio: string | null;
          descricao: string | null;
          id: string;
          nome: string;
          obra_id: string;
          ordem: number | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          custo_previsto?: number | null;
          custo_real?: number | null;
          data_fim?: string | null;
          data_inicio?: string | null;
          descricao?: string | null;
          id?: string;
          nome: string;
          obra_id: string;
          ordem?: number | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          custo_previsto?: number | null;
          custo_real?: number | null;
          data_fim?: string | null;
          data_inicio?: string | null;
          descricao?: string | null;
          id?: string;
          nome?: string;
          obra_id?: string;
          ordem?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "obra_etapas_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          }
        ];
      };
      obra_insumos: {
        Row: {
          data_entrada: string | null;
          fornecedor_id: string | null;
          fornecedor_nome: string | null;
          id: string;
          material: string;
          obra_id: string;
          quantidade_total: number;
          quantidade_usada: number | null;
          unidade: string;
          updated_at: string | null;
          valor_unitario: number | null;
          etapa_id: string | null;
        };
        Insert: {
          data_entrada?: string | null;
          fornecedor_id?: string | null;
          fornecedor_nome?: string | null;
          id?: string;
          material: string;
          obra_id: string;
          quantidade_total: number;
          quantidade_usada?: number | null;
          unidade: string;
          updated_at?: string | null;
          valor_unitario?: number | null;
          etapa_id?: string | null;
        };
        Update: {
          data_entrada?: string | null;
          fornecedor_id?: string | null;
          fornecedor_nome?: string | null;
          id?: string;
          material?: string;
          obra_id?: string;
          quantidade_total?: number;
          quantidade_usada?: number | null;
          unidade?: string;
          updated_at?: string | null;
          valor_unitario?: number | null;
          etapa_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "obra_insumos_fornecedor_id_fkey";
            columns: ["fornecedor_id"];
            isOneToOne: false;
            referencedRelation: "fornecedores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "obra_insumos_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "obra_insumos_etapa_id_fkey";
            columns: ["etapa_id"];
            isOneToOne: false;
            referencedRelation: "obra_etapas";
            referencedColumns: ["id"];
          }
        ];
      };
      orcamentos: {
        Row: {
          created_at: string;
          dados: Json | null;
          id: string;
          nome_obra: string;
          obra_id: string | null;
          status: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          dados?: Json | null;
          id?: string;
          nome_obra: string;
          obra_id?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          dados?: Json | null;
          id?: string;
          nome_obra?: string;
          obra_id?: string | null;
          status?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "orcamentos_obra_id_fkey";
            columns: ["obra_id"];
            isOneToOne: false;
            referencedRelation: "obras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "orcamentos_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          nome: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          nome?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nome?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_roles: {
        Row: {
          id: number;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: number;
          user_id: string;
          role: string;
        };
        Update: {
          id?: number;
          user_id?: string;
          role?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      construtoras_public: {
        Row: {
          id: string;
          identificador: string | null;
          nome: string;
        };
        Insert: {
          id?: string;
          identificador?: string | null;
          nome?: string;
        };
        Update: {
          id?: string;
          identificador?: string | null;
          nome?: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      convite_status: "pending" | "accepted" | "declined" | "expired";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never;
