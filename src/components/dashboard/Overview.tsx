"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Obra } from "@/hooks/useObras";

interface OverviewProps {
  dateRange?: DateRange;
  despesasPorCategoria: { category: string; value: number }[];
  obras: Obra[];
  isLoading: boolean;
  isLoadingObras: boolean;
}

const formatCurrency = (valor: number) =>
  `R$ ${valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;

export function Overview({
  dateRange,
  despesasPorCategoria,
  obras,
  isLoading,
  isLoadingObras,
}: OverviewProps) {
  const totalCosts = useMemo(
    () =>
      despesasPorCategoria.reduce(
        (acc, categoria) => acc + categoria.value,
        0
      ),
    [despesasPorCategoria]
  );

  const periodoLabel = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return "Ultimos 30 dias";
    }

    return `${format(dateRange.from, "dd/MM/yyyy")} - ${format(
      dateRange.to,
      "dd/MM/yyyy"
    )}`;
  }, [dateRange]);

  return (
    <div className="w-full space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Resumo Operacional</h3>
          <p className="text-sm text-muted-foreground">
            Periodo selecionado: {periodoLabel}
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/obras">Ver todas as obras</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-4 rounded-2xl shadow-sm">
          <h4 className="text-lg font-semibold mb-2">Obras em andamento</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Acompanhe o progresso de cada projeto ativo.
          </p>

          {isLoadingObras ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-3 w-56" />
                </div>
              ))}
            </div>
          ) : obras.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma obra em andamento neste periodo.
            </p>
          ) : (
            <div className="space-y-4">
              {obras.map((obra) => {
                const statusLabel = obra.status
                  .split("_")
                  .map(
                    (parte) =>
                      parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase()
                  )
                  .join(" ");

                return (
                  <div key={obra.id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-foreground">
                        {obra.nome}
                      </span>
                      <span className="text-emerald-600">
                        {obra.progresso ?? 0}% concluido
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-orange-500 transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(Number(obra.progresso) || 0, 0)
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        Prazo:{" "}
                        {obra.prazo
                          ? new Date(obra.prazo).toLocaleDateString("pt-BR")
                          : "Sem data"}
                      </span>
                      <span>Status: {statusLabel}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="p-4 rounded-2xl shadow-sm">
          <h4 className="text-lg font-semibold mb-2">
            Distribuicao de custos
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            Entenda onde os recursos foram aplicados no periodo.
          </p>

          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : despesasPorCategoria.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa registrada no periodo selecionado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={despesasPorCategoria}
                layout="vertical"
                margin={{ left: 40, right: 20 }}
              >
                <XAxis
                  type="number"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(valor: number) =>
                    `R$ ${valor.toLocaleString("pt-BR")}`
                  }
                />
                <YAxis
                  dataKey="category"
                  type="category"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <Tooltip
                  cursor={{ fill: "rgba(79, 70, 229, 0.08)" }}
                  formatter={(valor: number) => formatCurrency(valor)}
                  labelFormatter={(categoria: string) => categoria}
                />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm font-medium text-foreground">
            <span>Total</span>
            <span>{formatCurrency(totalCosts)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
