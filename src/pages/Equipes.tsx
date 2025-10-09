import { Users, Plus, Briefcase, DollarSign, UserPlus } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

const equipes = [
  {
    id: 1,
    name: "Carlos Roberto",
    role: "Engenheiro Civil",
    valorHora: "R$ 150",
    obra: "Residencial Vista Verde",
    status: "Ativo",
    initials: "CR",
  },
  {
    id: 2,
    name: "Maria Santos",
    role: "Mestre de Obras",
    valorHora: "R$ 85",
    obra: "Edifício Comercial Central",
    status: "Ativo",
    initials: "MS",
  },
  {
    id: 3,
    name: "João Silva",
    role: "Pedreiro",
    valorHora: "R$ 45",
    obra: "Residencial Vista Verde",
    status: "Ativo",
    initials: "JS",
  },
  {
    id: 4,
    name: "Ana Paula",
    role: "Arquiteta",
    valorHora: "R$ 120",
    obra: "Obra Industrial Norte",
    status: "Férias",
    initials: "AP",
  },
  {
    id: 5,
    name: "Pedro Oliveira",
    role: "Eletricista",
    valorHora: "R$ 55",
    obra: "Edifício Comercial Central",
    status: "Ativo",
    initials: "PO",
  },
  {
    id: 6,
    name: "Fernanda Costa",
    role: "Encanadora",
    valorHora: "R$ 50",
    obra: "Residencial Vista Verde",
    status: "Ativo",
    initials: "FC",
  },
];

export default function Equipes() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Equipes</h1>
          <p className="text-muted-foreground">Gerencie funcionários e folha de pagamento</p>
        </div>
        <Button className="gradient-primary gap-2">
          <UserPlus className="h-4 w-4" />
          Adicionar Funcionário
        </Button>
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
                <p className="text-2xl font-mono font-bold">156</p>
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
                <p className="text-2xl font-mono font-bold">142</p>
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
                <p className="text-2xl font-mono font-bold">R$ 520K</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Input placeholder="Buscar funcionário..." className="max-w-md" />

      {/* Team Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {equipes.map((membro) => (
          <Card key={membro.id} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                    {membro.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold truncate">{membro.name}</h3>
                      <p className="text-sm text-muted-foreground">{membro.role}</p>
                    </div>
                    <Badge variant={membro.status === "Ativo" ? "default" : "secondary"}>
                      {membro.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Valor/hora</span>
                      <span className="font-mono font-semibold">{membro.valorHora}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Obra</span>
                      <span className="font-medium truncate ml-2">{membro.obra}</span>
                    </div>
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
