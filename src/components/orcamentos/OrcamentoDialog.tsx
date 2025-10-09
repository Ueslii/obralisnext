import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Orcamento, ItemOrcamento } from "@/hooks/useOrcamentos";
import { Plus, Trash2 } from "lucide-react";

interface OrcamentoDialogProps {
  orcamento?: Orcamento;
  onSave: (dados: Omit<Orcamento, 'id' | 'custoTotal'>) => void;
  trigger?: React.ReactNode;
}

export function OrcamentoDialog({ orcamento, onSave, trigger }: OrcamentoDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Orcamento, 'id' | 'custoTotal'>>({
    obraId: orcamento?.obraId || '',
    nomeObra: orcamento?.nomeObra || '',
    tipoObra: orcamento?.tipoObra || 'residencial',
    area: orcamento?.area || 0,
    itens: orcamento?.itens || [{ etapa: '', custoPorM2: 0, extras: 0 }],
    dataEmissao: orcamento?.dataEmissao || new Date().toISOString().split('T')[0],
    status: orcamento?.status || 'rascunho',
  });

  const addItem = () => {
    setFormData({
      ...formData,
      itens: [...formData.itens, { etapa: '', custoPorM2: 0, extras: 0 }],
    });
  };

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      itens: formData.itens.filter((_, i) => i !== index),
    });
  };

  const updateItem = (index: number, campo: keyof ItemOrcamento, valor: any) => {
    const novosItens = [...formData.itens];
    novosItens[index] = { ...novosItens[index], [campo]: valor };
    setFormData({ ...formData, itens: novosItens });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gradient-primary gap-2">
            <Plus className="h-4 w-4" />
            Novo Orçamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{orcamento ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
          <DialogDescription>Configure as etapas e custos do orçamento</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nomeObra">Nome da Obra *</Label>
              <Input
                id="nomeObra"
                value={formData.nomeObra}
                onChange={(e) => setFormData({ ...formData, nomeObra: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipoObra">Tipo da Obra</Label>
              <Select value={formData.tipoObra} onValueChange={(value: any) => setFormData({ ...formData, tipoObra: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="comercial">Comercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="area">Área (m²) *</Label>
              <Input
                id="area"
                type="number"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="aprovado">Aprovado</SelectItem>
                  <SelectItem value="revisao">Em Revisão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Itens do Orçamento</Label>
              <Button type="button" size="sm" variant="outline" onClick={addItem}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar Item
              </Button>
            </div>

            {formData.itens.map((item, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Etapa</Label>
                  <Input
                    value={item.etapa}
                    onChange={(e) => updateItem(index, 'etapa', e.target.value)}
                    placeholder="Ex: Fundação"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo/m² (R$)</Label>
                  <Input
                    type="number"
                    value={item.custoPorM2}
                    onChange={(e) => updateItem(index, 'custoPorM2', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Extras (R$)</Label>
                  <Input
                    type="number"
                    value={item.extras}
                    onChange={(e) => updateItem(index, 'extras', Number(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => removeItem(index)}
                    disabled={formData.itens.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary">
              {orcamento ? 'Atualizar' : 'Criar'} Orçamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
