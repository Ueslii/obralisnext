import { Building2, CheckCircle2, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import constructionHero from "@/assets/construction-hero.jpg";

const activeProjects = [
  { id: 1, name: "Residencial Vista Verde", progress: 75, status: "Em dia", deadline: "30 dias" },
  { id: 2, name: "Edifício Comercial Central", progress: 45, status: "Atrasado", deadline: "15 dias" },
  { id: 3, name: "Obra Industrial Norte", progress: 90, status: "Em dia", deadline: "45 dias" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative h-48 rounded-2xl overflow-hidden">
        <img 
          src={constructionHero} 
          alt="Obras em andamento" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 to-foreground/60 flex items-center">
          <div className="px-8 text-primary-foreground">
            <h1 className="text-3xl font-bold mb-2">Bem-vindo ao ObrasPro</h1>
            <p className="text-primary-foreground/90">Gerencie suas obras com eficiência e precisão</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Obras em Andamento"
          value="12"
          icon={Building2}
          trend={{ value: "+2 este mês", positive: true }}
        />
        <StatCard
          title="Obras Concluídas"
          value="48"
          icon={CheckCircle2}
          trend={{ value: "+5 este mês", positive: true }}
        />
        <StatCard
          title="Custo Total Mensal"
          value="R$ 2.4M"
          icon={DollarSign}
          trend={{ value: "+12% vs mês anterior", positive: false }}
        />
        <StatCard
          title="Equipe Ativa"
          value="156"
          icon={Users}
          trend={{ value: "+8 funcionários", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Projects */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Obras em Andamento
            </CardTitle>
            <CardDescription>Acompanhe o progresso das suas obras</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeProjects.map((project) => (
              <div key={project.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{project.name}</span>
                  <span className={project.status === "Em dia" ? "text-success" : "text-destructive"}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={project.progress} className="flex-1" />
                  <span className="text-sm font-mono font-semibold min-w-12 text-right">
                    {project.progress}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Prazo: {project.deadline}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full mt-4">
              Ver todas as obras
            </Button>
          </CardContent>
        </Card>

        {/* Cost Overview */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Visão Geral de Custos
            </CardTitle>
            <CardDescription>Distribuição de despesas do mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Materiais</span>
                <span className="font-mono font-semibold">R$ 980.000</span>
              </div>
              <Progress value={65} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mão de Obra</span>
                <span className="font-mono font-semibold">R$ 520.000</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logística</span>
                <span className="font-mono font-semibold">R$ 380.000</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Equipamentos</span>
                <span className="font-mono font-semibold">R$ 520.000</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-bold text-lg text-primary">R$ 2.400.000</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
