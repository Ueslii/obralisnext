"use client";

import { FileText, Plus, Download, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useCompanyScope } from "@/hooks/useCompanyScope";

export default function OrcamentosPage() {
  const { memberUserIds } = useCompanyScope();

  const { data: counts, isLoading } = useQuery({
    queryKey: ["orcamentos-counts", memberUserIds.join(",")],
    enabled: memberUserIds.length > 0,
    queryFn: async () => {
      const inFilter = memberUserIds;
      const total = await supabase
        .from("orcamentos")
        .select("id", { count: "exact", head: true })
        .in("user_id", inFilter);

      const aprovados = await supabase
        .from("orcamentos")
        .select("id", { count: "exact", head: true })
        .in("user_id", inFilter)
        .eq("status", "aprovado");

      const pendentes = await supabase
        .from("orcamentos")
        .select("id", { count: "exact", head: true })
        .in("user_id", inFilter)
        .in("status", ["em_elaboracao", "revisao", "pendente"]);

      if (total.error) throw total.error;
      if (aprovados.error) throw aprovados.error;
      if (pendentes.error) throw pendentes.error;

      return {
        total: total.count ?? 0,
        aprovados: aprovados.count ?? 0,
        pendentes: pendentes.count ?? 0,
      };
    },
  });

  const total = counts?.total ?? 0;
  const aprovados = counts?.aprovados ?? 0;
  const pendentes = counts?.pendentes ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orçamentos</h1>
          <p className="text-muted-foreground">Criação e gestão de orçamentos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? "--" : total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <Download className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{isLoading ? "--" : aprovados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Eye className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{isLoading ? "--" : pendentes}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

