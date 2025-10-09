import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Obra } from "@/hooks/useObras";
import { Plus } from "lucide-react";

interface ObraDialogProps {
  obra?: Obra;
  onSave: (dados: Omit<Obra, 'id'>) => void;
  trigger?: React.ReactNode;
}

export function ObraDialog({ obra, onSave, trigger }: ObraDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Obra, 'id'>>({
    nome: obra?.nome || '',
    endereco: obra?.endereco || '',
    status: obra?.status || 'planejada',
    responsavel: obra?.responsavel || '',
    prazo: obra?.prazo || '',
    progresso: obra?.progresso || 0,
    custoPrevisto: obra?.custoPrevisto || 0,
    custoReal: obra?.custoReal || 0,
    descricao: obra?.descricao || '',
    dataInicio: obra?.dataInicio || '',
  });

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
            Nova Obra
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{obra ? 'Editar Obra' : 'Nova Obra'}</DialogTitle>
          <DialogDescription>Preencha os dados da obra</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Obra *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável *</Label>
              <Input
                id="responsavel"
                value={formData.responsavel}
                onChange={(e) => setFormData({ ...formData, responsavel: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço *</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planejada">Planejada</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluida">Concluída</SelectItem>
                  <SelectItem value="atrasada">Atrasada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={(e) => setFormData({ ...formData, dataInicio: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prazo">Prazo *</Label>
              <Input
                id="prazo"
                type="date"
                value={formData.prazo}
                onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="progresso">Progresso (%)</Label>
              <Input
                id="progresso"
                type="number"
                min="0"
                max="100"
                value={formData.progresso}
                onChange={(e) => setFormData({ ...formData, progresso: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custoPrevisto">Custo Previsto (R$)</Label>
              <Input
                id="custoPrevisto"
                type="number"
                value={formData.custoPrevisto}
                onChange={(e) => setFormData({ ...formData, custoPrevisto: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="custoReal">Custo Real (R$)</Label>
              <Input
                id="custoReal"
                type="number"
                value={formData.custoReal}
                onChange={(e) => setFormData({ ...formData, custoReal: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary">
              {obra ? 'Atualizar' : 'Criar'} Obra
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
