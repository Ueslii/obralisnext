"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient, QueryClient } from "@tanstack/react-query";
import { useAuth } from "@/providers/AuthProvider";
import { supabase } from "@/lib/supabase/client";
import {
    Tables,
    TablesInsert,
} from "@/lib/supabase/types";
import { toast } from "sonner";
import { useCompanyScope } from "./useCompanyScope";

type ObraRow = Tables<"obras">;

export type Obra = Omit<ObraRow, "status"> & {
    status: "planejada" | "em_andamento" | "concluida" | "atrasada";
};

export type NovaEtapaInsumo = {
    nome: string;
    unidade: string;
    quantidade: number;
    valorUnitario?: number;
    fornecedor?: string;
    dataEntrega?: string;
};

export type NovaEtapa = {
    nome: string;
    descricao?: string;
    custoPrevisto?: number;
    ordem?: number;
    insumos?: NovaEtapaInsumo[];
};

type ObraInsert = TablesInsert<"obras">;

export type NewObra = Omit<
    ObraInsert,
    "id" | "created_at" | "updated_at" | "user_id" | "status"
> & {
    status?: Obra["status"];
    etapas?: NovaEtapa[];
};

const statusPadrao: Obra["status"] = "planejada";

export const useObras = () => {
    let queryClient: QueryClient | null = null;
    try {
        queryClient = useQueryClient();
    } catch (_err) {
        queryClient = null;
    }
    const { user } = useAuth();
    const {
        memberUserIds,
        isLoading: isCompanyScopeLoading,
    } = useCompanyScope();

    const allowedUserIds = useMemo(() => {
        if (memberUserIds.length > 0) return memberUserIds;
        return user?.id ? [user.id] : [];
    }, [memberUserIds, user?.id]);

    const { data: obras = [], isLoading } = useQuery<Obra[]>({
        queryKey: ["obras", allowedUserIds.join(",")],
        enabled: allowedUserIds.length > 0,
        queryFn: async () => {
            const { data, error } = await supabase
                .from("obras")
                .select("*")
                .in("user_id", allowedUserIds)
                .order("created_at", { ascending: false });

            if (error) {
                throw error;
            }

            return (data ?? []).map(
                (obra) =>
                ({
                    ...obra,
                    status: obra.status as Obra["status"],
                } as Obra)
            );
        },
    });

    const addObra = useMutation({
        mutationFn: async (input: NewObra) => {
            const {
                etapas = [],
                status = statusPadrao,
                ...dadosObra
            } = input;

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("Usuário não autenticado");
            }

            // Preflight: verify dependent tables exist if etapas/insumos will be created
            if ((input.etapas ?? []).length > 0) {
                const etapaCheck = await supabase.from("obra_etapas").select("id").limit(1);
                if (etapaCheck.error && (etapaCheck.error.code === "42P01" || etapaCheck.error.code === "PGRST205")) {
                    throw new Error(
                        "Tabela 'obra_etapas' não encontrada no banco. Aplique as migrações no Supabase para continuar."
                    );
                }

                const insumoCheck = await supabase.from("obra_insumos").select("id").limit(1);
                if (insumoCheck.error && (insumoCheck.error.code === "42P01" || insumoCheck.error.code === "PGRST205")) {
                    throw new Error(
                        "Tabela 'obra_insumos' não encontrada no banco. Aplique as migrações no Supabase para continuar."
                    );
                }
            }

            const { data: novaObra, error } = await supabase
                .from("obras")
                .insert([
                    {
                        ...dadosObra,
                        status,
                        user_id: user.id,
                    } as ObraInsert,
                ])
                .select()
                .single();

            if (error || !novaObra) {
                throw error ?? new Error("Erro ao criar obra");
            }

            if (etapas.length > 0) {
                for (const [index, etapa] of etapas.entries()) {
                    const { insumos = [], ...dadosEtapa } = etapa;

                    const { data: etapaCriada, error: etapaError } = await supabase
                        .from("obra_etapas")
                        .insert([
                            {
                                obra_id: novaObra.id,
                                nome: dadosEtapa.nome,
                                descricao: dadosEtapa.descricao ?? null,
                                custo_previsto: dadosEtapa.custoPrevisto ?? 0,
                                custo_real: 0,
                                ordem: dadosEtapa.ordem ?? index + 1,
                            },
                        ])
                        .select()
                        .single();

                    if (etapaError || !etapaCriada) {
                        throw etapaError ?? new Error("Erro ao criar etapa da obra");
                    }

                    if (insumos.length > 0) {
                        const payload = insumos.map((insumo) => ({
                            obra_id: novaObra.id,
                            etapa_id: etapaCriada.id,
                            material: insumo.nome,
                            unidade: insumo.unidade,
                            quantidade_total: insumo.quantidade,
                            quantidade_usada: 0,
                            valor_unitario: insumo.valorUnitario ?? null,
                            fornecedor_nome: insumo.fornecedor ?? null,
                            data_entrada: insumo.dataEntrega ?? null,
                        }));

                        const { error: insumoError } = await supabase
                            .from("obra_insumos")
                            .insert(payload);

                        if (insumoError) {
                            throw insumoError;
                        }
                    }
                }
            }

            return {
                ...novaObra,
                status: novaObra.status as Obra["status"],
            } as Obra;
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obras"] });
            toast.success("Obra adicionada com sucesso!");
        },
        onError: (error: any) => {
            console.error("Erro ao adicionar obra:", error);
            toast.error(error?.message ?? "Erro ao adicionar obra");
        },
    });

    const updateObra = useMutation({
        mutationFn: async ({
            id,
            ...dados
        }: Partial<Omit<Obra, "id">> & { id: string }) => {
            const { data, error } = await supabase
                .from("obras")
                .update(dados)
                .eq("id", id)
                .select()
                .single();

            if (error) {
                throw error;
            }

            return {
                ...data,
                status: data.status as Obra["status"],
            } as Obra;
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obras"] });
            toast.success("Obra atualizada com sucesso!");
        },
        onError: (error: any) => {
            console.error("Erro ao atualizar obra:", error);
            toast.error(error?.message ?? "Erro ao atualizar obra");
        },
    });

    const deleteObra = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("obras").delete().eq("id", id);
            if (error) {
                throw error;
            }
        },
        onSuccess: () => {
            queryClient?.invalidateQueries({ queryKey: ["obras"] });
            toast.success("Obra deletada com sucesso!");
        },
        onError: (error: any) => {
            console.error("Erro ao deletar obra:", error);
            toast.error(error?.message ?? "Erro ao deletar obra");
        },
    });

    return {
        obras,
        isLoading: isLoading || isCompanyScopeLoading,
        addObra: addObra.mutateAsync,
        addObraPending: addObra.isPending,
        updateObra: updateObra.mutateAsync,
        updateObraPending: updateObra.isPending,
        deleteObra: deleteObra.mutateAsync,
        deleteObraPending: deleteObra.isPending,
    };
};
