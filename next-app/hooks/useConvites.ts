"use client";

import { useQuery, useMutation, useQueryClient, QueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useCompanyScope } from "./useCompanyScope";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type ConviteStatus = "pending" | "accepted" | "declined" | "expired";

export interface Convite {
    id: string;
    email: string;
    status: ConviteStatus;
    cargoSugerido: string | null;
    construtoraId: string;
    invitedBy: string | null;
    createdBy: string;
    createdAt: string;
    respondedAt: string | null;
}

const mapRow = (row: Record<string, any>): Convite => ({
    id: row.id,
    email: row.email,
    status: row.status as ConviteStatus,
    cargoSugerido: row.cargo_sugerido ?? null,
    construtoraId: row.construtora_id,
    invitedBy: row.invited_by ?? null,
    createdBy: row.created_by,
    createdAt: row.created_at,
    respondedAt: row.responded_at ?? null,
});

const mapCargoToMemberRole = (cargo?: string | null): string => {
    const v = (cargo ?? "").toString().toLowerCase().trim();
    if (v === "owner" || v === "proprietario" || v === "proprietário" || v === "dono") return "owner";
    if (v === "admin" || v === "administrador" || v === "administradora") return "admin";
    // todos os demais perfis (gestor, engenheiro, responsavel_obra, etc.) viram 'member'
    return "member";
};

export const useConvites = () => {
    const { construtoraId } = useCompanyScope();
    const { user } = useAuth();
    let qc: QueryClient | null = null;
    try { qc = useQueryClient(); } catch { qc = null; }

    const convitesQuery = useQuery<Convite[]>({
        queryKey: ["construtora_convites", construtoraId],
        enabled: Boolean(construtoraId),
        queryFn: async () => {
            const { data, error } = await supabase
                .from("construtora_convites")
                .select(
                    "id,email,status,cargo_sugerido,construtora_id,invited_by,created_by,created_at,responded_at"
                )
                .eq("construtora_id", construtoraId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            return (data ?? []).map(mapRow);
        },
    });

    const setStatus = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: ConviteStatus }) => {
            const { error } = await supabase
                .from("construtora_convites")
                .update({ status, responded_at: new Date().toISOString(), invited_by: user?.id ?? null })
                .eq("id", id);
            if (error) throw error;
            return { id, status };
        },
        onSuccess: async ({ id, status }) => {
            // If accepted, try to add membership automatically when the user already exists
            if (status === "accepted") {
                try {
                    const convite = convitesQuery.data?.find((c) => c.id === id);
                    if (convite?.email && construtoraId) {
                        const profile = await supabase
                            .from("profiles")
                            .select("id,email")
                            .ilike("email", convite.email)
                            .maybeSingle();

                        if (profile.data?.id) {
                            const payload: Record<string, any> = {
                                construtora_id: construtoraId,
                                user_id: profile.data.id,
                                role: mapCargoToMemberRole(convite.cargoSugerido),
                                invited_by: user?.id ?? null,
                                accepted_at: new Date().toISOString(),
                                created_by: user?.id ?? null,
                            };
                            const insert = await supabase
                                .from("construtora_membros")
                                .insert([payload]);
                            // ignore unique violation
                            if (insert.error && insert.error.code !== "23505") {
                                console.warn("Falha ao adicionar membro após aprovar convite", insert.error);
                            }
                        }
                    }
                } catch (e) {
                    console.warn("Falha ao tentar provisionar membro após aprovação:", e);
                }
            }
            qc?.invalidateQueries({ queryKey: ["construtora_convites", construtoraId] });
            toast.success(status === "accepted" ? "Convite aprovado" : "Convite recusado");
        },
        onError: (err: any) => {
            console.error("Erro ao atualizar convite:", err);
            toast.error(err?.message ?? "Não foi possível atualizar o convite");
        },
    });

    const invite = useMutation({
        mutationFn: async ({ email, cargoSugerido }: { email: string; cargoSugerido?: string | null }) => {
            if (!construtoraId || !user?.id) throw new Error("Sem escopo de construtora");
            const payload: Record<string, any> = {
                construtora_id: construtoraId,
                email,
                cargo_sugerido: cargoSugerido ?? null,
                created_by: user.id,
                invited_by: user.id,
                status: "pending",
            };
            const { data, error } = await supabase
                .from("construtora_convites")
                .insert([payload])
                .select("id")
                .single();
            if (error) throw error;

            // Dispara a função manualmente também (além do trigger), para feedback mais imediato
            try {
                await supabase.functions.invoke("notify-invite", {
                    body: {
                        inviteId: data?.id,
                        construtoraId,
                        email,
                        cargoSugerido: cargoSugerido ?? null,
                        createdBy: user.id,
                    },
                });
            } catch (e) {
                console.warn("Falha ao invocar notify-invite manualmente:", e);
            }
        },
        onSuccess: () => {
            qc?.invalidateQueries({ queryKey: ["construtora_convites", construtoraId] });
            toast.success("Convite enviado");
        },
        onError: (err: any) => {
            console.error("Erro ao enviar convite:", err);
            toast.error(err?.message ?? "Não foi possível enviar o convite");
        },
    });

    return {
        convites: convitesQuery.data ?? [],
        isLoading: convitesQuery.isLoading,
        approve: (id: string) => setStatus.mutateAsync({ id, status: "accepted" }),
        decline: (id: string) => setStatus.mutateAsync({ id, status: "declined" }),
        invite: (email: string, cargoSugerido?: string | null) => invite.mutateAsync({ email, cargoSugerido: cargoSugerido ?? null }),
        pending: setStatus.isPending,
        refetch: convitesQuery.refetch,
    };
};
