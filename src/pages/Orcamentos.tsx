import { useState } from "react";
import {
  FileText,
  Download,
  Edit,
  Trash2,
  Plus,
  Building,
  RefreshCw,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrcamentos } from "@/hooks/useOrcamentos";
import type { Orcamento } from "@/hooks/useOrcamentos";
import { OrcamentoDialog } from "@/components/orcamentos/OrcamentoDialog";
export default function Orcamentos() {
  const {
    orcamentos,
    addOrcamento,
    updateOrcamento,
    deleteOrcamento,
    sendToObra,
    createRevision,
    custoPorM2Padrao,
    isLoading,
  } = useOrcamentos();
  const [reviewOrcamento, setReviewOrcamento] = useState<Orcamento | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [isReviewSending, setIsReviewSending] = useState(false);

  const closeReviewDialog = () => {
    setReviewOpen(false);
    setReviewOrcamento(null);
    setIsReviewSending(false);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      rascunho: "secondary",
      aprovado: "default",
      revisao: "outline",
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const handleExportPDF = async (id: string) => {
    const orcamento = orcamentos.find(o => o.id === id);
    if (orcamento) {
      const { generateOrcamentoPdf } = await import("@/lib/orcamentoPdf");
      await generateOrcamentoPdf(orcamento);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{"Or\u00e7amentos"}</h1>
          <p className="text-muted-foreground">
            {"Gerencie or\u00e7amentos detalhados de obras"}
          </p>
        </div>
        <OrcamentoDialog
          onSave={addOrcamento}
          custoPorM2Padrao={custoPorM2Padrao}
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {"Novo Or\u00e7amento"}
            </Button>
          }
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{"Or\u00e7amentos Recentes"}</CardTitle>
          <CardDescription>
            {"Visualize e gerencie todos os or\u00e7amentos"}
          </CardDescription>
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
                    disabled={orcamento.status === "aprovado" || Boolean(orcamento.obraId)}
                    onClick={() => {
                      void sendToObra(orcamento.id);
                    }}
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Enviar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReviewOrcamento({
                        ...orcamento,
                        status: "revisao",
                      });
                      setReviewOpen(true);
                      void createRevision(orcamento.id);
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Revisao
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void handleExportPDF(orcamento.id);
                    }}
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
                      <AlertDialogTitle>{"Excluir Or\u00e7amento"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {"Tem certeza que deseja excluir este or\u00e7amento? Esta a\u00e7\u00e3o n\u00e3o pode ser desfeita."}
                      </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { void deleteOrcamento(orcamento.id); }}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}

            {!isLoading && orcamentos.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{"Nenhum or\u00e7amento cadastrado"}</p>
                <p className="text-sm">
                  {"Clique em \"Novo Or\u00e7amento\" para come\u00e7ar"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {reviewOrcamento ? (
        <Dialog
          open={reviewOpen}
          onOpenChange={(open) => {
            if (open) {
              setReviewOpen(true);
            } else {
              closeReviewDialog();
            }
          }}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{"Revisar or\u00e7amento"}</DialogTitle>
              <DialogDescription>
                {"Confira os principais dados antes de enviar para obras."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              <section className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  {"Informa\u00e7\u00f5es gerais"}
                </h3>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between"><dt className="font-semibold">Obra</dt><dd className="text-right">{reviewOrcamento.nomeObra}</dd></div>
                  <div className="flex justify-between"><dt className="font-semibold">Tipo</dt><dd className="text-right capitalize">{reviewOrcamento.tipoObra}</dd></div>
                  <div className="flex justify-between"><dt className="font-semibold">{"\u00c1rea"}</dt><dd className="text-right">{reviewOrcamento.area} m\u00b2</dd></div>
                  <div className="flex justify-between"><dt className="font-semibold">{"Respons\u00e1vel"}</dt><dd className="text-right">{reviewOrcamento.responsavelTecnico}</dd></div>
                  <div className="flex justify-between"><dt className="font-semibold">Status</dt><dd className="text-right capitalize">{reviewOrcamento.status}</dd></div>
                </dl>
              </section>
              <section className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Resumo financeiro</h3>
                <dl className="grid gap-2 text-sm">
                  <div className="flex justify-between"><dt>Custo base</dt><dd>{reviewOrcamento.custoBase.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                  <div className="flex justify-between"><dt>Insumos</dt><dd>{reviewOrcamento.custoInsumos.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                  <div className="flex justify-between"><dt>{"M\u00e3o de obra"}</dt><dd>{reviewOrcamento.custoMaoObra.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                  <div className="flex justify-between"><dt>Transporte</dt><dd>{reviewOrcamento.custoTransporte.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                  <div className="flex justify-between"><dt>Despesas extras</dt><dd>{reviewOrcamento.custoDespesasExtras.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                  <div className="flex justify-between font-semibold"><dt>Total previsto</dt><dd>{reviewOrcamento.custoTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</dd></div>
                </dl>
              </section>
              {reviewOrcamento.etapas?.length ? (
                <section className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Etapas planejadas</h3>
                  <div className="space-y-2 text-sm">
                    {reviewOrcamento.etapas.map((etapa) => (
                      <div key={etapa.id ?? etapa.nome} className="rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{etapa.nome}</span>
                          {etapa.custoPrevisto ? (
                            <span>{etapa.custoPrevisto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                          ) : null}
                        </div>
                        {etapa.descricao ? (
                          <p className="text-muted-foreground mt-1">{etapa.descricao}</p>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" disabled={isReviewSending} onClick={closeReviewDialog}>
                Fechar
              </Button>
              <Button
                type="button"
                onClick={async () => {
                  if (!reviewOrcamento) return;
                  setIsReviewSending(true);
                  try {
                    await sendToObra(reviewOrcamento.id);
                    closeReviewDialog();
                  } finally {
                    setIsReviewSending(false);
                  }
                }}
                disabled={isReviewSending}
              >
                {isReviewSending ? 'Enviando...' : 'Enviar para obras'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
