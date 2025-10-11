import { useState } from 'react';
import { Truck, Star, Plus, Eye, Edit, Trash2, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useFornecedores } from '@/hooks/useFornecedores';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function Fornecedores() {
  const { fornecedores, addFornecedor, updateFornecedor, deleteFornecedor } = useFornecedores();
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    cnpj: '',
    categoria: '',
    contato: '',
    telefone: '',
    email: '',
    prazoMedio: 7,
    avaliacaoQualidade: 5,
  });

  const fornecedoresFiltrados = fornecedores.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const handleSubmit = () => {
    if (editingId) {
      updateFornecedor(editingId, formData);
    } else {
      addFornecedor(formData);
    }
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      cnpj: '',
      categoria: '',
      contato: '',
      telefone: '',
      email: '',
      prazoMedio: 7,
      avaliacaoQualidade: 5,
    });
    setEditingId(null);
  };

  const handleEdit = (fornecedor: any) => {
    setFormData(fornecedor);
    setEditingId(fornecedor.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚚 Fornecedores</h1>
          <p className="text-muted-foreground">Gerencie seus fornecedores e acompanhe entregas</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar' : 'Novo'} Fornecedor</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={formData.cnpj} onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input value={formData.categoria} onChange={(e) => setFormData({ ...formData, categoria: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input value={formData.contato} onChange={(e) => setFormData({ ...formData, contato: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={formData.telefone} onChange={(e) => setFormData({ ...formData, telefone: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Prazo Médio (dias)</Label>
                  <Input type="number" value={formData.prazoMedio} onChange={(e) => setFormData({ ...formData, prazoMedio: Number(e.target.value) })} />
                </div>
                <div className="space-y-2">
                  <Label>Avaliação (1-5)</Label>
                  <Input type="number" min="1" max="5" value={formData.avaliacaoQualidade} onChange={(e) => setFormData({ ...formData, avaliacaoQualidade: Number(e.target.value) })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSubmit}>Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Buscar fornecedor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        className="max-w-sm"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fornecedoresFiltrados.map((forn) => (
          <Card key={forn.id} className="card-hover group">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{forn.nome}</CardTitle>
                    <Badge variant="outline" className="mt-1">{forn.categoria}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {forn.telefone}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  {forn.email}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <div>
                  <p className="text-xs text-muted-foreground">Prazo Médio</p>
                  <p className="font-semibold">{forn.prazoMedio} dias</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Avaliação</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{forn.avaliacaoQualidade}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Entregas</p>
                  <p className="font-semibold">{forn.totalEntregas}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Pago</p>
                  <p className="font-semibold font-mono text-sm">R$ {(forn.totalPago / 1000).toFixed(0)}k</p>
                </div>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/fornecedores/${forn.id}`)}>
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleEdit(forn)}>
                  <Edit className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Excluir fornecedor?</AlertDialogTitle>
                      <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteFornecedor(forn.id)} className="bg-destructive">
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
