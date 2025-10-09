import { Building2, MapPin, User, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const obras = [
  {
    id: 1,
    name: "Residencial Vista Verde",
    address: "Rua das Flores, 123 - Jardim Primavera",
    engineer: "Eng. Carlos Santos",
    status: "Em andamento",
    progress: 75,
    deadline: "2024-12-30",
  },
  {
    id: 2,
    name: "Edifício Comercial Central",
    address: "Av. Principal, 456 - Centro",
    engineer: "Eng. Maria Silva",
    status: "Atrasado",
    progress: 45,
    deadline: "2024-11-15",
  },
  {
    id: 3,
    name: "Obra Industrial Norte",
    address: "Rod. BR-101, Km 45",
    engineer: "Eng. João Oliveira",
    status: "Em andamento",
    progress: 90,
    deadline: "2024-11-30",
  },
  {
    id: 4,
    name: "Condomínio Residencial Sol",
    address: "Rua do Sol, 789 - Bairro Novo",
    engineer: "Eng. Ana Paula",
    status: "Concluída",
    progress: 100,
    deadline: "2024-10-15",
  },
];

export default function Obras() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Obras</h1>
          <p className="text-muted-foreground">Gerencie todas as suas obras em um só lugar</p>
        </div>
        <Button className="gradient-primary gap-2">
          <Plus className="h-4 w-4" />
          Nova Obra
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <Input placeholder="Buscar obra..." className="md:max-w-xs" />
        <Select defaultValue="all">
          <SelectTrigger className="md:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="andamento">Em andamento</SelectItem>
            <SelectItem value="concluida">Concluída</SelectItem>
            <SelectItem value="atrasado">Atrasado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Obras Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {obras.map((obra) => (
          <Card key={obra.id} className="card-hover cursor-pointer">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{obra.name}</h3>
                      <Badge
                        variant={
                          obra.status === "Concluída"
                            ? "default"
                            : obra.status === "Atrasado"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {obra.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{obra.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{obra.engineer}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Prazo: {new Date(obra.deadline).toLocaleDateString("pt-BR")}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progresso</span>
                    <span className="text-sm font-mono font-semibold">{obra.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${obra.progress}%` }}
                    />
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
