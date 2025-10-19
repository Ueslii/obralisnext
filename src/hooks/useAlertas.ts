import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyScope } from "./useCompanyScope";

export type AlertaSeveridade = "alta" | "media" | "baixa";

export interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  obraId: string | null;
  nomeObra?: string | null;
  severidade: AlertaSeveridade;
  data: string;
  lido: boolean;
  acao?: string | null;
}

export interface CreateAlertaInput {
  titulo: string;
  descricao?: string;
  tipo?: string;
  obraId?: string | null;
  severidade?: AlertaSeveridade;
  acao?: string | null;
}

const mapSeveridade = (value?: string | null): AlertaSeveridade => {
  if (value === "alta" || value === "media" || value === "baixa") {
    return value;
  }
  return "baixa";
};

const mapAlert = (
  row: Record<string, any>
): Alerta => {
  return {
    id: row.id,
    tipo: row.tipo ?? "info",
    titulo: row.titulo,
    descricao: row.descricao ?? "",
    obraId: row.obra_id ?? null,
    nomeObra: row.obras?.nome ?? null,
    severidade: mapSeveridade(row.severidade),
    data: row.created_at ?? new Date().toISOString(),
    lido: Boolean(row.lido),
    acao: row.acao ?? null,
  };
};

export const useAlertas = () => {
  const queryClient = useQueryClient();
  const {
    memberUserIds,
    isLoading: isCompanyScopeLoading,
  } = useCompanyScope();

  const { data: alertas = [], isLoading } = useQuery<Alerta[]>({
    queryKey: ["alertas", memberUserIds.join(",")],
    enabled: memberUserIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("alertas")
        .select("*, obras (nome)")
        .in("user_id", memberUserIds)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao carregar alertas:", error);
        throw error;
      }

      return (data ?? []).map(mapAlert);
    },
  });

  const addMutation = useMutation({
    mutationFn: async (payload: CreateAlertaInput) => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      const basePayload: Record<string, any> = {
        titulo: payload.titulo,
        descricao: payload.descricao ?? null,
        tipo: payload.tipo ?? "info",
        obra_id: payload.obraId ?? null,
        severidade: payload.severidade ?? "media",
        lido: false,
        user_id: user?.id ?? null,
      };

      if (payload.acao) {
        basePayload.acao = payload.acao;
      }

      const { error } = await supabase.from("alertas").insert([basePayload]);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
      toast.success("Alerta registrado com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao cadastrar alerta:", error);
      toast.error(error?.message ?? "Erro ao cadastrar alerta");
    },
  });

  const marcarComoLidoMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alertas")
        .update({ lido: true })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
    },
    onError: (error: any) => {
      console.error("Erro ao marcar alerta como lido:", error);
      toast.error(error?.message ?? "Não foi possível marcar como lido");
    },
  });

  const marcarTodosComoLidosMutation = useMutation({
    mutationFn: async () => {
      if (memberUserIds.length === 0) {
        return;
      }

      const { error } = await supabase
        .from("alertas")
        .update({ lido: true })
        .in("user_id", memberUserIds);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
    },
    onError: (error: any) => {
      console.error("Erro ao marcar todos os alertas como lidos:", error);
      toast.error(error?.message ?? "Não foi possível marcar todos como lidos");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("alertas")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alertas"] });
      toast.success("Alerta removido");
    },
    onError: (error: any) => {
      console.error("Erro ao excluir alerta:", error);
      toast.error(error?.message ?? "Não foi possível excluir o alerta");
    },
  });

  const alertasNaoLidos = useMemo(
    () => alertas.filter((alerta) => !alerta.lido),
    [alertas]
  );

  return {
    alertas,
    alertasNaoLidos,
    isLoading: isLoading || isCompanyScopeLoading,
    addAlerta: addMutation.mutateAsync,
    marcarComoLido: marcarComoLidoMutation.mutateAsync,
    marcarTodosComoLidos: marcarTodosComoLidosMutation.mutateAsync,
    deleteAlerta: deleteMutation.mutateAsync,
    getAlertasNaoLidos: () => alertasNaoLidos,
  };
};
