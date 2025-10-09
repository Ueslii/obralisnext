import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Membro {
  id: string;
  nome: string;
  funcao: string;
  valorHora: number;
  telefone?: string;
  email?: string;
  obraAtual?: string;
  status: 'ativo' | 'inativo' | 'ferias';
}

const STORAGE_KEY = 'obrapro_equipes';

const equipesIniciais: Membro[] = [
  {
    id: '1',
    nome: 'João Silva',
    funcao: 'Pedreiro',
    valorHora: 45,
    telefone: '(11) 98765-4321',
    email: 'joao@email.com',
    obraAtual: 'Residencial Vila Nova',
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    funcao: 'Eletricista',
    valorHora: 55,
    telefone: '(11) 98765-1234',
    email: 'maria@email.com',
    obraAtual: 'Comercial Centro',
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Pedro Oliveira',
    funcao: 'Encanador',
    valorHora: 50,
    telefone: '(11) 98765-5678',
    email: 'pedro@email.com',
    status: 'ativo',
  },
];

export const useEquipes = () => {
  const [membros, setMembros] = useState<Membro[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMembros(JSON.parse(saved));
    } else {
      setMembros(equipesIniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(equipesIniciais));
    }
  }, []);

  const saveMembros = (novosMembros: Membro[]) => {
    setMembros(novosMembros);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosMembros));
  };

  const addMembro = (membro: Omit<Membro, 'id'>) => {
    const novoMembro: Membro = {
      ...membro,
      id: Date.now().toString(),
    };
    saveMembros([...membros, novoMembro]);
    toast({ title: 'Membro adicionado com sucesso!' });
    return novoMembro;
  };

  const updateMembro = (id: string, dados: Partial<Membro>) => {
    const novosMembros = membros.map((m) => (m.id === id ? { ...m, ...dados } : m));
    saveMembros(novosMembros);
    toast({ title: 'Membro atualizado com sucesso!' });
  };

  const deleteMembro = (id: string) => {
    saveMembros(membros.filter((m) => m.id !== id));
    toast({ title: 'Membro excluído com sucesso!' });
  };

  const getMembro = (id: string) => membros.find((m) => m.id === id);

  const calcularFolhaPagamento = () => {
    return membros
      .filter((m) => m.status === 'ativo')
      .reduce((total, m) => total + m.valorHora * 160, 0);
  };

  return { membros, addMembro, updateMembro, deleteMembro, getMembro, calcularFolhaPagamento };
};
