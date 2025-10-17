import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCard from "@/components/dashboard/StatCard";

export default function Financeiro() {
  const {
    lancamentos,
    isLoading,
    addLancamento,
    updateLancamento,
    deleteLancamento,
    resumoFinanceiro,
  } = useFinanceiro();
  const { obras } = useObras();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [lancamentoSelecionado, setLancamentoSelecionado] = useState<
    Lancamento | undefined
  >(undefined);
  const [filter, setFilter] = useState("todos");

  const handleOpenDialog = (lancamento?: Lancamento) => {
    setLancamentoSelecionado(lancamento);
    setIsDialogOpen(true);
  };

  const handleSave = (
    dados: NewLancamento | (Partial<NewLancamento> & { id: string })
  ) => {
    if ("id" in dados && dados.id) {
      updateLancamento(dados as { id: string } & Partial<NewLancamento>);
    } else {
      addLancamento(dados as NewLancamento);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteLancamento(id);
  };

  const lancamentosFiltrados = useMemo(() => {
    if (filter === "todos") return lancamentos;
    return lancamentos.filter((l) => l.tipo === filter);
  }, [lancamentos, filter]);

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
                      <TableCell colSpan={6}>
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
                              onClick={() => handleDelete(lancamento.id)}
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
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum lançamento encontrado para este filtro.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Tabs>

      {isDialogOpen && (
        <LancamentoDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          lancamento={lancamentoSelecionado}
          obras={obras as Obra[]}
        />
      )}
    </div>
  );
}
