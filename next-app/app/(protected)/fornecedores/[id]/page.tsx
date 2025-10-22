"use client";

import { ArrowLeft, Truck, Star, Phone, Mail, MapPin, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export default function FornecedorDetalhesPage() {
  const router = useRouter();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Detalhes do Fornecedor</h1>
          <p className="text-muted-foreground">Informações completas do fornecedor</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            Fornecedor Exemplo
          </CardTitle>
          <CardDescription>Detalhes do fornecedor selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium mb-1">Funcionalidade em desenvolvimento</p>
            <p className="text-sm text-muted-foreground">
              A página de detalhes do fornecedor será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
