"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { DateRange } from "react-day-picker";

import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CalendarDateRangePicker } from "./DateRangerPicker";
import { Link } from "react-router-dom";

interface OverviewProps {
  date: DateRange;
  setDate: React.Dispatch<React.SetStateAction<DateRange>>;
  despesasPorCategoria: any[];
  isLoading: boolean;
}

export function Overview({
  date,
  setDate,
  despesasPorCategoria,
  isLoading,
}: OverviewProps) {
  if (isLoading) return <p>Carregando dados...</p>;
  const [costData, setCostData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);

  const totalCosts = despesasPorCategoria.reduce(
    (sum, item) => sum + item.value,
    0
  );

  return (
    <div className="w-full space-y-6">
      {/* 🔹 Filtro de Período */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Visão Geral</h1>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker date={date} setDate={setDate} />
          <Button variant="outline" onClick={() => setDate(undefined)}>
            Limpar Filtro
          </Button>
        </div>
      </div>

      {/* 🔹 Gráficos lado a lado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 📊 Obras em Andamento */}
        <Card className="p-4 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">🏗️ Obras em Andamento</h2>
          <p className="text-sm text-gray-500 mb-4">
            Acompanhe o progresso das suas obras
          </p>

          {progressData.map((obra, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-800">{obra.obra}</span>
                <span className="text-green-600">{obra.status}</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-2 bg-orange-500 rounded-full transition-all"
                  style={{ width: `${obra.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Prazo: {obra.prazo}</span>
                <span>{obra.progress}%</span>
              </div>
            </div>
          ))}
          <Link to="/obras">
            <Button variant="outline" className="w-full mt-2">
              Ver todas as obras
            </Button>
          </Link>
        </Card>

        {/* 💰 Visão Geral de Custos */}
        <Card className="p-4 rounded-2xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">
            💰 Visão Geral de Custos
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Distribuição de despesas do período
          </p>

          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={despesasPorCategoria}
              layout="vertical"
              margin={{ left: 30, right: 20 }}
            >
              <XAxis
                type="number"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value.toLocaleString("pt-BR")}`}
              />
              <YAxis
                dataKey="category"
                type="category"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number) =>
                  `R$ ${value.toLocaleString("pt-BR")}`
                }
              />
              <Bar
                dataKey="value"
                fill="#ff6a00"
                radius={[4, 4, 4, 4]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>

          <div className="mt-4 border-t pt-2 flex justify-between text-sm text-gray-700">
            <span>Total</span>
            <span className="font-medium">
              R$ {totalCosts.toLocaleString("pt-BR")}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}
