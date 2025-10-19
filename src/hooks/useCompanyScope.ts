import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type CompanyScopeResult = {
  construtoraId: string | null;
  companyName: string | null;
  role: string | null;
  memberUserIds: string[];
};

type RpcCompanyScopeRow = {
  construtora_id: string | null;
  company_name: string | null;
  role: string | null;
  member_user_ids: string[] | null;
} | null;

const normalizeIds = (ids: (string | null | undefined)[]): string[] => {
  return Array.from(new Set(ids.filter(Boolean) as string[])).sort();
};

export const useCompanyScope = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch, isFetching } =
    useQuery<CompanyScopeResult>({
      queryKey: ["company-scope", user?.id],
      enabled: Boolean(user?.id),
      staleTime: 1000 * 60 * 5,
      queryFn: async () => {
        if (!user?.id) {
          return {
            construtoraId: null,
            companyName: null,
            role: null,
            memberUserIds: [],
          };
        }

        const { data: scope, error: scopeError } = await supabase.rpc<
          RpcCompanyScopeRow[]
        >("get_company_scope");

        if (scopeError) {
          throw scopeError;
        }

        if (!scope) {
          return {
            construtoraId: null,
            companyName: null,
            role: null,
            memberUserIds: [user.id],
          };
        }

        const scopeArray = Array.isArray(scope) ? scope : [scope];
        const firstRow = scopeArray[0] ?? null;

        if (!firstRow) {
          return {
            construtoraId: null,
            companyName: null,
            role: null,
            memberUserIds: [user.id],
          };
        }

        const memberUserIds = normalizeIds([
          ...(firstRow.member_user_ids ?? []),
          user.id,
        ]);

        return {
          construtoraId: firstRow.construtora_id ?? null,
          companyName: firstRow.company_name ?? null,
          role: firstRow.role ?? null,
          memberUserIds,
        };
      },
    });

  const memberUserIds = useMemo(
    () => data?.memberUserIds ?? (user?.id ? [user.id] : []),
    [data?.memberUserIds, user?.id]
  );

  return {
    construtoraId: data?.construtoraId ?? null,
    companyName: data?.companyName ?? null,
    role: data?.role ?? null,
    memberUserIds,
    isLoading: isLoading || isFetching,
    error: error as Error | null,
    refetch,
  };
};
