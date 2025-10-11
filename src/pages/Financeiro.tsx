import { DollarSign, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Edit, Trash2, Building2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useObras } from "@/hooks/useObras";
import { LancamentoDialog } from "@/components/financeiro/LancamentoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Financeiro() {
  const { lancamentos, addLancamento, updateLancamento, deleteLancamento, getResumoFinanceiro, getDespesasPorCategoria } = useFinanceiro();
  const { obras } = useObras();
  const { totalDespesas, totalReceitas, saldo } = getResumoFinanceiro();
  const despesasPorCategoria = getDespesasPorCategoria();
  const margemLucro = totalReceitas > 0 ? ((saldo / totalReceitas) * 100).toFixed(1) : '0';

  // Calcular gastos por obra
  const gastosPorObra = obras.map(obra => {
    const lancamentosObra = lancamentos.filter(l => l.obraId === obra.id && l.tipo === 'despesa');
    const total = lancamentosObra.reduce((sum, l) => sum + l.valor, 0);
    return { nome: obra.nome, total, id: obra.id };
  }).filter(g => g.total > 0).sort((a, b) => b.total - a.total);

  const categoriasLabels: Record<string, string> = {
    materiais: 'Materiais',
    alimentacao: 'Alimentação',
    combustivel: 'Combustível',
    extras: 'Extras',
    pagamento: 'Pagamento',
    outros: 'Outros',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">💰 Financeiro</h1>
          <p className="text-muted-foreground">Controle completo de receitas, despesas e fluxo de caixa</p>
        </div>
        <LancamentoDialog onSave={addLancamento} />
      </div>

      {/* Resumo Financeiro */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-success">R$ {totalReceitas.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">R$ {totalDespesas.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${saldo >= 0 ? 'text-success' : 'text-destructive'}`}>
              R$ {saldo.toLocaleString('pt-BR')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem de Lucro</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold font-mono ${parseFloat(margemLucro) >= 0 ? 'text-success' : 'text-destructive'}`}>
              {margemLucro}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Despesas por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(despesasPorCategoria).map(([categoria, valor]) => (
                <div key={categoria} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{categoriasLabels[categoria]}</span>
                  <span className="font-mono font-semibold">R$ {valor.toLocaleString('pt-BR')}</span>
                </div>
              ))}
              {Object.keys(despesasPorCategoria).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gastos por Obra */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Gastos por Obra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {gastosPorObra.map((obra) => (
                <div key={obra.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{obra.nome}</span>
                  <span className="font-mono font-semibold text-destructive">R$ {obra.total.toLocaleString('pt-BR')}</span>
                </div>
              ))}
              {gastosPorObra.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma despesa registrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lançamentos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Lançamentos Recentes
          </CardTitle>
          <CardDescription>Histórico de receitas e despesas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lancamentos.slice(0, 10).map((lanc) => (
              <div key={lanc.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    lanc.tipo === 'receita' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {lanc.tipo === 'receita' ? (
                      <ArrowUpRight className="h-5 w-5 text-success" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{lanc.descricao}</p>
                      <Badge variant="outline" className="text-xs">
                        {categoriasLabels[lanc.categoria]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {lanc.nomeObra} • {new Date(lanc.data).toLocaleDateString('pt-BR')}
                      {lanc.etapa && ` • ${lanc.etapa}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p className={`font-mono font-semibold text-lg ${
                    lanc.tipo === 'receita' ? 'text-success' : 'text-destructive'
                  }`}>
                    {lanc.tipo === 'receita' ? '+' : '-'} R$ {lanc.valor.toLocaleString('pt-BR')}
                  </p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <LancamentoDialog 
                      lancamento={lanc} 
                      onSave={(dados) => updateLancamento(lanc.id, dados)} 
                      trigger={<Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>} 
                    />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteLancamento(lanc.id)} className="bg-destructive">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
            {lancamentos.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum lançamento registrado
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
