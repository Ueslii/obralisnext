import { Building2, CheckCircle2, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useObras } from "@/hooks/useObras";
import { useEquipes } from "@/hooks/useEquipes";
import constructionHero from "@/assets/construction-hero.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const { obras } = useObras();
  const { membros, calcularFolhaPagamento } = useEquipes();

  const obrasEmAndamento = obras.filter(o => o.status === 'em_andamento');
  const obrasConcluidas = obras.filter(o => o.status === 'concluida');
  const custoTotalMensal = obras.reduce((acc, o) => acc + o.custoReal, 0);
  const folhaPagamento = calcularFolhaPagamento();

  // Distribuição de custos simulada
  const custoMateriais = custoTotalMensal * 0.40;
  const custoMaoObra = folhaPagamento;
  const custoLogistica = custoTotalMensal * 0.15;
  const custoEquipamentos = custoTotalMensal * 0.20;

  return (
    <div className="space-y-6 animate-fade-in">
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
          value={obrasEmAndamento.length.toString()}
          icon={Building2}
          trend={{ value: `${obras.length} total`, positive: true }}
        />
        <StatCard
          title="Obras Concluídas"
          value={obrasConcluidas.length.toString()}
          icon={CheckCircle2}
          trend={{ value: `${Math.round((obrasConcluidas.length / obras.length) * 100)}% do total`, positive: true }}
        />
        <StatCard
          title="Custo Total Mensal"
          value={`R$ ${(custoTotalMensal / 1000000).toFixed(1)}M`}
          icon={DollarSign}
          trend={{ value: `${obras.length} obras ativas`, positive: false }}
        />
        <StatCard
          title="Equipe Ativa"
          value={membros.filter(m => m.status === 'ativo').length.toString()}
          icon={Users}
          trend={{ value: `${membros.length} total`, positive: true }}
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
            {obrasEmAndamento.slice(0, 3).map((obra) => (
              <div key={obra.id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{obra.nome}</span>
                  <span className={obra.status === "em_andamento" ? "text-success" : "text-destructive"}>
                    {obra.status === "em_andamento" ? "Em dia" : "Atrasada"}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={obra.progresso} className="flex-1" />
                  <span className="text-sm font-mono font-semibold min-w-12 text-right">
                    {obra.progresso}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Prazo: {new Date(obra.prazo).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            ))}
            {obrasEmAndamento.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhuma obra em andamento
              </p>
            )}
            <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/obras')}>
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
                <span className="font-mono font-semibold">R$ {custoMateriais.toLocaleString('pt-BR')}</span>
              </div>
              <Progress value={40} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Mão de Obra</span>
                <span className="font-mono font-semibold">R$ {custoMaoObra.toLocaleString('pt-BR')}</span>
              </div>
              <Progress value={35} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Logística</span>
                <span className="font-mono font-semibold">R$ {custoLogistica.toLocaleString('pt-BR')}</span>
              </div>
              <Progress value={15} className="h-2" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Equipamentos</span>
                <span className="font-mono font-semibold">R$ {custoEquipamentos.toLocaleString('pt-BR')}</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-mono font-bold text-lg text-primary">
                  R$ {custoTotalMensal.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
