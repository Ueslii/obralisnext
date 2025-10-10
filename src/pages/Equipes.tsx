import { Users, Briefcase, DollarSign, Edit, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useEquipes } from "@/hooks/useEquipes";
import { MembroDialog } from "@/components/equipes/MembroDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function Equipes() {
  const { membros, addMembro, updateMembro, deleteMembro, calcularFolhaPagamento } = useEquipes();
  const [busca, setBusca] = useState("");

  const membrosFiltrados = membros.filter(m => 
    m.nome.toLowerCase().includes(busca.toLowerCase()) ||
    m.funcao.toLowerCase().includes(busca.toLowerCase())
  );

  const totalAtivos = membros.filter(m => m.status === 'ativo').length;
  const folhaMensal = calcularFolhaPagamento();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">👷 RH e Equipes</h1>
          <p className="text-muted-foreground">Gerencie funcionários, folha de pagamento e horas extras</p>
        </div>
        <MembroDialog onSave={addMembro} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Funcionários</p>
                <p className="text-2xl font-mono font-bold">{membros.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ativos</p>
                <p className="text-2xl font-mono font-bold">{totalAtivos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Folha Mensal</p>
                <p className="text-2xl font-mono font-bold">R$ {(folhaMensal / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Input placeholder="Buscar funcionário..." className="max-w-md" value={busca} onChange={(e) => setBusca(e.target.value)} />

      {/* Team Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {membrosFiltrados.map((membro) => (
          <Card key={membro.id} className="card-hover group">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                    {membro.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold truncate">{membro.nome}</h3>
                      <p className="text-sm text-muted-foreground">{membro.funcao}</p>
                    </div>
                    <Badge variant={membro.status === "ativo" ? "default" : "secondary"}>
                      {membro.status === 'ativo' ? 'Ativo' : membro.status === 'ferias' ? 'Férias' : 'Inativo'}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor/hora</span>
                      <span className="font-mono font-semibold">R$ {membro.valorHora}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Mensal (160h)</span>
                      <span className="font-mono font-semibold text-primary">R$ {(membro.valorHora * 160).toLocaleString('pt-BR')}</span>
                    </div>
                    {membro.obraAtual && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Obra</span>
                        <span className="font-medium truncate ml-2">{membro.obraAtual}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MembroDialog membro={membro} onSave={(dados) => updateMembro(membro.id, dados)} trigger={<Button size="sm" variant="outline" className="flex-1"><Edit className="h-3 w-3 mr-1" />Editar</Button>} />
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive"><Trash2 className="h-3 w-3" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMembro(membro.id)} className="bg-destructive">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
