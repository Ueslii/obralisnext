import { FileBarChart, TrendingUp, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Relatorios() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análises e métricas das suas obras</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Custo Médio por Obra</p>
              <p className="text-3xl font-mono font-bold">R$ 2.8M</p>
              <p className="text-sm text-success">↑ 8% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Tempo Médio de Execução</p>
              <p className="text-3xl font-mono font-bold">8.5 meses</p>
              <p className="text-sm text-destructive">↓ 5% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Despesas Logísticas</p>
              <p className="text-3xl font-mono font-bold">R$ 380K</p>
              <p className="text-sm text-success">↑ 3% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Eficiência Geral</p>
              <p className="text-3xl font-mono font-bold">87%</p>
              <p className="text-sm text-success">↑ 12% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Custos Mensais
            </CardTitle>
            <CardDescription>Evolução dos custos nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2 p-4">
              {[65, 72, 58, 85, 78, 92].map((height, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t-lg transition-all hover:bg-primary-light"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {["Mai", "Jun", "Jul", "Ago", "Set", "Out"][idx]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5 text-primary" />
              Distribuição de Custos
            </CardTitle>
            <CardDescription>Breakdown por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Materiais</span>
                  <span className="font-mono font-semibold">41%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "41%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Mão de Obra</span>
                  <span className="font-mono font-semibold">28%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: "28%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Equipamentos</span>
                  <span className="font-mono font-semibold">22%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-success" style={{ width: "22%" }} />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Logística</span>
                  <span className="font-mono font-semibold">9%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-secondary" style={{ width: "9%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Obra concluída", detail: "Residencial Vista Verde", time: "Há 2 horas" },
              { action: "Orçamento aprovado", detail: "Edifício Comercial Central - R$ 3.8M", time: "Há 5 horas" },
              { action: "Novo funcionário", detail: "Carlos Santos - Engenheiro Civil", time: "Há 1 dia" },
              { action: "Pagamento realizado", detail: "Fornecedor de Materiais - R$ 150K", time: "Há 2 dias" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileBarChart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
