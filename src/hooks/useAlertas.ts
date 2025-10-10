import { useState, useEffect } from 'react';

export interface Alerta {
  id: string;
  tipo: 'margem_negativa' | 'despesa_acima' | 'obra_atrasada' | 'info';
  titulo: string;
  descricao: string;
  obraId?: string;
  nomeObra?: string;
  severidade: 'alta' | 'media' | 'baixa';
  data: string;
  lido: boolean;
  acao?: string;
}

const STORAGE_KEY = 'buildwise_alertas';

const alertasIniciais: Alerta[] = [
  {
    id: '1',
    tipo: 'despesa_acima',
    titulo: 'Despesa acima do previsto',
    descricao: 'A obra Residencial Vila Nova ultrapassou 10% do orçamento previsto na etapa de Fundação',
    obraId: '1',
    nomeObra: 'Residencial Vila Nova',
    severidade: 'media',
    data: new Date().toISOString(),
    lido: false,
    acao: 'Revisar orçamento',
  },
  {
    id: '2',
    tipo: 'obra_atrasada',
    titulo: 'Obra com possível atraso',
    descricao: 'Comercial Centro está com progresso de 40% mas já passou 50% do prazo',
    obraId: '2',
    nomeObra: 'Comercial Centro',
    severidade: 'alta',
    data: new Date().toISOString(),
    lido: false,
    acao: 'Ajustar cronograma',
  },
];

export const useAlertas = () => {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setAlertas(JSON.parse(saved));
    } else {
      setAlertas(alertasIniciais);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(alertasIniciais));
    }
  }, []);

  const saveAlertas = (novosAlertas: Alerta[]) => {
    setAlertas(novosAlertas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(novosAlertas));
  };

  const addAlerta = (alerta: Omit<Alerta, 'id' | 'data' | 'lido'>) => {
    const novoAlerta: Alerta = {
      ...alerta,
      id: Date.now().toString(),
      data: new Date().toISOString(),
      lido: false,
    };
    saveAlertas([novoAlerta, ...alertas]);
    return novoAlerta;
  };

  const marcarComoLido = (id: string) => {
    const novosAlertas = alertas.map((a) => (a.id === id ? { ...a, lido: true } : a));
    saveAlertas(novosAlertas);
  };

  const marcarTodosComoLidos = () => {
    const novosAlertas = alertas.map((a) => ({ ...a, lido: true }));
    saveAlertas(novosAlertas);
  };

  const deleteAlerta = (id: string) => {
    saveAlertas(alertas.filter((a) => a.id !== id));
  };

  const getAlertasNaoLidos = () => alertas.filter((a) => !a.lido);

  return {
    alertas,
    addAlerta,
    marcarComoLido,
    marcarTodosComoLidos,
    deleteAlerta,
    getAlertasNaoLidos,
  };
};
