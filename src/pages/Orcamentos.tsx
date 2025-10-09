import { Calculator, FileText, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Orcamentos() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orçamentos</h1>
        <p className="text-muted-foreground">Calcule custos e gere orçamentos detalhados</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calculator Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-primary" />
              Calculadora de Orçamento
            </CardTitle>
            <CardDescription>Preencha os dados para calcular o custo estimado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo da Obra</Label>
                <Select>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residencial">Residencial</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="area">Área (m²)</Label>
                <Input id="area" type="number" placeholder="1500" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Custos Estimados</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="materiais">Materiais (R$/m²)</Label>
                  <Input id="materiais" type="number" placeholder="650" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mao-obra">Mão de Obra (R$/m²)</Label>
                  <Input id="mao-obra" type="number" placeholder="350" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logistica">Logística (R$/m²)</Label>
                  <Input id="logistica" type="number" placeholder="120" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipamentos">Equipamentos (R$/m²)</Label>
                  <Input id="equipamentos" type="number" placeholder="180" />
                </div>
              </div>
            </div>

            <Button className="w-full gradient-primary">
              Calcular Orçamento
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Resultado
            </CardTitle>
            <CardDescription>Valor total estimado</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Custo por m²</p>
                <p className="text-2xl font-mono font-bold">R$ 1.300,00</p>
              </div>

              <div className="p-6 rounded-lg bg-primary/10 border-2 border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Total Estimado</p>
                <p className="text-3xl font-mono font-bold text-primary">R$ 1.950.000</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Materiais</span>
                  <span className="font-mono font-semibold">R$ 975.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mão de Obra</span>
                  <span className="font-mono font-semibold">R$ 525.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Logística</span>
                  <span className="font-mono font-semibold">R$ 180.000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipamentos</span>
                  <span className="font-mono font-semibold">R$ 270.000</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full gap-2">
              <FileText className="h-4 w-4" />
              Gerar PDF
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Budgets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Orçamentos Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "Residencial Vista Verde", value: "R$ 2.400.000", date: "15/10/2024" },
              { name: "Edifício Comercial Central", value: "R$ 3.800.000", date: "12/10/2024" },
              { name: "Obra Industrial Norte", value: "R$ 5.200.000", date: "08/10/2024" },
            ].map((budget, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
                <div>
                  <p className="font-medium">{budget.name}</p>
                  <p className="text-sm text-muted-foreground">{budget.date}</p>
                </div>
                <p className="font-mono font-semibold text-lg">{budget.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
