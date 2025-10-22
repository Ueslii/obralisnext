"use client";

import { useState } from "react";
import { Settings, User, Building, Bell, Shield, Palette, Moon, Sun } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useTheme } from "@/hooks/useTheme";

export default function ConfiguracoesPage() {
  const { user } = useAuth();
  const { themeMode, toggleTheme } = useTheme();

  const [notificacoes, setNotificacoes] = useState({
    emailObras: true,
    alertasOrcamento: true,
    relatoriosSemanais: false,
    push: true,
  });

  const [nome, setNome] = useState(user?.nome || "");
  const [email, setEmail] = useState(user?.email || "");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");

  const handleSaveProfile = async () => {
    try {
      toast.success("Perfil atualizado com sucesso!");
    } catch (e: unknown) {
      toast.error("Não foi possível salvar o perfil");
    }
  };

  const autoSaveNotifications = async (next: typeof notificacoes) => {
    setNotificacoes(next);
    toast.success("Preferências atualizadas");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da empresa</p>
      </div>

      <Tabs defaultValue="perfil" className="grid gap-6">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="personalizacao">Personalização</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Perfil do Usuário
              </CardTitle>
              <CardDescription>Informações pessoais e de acesso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" value={nome} onChange={(e) => setNome(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input id="cargo" value={cargo} onChange={(e) => setCargo(e.target.value)} />
                </div>
              </div>
              <Button onClick={handleSaveProfile} className="gradient-primary">
                Salvar Alterações
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações
              </CardTitle>
              <CardDescription>Preferências de alertas e avisos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de obras por e-mail</p>
                  <p className="text-sm text-muted-foreground">Receba atualizações sobre suas obras</p>
                </div>
                <Switch
                  checked={notificacoes.emailObras}
                  onCheckedChange={(checked) => void autoSaveNotifications({ ...notificacoes, emailObras: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertas de orçamento</p>
                  <p className="text-sm text-muted-foreground">Quando houver estouro de budget</p>
                </div>
                <Switch
                  checked={notificacoes.alertasOrcamento}
                  onCheckedChange={(checked) => void autoSaveNotifications({ ...notificacoes, alertasOrcamento: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Relatórios semanais</p>
                  <p className="text-sm text-muted-foreground">Resumo semanal por e-mail</p>
                </div>
                <Switch
                  checked={notificacoes.relatoriosSemanais}
                  onCheckedChange={(checked) => void autoSaveNotifications({ ...notificacoes, relatoriosSemanais: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notificações push</p>
                  <p className="text-sm text-muted-foreground">Alertas no navegador</p>
                </div>
                <Switch
                  checked={notificacoes.push}
                  onCheckedChange={(checked) => void autoSaveNotifications({ ...notificacoes, push: checked })}
                />
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-end text-sm text-muted-foreground pr-1">
            Preferências são salvas automaticamente
          </div>
        </TabsContent>

        <TabsContent value="personalizacao">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                Personalização de Interface
              </CardTitle>
              <CardDescription>Ajuste tema e cores de destaque</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {themeMode === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <div>
                    <p className="font-medium">Modo {themeMode === 'light' ? 'Claro' : 'Escuro'}</p>
                    <p className="text-sm text-muted-foreground">Alternar entre claro e escuro</p>
                  </div>
                </div>
                <Switch checked={themeMode === 'dark'} onCheckedChange={toggleTheme} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Segurança
              </CardTitle>
              <CardDescription>Altere sua senha e configurações de segurança</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <Button className="gradient-primary">Atualizar Senha</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

