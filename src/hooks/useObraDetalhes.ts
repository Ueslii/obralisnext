import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ObraComentario {
  id: string;
  obraId: string;
  autor: string;
  conteudo: string;
  tipo: 'comentario' | 'foto' | 'alerta';
  fotoUrl?: string;
  data: string;
}

export interface ObraInsumo {
  id: string;
  obraId: string;
  nome: string;
  quantidade: number;
  unidade: string;
  quantidadeUsada: number;
  fornecedor: string;
  dataEntrega: string;
}

export interface ObraImprevisto {
  id: string;
  obraId: string;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
}

const COMENTARIOS_KEY = 'buildwise_obra_comentarios';
const INSUMOS_KEY = 'buildwise_obra_insumos';
const IMPREVISTOS_KEY = 'buildwise_obra_imprevistos';

export const useObraDetalhes = (obraId: string) => {
  const [comentarios, setComentarios] = useState<ObraComentario[]>([]);
  const [insumos, setInsumos] = useState<ObraInsumo[]>([]);
  const [imprevistos, setImprevistos] = useState<ObraImprevisto[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedComentarios = localStorage.getItem(COMENTARIOS_KEY);
    const savedInsumos = localStorage.getItem(INSUMOS_KEY);
    const savedImprevistos = localStorage.getItem(IMPREVISTOS_KEY);

    if (savedComentarios) {
      const todos = JSON.parse(savedComentarios);
      setComentarios(todos.filter((c: ObraComentario) => c.obraId === obraId));
    }

    if (savedInsumos) {
      const todos = JSON.parse(savedInsumos);
      setInsumos(todos.filter((i: ObraInsumo) => i.obraId === obraId));
    }

    if (savedImprevistos) {
      const todos = JSON.parse(savedImprevistos);
      setImprevistos(todos.filter((i: ObraImprevisto) => i.obraId === obraId));
    }
  }, [obraId]);

  const addComentario = (comentario: Omit<ObraComentario, 'id' | 'data'>) => {
    const novoComentario: ObraComentario = {
      ...comentario,
      id: Date.now().toString(),
      data: new Date().toISOString(),
    };

    const saved = localStorage.getItem(COMENTARIOS_KEY);
    const todos = saved ? JSON.parse(saved) : [];
    const atualizados = [...todos, novoComentario];
    localStorage.setItem(COMENTARIOS_KEY, JSON.stringify(atualizados));
    setComentarios([...comentarios, novoComentario]);
    toast({ title: 'Comentário adicionado!' });
  };

  const addInsumo = (insumo: Omit<ObraInsumo, 'id'>) => {
    const novoInsumo: ObraInsumo = {
      ...insumo,
      id: Date.now().toString(),
    };

    const saved = localStorage.getItem(INSUMOS_KEY);
    const todos = saved ? JSON.parse(saved) : [];
    const atualizados = [...todos, novoInsumo];
    localStorage.setItem(INSUMOS_KEY, JSON.stringify(atualizados));
    setInsumos([...insumos, novoInsumo]);
    toast({ title: 'Insumo registrado!' });
  };

  const updateInsumo = (id: string, quantidadeUsada: number) => {
    const saved = localStorage.getItem(INSUMOS_KEY);
    const todos: ObraInsumo[] = saved ? JSON.parse(saved) : [];
    const atualizados = todos.map((i) =>
      i.id === id ? { ...i, quantidadeUsada } : i
    );
    localStorage.setItem(INSUMOS_KEY, JSON.stringify(atualizados));
    setInsumos(insumos.map((i) => (i.id === id ? { ...i, quantidadeUsada } : i)));
    toast({ title: 'Insumo atualizado!' });
  };

  const addImprevisto = (imprevisto: Omit<ObraImprevisto, 'id' | 'data'>) => {
    const novoImprevisto: ObraImprevisto = {
      ...imprevisto,
      id: Date.now().toString(),
      data: new Date().toISOString(),
    };

    const saved = localStorage.getItem(IMPREVISTOS_KEY);
    const todos = saved ? JSON.parse(saved) : [];
    const atualizados = [...todos, novoImprevisto];
    localStorage.setItem(IMPREVISTOS_KEY, JSON.stringify(atualizados));
    setImprevistos([...imprevistos, novoImprevisto]);
    toast({ title: 'Imprevisto registrado!' });
  };

  const getTotalImprevistos = () => {
    return imprevistos.reduce((sum, i) => sum + i.valor, 0);
  };

  return {
    comentarios,
    insumos,
    imprevistos,
    addComentario,
    addInsumo,
    updateInsumo,
    addImprevisto,
    getTotalImprevistos,
  };
};
