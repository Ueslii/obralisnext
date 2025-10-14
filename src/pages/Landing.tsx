import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Calculator, Users, TrendingUp, CheckCircle2, BarChart3, FileText, Wallet, Clock, Shield } from "lucide-react";
import logoBranco from "@/assets/logo-branco.svg";
import logoAzul from "@/assets/logo-azul.svg";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <img src={logoAzul} alt="Obralis" className="h-10 dark:hidden" />
          <img src={logoBranco} alt="Obralis" className="h-10 hidden dark:block" />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/auth')}>
              Login
            </Button>
            <Button onClick={() => navigate('/auth')}>
              Começar Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
            Gestão Inteligente de Obras
            <span className="block text-primary mt-2">Simples e Poderosa</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Controle completo de obras, orçamentos detalhados, gestão de equipes e financeiro em uma única plataforma profissional.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="gradient-primary" onClick={() => navigate('/auth')}>
              Começar Agora
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tudo que você precisa para gerenciar suas obras</h2>
          <p className="text-muted-foreground text-lg">Ferramentas profissionais para construtoras e engenheiros</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card className="card-hover">
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestão de Obras</CardTitle>
              <CardDescription>Acompanhe o progresso, prazos e custos de cada obra em tempo real</CardDescription>
            </CardHeader>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Orçamentos Detalhados</CardTitle>
              <CardDescription>Crie orçamentos profissionais com cálculos automáticos e exportação em PDF</CardDescription>
            </CardHeader>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestão de Equipes</CardTitle>
              <CardDescription>Controle completo de funcionários, cargos e folha de pagamento</CardDescription>
            </CardHeader>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <Wallet className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Controle Financeiro</CardTitle>
              <CardDescription>Acompanhe receitas, despesas e fluxo de caixa em tempo real</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">Por que escolher o Obralis?</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Orçamentos Profissionais</h3>
                    <p className="text-muted-foreground">Sistema completo com cálculo de insumos, mão de obra, transporte e margens automáticas</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Controle Total</h3>
                    <p className="text-muted-foreground">Acompanhe cada etapa das obras, de materiais a equipes, tudo em um só lugar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Relatórios em PDF</h3>
                    <p className="text-muted-foreground">Gere orçamentos profissionais com QR code e assinatura digital</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Interface Moderna</h3>
                    <p className="text-muted-foreground">Design intuitivo e responsivo, funciona em qualquer dispositivo</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Controle Financeiro</div>
              </Card>
              <Card className="p-6 text-center">
                <Clock className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">70%</div>
                <div className="text-sm text-muted-foreground">Economia de Tempo</div>
              </Card>
              <Card className="p-6 text-center">
                <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">PDF</div>
                <div className="text-sm text-muted-foreground">Orçamentos Pro</div>
              </Card>
              <Card className="p-6 text-center">
                <Shield className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold mb-1">100%</div>
                <div className="text-sm text-muted-foreground">Seguro e Confiável</div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="space-y-6">
              <h2 className="text-4xl font-bold">Comece a gerenciar suas obras hoje</h2>
              <p className="text-xl text-muted-foreground">
                Junte-se a centenas de construtoras que já utilizam o Obralis para gerenciar suas obras com eficiência
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button size="lg" className="gradient-primary" onClick={() => navigate('/auth')}>
                  Começar Grátis
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                  Falar com Vendas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <img src={logoAzul} alt="Obralis" className="h-8 dark:hidden" />
              <img src={logoBranco} alt="Obralis" className="h-8 hidden dark:block" />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Obralis. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
