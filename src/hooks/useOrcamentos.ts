import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ItemOrcamento {
  etapa: string;
  custoPorM2: number;
  extras: number;
}

export interface Orcamento {
  id: string;
  obraId: string;
  nomeObra: string;
  tipoObra: 'residencial' | 'comercial' | 'industrial';
  area: number;
  itens: ItemOrcamento[];
  custoTotal: number;
  dataEmissao: string;
  status: 'rascunho' | 'aprovado' | 'revisao';
}

const STORAGE_KEY = 'obrapro_orcamentos';

const orcamentosIniciais: Orcamento[] = [
  {
    id: '1',
    obraId: '1',
    nomeObra: 'Residencial Vila Nova',
    tipoObra: 'residencial',
    area: 350,
    itens: [
      { etapa: 'Fundação', custoPorM2: 450, extras: 15000 },
      { etapa: 'Estrutura', custoPorM2: 580, extras: 25000 },
      { etapa: 'Acabamento', custoPorM2: 720, extras: 35000 },
    ],
    custoTotal: 0,
    dataEmissao: '2025-01-10',
    status: 'aprovado',
  },
  {
    id: '2',
    obraId: '2',
    nomeObra: 'Comercial Centro',
    tipoObra: 'comercial',
    area: 520,
    itens: [
      { etapa: 'Fundação', custoPorM2: 500, extras: 20000 },
      { etapa: 'Estrutura', custoPorM2: 650, extras: 30000 },
    ],
    custoTotal: 0,
    dataEmissao: '2025-02-15',
    status: 'aprovado',
  },
];

export const useOrcamentos = () => {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const loadedOrcamentos = JSON.parse(saved);
      setOrcamentos(loadedOrcamentos.map(calcularTotal));
    } else {
      const initialized = orcamentosIniciais.map(calcularTotal);
      setOrcamentos(initialized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialized));
    }
  }, []);

  const calcularTotal = (orcamento: Orcamento): Orcamento => {
    const custoTotal = orcamento.itens.reduce((total, item) => {
      return total + item.custoPorM2 * orcamento.area + item.extras;
    }, 0);
    return { ...orcamento, custoTotal };
  };

  const saveOrcamentos = (novosOrcamentos: Orcamento[]) => {
    setOrcamentos(novosOrcamentos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosOrcamentos));
  };

  const addOrcamento = (orcamento: Omit<Orcamento, 'id' | 'custoTotal'>) => {
    const novoOrcamento: Orcamento = calcularTotal({
      ...orcamento,
      id: Date.now().toString(),
      custoTotal: 0,
    });
    saveOrcamentos([...orcamentos, novoOrcamento]);
    toast({ title: 'Orçamento criado com sucesso!' });
    return novoOrcamento;
  };

  const updateOrcamento = (id: string, dados: Partial<Orcamento>) => {
    const novosOrcamentos = orcamentos.map((o) =>
      o.id === id ? calcularTotal({ ...o, ...dados }) : o
    );
    saveOrcamentos(novosOrcamentos);
    toast({ title: 'Orçamento atualizado com sucesso!' });
  };

  const deleteOrcamento = (id: string) => {
    saveOrcamentos(orcamentos.filter((o) => o.id !== id));
    toast({ title: 'Orçamento excluído com sucesso!' });
  };

  const getOrcamento = (id: string) => orcamentos.find((o) => o.id === id);

  return { orcamentos, addOrcamento, updateOrcamento, deleteOrcamento, getOrcamento };
};
