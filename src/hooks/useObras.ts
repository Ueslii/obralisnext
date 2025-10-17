import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

// CORREÇÃO DEFINITIVA:
// Pegamos o tipo 'obras' gerado, removemos o campo 'status' que está incorreto (string),
// e o adicionamos de volta com o tipo enum correto.
export type Obra = Omit<Tables<"obras">, "status"> & {
  status: "planejada" | "em_andamento" | "concluida" | "atrasada";
};

// Criando o tipo 'NewObra' a partir do tipo base 'Obra' corrigido.
export type NewObra = Omit<
  Obra,
  "id" | "created_at" | "updated_at" | "user_id"
>;

export const useObras = () => {
  const queryClient = useQueryClient();

  // Query para listar obras
  const { data: obras = [], isLoading } = useQuery<Obra[]>({
    queryKey: ["obras"],
    queryFn: async (): Promise<Obra[]> => {
      const { data, error } = await supabase
        .from("obras")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Obra[];
    },
  });

  // Mutation para adicionar obra
  const addObra = useMutation({
    mutationFn: async (obra: NewObra) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("obras")
        .insert([{ ...obra, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Obra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Obra adicionada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao adicionar obra:", error);
      toast.error(error.message || "Erro ao adicionar obra");
    },
  });

  // Mutation para atualizar obra
  const updateObra = useMutation({
    mutationFn: async (dados: Partial<Obra> & { id: string }) => {
      const { data, error } = await supabase
        .from("obras")
        .update(dados)
        .eq("id", dados.id)
        .select()
        .single();

      if (error) throw error;
      return data as Obra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Obra atualizada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar obra:", error);
      toast.error(error.message || "Erro ao atualizar obra");
    },
  });

  // Mutation para deletar obra
  const deleteObra = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("obras").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Obra deletada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao deletar obra:", error);
      toast.error(error.message || "Erro ao deletar obra");
    },
  });

  return {
    obras,
    isLoading,
    addObra: addObra.mutate,
    updateObra: updateObra.mutate,
    deleteObra: deleteObra.mutate,
  };
};
