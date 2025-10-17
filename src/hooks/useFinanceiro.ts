import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";
import { useMemo } from "react";

export type Lancamento = Database["public"]["Tables"]["lancamentos"]["Row"] & {
  obras: { nome: string } | null;
};
export type NewLancamento =
  Database["public"]["Tables"]["lancamentos"]["Insert"];

export const useFinanceiro = (dateRange?: { from?: Date; to?: Date }) => {
  const queryClient = useQueryClient();

  const { data: lancamentos = [], isLoading } = useQuery<Lancamento[]>({
    queryKey: ["lancamentos", dateRange], // <- inclui o filtro na key
    queryFn: async () => {
      let query = supabase
        .from("lancamentos")
        .select(
          `
          *,
          obras (nome)
        `
        )
        .order("data", { ascending: false });

      // aplica o filtro de datas se houver
      if (dateRange?.from && dateRange?.to) {
        query = query
          .gte("data", dateRange.from.toISOString())
          .lte("data", dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lancamento[];
    },
  });
  // Funções de cálculo restauradas usando useMemo para eficiência
  const resumoFinanceiro = useMemo(() => {
    const totalDespesas = lancamentos
      .filter((l) => l.tipo === "despesa")
      .reduce((acc, l) => acc + l.valor, 0);

    const totalReceitas = lancamentos
      .filter((l) => l.tipo === "receita")
      .reduce((acc, l) => acc + l.valor, 0);

    const saldo = totalReceitas - totalDespesas;

    return { totalDespesas, totalReceitas, saldo };
  }, [lancamentos]);

  const despesasPorCategoria = useMemo(() => {
    const porCategoria: { [key: string]: number } = {};
    lancamentos
      .filter((l) => l.tipo === "despesa")
      .forEach((l) => {
        const categoria = l.categoria ?? "outros";
        porCategoria[categoria] = (porCategoria[categoria] || 0) + l.valor;
      });

    return Object.entries(porCategoria).map(([name, despesas]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      Despesas: despesas,
    }));
  }, [lancamentos]);

  const addLancamento = useMutation({
    mutationFn: async (lancamento: NewLancamento) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("lancamentos")
        .insert([{ ...lancamento, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar lançamento");
    },
  });

  const updateLancamento = useMutation({
    mutationFn: async ({
      id,
      ...dados
    }: Partial<NewLancamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("lancamentos")
        .update(dados)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar lançamento");
    },
  });

  const deleteLancamento = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("lancamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lançamento deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar lançamento");
    },
  });

  return {
    lancamentos,
    isLoading,
    resumoFinanceiro, // Retornando o resumo
    despesasPorCategoria, // Retornando os dados para o gráfico
    addLancamento: addLancamento.mutate,
    updateLancamento: updateLancamento.mutate,
    deleteLancamento: deleteLancamento.mutate,
  };
};
