import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DateRange } from "react-day-picker";
import {
  AlertTriangle,
  Building,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/DateRangerPicker";
import StatCard from "@/components/dashboard/StatCard";
import { Overview } from "@/components/dashboard/Overview";
import { useObras } from "@/hooks/useObras";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useEquipes } from "@/hooks/useEquipes";

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  const { obras, isLoading: isLoadingObras } = useObras();
  const {
    resumoFinanceiro,
    despesasPorCategoria,
    isLoading: isLoadingFinanceiro,
  } = useFinanceiro(dateRange);
  const { membros, isLoading: isLoadingEquipes } = useEquipes();

  const totalReceitas = resumoFinanceiro?.totalReceitas ?? 0;
  const totalDespesas = resumoFinanceiro?.totalDespesas ?? 0;
  const saldo = resumoFinanceiro?.saldo ?? 0;

  const obrasEmAndamento = useMemo(
    () => obras.filter((obra) => obra.status === "em_andamento"),
    [obras]
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
          <Button variant="outline">Download</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard
              title="Total de Receitas"
              value={`+ R$ ${totalReceitas.toLocaleString("pt-BR")}`}
              description="Receitas consolidadas no periodo"
              icon={DollarSign}
              isLoading={isLoadingFinanceiro}
              valueClassName="text-emerald-600"
            />
            <StatCard
              title="Total de Despesas"
              value={`- R$ ${totalDespesas.toLocaleString("pt-BR")}`}
              description="Gastos registrados no periodo"
              icon={TrendingDown}
              isLoading={isLoadingFinanceiro}
              valueClassName="text-red-500"
            />
            <StatCard
              title="Saldo Total"
              value={`${saldo >= 0 ? "+ " : "- "}R$ ${Math.abs(
                saldo
              ).toLocaleString("pt-BR")}`}
              description="Receitas menos despesas"
              icon={TrendingUp}
              isLoading={isLoadingFinanceiro}
              valueClassName={
                saldo >= 0 ? "text-emerald-600" : "text-red-500"
              }
            />
            <StatCard
              title="Obras Ativas"
              value={`+${obrasEmAndamento.length}`}
              description="Projetos atualmente em andamento"
              icon={Building}
              isLoading={isLoadingObras}
            />
            <StatCard
              title="Membros Ativos"
              value={`+${
                membros.filter((membro) => membro.status === "ativo").length
              }`}
              description="Colaboradores disponiveis"
              icon={Users}
              isLoading={isLoadingEquipes}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Button
              asChild
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Link to="/financeiro">
                <DollarSign className="h-6 w-6 text-primary" />
                <span>Financeiro</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Link to="/equipes">
                <Users className="h-6 w-6 text-primary" />
                <span>RH e Equipes</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Link to="/alertas">
                <AlertTriangle className="h-6 w-6 text-primary" />
                <span>Alertas</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-20 flex flex-col gap-2"
            >
              <Link to="/orcamentos">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Orcamentos</span>
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visao Geral de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <Overview
                  dateRange={dateRange}
                  despesasPorCategoria={despesasPorCategoria}
                  isLoading={isLoadingFinanceiro}
                  obras={obrasEmAndamento}
                  isLoadingObras={isLoadingObras}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
