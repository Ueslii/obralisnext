import { useState } from "react";
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
import { MoreHorizontal, PlusCircle, Users, DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MembroDialog } from "@/components/equipes/MembroDialog";
import { useEquipes, Membro, NewMembro } from "@/hooks/useEquipes";
import { Skeleton } from "@/components/ui/skeleton";
import StatCard from "@/components/dashboard/StatCard";

export default function Equipes() {
  const {
    membros,
    isLoading,
    addMembro,
    updateMembro,
    deleteMembro,
    calcularFolhaPagamento,
  } = useEquipes();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState<
    Membro | undefined
  >(undefined);

  const handleOpenDialog = (membro?: Membro) => {
    setMembroSelecionado(membro);
    setIsDialogOpen(true);
  };

  const handleSave = (
    dados: NewMembro | (Partial<Membro> & { id: string })
  ) => {
    if ("id" in dados && dados.id) {
      updateMembro(dados as { id: string } & Partial<Membro>);
    } else {
      addMembro(dados as NewMembro);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMembro(id);
  };

  const folhaPagamento = calcularFolhaPagamento();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Equipes</h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Novo Membro
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <StatCard
          title="Membros Ativos"
          value={`${membros.filter((m) => m.status === "ativo").length}`}
          icon={Users}
          isLoading={isLoading}
          description="Total de membros na equipe"
        />
        <StatCard
          title="Custo Mensal (Folha)"
          value={`R$ ${folhaPagamento.toLocaleString("pt-BR")}`}
          icon={DollarSign}
          isLoading={isLoading}
          description="Estimativa de custo mensal com a equipe"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membros da Equipe</CardTitle>
          <CardDescription>Gerencie os membros da sua equipe.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor/Hora</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : membros.length > 0 ? (
                membros.map((membro) => (
                  <TableRow key={membro.id}>
                    <TableCell className="font-medium">{membro.nome}</TableCell>
                    <TableCell>{membro.funcao}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          membro.status === "ativo" ? "success" : "secondary"
                        }
                      >
                        {membro.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      R$ {membro.valor_hora.toLocaleString("pt-BR")}
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
                            onClick={() => handleOpenDialog(membro)}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(membro.id)}
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
                  <TableCell colSpan={5} className="h-24 text-center">
                    Nenhum membro encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {isDialogOpen && (
        <MembroDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          membro={membroSelecionado}
        />
      )}
    </div>
  );
}
