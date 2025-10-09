import { useState } from "react";
import { Building2, MapPin, User, Calendar, Edit, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useObras } from "@/hooks/useObras";
import { ObraDialog } from "@/components/obras/ObraDialog";
import { AssistenteDialog } from "@/components/assistente/AssistenteDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Obras() {
  const { obras, addObra, updateObra, deleteObra } = useObras();
  const [filtro, setFiltro] = useState("all");
  const [busca, setBusca] = useState("");

  const obrasFiltradas = obras.filter(obra => {
    const matchFiltro = filtro === "all" || obra.status === filtro;
    const matchBusca = obra.nome.toLowerCase().includes(busca.toLowerCase()) ||
                       obra.endereco.toLowerCase().includes(busca.toLowerCase());
    return matchFiltro && matchBusca;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      concluida: "default",
      atrasada: "destructive",
      em_andamento: "secondary",
      planejada: "outline",
    };
    return variants[status] || "secondary";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      concluida: "Concluída",
      atrasada: "Atrasada",
      em_andamento: "Em Andamento",
      planejada: "Planejada",
    };
    return labels[status] || status;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Obras</h1>
          <p className="text-muted-foreground">Gerencie todas as suas obras em um só lugar</p>
        </div>
        <ObraDialog onSave={addObra} />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Input 
          placeholder="Buscar obra..." 
          className="md:max-w-xs"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="em_andamento">Em andamento</SelectItem>
            <SelectItem value="planejada">Planejada</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="atrasada">Atrasada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Obras Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {obrasFiltradas.map((obra) => (
          <Card key={obra.id} className="card-hover group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{obra.nome}</h3>
                      <Badge variant={getStatusBadge(obra.status)}>
                        {getStatusLabel(obra.status)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="line-clamp-1">{obra.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 flex-shrink-0" />
                    <span>{obra.responsavel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>Prazo: {new Date(obra.prazo).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-mono font-semibold">{obra.progresso}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${obra.progresso}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AssistenteDialog 
                    contexto={obra}
                    trigger={
                      <Button size="sm" variant="outline" className="flex-1">
                        <Sparkles className="h-3 w-3 mr-1" />
                        IA
                      </Button>
                    }
                  />
                  <ObraDialog
                    obra={obra}
                    onSave={(dados) => updateObra(obra.id, dados)}
                    trigger={
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Excluir obra?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. A obra "{obra.nome}" será permanentemente excluída.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteObra(obra.id)} className="bg-destructive">
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {obrasFiltradas.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Nenhuma obra encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {busca || filtro !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Comece criando sua primeira obra"}
            </p>
            {!busca && filtro === "all" && (
              <ObraDialog onSave={addObra} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
