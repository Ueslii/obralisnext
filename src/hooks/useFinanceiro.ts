import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { endOfDay, startOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { useCompanyScope } from "./useCompanyScope";

export type Lancamento =
  Database["public"]["Tables"]["lancamentos"]["Row"] & {
    obras: { nome: string } | null;
    membros: { id: string; nome: string; funcao: string | null } | null;
  };

export type NewLancamento =
  Database["public"]["Tables"]["lancamentos"]["Insert"];

type DateRangeFilter = { from?: Date; to?: Date };

export const useFinanceiro = (dateRange?: DateRangeFilter) => {
  const queryClient = useQueryClient();
  const {
    memberUserIds,
    isLoading: isCompanyScopeLoading,
  } = useCompanyScope();

  const normalizedRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return { from: null as string | null, to: null as string | null };
    }

    return {
      from: startOfDay(dateRange.from).toISOString(),
      to: endOfDay(dateRange.to).toISOString(),
    };
  }, [dateRange]);

  const { data: lancamentos = [], isLoading } = useQuery<Lancamento[]>({
    queryKey: [
      "lancamentos",
      normalizedRange.from,
      normalizedRange.to,
      memberUserIds.join(","),
    ],
    enabled: memberUserIds.length > 0,
    queryFn: async () => {
      let query = supabase
        .from("lancamentos")
        .select(
          `
          *,
          obras (nome),
          membros (id, nome, funcao)
        `
        )
        .in("user_id", memberUserIds)
        .order("data", { ascending: false });

      if (normalizedRange.from && normalizedRange.to) {
        query = query
          .gte("data", normalizedRange.from)
          .lte("data", normalizedRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Lancamento[];
    },
  });

  const resumoFinanceiro = useMemo(() => {
    const totalDespesas = lancamentos
      .filter((lancamento) => lancamento.tipo === "despesa")
      .reduce((acc, lancamento) => acc + lancamento.valor, 0);

    const totalReceitas = lancamentos
      .filter((lancamento) => lancamento.tipo === "receita")
      .reduce((acc, lancamento) => acc + lancamento.valor, 0);

    const saldo = totalReceitas - totalDespesas;

    return { totalDespesas, totalReceitas, saldo };
  }, [lancamentos]);

  const despesasPorCategoria = useMemo(() => {
    const porCategoria = new Map<string, number>();

    lancamentos
      .filter((lancamento) => lancamento.tipo === "despesa")
      .forEach((lancamento) => {
        const categoria = lancamento.categoria ?? "Outros";
        const chave =
          categoria.charAt(0).toUpperCase() +
          categoria.slice(1).toLowerCase();

        porCategoria.set(
          chave,
          (porCategoria.get(chave) ?? 0) + lancamento.valor
        );
      });

    return Array.from(porCategoria.entries()).map(([category, value]) => ({
      category,
      value,
    }));
  }, [lancamentos]);

  const addLancamento = useMutation({
    mutationFn: async (lancamento: NewLancamento) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario nao autenticado");

      const { data, error } = await supabase
        .from("lancamentos")
        .insert([
          {
            ...lancamento,
            membro_id: lancamento.membro_id ?? null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lancamento adicionado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao adicionar lancamento");
    },
  });

  const updateLancamento = useMutation({
    mutationFn: async ({
      id,
      membro_id,
      ...dados
    }: Partial<NewLancamento> & { id: string }) => {
      const payload: Record<string, any> = { ...dados };
      if (membro_id !== undefined) {
        payload.membro_id = membro_id ?? null;
      }

      const { data, error } = await supabase
        .from("lancamentos")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lancamentos"] });
      toast.success("Lancamento atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar lancamento");
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
      toast.success("Lancamento deletado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao deletar lancamento");
    },
  });

  return {
    lancamentos,
    isLoading: isLoading || isCompanyScopeLoading,
    resumoFinanceiro,
    despesasPorCategoria,
    addLancamento: addLancamento.mutateAsync,
    addLancamentoPending: addLancamento.isPending,
    updateLancamento: updateLancamento.mutateAsync,
    updateLancamentoPending: updateLancamento.isPending,
    deleteLancamento: deleteLancamento.mutateAsync,
    deleteLancamentoPending: deleteLancamento.isPending,
  };
};
