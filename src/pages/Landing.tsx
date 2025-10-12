import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Building2, Calculator, Users, TrendingUp } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-foreground">Obralis</h1>
          <p className="text-xl text-muted-foreground mb-8">Gestão Inteligente de Obras</p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Fazer Login
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth?mode=cadastro')}>
              Cadastrar
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <Building2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Gestão de Obras</CardTitle>
              <CardDescription>Controle completo de todas as suas obras</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Calculator className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Orçamentos</CardTitle>
              <CardDescription>Crie orçamentos detalhados e profissionais</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Equipes</CardTitle>
              <CardDescription>Gerencie sua equipe de forma eficiente</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Financeiro</CardTitle>
              <CardDescription>Controle financeiro completo</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
