import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompanyScope } from "./useCompanyScope";

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

export interface OrcamentoEtapa {
  id: string;
  nome: string;
  descricao?: string;
  custoPrevisto: number;
  responsavel?: string;
  inicioPrevisto?: string;
  fimPrevisto?: string;
  insumos?: Insumo[];
}

export interface Orcamento {
  id: string;
  nomeObra: string;
  tipoObra: "residencial" | "comercial" | "industrial" | "reforma" | "infraestrutura";
  area: number;
  localizacao: string;
  status: "rascunho" | "aprovado" | "revisao";
  responsavelTecnico: string;
  dataEmissao: string;
  custoPorM2: number;
  insumos: Insumo[];
  maoDeObra: MaoDeObra[];
  transporte: Transporte;
  despesasExtras: DespesaExtra[];
  encargosMaoObra: number;
  margemAdministrativa: number;
  contingencia: number;
  margemLucro: number;
  impostos: number;
  custoBase: number;
  custoInsumos: number;
  custoMaoObra: number;
  custoTransporte: number;
  custoDespesasExtras: number;
  custoEtapas: number;
  subtotal: number;
  lucro: number;
  valorImpostos: number;
  custoTotal: number;
  custoPorM2Final: number;
  obraId: string | null;
  etapas: OrcamentoEtapa[];
  observacoesTecnicas?: string;
}

const custoPorM2Padrao = {
  residencial: 2000,
  comercial: 3000,
  industrial: 4500,
  reforma: 1500,
  infraestrutura: 3500,
} as const;

type OrcamentoBase =
  & Omit<
      Orcamento,
      |
        "id"
      |
        "custoBase"
      |
        "custoInsumos"
      |
        "custoMaoObra"
      |
        "custoTransporte"
      |
        "custoDespesasExtras"
      |
        "custoEtapas"
      |
        "subtotal"
      |
        "lucro"
      |
        "valorImpostos"
      |
        "custoTotal"
      |
        "custoPorM2Final"
    >
  & { id?: string };

const generateLocalId = () => Math.random().toString(36).slice(2);

const calcularTotais = (orcamento: OrcamentoBase): Orcamento => {
  const etapasPlanejadas = orcamento.etapas ?? [];
  const insumosEtapas = etapasPlanejadas.flatMap(
    (etapa) => etapa.insumos ?? []
  );
  const todosInsumos = [...orcamento.insumos, ...insumosEtapas];

  const custoBase = orcamento.area * orcamento.custoPorM2;

  const custoInsumos = todosInsumos.reduce(
    (total, item) => total + item.quantidade * item.valorUnitario,
    0
  );

  const custoMaoObraBase = orcamento.maoDeObra.reduce(
    (total, item) => total + item.quantidade * item.custoDiario * item.duracao,
    0
  );
  const custoMaoObra =
    custoMaoObraBase *
    (1 + orcamento.encargosMaoObra / 100) *
    (1 + orcamento.margemAdministrativa / 100);

  const { distancia, consumo, precoGasolina, viagensSemana, duracaoSemanas, pedagios } =
    orcamento.transporte;
  const custoTransporte =
    ((distancia * 2 * viagensSemana * duracaoSemanas) / consumo) * precoGasolina +
    pedagios;

  const custoDespesasExtrasBase = orcamento.despesasExtras.reduce(
    (total, item) => total + item.valor,
    0
  );
  const custoDespesasExtras =
    custoDespesasExtrasBase * (1 + orcamento.contingencia / 100);

  const custoEtapas = etapasPlanejadas.reduce(
    (total, etapa) => total + Number(etapa.custoPrevisto ?? 0),
    0
  );

  const subtotal =
    custoBase +
    custoInsumos +
    custoMaoObra +
    custoTransporte +
    custoDespesasExtras +
    custoEtapas;

  const lucro = subtotal * (orcamento.margemLucro / 100);
  const valorImpostos = (subtotal + lucro) * (orcamento.impostos / 100);
  const custoTotal = subtotal + lucro + valorImpostos;
  const custoPorM2Final = custoTotal / (orcamento.area || 1);

  return {
    ...orcamento,
    id: orcamento.id ?? generateLocalId(),
    obraId: (orcamento as Partial<Orcamento>).obraId ?? null,
    insumos: todosInsumos,
    etapas: etapasPlanejadas,
    custoBase,
    custoInsumos,
    custoMaoObra,
    custoTransporte,
    custoDespesasExtras,
    custoEtapas,
    subtotal,
    lucro,
    valorImpostos,
    custoTotal,
    custoPorM2Final,
  };
};

const mapOrcamentoRow = (row: Record<string, any>): Orcamento | null => {
  const dados = row.dados as Orcamento | null;
  if (dados) {
    const etapas = dados.etapas ?? [];
    const custoEtapas =
      dados.custoEtapas ??
      etapas.reduce(
        (total, etapa) => total + Number(etapa.custoPrevisto ?? 0),
        0
      );
    return {
      ...dados,
      etapas,
      custoEtapas,
      id: row.id,
      obraId: row.obra_id ?? dados.obraId ?? null,
    };
  }

  if (row.nome_obra) {
    const fallback: Orcamento = calcularTotais({
      id: row.id,
      nomeObra: row.nome_obra,
      tipoObra: "residencial",
      area: 0,
      localizacao: "",
      status: (row.status as Orcamento["status"]) ?? "rascunho",
      responsavelTecnico: "",
      dataEmissao: new Date().toISOString().split("T")[0],
      custoPorM2: custoPorM2Padrao.residencial,
      insumos: [],
      maoDeObra: [],
      transporte: {
        distancia: 0,
        consumo: 10,
        precoGasolina: 5,
        viagensSemana: 0,
        duracaoSemanas: 0,
        pedagios: 0,
      },
      despesasExtras: [],
      etapas: [],
      encargosMaoObra: 0,
      margemAdministrativa: 0,
      contingencia: 0,
      margemLucro: 0,
      impostos: 0,
      observacoesTecnicas: row.observacoes_tecnicas ?? undefined,
      obraId: row.obra_id ?? null,
    } as OrcamentoBase);
    return { ...fallback, obraId: row.obra_id ?? null };
  }

  return null;
};

export const useOrcamentos = () => {
  const queryClient = useQueryClient();
  const {
    memberUserIds,
    isLoading: isCompanyScopeLoading,
  } = useCompanyScope();

  const { data, isLoading } = useQuery({
    queryKey: ["orcamentos", memberUserIds.join(",")],
    enabled: memberUserIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select("*")
        .in("user_id", memberUserIds)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42703") {
          throw error;
        }

        const fallback = await supabase
          .from("orcamentos")
          .select("*")
          .order("created_at", { ascending: false });

        if (fallback.error) {
          throw fallback.error;
        }

        return (fallback.data ?? [])
          .filter((row) =>
            memberUserIds.includes((row as Record<string, any>).user_id ?? "")
          )
          .map((row) => mapOrcamentoRow(row as Record<string, any>))
          .filter(Boolean) as Orcamento[];
      }

      return (data ?? [])
        .map((row) => mapOrcamentoRow(row as Record<string, any>))
        .filter(Boolean) as Orcamento[];
    },
  });

  const addMutation = useMutation({
    mutationFn: async (dados: OrcamentoBase) => {
      const resultado = calcularTotais(dados);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("orcamentos").insert([
        {
          nome_obra: resultado.nomeObra,
          status: resultado.status,
          dados: resultado,
          user_id: user?.id ?? null,
        },
      ]);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento salvo com sucesso");
    },
    onError: (error: any) => {
      console.error("Erro ao salvar orçamento:", error);
      toast.error(error?.message ?? "Não foi possível salvar o orçamento");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, dados }: { id: string; dados: OrcamentoBase }) => {
      const resultado = calcularTotais({ ...dados, id });
      const { error } = await supabase
        .from("orcamentos")
        .update({
          nome_obra: resultado.nomeObra,
          status: resultado.status,
          dados: resultado,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento atualizado");
    },
    onError: (error: any) => {
      console.error("Erro ao atualizar orçamento:", error);
      toast.error(error?.message ?? "Não foi possível atualizar o orçamento");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);
      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orçamento removido");
    },
    onError: (error: any) => {
      console.error("Erro ao remover orçamento:", error);
      toast.error(error?.message ?? "Não foi possível remover o orçamento");
    },
  });

  const sendToObraMutation = useMutation({
    mutationFn: async (id: string) => {
      const orcamento = (data ?? []).find((item) => item.id === id);
      if (!orcamento) {
        throw new Error("Orcamento nao encontrado");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuario nao autenticado");
      }

      // Preflight: verify dependent tables exist to avoid partial creation
      const etapaCheck = await supabase.from("obra_etapas").select("id").limit(1);
      if (etapaCheck.error && (etapaCheck.error.code === "42P01" || etapaCheck.error.code === "PGRST205")) {
        throw new Error(
          "Tabela 'obra_etapas' não encontrada no banco. Aplique as migrações no Supabase para continuar."
        );
      }

      const insumoCheck = await supabase.from("obra_insumos").select("id").limit(1);
      if (insumoCheck.error && (insumoCheck.error.code === "42P01" || insumoCheck.error.code === "PGRST205")) {
        throw new Error(
          "Tabela 'obra_insumos' não encontrada no banco. Aplique as migrações no Supabase para continuar."
        );
      }

      const { data: obraCriada, error: obraError } = await supabase
        .from("obras")
        .insert([
          {
            nome: orcamento.nomeObra,
            status: "planejada",
            custo_previsto: null,
            descricao: orcamento.observacoesTecnicas ?? null,
            responsavel: orcamento.responsavelTecnico ?? null,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (obraError || !obraCriada) {
        throw obraError ?? new Error("Nao foi possivel criar a obra");
      }

      const { data: etapaCriada, error: etapaError } = await supabase
        .from("obra_etapas")
        .insert([
          {
            obra_id: obraCriada.id,
            nome: "Orcamento aprovado",
            descricao: "Planejamento importado do orcamento",
            custo_previsto: null,
            ordem: 1,
          },
        ])
        .select()
        .single();

      if (etapaError || !etapaCriada) {
        throw etapaError ?? new Error("Nao foi possivel criar a etapa");
      }

      if (orcamento.insumos.length > 0) {
        const payload = orcamento.insumos.map((item) => ({
          obra_id: obraCriada.id,
          etapa_id: etapaCriada.id,
          material: item.descricao,
          unidade: item.unidade,
          quantidade_total: item.quantidade,
          quantidade_usada: 0,
          valor_unitario: item.valorUnitario ?? null,
          fornecedor_nome: item.fornecedor ?? null,
          data_entrada: item.prazo ?? null,
        }));

        const { error: insumoError } = await supabase
          .from("obra_insumos")
          .insert(payload);

        if (insumoError) {
          throw insumoError;
        }
      }

      const dadosAtualizados = {
        ...orcamento,
        status: "aprovado" as const,
        obraId: obraCriada.id,
      };

      const { error: updateError } = await supabase
        .from("orcamentos")
        .update({
          obra_id: obraCriada.id,
          status: "aprovado",
          dados: dadosAtualizados,
        })
        .eq("id", id);

      if (updateError) {
        throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      queryClient.invalidateQueries({ queryKey: ["obras"] });
      toast.success("Orcamento enviado para obras");
    },
    onError: (error: any) => {
      console.error("Erro ao enviar orcamento para obras:", error);
      toast.error(error?.message ?? "Nao foi possivel enviar o orcamento");
    },
  });

const createRevisionMutation = useMutation({
    mutationFn: async (id: string) => {
      const orcamento = (data ?? []).find((item) => item.id === id);
      if (!orcamento) {
        throw new Error("Orcamento nao encontrado");
      }

      const atualizado = {
        ...orcamento,
        status: "revisao" as const,
      };

      const { error } = await supabase
        .from("orcamentos")
        .update({
          status: "revisao",
          dados: atualizado,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast.success("Orcamento marcado para revisão");
    },
    onError: (error: any) => {
      console.error("Erro ao preparar revisao:", error);
      toast.error(error?.message ?? "Nao foi possivel preparar a revisao");
    },
  });

  const orcamentos = data ?? [];

  return {
    orcamentos,
    isLoading: isLoading || isCompanyScopeLoading,
    custoPorM2Padrao,
    addOrcamento: addMutation.mutateAsync,
    updateOrcamento: (id: string, dados: OrcamentoBase) =>
      updateMutation.mutateAsync({ id, dados }),
    deleteOrcamento: deleteMutation.mutateAsync,
    sendToObra: sendToObraMutation.mutateAsync,
    createRevision: createRevisionMutation.mutateAsync,
    getOrcamento: (id: string) => orcamentos.find((item) => item.id === id),
  };
};
