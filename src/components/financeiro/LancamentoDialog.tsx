import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Lancamento, NewLancamento } from "@/hooks/useFinanceiro";
import { Obra } from "@/hooks/useObras";
import { Membro } from "@/hooks/useEquipes";

interface LancamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lancamento?: Lancamento;
  onSave: (
    dados: NewLancamento | (Partial<NewLancamento> & { id: string })
  ) => void | Promise<void>;
  obras: Obra[];
  membros: Membro[];
  isSubmitting?: boolean;
}

// Tipo para o estado do formulário, que pode incluir dados temporários de UI como nomeObra
type FormData = NewLancamento & {
  nomeObra?: string;
};

export function LancamentoDialog({
  open,
  onOpenChange,
  lancamento,
  onSave,
  obras,
  membros,
  isSubmitting,
}: LancamentoDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    obra_id: "",
    tipo: "despesa",
    categoria: "materiais",
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    etapa: "",
    membro_id: "",
    nomeObra: "", // Adiciona nomeObra para fins de UI
  });

  useEffect(() => {
    if (open && lancamento) {
      setFormData({
        obra_id: lancamento.obra_id,
        tipo: lancamento.tipo,
        categoria: lancamento.categoria,
        descricao: lancamento.descricao,
        valor: lancamento.valor,
        data: lancamento.data,
        etapa: lancamento.etapa,
        membro_id: lancamento.membro_id ?? "",
        nomeObra: lancamento.obras?.nome || "",
      });
    } else if (open && !lancamento) {
      // Reseta o formulário ao abrir para uma nova entrada
      setFormData({
        obra_id: "",
        tipo: "despesa",
        categoria: "materiais",
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split("T")[0],
        etapa: "",
        membro_id: "",
        nomeObra: "",
      });
    }
  }, [open, lancamento]);

  const handleObraChange = (obraId: string) => {
    const obra = obras.find((o) => o.id === obraId);
    setFormData((prev) => ({
      ...prev,
      obra_id: obraId,
      nomeObra: obra?.nome || "",
    }));
  };

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => {
      if (field === "categoria") {
        const novaCategoria = value as FormData["categoria"];
        return {
          ...prev,
          categoria: novaCategoria,
          membro_id:
            novaCategoria === "hora_extra" ? prev.membro_id ?? "" : "",
        };
      }

      if (field === "membro_id") {
        return {
          ...prev,
          membro_id: value,
        };
      }

      return { ...prev, [field]: value };
    });
  };

  const [internalSubmitting, setInternalSubmitting] = useState(false);
  const submitting = internalSubmitting || Boolean(isSubmitting);
  const requiresMembro = formData.categoria === "hora_extra";
  const canSubmit =
    !requiresMembro ||
    (Boolean(formData.membro_id) && membros.length > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !canSubmit) return;

    const { nomeObra: _nomeObra, membro_id, obra_id, ...restante } = formData;
    const payload: NewLancamento = {
      ...restante,
      obra_id: obra_id ? obra_id : null,
      membro_id:
        formData.categoria === "hora_extra" && membro_id
          ? membro_id
          : null,
    };

    try {
      setInternalSubmitting(true);
      if (lancamento?.id) {
        await onSave({ id: lancamento.id, ...payload });
      } else {
        await onSave(payload);
      }
    } finally {
      setInternalSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {lancamento ? "Editar Lançamento" : "Novo Lançamento"}
          </DialogTitle>
          <DialogDescription>
            Registre despesas e receitas da obra
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="obra">Obra</Label>
              <Select value={formData.obra_id} onValueChange={handleObraChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>
                      {obra.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={formData.tipo}
                onValueChange={(v: any) => handleChange("tipo", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="despesa">Despesa</SelectItem>
                  <SelectItem value="receita">Receita</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Select
                value={formData.categoria}
                onValueChange={(v: any) => handleChange("categoria", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materiais">Materiais</SelectItem>
                  <SelectItem value="alimentacao">Alimentação</SelectItem>
                  <SelectItem value="combustivel">Combustível</SelectItem>
                  <SelectItem value="extras">Extras</SelectItem>
                  <SelectItem value="pagamento">Pagamento</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => handleChange("data", e.target.value)}
                required
              />
            </div>
          </div>

          {formData.categoria === "hora_extra" && (
            <div className="space-y-2">
              <Label htmlFor="membro_id">Colaborador responsável</Label>
              <Select
                value={(formData.membro_id as string) ?? ""}
                onValueChange={(valor: string) => handleChange("membro_id", valor)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {membros.length === 0 ? (
                    <SelectItem value="" disabled>
                      Cadastre colaboradores em Equipes
                    </SelectItem>
                  ) : (
                    membros.map((membro) => (
                      <SelectItem key={membro.id} value={membro.id}>
                        {membro.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {membros.length === 0 && (
                <p className="text-xs text-destructive">
                  É necessário cadastrar colaboradores para lançar horas extras.
                </p>
              )}
              {membros.length > 0 && !formData.membro_id && (
                <p className="text-xs text-destructive">
                  Selecione o colaborador responsável pela hora extra.
                </p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Ex: Cimento e areia"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) =>
                  handleChange("valor", parseFloat(e.target.value) || 0)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa (opcional)</Label>
              <Input
                id="etapa"
                value={formData.etapa || ""}
                onChange={(e) => handleChange("etapa", e.target.value)}
                placeholder="Ex: Fundação"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || !canSubmit}>
              {submitting
                ? "Processando..."
                : lancamento
                ? "Salvar"
                : "Adicionar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
