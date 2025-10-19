import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MessageSquare,
  Image,
  Package,
  DollarSign,
  AlertTriangle,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { useObras } from "@/hooks/useObras";
import { useObraDetalhes, ObraInsumo } from "@/hooks/useObraDetalhes";
import { useFinanceiro } from "@/hooks/useFinanceiro";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Adicionado "export default" aqui
export default function ObraDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // Corrigindo a chamada do hook para usar a nova lógica com Supabase
  const {
    obras,
    isLoading: isLoadingObras,
    updateObra,
    updateObraPending,
  } = useObras();

  // Lógica para encontrar a obra específica após o carregamento
  const obra = !isLoadingObras ? obras.find((o) => o.id === id) : undefined;

  const {
    comentarios,
    imprevistos,
    etapas,
    insumosSemEtapa,
    addComentario,
    addInsumo,
    updateInsumo,
    addImprevisto,
    getTotalImprevistos,
    isLoading: isLoadingDetalhes,
  } = useObraDetalhes(id || "");
  const { lancamentos } = useFinanceiro();

  const [progressoSelecionado, setProgressoSelecionado] = useState<number>(0);
  const [novoComentario, setNovoComentario] = useState("");
  const [novoInsumo, setNovoInsumo] = useState({
    nome: "",
    quantidade: 0,
    unidade: "",
    fornecedor: "",
    dataEntrega: "",
    etapaId: "",
    valorUnitario: 0,
  });
  const [novoImprevisto, setNovoImprevisto] = useState({
    descricao: "",
    valor: 0,
    categoria: "material",
  });

  useEffect(() => {
    if (obra) {
      setProgressoSelecionado(Number(obra.progresso ?? 0));
    }
  }, [obra?.id, obra?.progresso]);

  const progressoAtual = Number(obra?.progresso ?? 0);
  const progressoAlterado = progressoSelecionado !== progressoAtual;

  const handleAtualizarProgresso = async () => {
    if (!obra) return;

    try {
      await updateObra({
        id: obra.id,
        progresso: progressoSelecionado,
      });
      toast.success("Progresso atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar progresso da obra:", error);
      toast.error("Não foi possível atualizar o progresso da obra.");
    }
  };

  if (isLoadingObras || isLoadingDetalhes) {
    return <div>Carregando...</div>;
  }

  if (!obra) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Obra não encontrada</h2>
        <Button onClick={() => navigate("/obras")}>Voltar para Obras</Button>
      </div>
    );
  }

  const lancamentosObra = lancamentos.filter((l) => l.obra_id === id);
  const totalReceitas = lancamentosObra
    .filter((l) => l.tipo === "receita")
    .reduce((sum, l) => sum + l.valor, 0);
  const totalDespesas = lancamentosObra
    .filter((l) => l.tipo === "despesa")
    .reduce((sum, l) => sum + l.valor, 0);
  const saldoObra = totalReceitas - totalDespesas - getTotalImprevistos();

    const handleAddComentario = async () => {
    if (novoComentario.trim()) {
      await addComentario({
        obraId: id || "",
        conteudo: novoComentario,
        tipo: "comentario",
      });
      setNovoComentario("");
    }
  };

  const handleAddInsumo = async () => {
    if (novoInsumo.nome && novoInsumo.quantidade > 0) {
      await addInsumo({
        obraId: id || "",
        nome: novoInsumo.nome,
        quantidade: novoInsumo.quantidade,
        unidade: novoInsumo.unidade,
        fornecedor: novoInsumo.fornecedor || undefined,
        dataEntrega: novoInsumo.dataEntrega || undefined,
        quantidadeUsada: 0,
        etapaId: novoInsumo.etapaId || undefined,
        valorUnitario: novoInsumo.valorUnitario || undefined,
      });
      setNovoInsumo({
        nome: "",
        quantidade: 0,
        unidade: "",
        fornecedor: "",
        dataEntrega: "",
        etapaId: "",
        valorUnitario: 0,
      });
    }
  };

  const handleAddImprevisto = async () => {
    if (novoImprevisto.descricao && novoImprevisto.valor > 0) {
      await addImprevisto({
        obraId: id || "",
        ...novoImprevisto,
      });
      setNovoImprevisto({ descricao: "", valor: 0, categoria: "material" });
    }
  };

  const renderInsumoCard = (insumo: ObraInsumo) => {
    const percentual =
      insumo.quantidade > 0
        ? Math.min(
            100,
            Math.max(0, (insumo.quantidadeUsada / insumo.quantidade) * 100)
          )
        : 0;
    const restante = Math.max(0, insumo.quantidade - insumo.quantidadeUsada);

    return (
      <div key={insumo.id} className="p-4 border rounded-lg space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{insumo.nome}</span>
          {insumo.fornecedor ? (
            <Badge variant="outline">{insumo.fornecedor}</Badge>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span>
            Total: {insumo.quantidade} {insumo.unidade}
          </span>
          <span>
            Usado: {insumo.quantidadeUsada} {insumo.unidade}
          </span>
          <span>
            Restante: {restante} {insumo.unidade}
          </span>
          {insumo.valorUnitario ? (
            <span>
              Valor unitario: R${" "}
              {Number(insumo.valorUnitario).toLocaleString("pt-BR")}
            </span>
          ) : null}
        </div>
        <Progress value={percentual} className="h-2" />
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Atualizar quantidade usada"
            className="flex-1"
            onBlur={(event) => {
              const valor = Number(event.target.value);
              if (!Number.isNaN(valor) && valor >= 0) {
                updateInsumo(insumo.id, valor);
              }
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/obras")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">🏗️ {obra.nome}</h1>
          <p className="text-muted-foreground">{obra.endereco}</p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          {obra.status === "em_andamento"
            ? "Em Andamento"
            : obra.status === "concluida"
            ? "Concluída"
            : obra.status === "atrasada"
            ? "Atrasada"
            : "Planejada"}
        </Badge>
      </div>

      {/* Resumo Geral */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Progresso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Progresso planejado</p>
                <div className="text-3xl font-bold">
                  {progressoSelecionado}%
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  void handleAtualizarProgresso();
                }}
                disabled={!progressoAlterado || updateObraPending}
              >
                {updateObraPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
            <Slider
              value={[progressoSelecionado]}
              max={100}
              step={1}
              onValueChange={([valor]) => {
                if (typeof valor === "number") {
                  setProgressoSelecionado(
                    Math.min(100, Math.max(0, Math.round(valor)))
                  );
                }
              }}
            />
            <div className="space-y-2">
              <Progress value={progressoSelecionado} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Último registro salvo:{" "}
                <span className="font-medium text-foreground">
                  {progressoAtual}%
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-success" />
              Saldo Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold font-mono ${
                saldoObra >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              R$ {saldoObra.toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Imprevistos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-destructive">
              R$ {getTotalImprevistos().toLocaleString("pt-BR")}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Prazo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {obra.prazo
                ? new Date(obra.prazo).toLocaleDateString("pt-BR")
                : "N/D"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="comentarios" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="comentarios">
            <MessageSquare className="h-4 w-4 mr-2" />
            Comentários
          </TabsTrigger>
          <TabsTrigger value="insumos">
            <Package className="h-4 w-4 mr-2" />
            Insumos
          </TabsTrigger>
          <TabsTrigger value="imprevistos">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Imprevistos
          </TabsTrigger>
          <TabsTrigger value="financeiro">
            <DollarSign className="h-4 w-4 mr-2" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comentarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Novo Comentário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Adicione observações, atualizações ou fotos..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                rows={3}
              />
              <Button onClick={handleAddComentario}>
                Adicionar Comentário
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {comentarios.map((com) => (
              <Card key={com.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{com.autor}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(com.data).toLocaleString("pt-BR")}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{com.conteudo}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

                <TabsContent value="insumos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar insumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Nome do material</Label>
                  <Input
                    value={novoInsumo.nome}
                    onChange={(event) =>
                      setNovoInsumo({ ...novoInsumo, nome: event.target.value })
                    }
                    placeholder="Ex: cimento, areia, tijolo..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Etapa</Label>
                  <Select
                    value={novoInsumo.etapaId}
                    onValueChange={(valor) =>
                      setNovoInsumo({ ...novoInsumo, etapaId: valor })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sem etapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {etapas.map((etapa) => (
                        <SelectItem key={etapa.id} value={etapa.id}>
                          {etapa.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fornecedor</Label>
                  <Input
                    value={novoInsumo.fornecedor}
                    onChange={(event) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        fornecedor: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={novoInsumo.quantidade}
                    onChange={(event) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        quantidade: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unidade</Label>
                  <Input
                    value={novoInsumo.unidade}
                    onChange={(event) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        unidade: event.target.value,
                      })
                    }
                    placeholder="Ex: kg, m3, unidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor unitario (R$)</Label>
                  <Input
                    type="number"
                    value={novoInsumo.valorUnitario}
                    onChange={(event) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        valorUnitario: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Data de entrega</Label>
                  <Input
                    type="date"
                    value={novoInsumo.dataEntrega}
                    onChange={(event) =>
                      setNovoInsumo({
                        ...novoInsumo,
                        dataEntrega: event.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleAddInsumo}>Adicionar insumo</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Insumos por etapa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {etapas.length === 0 && insumosSemEtapa.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum insumo registrado para esta obra.
                </p>
              ) : (
                <>
                  {etapas.map((etapa) => (
                    <div key={etapa.id} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold">{etapa.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            Custo previsto: R$ {etapa.custoPrevisto.toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                      {etapa.insumos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum insumo vinculado a esta etapa.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {etapa.insumos.map((insumo) => renderInsumoCard(insumo))}
                        </div>
                      )}
                    </div>
                  ))}
                  {insumosSemEtapa.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-base font-semibold">Insumos sem etapa</h4>
                          <p className="text-sm text-muted-foreground">
                            Materiais ainda nao associados a uma etapa especifica.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {insumosSemEtapa.map((insumo) => renderInsumoCard(insumo))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imprevistos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registrar Imprevisto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Descrição</Label>
                  <Input
                    value={novoImprevisto.descricao}
                    onChange={(e) =>
                      setNovoImprevisto({
                        ...novoImprevisto,
                        descricao: e.target.value,
                      })
                    }
                    placeholder="Descreva o imprevisto..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    value={novoImprevisto.valor}
                    onChange={(e) =>
                      setNovoImprevisto({
                        ...novoImprevisto,
                        valor: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Select
                    value={novoImprevisto.categoria}
                    onValueChange={(v) =>
                      setNovoImprevisto({ ...novoImprevisto, categoria: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="material">Material</SelectItem>
                      <SelectItem value="mao_obra">Mão de Obra</SelectItem>
                      <SelectItem value="equipamento">Equipamento</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAddImprevisto}>
                Registrar Imprevisto
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Imprevistos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {imprevistos.map((imp) => (
                  <div
                    key={imp.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{imp.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {imp.categoria} •{" "}
                        {new Date(imp.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span className="font-mono font-bold text-destructive">
                      R$ {imp.valor.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Custo Previsto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  R$ {(obra.custo_previsto || 0).toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Custo Real
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-destructive">
                  R${" "}
                  {(totalDespesas + getTotalImprevistos()).toLocaleString(
                    "pt-BR"
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Diferença</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold font-mono ${
                    (obra.custo_previsto || 0) -
                      (totalDespesas + getTotalImprevistos()) >=
                    0
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  R${" "}
                  {(
                    (obra.custo_previsto || 0) -
                    (totalDespesas + getTotalImprevistos())
                  ).toLocaleString("pt-BR")}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lançamentos da Obra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lancamentosObra.map((lanc) => (
                  <div
                    key={lanc.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{lanc.descricao}</p>
                      <p className="text-sm text-muted-foreground">
                        {lanc.categoria} •{" "}
                        {new Date(lanc.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        lanc.tipo === "receita"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {lanc.tipo === "receita" ? "+" : "-"} R${" "}
                      {lanc.valor.toLocaleString("pt-BR")}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}



