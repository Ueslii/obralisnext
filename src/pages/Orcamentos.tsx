import { Calculator, FileText, DollarSign, TrendingUp, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import { OrcamentoDialog } from "@/components/orcamentos/OrcamentoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Orcamentos() {
  const { orcamentos, addOrcamento, updateOrcamento, deleteOrcamento } = useOrcamentos();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Orçamentos</h1>
          <p className="text-muted-foreground">Calcule custos e gere orçamentos detalhados</p>
        </div>
        <OrcamentoDialog onSave={addOrcamento} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Orçamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {orcamentos.map((orc) => (
              <div key={orc.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium">{orc.nomeObra}</p>
                    <Badge variant={orc.status === 'aprovado' ? 'default' : orc.status === 'rascunho' ? 'outline' : 'secondary'}>
                      {orc.status === 'aprovado' ? 'Aprovado' : orc.status === 'rascunho' ? 'Rascunho' : 'Revisão'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(orc.dataEmissao).toLocaleDateString('pt-BR')} • {orc.area}m² • {orc.itens.length} etapas
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono font-semibold text-lg">R$ {orc.custoTotal.toLocaleString('pt-BR')}</p>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <OrcamentoDialog orcamento={orc} onSave={(dados) => updateOrcamento(orc.id, dados)} trigger={<Button size="sm" variant="outline"><Edit className="h-3 w-3" /></Button>} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteOrcamento(orc.id)} className="bg-destructive">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
