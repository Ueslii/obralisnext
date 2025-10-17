import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

// Tipos baseados no Supabase, mas exportados para uso na UI
export type Membro = Database["public"]["Tables"]["membros"]["Row"];
export type NewMembro = Database["public"]["Tables"]["membros"]["Insert"];

export const useEquipes = () => {
  const queryClient = useQueryClient();

  // Query para listar membros
  const { data: membros = [], isLoading } = useQuery<Membro[]>({
    queryKey: ["membros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("membros")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Membro[];
    },
  });

  // Mutation para adicionar membro
  const addMembro = useMutation({
    mutationFn: async (membro: NewMembro) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("membros")
        .insert([{ ...membro, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Membro;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membros"] });
      toast.success("Membro adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar membro");
    },
  });

  // Mutation para atualizar membro
  const updateMembro = useMutation({
    mutationFn: async ({ id, ...dados }: Partial<Membro> & { id: string }) => {
      const { data, error } = await supabase
        .from("membros")
        .update(dados)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Membro;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membros"] });
      toast.success("Membro atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar membro");
    },
  });

  // Mutation para deletar membro
  const deleteMembro = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("membros").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["membros"] });
      toast.success("Membro deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar membro");
    },
  });

  // Lógica de cálculo portada para o novo hook
  const calcularFolhaPagamento = () => {
    return membros
      .filter((m) => m.status === "ativo")
      .reduce((total, m) => total + (m.valor_hora ?? 0) * 160, 0); // Assumindo 160h/mês
  };

  return {
    membros,
    isLoading,
    addMembro: addMembro.mutate,
    updateMembro: updateMembro.mutate,
    deleteMembro: deleteMembro.mutate,
    calcularFolhaPagamento,
  };
};
