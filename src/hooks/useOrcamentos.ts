import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Insumo {
  id: string;
  descricao: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  fornecedor?: string;
  prazo?: string;
}

export interface MaoDeObra {
  id: string;
  funcao: string;
  quantidade: number;
  custoDiario: number;
  duracao: number;
}

export interface DespesaExtra {
  id: string;
  categoria: string;
  valor: number;
  observacoes?: string;
}

export interface Transporte {
  distancia: number;
  consumo: number;
  precoGasolina: number;
  viagensSemana: number;
  duracaoSemanas: number;
  pedagios: number;
}

export interface Orcamento {
  id: string;
  nomeObra: string;
  tipoObra: 'residencial' | 'comercial' | 'industrial' | 'reforma' | 'infraestrutura';
  area: number;
  localizacao: string;
  status: 'rascunho' | 'aprovado' | 'revisao';
  responsavelTecnico: string;
  dataEmissao: string;
  
  // Dados de cálculo
  custoPorM2: number;
  insumos: Insumo[];
  maoDeObra: MaoDeObra[];
  transporte: Transporte;
  despesasExtras: DespesaExtra[];
  
  // Margens
  encargosMaoObra: number; // %
  margemAdministrativa: number; // %
  contingencia: number; // %
  margemLucro: number; // %
  impostos: number; // %
  
  // Totais calculados
  custoBase: number;
  custoInsumos: number;
  custoMaoObra: number;
  custoTransporte: number;
  custoDespesasExtras: number;
  subtotal: number;
  lucro: number;
  valorImpostos: number;
  custoTotal: number;
  custoPorM2Final: number;
  
  observacoesTecnicas?: string;
}

const STORAGE_KEY = 'obralis_orcamentos';

const custoPorM2Padrao = {
  residencial: 2000,
  comercial: 3000,
  industrial: 4500,
  reforma: 1500,
  infraestrutura: 3500,
};

export const useOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setOrcamentos(JSON.parse(saved));
    }
  }, []);

  const calcularTotais = (orcamento: Omit<Orcamento, 'id' | 'custoBase' | 'custoInsumos' | 'custoMaoObra' | 'custoTransporte' | 'custoDespesasExtras' | 'subtotal' | 'lucro' | 'valorImpostos' | 'custoTotal' | 'custoPorM2Final'>): Orcamento => {
    // 1. Custo Base
    const custoBase = orcamento.area * orcamento.custoPorM2;
    
    // 2. Insumos
    const custoInsumos = orcamento.insumos.reduce((total, item) => 
      total + (item.quantidade * item.valorUnitario), 0);
    
    // 3. Mão de Obra
    const custoMaoObraBase = orcamento.maoDeObra.reduce((total, item) => 
      total + (item.quantidade * item.custoDiario * item.duracao), 0);
    const custoMaoObra = custoMaoObraBase * (1 + orcamento.encargosMaoObra / 100) * (1 + orcamento.margemAdministrativa / 100);
    
    // 4. Transporte
    const { distancia, consumo, precoGasolina, viagensSemana, duracaoSemanas, pedagios } = orcamento.transporte;
    const custoTransporte = ((distancia * 2 * viagensSemana * duracaoSemanas) / consumo) * precoGasolina + pedagios;
    
    // 5. Despesas Extras
    const custoDespesasExtrasBase = orcamento.despesasExtras.reduce((total, item) => total + item.valor, 0);
    const custoDespesasExtras = custoDespesasExtrasBase * (1 + orcamento.contingencia / 100);
    
    // 6. Subtotal
    const subtotal = custoBase + custoInsumos + custoMaoObra + custoTransporte + custoDespesasExtras;
    
    // 7. Lucro
    const lucro = subtotal * (orcamento.margemLucro / 100);
    
    // 8. Impostos
    const valorImpostos = (subtotal + lucro) * (orcamento.impostos / 100);
    
    // 9. Custo Total
    const custoTotal = subtotal + lucro + valorImpostos;
    const custoPorM2Final = custoTotal / orcamento.area;
    
    return {
      ...orcamento,
      id: Date.now().toString(),
      custoBase,
      custoInsumos,
      custoMaoObra,
      custoTransporte,
      custoDespesasExtras,
      subtotal,
      lucro,
      valorImpostos,
      custoTotal,
      custoPorM2Final,
    };
  };

  const saveOrcamentos = (novosOrcamentos: Orcamento[]) => {
    setOrcamentos(novosOrcamentos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosOrcamentos));
  };

  const addOrcamento = (orcamento: Omit<Orcamento, 'id' | 'custoBase' | 'custoInsumos' | 'custoMaoObra' | 'custoTransporte' | 'custoDespesasExtras' | 'subtotal' | 'lucro' | 'valorImpostos' | 'custoTotal' | 'custoPorM2Final'>) => {
    const novoOrcamento = calcularTotais(orcamento);
    saveOrcamentos([...orcamentos, novoOrcamento]);
    toast({ title: 'Orçamento criado com sucesso!' });
    return novoOrcamento;
  };

  const updateOrcamento = (id: string, dados: Partial<Orcamento>) => {
    const orcamentoExistente = orcamentos.find(o => o.id === id);
    if (!orcamentoExistente) return;
    
    const orcamentoAtualizado = calcularTotais({
      ...orcamentoExistente,
      ...dados,
    } as any);
    
    const novosOrcamentos = orcamentos.map((o) =>
      o.id === id ? orcamentoAtualizado : o
    );
    saveOrcamentos(novosOrcamentos);
    toast({ title: 'Orçamento atualizado com sucesso!' });
  };

  const deleteOrcamento = (id: string) => {
    saveOrcamentos(orcamentos.filter((o) => o.id !== id));
    toast({ title: 'Orçamento excluído com sucesso!' });
  };

  const getOrcamento = (id: string) => orcamentos.find((o) => o.id === id);

  return { 
    orcamentos, 
    addOrcamento, 
    updateOrcamento, 
    deleteOrcamento, 
    getOrcamento,
    custoPorM2Padrao,
  };
};
