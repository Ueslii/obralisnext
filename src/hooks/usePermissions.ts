import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type UserRole = "admin" | "engenheiro" | "gestor" | "usuario";

export interface Permission {
  obras: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewDetails: boolean;
  };
  financeiro: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  equipes: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  fornecedores: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  orcamentos: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  relatorios: {
    view: boolean;
    export: boolean;
  };
  configuracoes: {
    view: boolean;
    edit: boolean;
  };
}

const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    obras: { view: true, create: true, edit: true, delete: true, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: true },
    equipes: { view: true, create: true, edit: true, delete: true },
    fornecedores: { view: true, create: true, edit: true, delete: true },
    orcamentos: { view: true, create: true, edit: true, delete: true },
    relatorios: { view: true, export: true },
    configuracoes: { view: true, edit: true },
  },
  engenheiro: {
    obras: { view: true, create: true, edit: true, delete: false, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: false },
    equipes: { view: true, create: false, edit: false, delete: false },
    fornecedores: { view: true, create: true, edit: true, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    relatorios: { view: true, export: true },
    configuracoes: { view: true, edit: false },
  },
  gestor: {
    obras: { view: true, create: true, edit: true, delete: false, viewDetails: true },
    financeiro: { view: true, create: true, edit: true, delete: false },
    equipes: { view: true, create: true, edit: true, delete: false },
    fornecedores: { view: true, create: false, edit: false, delete: false },
    orcamentos: { view: true, create: true, edit: true, delete: false },
    relatorios: { view: true, export: false },
    configuracoes: { view: true, edit: false },
  },
  usuario: {
    obras: { view: true, create: false, edit: false, delete: false, viewDetails: false },
    financeiro: { view: false, create: false, edit: false, delete: false },
    equipes: { view: true, create: false, edit: false, delete: false },
    fornecedores: { view: false, create: false, edit: false, delete: false },
    orcamentos: { view: false, create: false, edit: false, delete: false },
    relatorios: { view: false, export: false },
    configuracoes: { view: true, edit: false },
  },
};

export const usePermissions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery<{ role: UserRole }[]>({
    queryKey: ["user_roles", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id ?? "");

      if (error) {
        throw error;
      }

      return data as { role: UserRole }[];
    },
  });

  const userRole: UserRole = rolesQuery.data?.[0]?.role ?? "usuario";
  const permissions = rolePermissions[userRole];

  const changeRoleMutation = useMutation({
    mutationFn: async (role: UserRole) => {
      if (!user?.id) {
        throw new Error("Usuário não autenticado");
      }

      const { error: deleteError } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      const { error: insertError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role });

      if (insertError) {
        throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles", user?.id] });
      toast.success("Perfil atualizado");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar perfil de acesso:", error);
      toast.error(error?.message ?? "Não foi possível atualizar as permissões");
    },
  });

  const hasPermission = useMemo(
    () =>
      (module: keyof Permission, action: string): boolean => {
        const modulo = permissions[module];
        if (!modulo) return false;
        return Boolean(modulo[action as keyof typeof modulo]);
      },
    [permissions]
  );

  return {
    userRole,
    permissions,
    isLoading: rolesQuery.isLoading,
    changeRole: changeRoleMutation.mutateAsync,
    hasPermission,
  };
};
