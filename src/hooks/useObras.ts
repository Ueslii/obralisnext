import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Obra {
  id: string;
  nome: string;
  endereco: string;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'atrasada';
  responsavel: string;
  prazo: string;
  progresso: number;
  custoPrevisto: number;
  custoReal: number;
  descricao?: string;
  dataInicio?: string;
}

const STORAGE_KEY = 'obrapro_obras';

const obrasIniciais: Obra[] = [
  {
    id: '1',
    nome: 'Residencial Vila Nova',
    endereco: 'Rua das Flores, 123',
    status: 'em_andamento',
    responsavel: 'Carlos Silva',
    prazo: '2025-12-31',
    progresso: 65,
    custoPrevisto: 850000,
    custoReal: 720000,
    dataInicio: '2025-01-15',
  },
  {
    id: '2',
    nome: 'Comercial Centro',
    endereco: 'Av. Principal, 456',
    status: 'em_andamento',
    responsavel: 'Ana Santos',
    prazo: '2025-10-15',
    progresso: 40,
    custoPrevisto: 1200000,
    custoReal: 450000,
    dataInicio: '2025-03-01',
  },
  {
    id: '3',
    nome: 'Condomínio Horizonte',
    endereco: 'Rua do Sol, 789',
    status: 'planejada',
    responsavel: 'João Oliveira',
    prazo: '2026-03-30',
    progresso: 0,
    custoPrevisto: 2500000,
    custoReal: 0,
  },
];

export const useObras = () => {
  const [obras, setObras] = useState<Obra[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setObras(JSON.parse(saved));
    } else {
      setObras(obrasIniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obrasIniciais));
    }
  }, []);

  const saveObras = (novasObras: Obra[]) => {
    setObras(novasObras);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novasObras));
  };

  const addObra = (obra: Omit<Obra, 'id'>) => {
    const novaObra: Obra = {
      ...obra,
      id: Date.now().toString(),
    };
    saveObras([...obras, novaObra]);
    toast({ title: 'Obra criada com sucesso!' });
    return novaObra;
  };

  const updateObra = (id: string, dados: Partial<Obra>) => {
    const novasObras = obras.map((o) => (o.id === id ? { ...o, ...dados } : o));
    saveObras(novasObras);
    toast({ title: 'Obra atualizada com sucesso!' });
  };

  const deleteObra = (id: string) => {
    saveObras(obras.filter((o) => o.id !== id));
    toast({ title: 'Obra excluída com sucesso!' });
  };

  const getObra = (id: string) => obras.find((o) => o.id === id);

  return { obras, addObra, updateObra, deleteObra, getObra };
};
