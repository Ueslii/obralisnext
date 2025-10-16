import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Obra {
  id: string;
  nome: string;
  endereco?: string | null;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'atrasada';
  responsavel?: string | null;
  prazo?: string | null;
  progresso?: number | null;
  custo_previsto?: number | null;
  custo_real?: number | null;
  descricao?: string | null;
  data_inicio?: string | null;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export const useObrasSupabase = () => {
  const queryClient = useQueryClient();

  // Query para listar obras
  const { data: obras = [], isLoading } = useQuery({
    queryKey: ['obras'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('obras')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Obra[];
    },
  });

  // Mutation para adicionar obra
  const addObra = useMutation({
    mutationFn: async (obra: Omit<Obra, 'id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('obras')
        .insert([{ ...obra, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data as Obra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra adicionada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao adicionar obra:', error);
      toast.error(error.message || 'Erro ao adicionar obra');
    },
  });

  // Mutation para atualizar obra
  const updateObra = useMutation({
    mutationFn: async ({ id, ...dados }: Partial<Obra> & { id: string }) => {
      const { data, error } = await supabase
        .from('obras')
        .update(dados)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Obra;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra atualizada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar obra:', error);
      toast.error(error.message || 'Erro ao atualizar obra');
    },
  });

  // Mutation para deletar obra
  const deleteObra = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('obras')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] });
      toast.success('Obra deletada com sucesso!');
    },
    onError: (error: any) => {
      console.error('Erro ao deletar obra:', error);
      toast.error(error.message || 'Erro ao deletar obra');
    },
  });

  // Função para obter obra por ID
  const getObra = (id: string) => {
    return obras.find(obra => obra.id === id);
  };

  return {
    obras,
    isLoading,
    addObra: addObra.mutate,
    updateObra: updateObra.mutate,
    deleteObra: deleteObra.mutate,
    getObra,
  };
};
