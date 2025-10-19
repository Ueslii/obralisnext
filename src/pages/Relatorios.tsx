import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";
import { useObras } from "@/hooks/useObras";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { useEquipes } from "@/hooks/useEquipes";

export default function Relatorios() {
  const { obras, isLoading: isLoadingObras } = useObras();
  const {
    lancamentos,
    resumoFinanceiro,
    isLoading: isLoadingFinanceiro,
  } = useFinanceiro();
  const {
    membros,
    calcularFolhaPagamento,
    isLoading: isLoadingEquipes,
  } = useEquipes();

  const handleGenerateReport = async () => {
    if (isLoadingObras || isLoadingFinanceiro || isLoadingEquipes) {
      alert(
        "Aguarde o carregamento de todos os dados antes de gerar o relatório."
      );
      return;
    }
    const { generatePDF } = await import("@/lib/pdfGenerator");
    await generatePDF(obras, lancamentos, membros);
  };

  const isLoading = isLoadingObras || isLoadingFinanceiro || isLoadingEquipes;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={handleGenerateReport} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? "Carregando dados..." : "Gerar Relatório em PDF"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total de Receitas:</span>
              <span className="font-bold text-green-600">
                R$ {resumoFinanceiro.totalReceitas.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Total de Despesas:</span>
              <span className="font-bold text-red-600">
                R$ {resumoFinanceiro.totalDespesas.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span>Saldo Atual:</span>
              <span className="font-bold">
                R$ {resumoFinanceiro.saldo.toLocaleString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Obras</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total de Obras:</span>
              <span className="font-bold">{obras.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Obras em Andamento:</span>
              <span className="font-bold">
                {obras.filter((o) => o.status === "em_andamento").length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Obras Concluídas:</span>
              <span className="font-bold">
                {obras.filter((o) => o.status === "concluida").length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo de Equipes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Total de Membros:</span>
              <span className="font-bold">{membros.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Custo Mensal (Folha):</span>
              <span className="font-bold">
                R$ {calcularFolhaPagamento().toLocaleString("pt-BR")}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

