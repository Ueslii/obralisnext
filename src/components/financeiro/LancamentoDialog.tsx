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

interface LancamentoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lancamento?: Lancamento;
  onSave: (
    dados: NewLancamento | (Partial<NewLancamento> & { id: string })
  ) => void;
  obras: Obra[];
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
}: LancamentoDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    obra_id: "",
    tipo: "despesa",
    categoria: "materiais",
    descricao: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    etapa: "",
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
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { nomeObra, ...dadosParaSalvar } = formData; // Remove campo exclusivo da UI

    if (lancamento?.id) {
      onSave({ id: lancamento.id, ...dadosParaSalvar });
    } else {
      onSave(dadosParaSalvar as NewLancamento);
    }
    onOpenChange(false);
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
            <Button type="submit">{lancamento ? "Salvar" : "Adicionar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
