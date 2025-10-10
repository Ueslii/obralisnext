import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Lancamento {
  id: string;
  obraId: string;
  nomeObra: string;
  tipo: 'despesa' | 'receita';
  categoria: 'materiais' | 'alimentacao' | 'combustivel' | 'extras' | 'pagamento' | 'outros';
  descricao: string;
  valor: number;
  data: string;
  etapa?: string;
}

export interface ControlePorEtapa {
  obraId: string;
  nomeObra: string;
  etapa: string;
  orcamentoPrevisto: number;
  custoReal: number;
  status: 'dentro' | 'atencao' | 'excedido';
}

const STORAGE_KEY = 'buildwise_lancamentos';

const lancamentosIniciais: Lancamento[] = [
  {
    id: '1',
    obraId: '1',
    nomeObra: 'Residencial Vila Nova',
    tipo: 'despesa',
    categoria: 'materiais',
    descricao: 'Cimento e areia',
    valor: 12500,
    data: new Date().toISOString().split('T')[0],
    etapa: 'Fundação',
  },
  {
    id: '2',
    obraId: '1',
    nomeObra: 'Residencial Vila Nova',
    tipo: 'despesa',
    categoria: 'alimentacao',
    descricao: 'Marmitas equipe',
    valor: 850,
    data: new Date().toISOString().split('T')[0],
  },
  {
    id: '3',
    obraId: '2',
    nomeObra: 'Comercial Centro',
    tipo: 'despesa',
    categoria: 'combustivel',
    descricao: 'Diesel betoneira',
    valor: 420,
    data: new Date().toISOString().split('T')[0],
  },
];

export const useFinanceiro = () => {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLancamentos(JSON.parse(saved));
    } else {
      setLancamentos(lancamentosIniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lancamentosIniciais));
    }
  }, []);

  const saveLancamentos = (novosLancamentos: Lancamento[]) => {
    setLancamentos(novosLancamentos);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosLancamentos));
  };

  const addLancamento = (lancamento: Omit<Lancamento, 'id'>) => {
    const novoLancamento: Lancamento = {
      ...lancamento,
      id: Date.now().toString(),
    };
    saveLancamentos([...lancamentos, novoLancamento]);
    toast({ title: 'Lançamento registrado com sucesso!' });
    return novoLancamento;
  };

  const updateLancamento = (id: string, dados: Partial<Lancamento>) => {
    const novosLancamentos = lancamentos.map((l) => (l.id === id ? { ...l, ...dados } : l));
    saveLancamentos(novosLancamentos);
    toast({ title: 'Lançamento atualizado com sucesso!' });
  };

  const deleteLancamento = (id: string) => {
    saveLancamentos(lancamentos.filter((l) => l.id !== id));
    toast({ title: 'Lançamento excluído com sucesso!' });
  };

  const getResumoFinanceiro = () => {
    const totalDespesas = lancamentos
      .filter((l) => l.tipo === 'despesa')
      .reduce((acc, l) => acc + l.valor, 0);
    
    const totalReceitas = lancamentos
      .filter((l) => l.tipo === 'receita')
      .reduce((acc, l) => acc + l.valor, 0);
    
    const saldo = totalReceitas - totalDespesas;
    
    return { totalDespesas, totalReceitas, saldo };
  };

  const getDespesasPorCategoria = () => {
    const despesas = lancamentos.filter((l) => l.tipo === 'despesa');
    const porCategoria: Record<string, number> = {};
    
    despesas.forEach((l) => {
      porCategoria[l.categoria] = (porCategoria[l.categoria] || 0) + l.valor;
    });
    
    return porCategoria;
  };

  return {
    lancamentos,
    addLancamento,
    updateLancamento,
    deleteLancamento,
    getResumoFinanceiro,
    getDespesasPorCategoria,
  };
};
