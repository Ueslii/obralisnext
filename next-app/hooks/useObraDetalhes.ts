"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useCompanyScope } from "./useCompanyScope";

export interface ObraComentario {
    id: string;
    obraId: string;
    autor: string;
    conteudo: string;
    tipo: "comentario" | "foto" | "alerta";
    fotoUrl?: string | null;
    data: string;
}

export interface ObraInsumo {
    id: string;
    obraId: string;
    nome: string;
    quantidade: number;
    unidade: string;
    quantidadeUsada: number;
    fornecedor?: string | null;
    dataEntrega?: string | null;
    etapaId?: string | null;
    etapaNome?: string | null;
    valorUnitario?: number | null;
}

export interface ObraEtapa {
    id: string;
    obraId: string;
    nome: string;
    descricao?: string | null;
    custoPrevisto: number;
    custoReal: number;
    ordem?: number | null;
    dataInicio?: string | null;
    dataFim?: string | null;
    insumos: ObraInsumo[];
}

export interface ObraImprevisto {
    id: string;
    obraId: string;
    descricao: string;
    valor: number;
    data: string;
    categoria?: string | null;
}

export interface ComentarioInput {
    obraId: string;
    conteudo: string;
    tipo: "comentario" | "foto" | "alerta";
}

export interface InsumoInput {
    obraId: string;
    nome: string;
    quantidade: number;
    unidade: string;
    fornecedor?: string;
    dataEntrega?: string;
    quantidadeUsada?: number;
    etapaId?: string;
    valorUnitario?: number;
}

export interface ImprevistoInput {
    obraId: string;
    descricao: string;
    valor: number;
    categoria?: string;
}

const mapComentario = (row: Record<string, any>): ObraComentario => ({
    id: row.id,
    obraId: row.obra_id,
    autor: row.profiles?.nome ?? "Usuario",
    conteudo: row.conteudo ?? "",
    tipo: row.tipo ?? "comentario",
    fotoUrl: row.foto_url ?? null,
    data: row.updated_at ?? row.created_at ?? new Date().toISOString(),
});

const mapInsumo = (row: Record<string, any>): ObraInsumo => ({
    id: row.id,
    obraId: row.obra_id,
    nome: row.material ?? "",
    quantidade: Number(row.quantidade_total ?? 0),
    unidade: row.unidade ?? "",
    quantidadeUsada: Number(row.quantidade_usada ?? 0),
    fornecedor: row.fornecedores?.nome ?? row.fornecedor_nome ?? null,
    dataEntrega: row.data_entrada ?? null,
    etapaId: row.etapa_id ?? null,
    etapaNome: row.obra_etapas?.nome ?? null,
    valorUnitario: row.valor_unitario ?? null,
});

const mapImprevisto = (row: Record<string, any>): ObraImprevisto => ({
    id: row.id,
    obraId: row.obra_id,
    descricao: row.descricao ?? "",
    valor: Number(row.valor ?? 0),
    categoria: row.categoria ?? null,
    data: row.data ?? row.created_at ?? new Date().toISOString(),
});

type ObraEtapaBase = Omit<ObraEtapa, "insumos">;

const mapEtapaBase = (row: Record<string, any>): ObraEtapaBase => ({
    id: row.id,
    obraId: row.obra_id,
    nome: row.nome ?? "",
    descricao: row.descricao ?? null,
    custoPrevisto: Number(row.custo_previsto ?? 0),
    custoReal: Number(row.custo_real ?? 0),
    ordem: row.ordem ?? null,
    dataInicio: row.data_inicio ?? null,
    dataFim: row.data_fim ?? null,
});

export const useObraDetalhes = (obraId: string) => {
    let queryClient: QueryClient | null = null;
    try { queryClient = useQueryClient(); } catch { queryClient = null; }
    const {
        memberUserIds,
        isLoading: isCompanyScopeLoading,
    } = useCompanyScope();

    const acessoQuery = useQuery({
        queryKey: ["obra", obraId, "acesso", memberUserIds.join(",")],
        enabled: Boolean(obraId) && memberUserIds.length > 0,
        staleTime: 1000 * 60,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obras")
                .select("id")
                .eq("id", obraId)
                .in("user_id", memberUserIds)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                throw new Error("Obra não encontrada ou sem permissão");
            }

            return true;
        },
    });

    const acessoLiberado = acessoQuery.data === true;

    const comentariosQuery = useQuery({
        queryKey: ["obra", obraId, "comentarios", memberUserIds.join(",")],
        enabled: acessoLiberado,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obra_comentarios")
                .select("*")
                .eq("obra_id", obraId);

            if (error) {
                if (error.code === "42P01" || error.code === "PGRST205") {
                    console.warn("Tabela obra_comentarios indisponível:", error?.message);
                    return [] as ObraComentario[];
                }
                throw error;
            }

            const rows = (data ?? []) as Record<string, any>[];

            const userIds = Array.from(
                new Set(
                    rows
                        .map((row) => row.user_id as string | null)
                        .filter((value): value is string => Boolean(value))
                )
            );

            const profileMap = new Map<string, string | null>();

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from("profiles")
                    .select("id, nome")
                    .in("id", userIds);

                if (profilesError) {
                    if (profilesError.code === "42P01" || profilesError.code === "PGRST205") {
                        console.warn("Tabela profiles indisponível:", profilesError?.message);
                    } else {
                        console.warn("Não foi possível carregar autores dos comentários:", profilesError?.message);
                    }
                } else {
                    (profilesData ?? []).forEach((profile: any) => {
                        profileMap.set(profile.id, profile.nome ?? null);
                    });
                }
            }

            rows.sort((a, b) => {
                const bDate = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
                const aDate = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
                return bDate - aDate;
            });

            return rows.map((row) =>
                mapComentario({
                    ...row,
                    profiles: { nome: profileMap.get(row.user_id) ?? null },
                })
            );
        },
    });

    const insumosQuery = useQuery({
        queryKey: ["obra", obraId, "insumos", memberUserIds.join(",")],
        enabled: acessoLiberado,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obra_insumos")
                .select("*, fornecedores (nome), obra_etapas (nome)")
                .eq("obra_id", obraId)
                .order("data_entrada", { ascending: false });

            if (error) {
                if (error.code === "42P01" || error.code === "PGRST205") {
                    console.warn("Tabela obra_insumos indisponível:", error?.message);
                    return [] as ObraInsumo[];
                }
                throw error;
            }

            return (data ?? []).map((row) => mapInsumo(row as Record<string, any>));
        },
    });

    const etapasQuery = useQuery<ObraEtapaBase[]>({
        queryKey: ["obra", obraId, "etapas", memberUserIds.join(",")],
        enabled: acessoLiberado,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obra_etapas")
                .select("*")
                .eq("obra_id", obraId)
                .order("ordem", { ascending: true });

            if (error) {
                if (error.code === "42P01" || error.code === "PGRST205") {
                    console.warn("Tabela obra_etapas indisponível:", error?.message);
                    return [] as ObraEtapaBase[];
                }
                throw error;
            }

            return (data ?? []).map((row) =>
                mapEtapaBase(row as Record<string, any>)
            );
        },
    });

    const imprevistosQuery = useQuery({
        queryKey: ["obra", obraId, "imprevistos", memberUserIds.join(",")],
        enabled: acessoLiberado,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obra_imprevistos")
                .select("*")
                .eq("obra_id", obraId)
                .order("created_at", { ascending: false });

            if (error) {
                if (error.code === "42P01" || error.code === "PGRST205") {
                    console.warn("Tabela obra_imprevistos indisponível:", error?.message);
                    return [] as ObraImprevisto[];
                }
                throw error;
            }

            return (data ?? []).map((row) => mapImprevisto(row as Record<string, any>));
        },
    });

    const addComentarioMutation = useMutation({
        mutationFn: async (payload: ComentarioInput) => {
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();

            if (userError) throw userError;

            const { error } = await supabase.from("obra_comentarios").insert({
                obra_id: payload.obraId,
                conteudo: payload.conteudo,
                tipo: payload.tipo,
                user_id: user?.id ?? null,
            });

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "comentarios"] });
            toast.success("Comentário adicionado");
        },
        onError: (error: any) => {
            console.error("Erro ao adicionar comentário:", error);
            toast.error(error?.message ?? "Não foi possível adicionar o comentário");
        },
    });

    const addInsumoMutation = useMutation({
        mutationFn: async (payload: InsumoInput) => {
            const basePayload: Record<string, any> = {
                obra_id: payload.obraId,
                material: payload.nome,
                quantidade_total: payload.quantidade,
                quantidade_usada: payload.quantidadeUsada ?? 0,
                unidade: payload.unidade,
                fornecedor_nome: payload.fornecedor ?? null,
                data_entrada: payload.dataEntrega ?? null,
                etapa_id: payload.etapaId ?? null,
                valor_unitario: payload.valorUnitario ?? null,
            };

            const tentativa = await supabase.from("obra_insumos").insert([basePayload]);

            if (tentativa.error?.code === "42703") {
                delete basePayload.fornecedor_nome;
                const fallback = await supabase.from("obra_insumos").insert([basePayload]);
                if (fallback.error) throw fallback.error;
                return;
            }

            if (tentativa.error) {
                throw tentativa.error;
            }
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "insumos"] });
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "etapas"] });
            toast.success("Insumo registrado");
        },
        onError: (error: any) => {
            console.error("Erro ao registrar insumo:", error);
            toast.error(error?.message ?? "Não foi possível registrar o insumo");
        },
    });

    const updateInsumoMutation = useMutation({
        mutationFn: async ({ id, quantidadeUsada }: { id: string; quantidadeUsada: number }) => {
            const { error } = await supabase
                .from("obra_insumos")
                .update({ quantidade_usada: quantidadeUsada })
                .eq("id", id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "insumos"] });
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "etapas"] });
            toast.success("Insumo atualizado");
        },
        onError: (error: any) => {
            console.error("Erro ao atualizar insumo:", error);
            toast.error(error?.message ?? "Não foi possível atualizar o insumo");
        },
    });

    const addImprevistoMutation = useMutation({
        mutationFn: async (payload: ImprevistoInput) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            const tentativa = await supabase.from("obra_imprevistos").insert({
                obra_id: payload.obraId,
                descricao: payload.descricao,
                valor: payload.valor,
                categoria: payload.categoria ?? null,
                user_id: user?.id ?? null,
            });

            if (tentativa.error?.code === "42P01") {
                console.warn(
                    "Tabela obra_imprevistos não encontrada. Atualize as migrações para registrar imprevistos."
                );
                throw tentativa.error;
            }

            if (tentativa.error) {
                throw tentativa.error;
            }
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obra", obraId, "imprevistos"] });
            toast.success("Imprevisto registrado");
        },
        onError: (error: any) => {
            console.error("Erro ao registrar imprevisto:", error);
            toast.error(error?.message ?? "Não foi possível registrar o imprevisto");
        },
    });

    const comentarios = comentariosQuery.data ?? [];
    const insumos = insumosQuery.data ?? [];
    const imprevistos = imprevistosQuery.data ?? [];
    const etapasBase = etapasQuery.data ?? [];

    const etapas = useMemo<ObraEtapa[]>(
        () =>
            etapasBase.map((etapa) => ({
                ...etapa,
                insumos: insumos.filter((insumo) => insumo.etapaId === etapa.id),
            })),
        [etapasBase, insumos]
    );

    const insumosSemEtapa = useMemo(
        () => insumos.filter((insumo) => !insumo.etapaId),
        [insumos]
    );

    const totalImprevistos = useMemo(
        () => imprevistos.reduce((acc, item) => acc + (item.valor ?? 0), 0),
        [imprevistos]
    );

    return {
        comentarios,
        insumos,
        imprevistos,
        isLoading:
            isCompanyScopeLoading ||
            acessoQuery.isLoading ||
            comentariosQuery.isLoading ||
            insumosQuery.isLoading ||
            etapasQuery.isLoading ||
            imprevistosQuery.isLoading,
        addComentario: addComentarioMutation.mutateAsync,
        addInsumo: addInsumoMutation.mutateAsync,
        updateInsumo: (id: string, quantidadeUsada: number) =>
            updateInsumoMutation.mutateAsync({ id, quantidadeUsada }),
        addImprevisto: addImprevistoMutation.mutateAsync,
        getTotalImprevistos: () => totalImprevistos,
        etapas,
        insumosSemEtapa,
    };
};
