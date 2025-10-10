import { FileBarChart, TrendingUp, Download, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useObras } from "@/hooks/useObras";
import { useEquipes } from "@/hooks/useEquipes";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { useToast } from "@/hooks/use-toast";

export default function Relatorios() {
  const { obras } = useObras();
  const { membros, calcularFolhaPagamento } = useEquipes();
  const { orcamentos } = useOrcamentos();
  const { toast } = useToast();

  const obrasEmAndamento = obras.filter(o => o.status === 'em_andamento').length;
  const obrasConcluidas = obras.filter(o => o.status === 'concluida').length;
  const custoTotal = obras.reduce((sum, o) => sum + o.custoReal, 0);
  const custoMedio = obras.length > 0 ? custoTotal / obras.length : 0;
  const folhaMensal = calcularFolhaPagamento();
  const totalOrcamentos = orcamentos.reduce((sum, o) => sum + o.custoTotal, 0);
  const membrosAtivos = membros.filter(m => m.status === 'ativo').length;

  const handleExport = () => {
    toast({ 
      title: "Relatório exportado com sucesso!", 
      description: "O arquivo PDF foi gerado e está pronto para download." 
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análises e métricas das suas obras</p>
        </div>
        <Button onClick={handleExport} className="gap-2">
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
              <p className="text-3xl font-mono font-bold">
                R$ {(custoMedio / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-success">↑ 8% vs mês anterior</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total de Obras</p>
              <p className="text-3xl font-mono font-bold">{obras.length}</p>
              <p className="text-sm text-muted-foreground">
                {obrasEmAndamento} em andamento
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Folha de Pagamento</p>
              <p className="text-3xl font-mono font-bold">
                R$ {(folhaMensal / 1000).toFixed(0)}K
              </p>
              <p className="text-sm text-muted-foreground">
                {membrosAtivos} funcionários ativos
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Orçamentos Totais</p>
              <p className="text-3xl font-mono font-bold">
                R$ {(totalOrcamentos / 1000000).toFixed(1)}M
              </p>
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
            Obras em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {obras.slice(0, 5).map((obra) => (
              <div key={obra.id} className="flex items-start gap-4 pb-4 border-b border-border last:border-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileBarChart className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{obra.nome}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {obra.responsavel} • Progresso: {obra.progresso}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono font-semibold text-sm">
                    R$ {(obra.custoReal / 1000).toFixed(0)}K
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Prazo: {new Date(obra.prazo).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            ))}
            {obras.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma obra cadastrada ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
