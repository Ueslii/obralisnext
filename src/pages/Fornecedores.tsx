import { useMemo, useState } from "react";
import {
  Truck,
  Star,
  Plus,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useFornecedores } from "@/hooks/useFornecedores";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const initialForm = {
  nome: "",
  cnpj: "",
  categoria: "",
  contato: "",
  telefone: "",
  email: "",
  prazoMedio: 7,
  avaliacaoQualidade: 5,
};

export default function Fornecedores() {
  const {
    fornecedores,
    isLoading,
    addFornecedor,
    updateFornecedor,
    deleteFornecedor,
  } = useFornecedores();

  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialForm);

  const fornecedoresFiltrados = useMemo(
    () =>
      fornecedores.filter((f) => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return true;
        return (
          f.nome.toLowerCase().includes(termo) ||
          (f.categoria ?? "").toLowerCase().includes(termo)
        );
      }),
    [busca, fornecedores]
  );

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateFornecedor(editingId, formData);
      } else {
        await addFornecedor(formData);
      }
      setDialogOpen(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id: string) => {
    const fornecedor = fornecedores.find((f) => f.id === id);
    if (!fornecedor) return;

    setFormData({
      nome: fornecedor.nome,
      cnpj: fornecedor.cnpj ?? "",
      categoria: fornecedor.categoria ?? "",
      contato: fornecedor.contato ?? "",
      telefone: fornecedor.telefone ?? "",
      email: fornecedor.email ?? "",
      prazoMedio: fornecedor.prazoMedio ?? 0,
      avaliacaoQualidade: fornecedor.avaliacaoQualidade ?? 0,
    });
    setEditingId(fornecedor.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">🚚 Fornecedores</h1>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores e acompanhe entregas
          </p>
        </div>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar" : "Novo"} Fornecedor
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.nome}
                    onChange={(event) =>
                      setFormData({ ...formData, nome: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(event) =>
                      setFormData({ ...formData, cnpj: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input
                    value={formData.categoria}
                    onChange={(event) =>
                      setFormData({ ...formData, categoria: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contato</Label>
                  <Input
                    value={formData.contato}
                    onChange={(event) =>
                      setFormData({ ...formData, contato: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(event) =>
                      setFormData({ ...formData, telefone: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    value={formData.email}
                    onChange={(event) =>
                      setFormData({ ...formData, email: event.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo Médio (dias)</Label>
                  <Input
                    type="number"
                    value={formData.prazoMedio}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        prazoMedio: Number(event.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Avaliação (1-5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.avaliacaoQualidade}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        avaliacaoQualidade: Number(event.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Input
        placeholder="Buscar fornecedor..."
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        className="max-w-sm"
      />

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Carregando fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Buscando dados cadastrados...
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {fornecedoresFiltrados.map((fornecedor) => {
          const prazoMedio = fornecedor.prazoMedio ?? 0;
          const avaliacao = fornecedor.avaliacaoQualidade ?? 0;

          return (
            <Card key={fornecedor.id} className="card-hover group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{fornecedor.nome}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {fornecedor.categoria ?? "Sem categoria"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {fornecedor.telefone || "-"}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {fornecedor.email || "-"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Prazo Médio</p>
                    <p className="font-semibold">
                      {prazoMedio > 0 ? `${prazoMedio} dias` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Avaliação</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {avaliacao > 0 ? avaliacao.toFixed(1) : "—"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entregas</p>
                    <p className="font-semibold">{fornecedor.totalEntregas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Pago</p>
                    <p className="font-semibold font-mono text-sm">
                      {currency.format(fornecedor.totalPago)}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate(`/fornecedores/${fornecedor.id}`)}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Ver
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(fornecedor.id)}
                  >
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
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive"
                          onClick={() => {
                            void deleteFornecedor(fornecedor.id);
                          }}
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!isLoading && fornecedoresFiltrados.length === 0 && (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="text-lg">Nenhum fornecedor encontrado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ajuste a busca ou cadastre um novo fornecedor para começar.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
