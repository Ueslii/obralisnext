"use client";

import { useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Plus, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDateRangePicker } from "@/components/dashboard/DateRangerPicker";
import { DateRange } from "react-day-picker";
import { useFinanceiro } from "@/hooks/useFinanceiro";

export default function FinanceiroPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const { resumoFinanceiro, isLoading } = useFinanceiro(dateRange);

  const receitas = resumoFinanceiro?.totalReceitas ?? 0;
  const despesas = resumoFinanceiro?.totalDespesas ?? 0;
  const saldo = resumoFinanceiro?.saldo ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Financeiro</h1>
          <p className="text-muted-foreground">Controle de receitas, despesas e orçamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDateRangePicker date={dateRange} setDate={setDateRange} />
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lançamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {isLoading ? "--" : `R$ ${receitas.toLocaleString("pt-BR")}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {isLoading ? "--" : `R$ ${despesas.toLocaleString("pt-BR")}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={"text-2xl font-bold " + (saldo >= 0 ? "text-emerald-600" : "text-red-500")}> 
              {isLoading ? "--" : `${saldo >= 0 ? "+ " : "- "}R$ ${Math.abs(saldo).toLocaleString("pt-BR")}`}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

