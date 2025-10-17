import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "@/components/dashboard/DateRangerPicker";
import { Overview } from "@/components/dashboard/Overview";
import { useObras } from "@/hooks/useObras";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import StatCard from "@/components/dashboard/StatCard";
import {
  AlertTriangle,
  Building,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";

import { useEquipes } from "@/hooks/useEquipes";
import { Link } from "react-router-dom";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";

export default function Dashboard() {
  const { obras, isLoading: isLoadingObras } = useObras();
  const {
    resumoFinanceiro,
    despesasPorCategoria,
    isLoading: isLoadingFinanceiro,
  } = useFinanceiro();
  const { membros, isLoading: isLoadingEquipes } = useEquipes();

  const [date, setDate] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button>Download</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total de Receitas"
              value={`R$ ${resumoFinanceiro.totalReceitas.toLocaleString(
                "pt-BR"
              )}`}
              description="Total de receitas de todas as obras"
              icon={DollarSign}
              isLoading={isLoadingFinanceiro}
            />
            <StatCard
              title="Total de Despesas"
              value={`R$ ${resumoFinanceiro.totalDespesas.toLocaleString(
                "pt-BR"
              )}`}
              description="Total de despesas de todas as obras"
              icon={TrendingUp}
              isLoading={isLoadingFinanceiro}
            />
            <StatCard
              title="Obras Ativas"
              value={`+${
                obras.filter((o) => o.status === "em_andamento").length
              }`}
              description="Obras em andamento no momento"
              icon={Building}
              isLoading={isLoadingObras}
            />
            <StatCard
              title="Membros Ativos"
              value={`+${membros.filter((m) => m.status === "ativo").length}`}
              description="Membros da equipe trabalhando"
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
                <span>Orçamentos</span>
              </Link>
            </Button>
          </div>

          <div className="grid gap-4">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral de Custos</CardTitle>
              </CardHeader>
              <CardContent>
                <Overview
                  date={date}
                  setDate={setDate}
                  despesasPorCategoria={despesasPorCategoria}
                  isLoading={isLoadingFinanceiro}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
