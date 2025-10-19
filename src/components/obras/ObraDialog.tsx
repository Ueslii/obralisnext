import { useEffect, useMemo, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { NewObra, Obra } from "@/hooks/useObras";

type InsumoForm = {
  id: string;
  nome: string;
  quantidade: number;
  unidade: string;
  valorUnitario: number;
  fornecedor?: string;
  dataEntrega?: string;
};

type EtapaForm = {
  id: string;
  nome: string;
  descricao?: string;
  custoPrevisto: number;
  insumos: InsumoForm[];
};

type ObraPersistedEtapa = {
  nome: string;
  descricao?: string | null;
  custoPrevisto?: number | null;
  insumos?: Array<{
    nome: string;
    quantidade: number;
    unidade: string;
    valorUnitario?: number | null;
    fornecedor?: string | null;
    dataEntrega?: string | null;
  }>;
};

interface ObraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (
    dados: NewObra | (Partial<Obra> & { id: string })
  ) => void | Promise<void>;
  obra?: Obra & { etapas?: ObraPersistedEtapa[] };
  isSubmitting?: boolean;
}

const gerarId = () => Math.random().toString(36).slice(2, 11);

const criarInsumoPadrao = (): InsumoForm => ({
  id: gerarId(),
  nome: "",
  quantidade: 0,
  unidade: "",
  valorUnitario: 0,
});

const criarEtapaPadrao = (): EtapaForm => ({
  id: gerarId(),
  nome: "",
  descricao: "",
  custoPrevisto: 0,
  insumos: [criarInsumoPadrao()],
});

const statusOptions: Array<{ label: string; value: Obra["status"] }> = [
  { label: "Planejada", value: "planejada" },
  { label: "Em andamento", value: "em_andamento" },
  { label: "Concluída", value: "concluida" },
  { label: "Atrasada", value: "atrasada" },
];

export function ObraDialog({
  open,
  onOpenChange,
  onSave,
  obra,
  isSubmitting,
}: ObraDialogProps) {
  const isEditing = Boolean(obra);
  const [dados, setDados] = useState<Partial<Obra>>({
    status: "planejada",
    progresso: 0,
    custo_previsto: 0,
  });
  const [etapas, setEtapas] = useState<EtapaForm[]>([criarEtapaPadrao()]);
  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const [plannerOpen, setPlannerOpen] = useState(false);

  useEffect(() => {
    if (obra) {
      setDados({
        ...obra,
        status: obra.status,
      });
      if (obra.etapas && obra.etapas.length > 0) {
        setEtapas(
          obra.etapas.map((etapa) => ({
            id: gerarId(),
            nome: etapa.nome,
            descricao: etapa.descricao ?? "",
            custoPrevisto: etapa.custoPrevisto ?? 0,
            insumos:
              etapa.insumos?.map((insumo) => ({
                id: gerarId(),
                nome: insumo.nome ?? "",
                quantidade: Number(insumo.quantidade ?? 0),
                unidade: insumo.unidade ?? "",
                valorUnitario: Number(insumo.valorUnitario ?? 0),
                fornecedor: insumo.fornecedor ?? undefined,
                dataEntrega: insumo.dataEntrega ?? undefined,
              })) ?? [criarInsumoPadrao()],
          }))
        );
      } else {
        setEtapas([criarEtapaPadrao()]);
      }
    } else {
      setDados({
        status: "planejada",
        progresso: 0,
        custo_previsto: 0,
      });
      setEtapas([criarEtapaPadrao()]);
    }
  }, [obra, open]);

  useEffect(() => {
    if (!open) {
      setPlannerOpen(false);
    }
  }, [open]);

  const etapasValidas = useMemo(
    () => etapas.filter((etapa) => etapa.nome.trim().length > 0),
    [etapas]
  );

  const totalEtapasPlanejadas = useMemo(
    () =>
      etapasValidas.reduce(
        (acc, etapa) => acc + Number(etapa.custoPrevisto ?? 0),
        0
      ),
    [etapasValidas]
  );

  const handleChange = (campo: keyof Obra, valor: any) => {
    setDados((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const atualizarEtapa = (
    id: string,
    campo: keyof Omit<EtapaForm, "id" | "insumos">,
    valor: any
  ) => {
    setEtapas((prev) =>
      prev.map((etapa) =>
        etapa.id === id
          ? {
              ...etapa,
              [campo]: campo === "custoPrevisto" ? Number(valor) : valor,
            }
          : etapa
      )
    );
  };

  const removerEtapa = (id: string) => {
    setEtapas((prev) => {
      const restante = prev.filter((etapa) => etapa.id !== id);
      return restante.length > 0 ? restante : [criarEtapaPadrao()];
    });
  };

  const adicionarEtapa = () => {
    setEtapas((prev) => [...prev, criarEtapaPadrao()]);
  };

  const atualizarInsumo = (
    etapaId: string,
    insumoId: string,
    campo: keyof Omit<InsumoForm, "id">,
    valor: any
  ) => {
    setEtapas((prev) =>
      prev.map((etapa) =>
        etapa.id === etapaId
          ? {
              ...etapa,
              insumos: etapa.insumos.map((insumo) =>
                insumo.id === insumoId
                  ? {
                      ...insumo,
                      [campo]:
                        campo === "quantidade" || campo === "valorUnitario"
                          ? Number(valor)
                          : valor,
                    }
                  : insumo
              ),
            }
          : etapa
      )
    );
  };

  const adicionarInsumo = (etapaId: string) => {
    setEtapas((prev) =>
      prev.map((etapa) =>
        etapa.id === etapaId
          ? {
              ...etapa,
              insumos: [...etapa.insumos, criarInsumoPadrao()],
            }
          : etapa
      )
    );
  };

  const removerInsumo = (etapaId: string, insumoId: string) => {
    setEtapas((prev) =>
      prev.map((etapa) =>
        etapa.id === etapaId
          ? {
              ...etapa,
              insumos:
                etapa.insumos.length > 1
                  ? etapa.insumos.filter((insumo) => insumo.id !== insumoId)
                  : [criarInsumoPadrao()],
            }
          : etapa
      )
    );
  };

  const submitting = internalSubmitting || Boolean(isSubmitting);

  const handleSubmit = async () => {
    if (!dados.nome || dados.nome.trim() === "") return;
    if (submitting) return;

    const payloadBase = {
      nome: dados.nome,
      responsavel: dados.responsavel ?? null,
      custo_previsto: Number(dados.custo_previsto ?? 0),
      prazo: dados.prazo ?? null,
      status: (dados.status ?? "planejada") as Obra["status"],
      endereco: dados.endereco ?? null,
      descricao: dados.descricao ?? null,
    };

    try {
      setInternalSubmitting(true);
      if (isEditing && obra) {
        await onSave({ ...payloadBase, id: obra.id });
      } else {
        const etapasPayload =
          etapasValidas.length === 0
            ? undefined
            : etapasValidas.map((etapa, index) => ({
                nome: etapa.nome,
                descricao:
                  etapa.descricao && etapa.descricao.trim().length > 0
                    ? etapa.descricao
                    : undefined,
                custoPrevisto: Number(etapa.custoPrevisto ?? 0),
                ordem: index + 1,
                insumos: etapa.insumos
                  .filter((insumo) => insumo.nome.trim().length > 0)
                  .map((insumo) => ({
                    nome: insumo.nome,
                    quantidade: Number(insumo.quantidade ?? 0),
                    unidade: insumo.unidade,
                    valorUnitario:
                      Number(insumo.valorUnitario ?? 0) || undefined,
                    fornecedor:
                      insumo.fornecedor && insumo.fornecedor.trim().length > 0
                        ? insumo.fornecedor
                        : undefined,
                    dataEntrega: insumo.dataEntrega || undefined,
                  })),
              }));

        await onSave({
          ...payloadBase,
          etapas: etapasPayload,
        } as NewObra);
      }
      setPlannerOpen(false);
    } finally {
      setInternalSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl md:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Editar obra" : "Nova obra"}</DialogTitle>
            <DialogDescription>
              Defina as informações principais da obra e planeje as etapas com
              os insumos previstos.
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void handleSubmit();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome da obra</Label>
                <Input
                  id="nome"
                  placeholder="Ex.: Residencial Jardim Primavera"
                  value={dados.nome ?? ""}
                  onChange={(event) => handleChange("nome", event.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavel">Responsável</Label>
                <Input
                  id="responsavel"
                  placeholder="Ex.: Eng. Maria Ferreira"
                  value={dados.responsavel ?? ""}
                  onChange={(event) =>
                    handleChange("responsavel", event.target.value)
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="custo_previsto">Custo previsto (R$)</Label>
                <Input
                  id="custo_previsto"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="Informe o orçamento estimado"
                  value={dados.custo_previsto ?? 0}
                  onChange={(event) =>
                    handleChange(
                      "custo_previsto",
                      Number(event.target.value ?? 0)
                    )
                  }
                  disabled={submitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="prazo">Prazo final</Label>
                <Input
                  id="prazo"
                  type="date"
                  value={dados.prazo ?? ""}
                  onChange={(event) => handleChange("prazo", event.target.value)}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={(dados.status as Obra["status"]) ?? "planejada"}
                  onValueChange={(value) =>
                    handleChange("status", value as Obra["status"])
                  }
                  disabled={submitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  placeholder="Rua, número, bairro e cidade"
                  value={dados.endereco ?? ""}
                  onChange={(event) =>
                    handleChange("endereco", event.target.value)
                  }
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição da obra</Label>
              <Textarea
                id="descricao"
                rows={4}
                placeholder="Compartilhe o escopo resumido, objetivos ou observações importantes sobre esta obra."
                value={dados.descricao ?? ""}
                onChange={(event) =>
                  handleChange("descricao", event.target.value)
                }
                disabled={submitting}
              />
            </div>

            <div className="rounded-lg border border-dashed p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Planejamento de etapas
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {etapasValidas.length
                      ? "Revise as etapas planejadas e os insumos antes de salvar."
                      : "Adicione etapas com escopo e insumos para garantir um cronograma previsível."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="secondary">
                    {etapasValidas.length}{" "}
                    {etapasValidas.length === 1 ? "etapa" : "etapas"}
                  </Badge>
                  {etapasValidas.length > 0 ? (
                    <span className="text-sm font-semibold text-foreground">
                      {totalEtapasPlanejadas.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPlannerOpen(true)}
                    disabled={submitting}
                  >
                    Gerenciar etapas
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={submitting || !(dados.nome && dados.nome.trim())}
              >
                {submitting
                  ? "Processando..."
                  : isEditing
                  ? "Salvar alterações"
                  : "Criar obra"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={plannerOpen} onOpenChange={setPlannerOpen}>
        <DialogContent className="max-w-3xl md:max-w-5xl">
          <DialogHeader>
            <DialogTitle>Planejamento de etapas</DialogTitle>
            <DialogDescription>
              Organize as etapas, os insumos necessários e seus custos
              previstos.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
            {etapas.map((etapa, index) => (
              <div
                key={etapa.id}
                className="space-y-4 rounded-lg border bg-background p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Etapa {index + 1}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Informe o nome, custo previsto e os insumos necessários
                      para esta etapa.
                    </p>
                  </div>
                  {etapas.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => removerEtapa(etapa.id)}
                    >
                      Remover etapa
                    </Button>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome da etapa</Label>
                    <Input
                      placeholder="Ex.: Fundação, estrutura, acabamento..."
                      value={etapa.nome}
                      onChange={(event) =>
                        atualizarEtapa(etapa.id, "nome", event.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Custo previsto (R$)</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      placeholder="Valor estimado desta etapa"
                      value={etapa.custoPrevisto}
                      onChange={(event) =>
                        atualizarEtapa(
                          etapa.id,
                          "custoPrevisto",
                          Number(event.target.value ?? 0)
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Textarea
                    rows={3}
                    placeholder="Detalhe as entregas previstas, dependências ou observações relevantes."
                    value={etapa.descricao ?? ""}
                    onChange={(event) =>
                      atualizarEtapa(etapa.id, "descricao", event.target.value)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Insumos desta etapa
                    </h4>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => adicionarInsumo(etapa.id)}
                    >
                      Adicionar insumo
                    </Button>
                  </div>

                  {etapa.insumos.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Nenhum insumo cadastrado. Adicione os materiais ou
                      serviços necessários para esta etapa.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {etapa.insumos.map((insumo) => (
                        <div
                          key={insumo.id}
                          className="grid gap-3 rounded-md border p-3 md:grid-cols-6"
                        >
                          <div className="md:col-span-2 space-y-2">
                            <Label>Insumo</Label>
                            <Input
                              placeholder="Material ou serviço"
                              value={insumo.nome}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "nome",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantidade</Label>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              placeholder="0"
                              value={insumo.quantidade}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "quantidade",
                                  Number(event.target.value ?? 0)
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Unidade</Label>
                            <Input
                              placeholder="Ex.: un, m³, kg"
                              value={insumo.unidade}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "unidade",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Valor unitário (R$)</Label>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min="0"
                              placeholder="0,00"
                              value={insumo.valorUnitario}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "valorUnitario",
                                  Number(event.target.value ?? 0)
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Fornecedor</Label>
                            <Input
                              placeholder="Fornecedor responsável"
                              value={insumo.fornecedor ?? ""}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "fornecedor",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Entrega prevista</Label>
                            <Input
                              type="date"
                              value={insumo.dataEntrega ?? ""}
                              onChange={(event) =>
                                atualizarInsumo(
                                  etapa.id,
                                  insumo.id,
                                  "dataEntrega",
                                  event.target.value
                                )
                              }
                            />
                          </div>
                          <div className="md:col-span-6 flex justify-end">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => removerInsumo(etapa.id, insumo.id)}
                            >
                              Remover insumo
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPlannerOpen(false)}
            >
              Concluir
            </Button>
            <Button type="button" onClick={adicionarEtapa}>
              Adicionar etapa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
