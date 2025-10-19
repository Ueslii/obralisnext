import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FornecedorFormData {
  nome: string;
  cnpj?: string;
  categoria?: string;
  contato?: string;
  telefone?: string;
  email?: string;
  prazoMedio?: number | null;
  avaliacaoQualidade?: number | null;
}

export interface Fornecedor extends FornecedorFormData {
  id: string;
  createdAt?: string;
  prazoMedio?: number | null;
  avaliacaoQualidade?: number | null;
  totalEntregas: number;
  totalPago: number;
}

export interface Entrega {
  id: string;
  fornecedorId: string | null;
  obraId: string | null;
  nomeObra?: string | null;
  material?: string | null;
  quantidade?: number | null;
  unidade?: string | null;
  valorTotal?: number | null;
  status?: string | null;
  dataEntrega?: string | null;
  prazoEntrega?: number | null;
}

const calculatePrazoEntrega = (
  pedido?: string | null,
  prevista?: string | null,
  real?: string | null
) => {
  const start = pedido ?? prevista;
  const end = real ?? prevista;

  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.valueOf()) || Number.isNaN(endDate.valueOf())) {
    return null;
  }

  return Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  );
};

const mapEntregaRow = (row: Record<string, any>): Entrega => {
  const valorTotal = row.valor_total ?? row.valorTotal;
  const pedido = row.data_pedido ?? row.dataPedido;
  const prevista = row.data_entrega_prevista ?? row.dataEntrega ?? null;
  const real = row.data_entrega_real ?? null;

  return {
    id: row.id,
    fornecedorId: row.fornecedor_id ?? row.fornecedorId ?? null,
    obraId: row.obra_id ?? row.obraId ?? null,
    nomeObra: row.obras?.nome ?? row.nome_obra ?? row.nomeObra ?? null,
    material: row.material ?? null,
    quantidade: row.quantidade ?? null,
    unidade: row.unidade ?? null,
    valorTotal: typeof valorTotal === "number" ? valorTotal : Number(valorTotal ?? 0),
    status: row.status ?? null,
    dataEntrega: row.data_entrega_prevista ?? row.data_entrega ?? row.dataEntrega ?? null,
    prazoEntrega: calculatePrazoEntrega(pedido, prevista, real),
  };
};

const fetchEntregas = async (): Promise<Entrega[]> => {
  const tryFornecedorEntregas = await supabase
    .from("fornecedor_entregas")
    .select("*, obras (nome)")
    .order("created_at", { ascending: false });

  if (tryFornecedorEntregas.error) {
    if (tryFornecedorEntregas.error.code !== "42P01") {
      throw tryFornecedorEntregas.error;
    }

    const fallback = await supabase
      .from("entregas")
      .select("*, obras (nome)")
      .order("created_at", { ascending: false });

    if (fallback.error) {
      throw fallback.error;
    }

    return (fallback.data ?? []).map((row) => mapEntregaRow(row as Record<string, any>));
  }

  return (tryFornecedorEntregas.data ?? []).map((row) =>
    mapEntregaRow(row as Record<string, any>)
  );
};

const buildFornecedorPayload = (dados: FornecedorFormData) => {
  const payload: Record<string, any> = {
    nome: dados.nome,
    cnpj: dados.cnpj ?? null,
    categoria: dados.categoria ?? null,
    contato: dados.contato ?? null,
    telefone: dados.telefone ?? null,
    email: dados.email ?? null,
  };

  if (dados.prazoMedio !== undefined) {
    payload.prazo_medio_dias = dados.prazoMedio;
  }

  if (dados.avaliacaoQualidade !== undefined) {
    payload.avaliacao_qualidade = dados.avaliacaoQualidade;
  }

  return payload;
};

export const useFornecedores = () => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["fornecedores"],
    queryFn: async () => {
      const [fornecedoresResposta, entregas] = await Promise.all([
        supabase.from("fornecedores").select("*").order("created_at", { ascending: false }),
        fetchEntregas(),
      ]);

      if (fornecedoresResposta.error) {
        throw fornecedoresResposta.error;
      }

      return {
        fornecedores: fornecedoresResposta.data ?? [],
        entregas,
      };
    },
  });

  const fornecedores = useMemo<Fornecedor[]>(() => {
    const base = data?.fornecedores ?? [];
    const entregas = data?.entregas ?? [];

    return base.map((row: Record<string, any>) => {
      const relacionadas = entregas.filter((entrega) => entrega.fornecedorId === row.id);
      const totalPago = relacionadas.reduce(
        (acc, entrega) => acc + (entrega.valorTotal ?? 0),
        0
      );

      return {
        id: row.id,
        nome: row.nome,
        cnpj: row.cnpj ?? null,
        categoria: row.categoria ?? null,
        contato: row.contato ?? null,
        telefone: row.telefone ?? null,
        email: row.email ?? null,
        createdAt: row.created_at,
        prazoMedio: row.prazo_medio_dias ?? row.prazoMedio ?? null,
        avaliacaoQualidade: row.avaliacao_qualidade ?? row.avaliacaoQualidade ?? null,
        totalEntregas: relacionadas.length,
        totalPago,
      } satisfies Fornecedor;
    });
  }, [data]);

  const entregas = useMemo(() => data?.entregas ?? [], [data]);

  const addFornecedorMutation = useMutation({
    mutationFn: async (dados: FornecedorFormData) => {
      const payload = buildFornecedorPayload(dados);
      const tentativa = await supabase.from("fornecedores").insert([payload]);

      if (tentativa.error?.code === "42703") {
        delete payload.prazo_medio_dias;
        delete payload.avaliacao_qualidade;
        const fallback = await supabase.from("fornecedores").insert([payload]);
        if (fallback.error) throw fallback.error;
        return;
      }

      if (tentativa.error) {
        throw tentativa.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor cadastrado com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar fornecedor:", error);
      toast.error(error?.message ?? "Não foi possível cadastrar o fornecedor");
    },
  });

  const updateFornecedorMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: FornecedorFormData }) => {
      const payload = buildFornecedorPayload(dados);
      const tentativa = await supabase
        .from("fornecedores")
        .update(payload)
        .eq("id", id);

      if (tentativa.error?.code === "42703") {
        delete payload.prazo_medio_dias;
        delete payload.avaliacao_qualidade;
        const fallback = await supabase
          .from("fornecedores")
          .update(payload)
          .eq("id", id);
        if (fallback.error) throw fallback.error;
        return;
      }

      if (tentativa.error) {
        throw tentativa.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor atualizado");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar fornecedor:", error);
      toast.error(error?.message ?? "Não foi possível atualizar o fornecedor");
    },
  });

  const deleteFornecedorMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fornecedores").delete().eq("id", id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Fornecedor excluído");
    },
    onError: (error: any) => {
      console.error("Erro ao excluir fornecedor:", error);
      toast.error(error?.message ?? "Não foi possível excluir o fornecedor");
    },
  });

  const addEntregaMutation = useMutation({
    mutationFn: async (dados: Omit<Entrega, "id" | "nomeObra">) => {
      const payload: Record<string, any> = {
        fornecedor_id: dados.fornecedorId,
        obra_id: dados.obraId,
        material: dados.material ?? null,
        quantidade: dados.quantidade ?? null,
        unidade: dados.unidade ?? null,
        valor_total: dados.valorTotal ?? null,
        status: dados.status ?? "pendente",
        data_entrega_prevista: dados.dataEntrega ?? null,
      };

      const tentativa = await supabase
        .from("fornecedor_entregas")
        .insert([payload])
        .select("id")
        .single();

      if (tentativa.error?.code === "42P01") {
        const fallbackPayload = {
          fornecedor_id: dados.fornecedorId,
          obra_id: dados.obraId,
          material: dados.material ?? null,
          quantidade: dados.quantidade ?? null,
          unidade: dados.unidade ?? null,
          valor_total: dados.valorTotal ?? null,
          status: dados.status ?? "pendente",
          data_entrega: dados.dataEntrega ?? null,
        };

        const fallback = await supabase
          .from("entregas")
          .insert([fallbackPayload])
          .select("id")
          .single();

        if (fallback.error) {
          throw fallback.error;
        }
        return fallback.data as Record<string, any>;
      }

      if (tentativa.error) {
        throw tentativa.error;
      }

      return tentativa.data as Record<string, any>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Entrega registrada");
    },
    onError: (error: any) => {
      console.error("Erro ao registrar entrega:", error);
      toast.error(error?.message ?? "Não foi possível registrar a entrega");
    },
  });

  const updateEntregaMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: Partial<Entrega> }) => {
      const tentativa = await supabase
        .from("fornecedor_entregas")
        .update({
          status: dados.status ?? null,
          valor_total: dados.valorTotal ?? null,
          quantidade: dados.quantidade ?? null,
          unidade: dados.unidade ?? null,
          data_entrega_real: dados.dataEntrega ?? null,
        })
        .eq("id", id);

      if (tentativa.error?.code === "42P01") {
        const fallback = await supabase
          .from("entregas")
          .update({
            status: dados.status ?? null,
            valor_total: dados.valorTotal ?? null,
            quantidade: dados.quantidade ?? null,
            unidade: dados.unidade ?? null,
            data_entrega: dados.dataEntrega ?? null,
          })
          .eq("id", id);

        if (fallback.error) throw fallback.error;
        return;
      }

      if (tentativa.error) {
        throw tentativa.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Entrega atualizada");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar entrega:", error);
      toast.error(error?.message ?? "Não foi possível atualizar a entrega");
    },
  });

  const deleteEntregaMutation = useMutation({
    mutationFn: async (id: string) => {
      const tentativa = await supabase
        .from("fornecedor_entregas")
        .delete()
        .eq("id", id);

      if (tentativa.error?.code === "42P01") {
        const fallback = await supabase.from("entregas").delete().eq("id", id);
        if (fallback.error) throw fallback.error;
        return;
      }

      if (tentativa.error) {
        throw tentativa.error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fornecedores"] });
      toast.success("Entrega removida");
    },
    onError: (error: any) => {
      console.error("Erro ao excluir entrega:", error);
      toast.error(error?.message ?? "Não foi possível excluir a entrega");
    },
  });

  return {
    fornecedores,
    entregas,
    isLoading,
    addFornecedor: addFornecedorMutation.mutateAsync,
    updateFornecedor: (id: string, dados: FornecedorFormData) =>
      updateFornecedorMutation.mutateAsync({ id, dados }),
    deleteFornecedor: deleteFornecedorMutation.mutateAsync,
    addEntrega: addEntregaMutation.mutateAsync,
    updateEntrega: (id: string, dados: Partial<Entrega>) =>
      updateEntregaMutation.mutateAsync({ id, dados }),
    deleteEntrega: deleteEntregaMutation.mutateAsync,
    getEntregasPorFornecedor: (fornecedorId: string) =>
      entregas.filter((entrega) => entrega.fornecedorId === fornecedorId),
  };
};
