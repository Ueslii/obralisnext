import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Lancamento } from '@/hooks/useFinanceiro';
import { useObras } from '@/hooks/useObras';

interface LancamentoDialogProps {
  lancamento?: Lancamento;
  onSave: (dados: Omit<Lancamento, 'id'>) => void;
  trigger?: React.ReactNode;
}

export function LancamentoDialog({ lancamento, onSave, trigger }: LancamentoDialogProps) {
  const [open, setOpen] = useState(false);
  const { obras } = useObras();
  
  const [formData, setFormData] = useState({
    obraId: lancamento?.obraId || '',
    nomeObra: lancamento?.nomeObra || '',
    tipo: lancamento?.tipo || 'despesa' as 'despesa' | 'receita',
    categoria: lancamento?.categoria || 'materiais' as any,
    descricao: lancamento?.descricao || '',
    valor: lancamento?.valor || 0,
    data: lancamento?.data || new Date().toISOString().split('T')[0],
    etapa: lancamento?.etapa || '',
  });

  const handleObraChange = (obraId: string) => {
    const obra = obras.find(o => o.id === obraId);
    setFormData({ ...formData, obraId, nomeObra: obra?.nome || '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
    setFormData({
      obraId: '',
      nomeObra: '',
      tipo: 'despesa',
      categoria: 'materiais',
      descricao: '',
      valor: 0,
      data: new Date().toISOString().split('T')[0],
      etapa: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Lançamento
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{lancamento ? 'Editar Lançamento' : 'Novo Lançamento'}</DialogTitle>
          <DialogDescription>Registre despesas e receitas da obra</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="obra">Obra</Label>
              <Select value={formData.obraId} onValueChange={handleObraChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a obra" />
                </SelectTrigger>
                <SelectContent>
                  {obras.map((obra) => (
                    <SelectItem key={obra.id} value={obra.id}>{obra.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={formData.tipo} onValueChange={(v: any) => setFormData({ ...formData, tipo: v })}>
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
              <Select value={formData.categoria} onValueChange={(v: any) => setFormData({ ...formData, categoria: v })}>
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
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Input
              id="descricao"
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="etapa">Etapa (opcional)</Label>
              <Input
                id="etapa"
                value={formData.etapa}
                onChange={(e) => setFormData({ ...formData, etapa: e.target.value })}
                placeholder="Ex: Fundação"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {lancamento ? 'Salvar' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
