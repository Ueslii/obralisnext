import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ObraDialog } from "@/components/obras/ObraDialog";
import { useObras, Obra, NewObra } from "@/hooks/useObras";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Obras() {
  const {
    obras,
    isLoading,
    addObra,
    updateObra,
    deleteObra,
    addObraPending,
    updateObraPending,
    deleteObraPending,
  } = useObras();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [obraSelecionada, setObraSelecionada] = useState<Obra | undefined>(
    undefined
  );

  const handleOpenDialog = (obra?: Obra) => {
    setObraSelecionada(obra);
    setIsDialogOpen(true);
  };

  const handleSave = async (
    dados: NewObra | (Partial<Obra> & { id: string })
  ) => {
    try {
      if ("id" in dados && dados.id) {
        await updateObra(dados as { id: string } & Partial<Obra>);
      } else {
        await addObra(dados as NewObra);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erro ao salvar obra:", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteObra(id);
    } catch (error) {
      console.error("Erro ao excluir obra:", error);
    }
  };

  const statusMap: { [key: string]: string } = {
    planejada: "Planejada",
    em_andamento: "Em Andamento",
    concluida: "Concluída",
    atrasada: "Atrasada",
  };

  const renderTable = (filteredObras: Obra[]) => (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Obras</CardTitle>
        <CardDescription>
          Visualize e gerencie todas as suas obras.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Endereço</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Prazo</TableHead>
              <TableHead>Progresso</TableHead>
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
            ) : filteredObras.length > 0 ? (
              filteredObras.map((obra) => (
                <TableRow
                  key={obra.id}
                  onClick={() => navigate(`/obras/${obra.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{obra.nome}</TableCell>
                  <TableCell>{obra.endereco}</TableCell>
                  <TableCell>
                    <Badge>{statusMap[obra.status] || obra.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {obra.prazo
                      ? new Date(obra.prazo).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{obra.progresso}%</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleOpenDialog(obra)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => navigate(`/obras/${obra.id}`)}
                        >
                          Ver Detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          disabled={deleteObraPending}
                          onClick={() => {
                            void handleDelete(obra.id);
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
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma obra encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Gerenciamento de Obras
        </h2>
        <Button onClick={() => handleOpenDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" /> Criar Nova Obra
        </Button>
      </div>

      <Tabs defaultValue="todas">
        <TabsList>
          <TabsTrigger value="todas">Todas</TabsTrigger>
          <TabsTrigger value="em_andamento">Em Andamento</TabsTrigger>
          <TabsTrigger value="concluidas">Concluídas</TabsTrigger>
        </TabsList>

        <TabsContent value="todas">{renderTable(obras)}</TabsContent>
        <TabsContent value="em_andamento">
          {renderTable(obras.filter((o) => o.status === "em_andamento"))}
        </TabsContent>
        <TabsContent value="concluidas">
          {renderTable(obras.filter((o) => o.status === "concluida"))}
        </TabsContent>
      </Tabs>

      {isDialogOpen && (
        <ObraDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSave={handleSave}
          obra={obraSelecionada}
          isSubmitting={addObraPending || updateObraPending}
        />
      )}
    </div>
  );
}
