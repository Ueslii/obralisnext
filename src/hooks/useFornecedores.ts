import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Entrega {
  id: string;
  fornecedorId: string;
  obraId: string;
  nomeObra: string;
  material: string;
  quantidade: number;
  unidade: string;
  valorTotal: number;
  dataEntrega: string;
  prazoEntrega: number; // dias
  status: 'pendente' | 'entregue' | 'atrasado';
}

export interface Fornecedor {
  id: string;
  nome: string;
  cnpj: string;
  categoria: string;
  contato: string;
  telefone: string;
  email: string;
  prazoMedio: number; // dias
  avaliacaoQualidade: number; // 1-5
  totalEntregas: number;
  totalPago: number;
}

const STORAGE_KEY = 'buildwise_fornecedores';
const ENTREGAS_KEY = 'buildwise_entregas';

const fornecedoresIniciais: Fornecedor[] = [
  {
    id: '1',
    nome: 'Cimentos Brasil Ltda',
    cnpj: '12.345.678/0001-90',
    categoria: 'Materiais de Construção',
    contato: 'João Silva',
    telefone: '(11) 98765-4321',
    email: 'joao@cimentosbrasil.com',
    prazoMedio: 7,
    avaliacaoQualidade: 5,
    totalEntregas: 15,
    totalPago: 125000,
  },
  {
    id: '2',
    nome: 'Ferragens ABC',
    cnpj: '98.765.432/0001-10',
    categoria: 'Ferragens',
    contato: 'Maria Santos',
    telefone: '(11) 91234-5678',
    email: 'maria@ferragensabc.com',
    prazoMedio: 5,
    avaliacaoQualidade: 4,
    totalEntregas: 22,
    totalPago: 89000,
  },
];

const entregasIniciais: Entrega[] = [
  {
    id: '1',
    fornecedorId: '1',
    obraId: '1',
    nomeObra: 'Residencial Vila Nova',
    material: 'Cimento CP-III',
    quantidade: 200,
    unidade: 'sacos',
    valorTotal: 15000,
    dataEntrega: '2025-10-08',
    prazoEntrega: 7,
    status: 'entregue',
  },
  {
    id: '2',
    fornecedorId: '2',
    obraId: '2',
    nomeObra: 'Comercial Centro',
    material: 'Ferragem 10mm',
    quantidade: 500,
    unidade: 'kg',
    valorTotal: 8500,
    dataEntrega: '2025-10-10',
    prazoEntrega: 5,
    status: 'entregue',
  },
];

export const useFornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedFornecedores = localStorage.getItem(STORAGE_KEY);
    const savedEntregas = localStorage.getItem(ENTREGAS_KEY);
    
    if (savedFornecedores) {
      setFornecedores(JSON.parse(savedFornecedores));
    } else {
      setFornecedores(fornecedoresIniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fornecedoresIniciais));
    }

    if (savedEntregas) {
      setEntregas(JSON.parse(savedEntregas));
    } else {
      setEntregas(entregasIniciais);
      localStorage.setItem(ENTREGAS_KEY, JSON.stringify(entregasIniciais));
    }
  }, []);

  const saveFornecedores = (novosFornecedores: Fornecedor[]) => {
    setFornecedores(novosFornecedores);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosFornecedores));
  };

  const saveEntregas = (novasEntregas: Entrega[]) => {
    setEntregas(novasEntregas);
    localStorage.setItem(ENTREGAS_KEY, JSON.stringify(novasEntregas));
  };

  const addFornecedor = (fornecedor: Omit<Fornecedor, 'id' | 'totalEntregas' | 'totalPago'>) => {
    const novoFornecedor: Fornecedor = {
      ...fornecedor,
      id: Date.now().toString(),
      totalEntregas: 0,
      totalPago: 0,
    };
    saveFornecedores([...fornecedores, novoFornecedor]);
    toast({ title: 'Fornecedor cadastrado com sucesso!' });
    return novoFornecedor;
  };

  const updateFornecedor = (id: string, dados: Partial<Fornecedor>) => {
    const novosFornecedores = fornecedores.map((f) => (f.id === id ? { ...f, ...dados } : f));
    saveFornecedores(novosFornecedores);
    toast({ title: 'Fornecedor atualizado com sucesso!' });
  };

  const deleteFornecedor = (id: string) => {
    saveFornecedores(fornecedores.filter((f) => f.id !== id));
    toast({ title: 'Fornecedor excluído com sucesso!' });
  };

  const addEntrega = (entrega: Omit<Entrega, 'id'>) => {
    const novaEntrega: Entrega = {
      ...entrega,
      id: Date.now().toString(),
    };
    saveEntregas([...entregas, novaEntrega]);

    // Atualizar totais do fornecedor
    const fornecedor = fornecedores.find((f) => f.id === entrega.fornecedorId);
    if (fornecedor) {
      updateFornecedor(entrega.fornecedorId, {
        totalEntregas: fornecedor.totalEntregas + 1,
        totalPago: fornecedor.totalPago + entrega.valorTotal,
      });
    }

    toast({ title: 'Entrega registrada com sucesso!' });
    return novaEntrega;
  };

  const updateEntrega = (id: string, dados: Partial<Entrega>) => {
    const novasEntregas = entregas.map((e) => (e.id === id ? { ...e, ...dados } : e));
    saveEntregas(novasEntregas);
    toast({ title: 'Entrega atualizada com sucesso!' });
  };

  const deleteEntrega = (id: string) => {
    saveEntregas(entregas.filter((e) => e.id !== id));
    toast({ title: 'Entrega excluída com sucesso!' });
  };

  const getEntregasPorFornecedor = (fornecedorId: string) => {
    return entregas.filter((e) => e.fornecedorId === fornecedorId);
  };

  return {
    fornecedores,
    entregas,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
    addEntrega,
    updateEntrega,
    deleteEntrega,
    getEntregasPorFornecedor,
  };
};
