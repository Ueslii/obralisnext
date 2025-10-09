import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Membro } from "@/hooks/useEquipes";
import { UserPlus } from "lucide-react";

interface MembroDialogProps {
  membro?: Membro;
  onSave: (dados: Omit<Membro, 'id'>) => void;
  trigger?: React.ReactNode;
}

export function MembroDialog({ membro, onSave, trigger }: MembroDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<Omit<Membro, 'id'>>({
    nome: membro?.nome || '',
    funcao: membro?.funcao || '',
    valorHora: membro?.valorHora || 0,
    telefone: membro?.telefone || '',
    email: membro?.email || '',
    obraAtual: membro?.obraAtual || '',
    status: membro?.status || 'ativo',
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
            <UserPlus className="h-4 w-4" />
            Adicionar Funcionário
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{membro ? 'Editar Funcionário' : 'Novo Funcionário'}</DialogTitle>
          <DialogDescription>Preencha os dados do funcionário</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome Completo *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funcao">Função *</Label>
              <Input
                id="funcao"
                value={formData.funcao}
                onChange={(e) => setFormData({ ...formData, funcao: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valorHora">Valor/Hora (R$) *</Label>
              <Input
                id="valorHora"
                type="number"
                value={formData.valorHora}
                onChange={(e) => setFormData({ ...formData, valorHora: Number(e.target.value) })}
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
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="ferias">Férias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="obraAtual">Obra Atual</Label>
            <Input
              id="obraAtual"
              value={formData.obraAtual}
              onChange={(e) => setFormData({ ...formData, obraAtual: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="gradient-primary">
              {membro ? 'Atualizar' : 'Adicionar'} Funcionário
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
