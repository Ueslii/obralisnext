import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Orcamento } from '@/hooks/useOrcamentos';

export const generatePDF = (orcamento: Orcamento) => {
  const doc = new jsPDF();
  
  // Cabeçalho
  doc.setFontSize(20);
  doc.text('Obralis', 105, 15, { align: 'center' });
  doc.setFontSize(16);
  doc.text('Orçamento de Obra', 105, 25, { align: 'center' });
  
  // Informações Gerais
  doc.setFontSize(12);
  doc.text(`Obra: ${orcamento.nomeObra}`, 20, 40);
  doc.text(`Tipo: ${orcamento.tipoObra}`, 20, 47);
  doc.text(`Área: ${orcamento.area} m²`, 20, 54);
  doc.text(`Responsável: ${orcamento.responsavelTecnico}`, 20, 61);
  doc.text(`Data: ${orcamento.dataEmissao}`, 140, 40);
  doc.text(`Status: ${orcamento.status}`, 140, 47);
  
  let yPos = 75;
  
  // Tabela de Insumos
  if (orcamento.insumos.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Insumo', 'Unid.', 'Qtd', 'Vlr Unit.', 'Total']],
      body: orcamento.insumos.map(i => [
        i.descricao,
        i.unidade,
        i.quantidade.toString(),
        `R$ ${i.valorUnitario.toFixed(2)}`,
        `R$ ${(i.quantidade * i.valorUnitario).toFixed(2)}`
      ]),
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Tabela de Mão de Obra
  if (orcamento.maoDeObra.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Função', 'Qtd', 'Custo/Dia', 'Dias', 'Total']],
      body: orcamento.maoDeObra.map(m => [
        m.funcao,
        m.quantidade.toString(),
        `R$ ${m.custoDiario.toFixed(2)}`,
        m.duracao.toString(),
        `R$ ${(m.quantidade * m.custoDiario * m.duracao).toFixed(2)}`
      ]),
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }
  
  // Resumo Financeiro
  doc.setFontSize(14);
  doc.text('Resumo Financeiro', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  const resumo = [
    ['Custo Base', `R$ ${orcamento.custoBase.toFixed(2)}`],
    ['Insumos', `R$ ${orcamento.custoInsumos.toFixed(2)}`],
    ['Mão de Obra', `R$ ${orcamento.custoMaoObra.toFixed(2)}`],
    ['Transporte', `R$ ${orcamento.custoTransporte.toFixed(2)}`],
    ['Despesas Extras', `R$ ${orcamento.custoDespesasExtras.toFixed(2)}`],
    ['Subtotal', `R$ ${orcamento.subtotal.toFixed(2)}`],
    ['Lucro', `R$ ${orcamento.lucro.toFixed(2)}`],
    ['Impostos', `R$ ${orcamento.valorImpostos.toFixed(2)}`],
  ];
  
  resumo.forEach(([label, valor]) => {
    doc.text(label, 20, yPos);
    doc.text(valor, 120, yPos);
    yPos += 7;
  });
  
  // Total Final
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 20, yPos + 5);
  doc.text(`R$ ${orcamento.custoTotal.toFixed(2)}`, 120, yPos + 5);
  
  // Rodapé
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gerado por Obralis', 105, 285, { align: 'center' });
  
  doc.save(`Orcamento_${orcamento.nomeObra.replace(/\s/g, '_')}.pdf`);
};
