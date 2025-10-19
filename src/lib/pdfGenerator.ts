import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Obra } from "@/hooks/useObras";
import { Lancamento } from "@/hooks/useFinanceiro";
import { Membro } from "@/hooks/useEquipes";

export const generatePDF = async (
  obras: Obra[],
  lancamentos: Lancamento[],
  membros: Membro[]
) => {
  const doc = new jsPDF();

  doc.text("Relatório Geral da Construtora", 14, 20);
  doc.setFontSize(10);
  doc.text(`Data de Emissão: ${new Date().toLocaleDateString()}`, 14, 26);

  // Resumo Financeiro
  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita")
    .reduce((acc, l) => acc + l.valor, 0);
  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa")
    .reduce((acc, l) => acc + l.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  autoTable(doc, {
    startY: 35,
    head: [["Resumo Financeiro", "Valor (R$)"]],
    body: [
      ["Total de Receitas", totalReceitas.toLocaleString("pt-BR")],
      ["Total de Despesas", totalDespesas.toLocaleString("pt-BR")],
      ["Saldo Atual", saldo.toLocaleString("pt-BR")],
    ],
    theme: "striped",
    headStyles: { fillColor: [22, 163, 74] },
  });

  // Resumo de Obras
  const obrasEmAndamento = obras.filter(
    (o) => o.status === "em_andamento"
  ).length;
  const obrasConcluidas = obras.filter((o) => o.status === "concluida").length;

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Resumo de Obras", "Quantidade"]],
    body: [
      ["Total de Obras", obras.length],
      ["Obras em Andamento", obrasEmAndamento],
      ["Obras Concluídas", obrasConcluidas],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
  });

  // Tabela de Obras
  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 10,
    head: [["Obra", "Status", "Progresso (%)", "Custo Previsto", "Custo Real"]],
    body: obras.map((o) => [
      o.nome,
      o.status,
      o.progresso,
      o.custo_previsto?.toLocaleString("pt-BR") || "N/A",
      o.custo_real?.toLocaleString("pt-BR") || "N/A",
    ]),
    theme: "striped",
  });

  doc.save(`relatorio-geral-${new Date().toISOString().split("T")[0]}.pdf`);
};

