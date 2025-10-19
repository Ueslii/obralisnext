import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  useFinanceiro,
  Lancamento,
  NewLancamento,
} from "@/hooks/useFinanceiro";
import { LancamentoDialog } from "@/components/financeiro/LancamentoDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useObras, Obra } from "@/hooks/useObras";
import { useEquipes } from "@/hooks/useEquipes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";

export default function Financeiro() {
  const {
    lancamentos,
    isLoading,
    addLancamento,
    addLancamentoPending,
    updateLancamento,
    updateLancamentoPending,
    deleteLancamento,
    deleteLancamentoPending,
    resumoFinanceiro,
  } = useFinanceiro();
  const { obras } = useObras();
  const { membros: membrosEquipe, isLoading: isLoadingMembros } = useEquipes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<
    Lancamento | undefined
  >(undefined);
  const [filter, setFilter] = useState("todos");

  const handleOpenDialog = (lancamento?: Lancamento) => {
    setLancamentoSelecionado(lancamento);
    setIsDialogOpen(true);
  };

  const handleSave = async (
    dados: NewLancamento | (Partial<NewLancamento> & { id: string })
  ) => {
    try {
      if ("id" in dados && dados.id) {
        await updateLancamento(dados as { id: string } & Partial<NewLancamento>);
      } else {
        await addLancamento(dados as NewLancamento);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar lançamento:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLancamento(id);
    } catch (error) {
      console.error("Erro ao excluir lançamento:", error);
    }
  };

  const lancamentosFiltrados = useMemo(() => {
    if (filter === "todos") return lancamentos;
    return lancamentos.filter((l) => l.tipo === filter);
  }, [lancamentos, filter]);

  const extrasPorMembro = useMemo(() => {
    const mapa = new Map<string, number>();
    lancamentos
      .filter(
        (lancamento) =>
          lancamento.categoria === "hora_extra" && !!lancamento.membro_id
      )
      .forEach((lancamento) => {
        if (!lancamento.membro_id) return;
        mapa.set(
          lancamento.membro_id,
          (mapa.get(lancamento.membro_id) ?? 0) + lancamento.valor
        );
      });
    return mapa;
  }, [lancamentos]);

  const folhaPagamento = useMemo(
    () =>
      membrosEquipe
        .map((membro) => {
          const valorHora = membro.valor_hora ?? 0;
          const horasBase = 160;
          const base = valorHora * horasBase;
          const extras = extrasPorMembro.get(membro.id) ?? 0;

          return {
            membro,
            base,
            extras,
            total: base + extras,
          };
        })
        .sort((a, b) => a.membro.nome.localeCompare(b.membro.nome)),
    [membrosEquipe, extrasPorMembro]
  );

  const totaisFolha = useMemo(
    () =>
      folhaPagamento.reduce(
        (acumulado, item) => ({
          base: acumulado.base + item.base,
          extras: acumulado.extras + item.extras,
          total: acumulado.total + item.total,
        }),
        { base: 0, extras: 0, total: 0 }
      ),
    [folhaPagamento]
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Lançamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total de Receitas"
          value={`R$ ${resumoFinanceiro.totalReceitas.toLocaleString("pt-BR")}`}
          icon={TrendingUp}
          description=""
          isLoading={isLoading}
        />
        <StatCard
          title="Total de Despesas"
          value={`R$ ${resumoFinanceiro.totalDespesas.toLocaleString("pt-BR")}`}
          icon={TrendingDown}
          description=""
          isLoading={isLoading}
        />
        <StatCard
          title="Saldo Atual"
          value={`R$ ${resumoFinanceiro.saldo.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          description=""
          isLoading={isLoading}
        />
      </div>

      <Tabs defaultValue="todos" onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="receita">Receitas</TabsTrigger>
          <TabsTrigger value="despesa">Despesas</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Lançamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={7}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : lancamentosFiltrados.length > 0 ? (
                  lancamentosFiltrados.map((lancamento) => (
                    <TableRow key={lancamento.id}>
                      <TableCell className="font-medium">
                        {lancamento.obras?.nome || "Geral"}
                      </TableCell>
                      <TableCell>{lancamento.descricao}</TableCell>
                      <TableCell>
                        {lancamento.categoria === "hora_extra" ? (
                          lancamento.membros ? (
                            <span className="font-medium text-foreground">
                              {lancamento.membros.nome}
                            </span>
                          ) : (
                            <Badge variant="destructive">Não vinculado</Badge>
                          )
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            lancamento.tipo === "receita"
                              ? "success"
                              : "destructive"
                          }
                        >
                          {lancamento.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        R$ {lancamento.valor.toLocaleString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        {new Date(lancamento.data).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleOpenDialog(lancamento)}
                            >
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              disabled={deleteLancamentoPending}
                              onClick={() => {
                                void handleDelete(lancamento.id);
                              }}
                            >
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhum lançamento encontrado para este filtro.
                      </TableCell>
                    </TableRow>
                  )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <CardTitle>Folha de pagamento</CardTitle>
              <CardDescription>
                Valores estimados considerando 160 horas mensais por colaborador
                e lançamentos de hora extra registrados no financeiro.
              </CardDescription>
            </div>
            <Badge variant="outline">
              Total:{" "}
              {totaisFolha.total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingMembros ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-full" />
              ))}
            </div>
          ) : folhaPagamento.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum colaborador cadastrado. Adicione membros em <strong>Equipes</strong> para acompanhar a folha de pagamento.
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Valor/Hora</TableHead>
                    <TableHead>Base (160h)</TableHead>
                    <TableHead>Horas extras</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {folhaPagamento.map((item) => {
                    const valorHora = item.membro.valor_hora ?? 0;
                    return (
                      <TableRow key={item.membro.id}>
                        <TableCell className="font-medium">
                          {item.membro.nome}
                        </TableCell>
                        <TableCell>{item.membro.funcao ?? "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              item.membro.status === "ativo"
                                ? "success"
                                : "secondary"
                            }
                          >
                            {item.membro.status ?? "Sem status"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          R${" "}
                          {valorHora.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          R${" "}
                          {item.base.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          {item.extras > 0 ? (
                            <>
                              R${" "}
                              {item.extras.toLocaleString("pt-BR", {
                                minimumFractionDigits: 2,
                              })}
                            </>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          R${" "}
                          {item.total.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center gap-6 text-sm">
                <span>
                  Base salarial:{" "}
                  <strong>
                    {totaisFolha.base.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </span>
                <span>
                  Total horas extras:{" "}
                  <strong>
                    {totaisFolha.extras.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </span>
                <span>
                  Folha projetada:{" "}
                  <strong>
                    {totaisFolha.total.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </strong>
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {isDialogOpen && (
        <LancamentoDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          lancamento={lancamentoSelecionado}
          isSubmitting={
            addLancamentoPending || updateLancamentoPending || deleteLancamentoPending
          }
          obras={obras as Obra[]}
          membros={membrosEquipe}
        />
      )}
    </div>
  );
}
