import { FileText, Download, Edit, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { OrcamentoDialog } from "@/components/orcamentos/OrcamentoDialog";
import { generatePDF } from "@/lib/pdfGenerator";

export default function Orcamentos() {
  const { orcamentos, addOrcamento, updateOrcamento, deleteOrcamento, custoPorM2Padrao } = useOrcamentos();

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: "secondary",
      aprovado: "default",
      revisao: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const handleExportPDF = (id: string) => {
    const orcamento = orcamentos.find(o => o.id === id);
    if (orcamento) {
      generatePDF(orcamento);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orçamentos</h1>
          <p className="text-muted-foreground">Gerencie orçamentos detalhados de obras</p>
        </div>
        <OrcamentoDialog onSave={addOrcamento} custoPorM2Padrao={custoPorM2Padrao} trigger={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        } />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orçamentos Recentes</CardTitle>
          <CardDescription>Visualize e gerencie todos os orçamentos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orcamentos.map((orcamento) => (
              <div
                key={orcamento.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{orcamento.nomeObra}</h3>
                      {getStatusBadge(orcamento.status)}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{orcamento.dataEmissao}</span>
                      <span>•</span>
                      <span>{orcamento.area} m²</span>
                      <span>•</span>
                      <span>{orcamento.tipoObra}</span>
                      <span>•</span>
                      <span className="font-semibold text-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(orcamento.custoTotal)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExportPDF(orcamento.id)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <OrcamentoDialog
                    orcamento={orcamento}
                    onSave={(dados) => updateOrcamento(orcamento.id, dados)}
                    custoPorM2Padrao={custoPorM2Padrao}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Orçamento</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir este orçamento? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteOrcamento(orcamento.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {orcamentos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento cadastrado</p>
                <p className="text-sm">Clique em "Novo Orçamento" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
