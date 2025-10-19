import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Orcamento } from "@/hooks/useOrcamentos";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const formatCurrency = (value: number) => currencyFormatter.format(value ?? 0);

const nextTableStart = (doc: jsPDF, offset = 10) =>
  ((doc as unknown as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 34) + offset;

export const generateOrcamentoPdf = async (orcamento: Orcamento) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Orçamento - ${orcamento.nomeObra}`, 14, 20);
  doc.setFontSize(10);
  doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 28);

  autoTable(doc, {
    startY: 34,
    head: [["Campo", "Valor"]],
    body: [
      ["Tipo de obra", orcamento.tipoObra],
      ["Área", `${orcamento.area} m²`],
      ["Status", orcamento.status],
      ["Responsável técnico", orcamento.responsavelTecnico],
      ["Localização", orcamento.localizacao],
      ["Data de emissão", orcamento.dataEmissao],
    ],
    theme: "striped",
    headStyles: { fillColor: [249, 115, 22] },
  });

  if (orcamento.etapas.length > 0) {
    autoTable(doc, {
      startY: nextTableStart(doc),
      head: [["Etapa", "Responsável", "Início", "Término", "Custo previsto"]],
      body: orcamento.etapas.map((etapa) => [
        etapa.nome || "-",
        etapa.responsavel || "-",
        etapa.inicioPrevisto
          ? new Date(etapa.inicioPrevisto).toLocaleDateString("pt-BR")
          : "-",
        etapa.fimPrevisto
          ? new Date(etapa.fimPrevisto).toLocaleDateString("pt-BR")
          : "-",
        formatCurrency(Number(etapa.custoPrevisto ?? 0)),
      ]),
      theme: "striped",
    });
  }

  autoTable(doc, {
    startY: nextTableStart(doc),
    head: [["Categoria", "Valor"]],
    body: [
      ["Custo base", formatCurrency(orcamento.custoBase)],
      ["Insumos", formatCurrency(orcamento.custoInsumos)],
      ["Mão de obra", formatCurrency(orcamento.custoMaoObra)],
      ["Transporte", formatCurrency(orcamento.custoTransporte)],
      ["Etapas planejadas", formatCurrency(orcamento.custoEtapas)],
      ["Despesas extras", formatCurrency(orcamento.custoDespesasExtras)],
      ["Subtotal", formatCurrency(orcamento.subtotal)],
      ["Lucro", formatCurrency(orcamento.lucro)],
      ["Impostos", formatCurrency(orcamento.valorImpostos)],
      ["Custo total", formatCurrency(orcamento.custoTotal)],
      ["Custo final por m²", formatCurrency(orcamento.custoPorM2Final)],
    ],
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] },
  });

  if (orcamento.insumos.length > 0) {
    autoTable(doc, {
      startY: nextTableStart(doc),
      head: [["Material", "Unidade", "Quantidade", "Valor unitário", "Fornecedor"]],
      body: orcamento.insumos.map((item) => [
        item.descricao,
        item.unidade,
        item.quantidade.toString(),
        formatCurrency(item.valorUnitario),
        item.fornecedor ?? "-",
      ]),
      theme: "striped",
    });
  }

  if (orcamento.maoDeObra.length > 0) {
    autoTable(doc, {
      startY: nextTableStart(doc),
      head: [["Função", "Quantidade", "Custo diário", "Duração (dias)", "Custo total"]],
      body: orcamento.maoDeObra.map((item) => [
        item.funcao,
        item.quantidade.toString(),
        formatCurrency(item.custoDiario),
        item.duracao.toString(),
        formatCurrency(item.quantidade * item.custoDiario * item.duracao),
      ]),
      theme: "striped",
    });
  }

  if (orcamento.despesasExtras.length > 0) {
    autoTable(doc, {
      startY: nextTableStart(doc),
      head: [["Categoria", "Valor", "Observações"]],
      body: orcamento.despesasExtras.map((item) => [
        item.categoria,
        formatCurrency(item.valor),
        item.observacoes ?? "-",
      ]),
      theme: "striped",
    });
  }

  if (orcamento.observacoesTecnicas) {
    const startY = nextTableStart(doc);
    doc.setFontSize(12);
    doc.text("Observações Técnicas", 14, startY);
    doc.setFontSize(10);
    const maxWidth = 182;
    const lines = doc.splitTextToSize(orcamento.observacoesTecnicas, maxWidth);
    doc.text(lines, 14, startY + 6);
  }

  const fileName = `orcamento-${orcamento.nomeObra
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")}-${new Date()
    .toISOString()
    .split("T")[0]}.pdf`;

  doc.save(fileName);
};

