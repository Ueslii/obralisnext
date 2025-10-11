import { Settings, User, Building, Bell, Shield, Palette, Moon, Sun, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/useTheme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Configuracoes() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { themeMode, accentColor, toggleTheme, changeAccent } = useTheme();
  
  const [notificacoes, setNotificacoes] = useState({
    emailObras: true,
    alertasOrcamento: true,
    relatoriosSemanais: false,
    push: true,
  });

  const handleSaveProfile = () => {
    toast({ 
      title: "Perfil atualizado com sucesso!",
      description: "Suas informações pessoais foram atualizadas."
    });
  };

  const handleSaveCompany = () => {
    toast({ 
      title: "Dados da empresa atualizados!",
      description: "As informações da empresa foram salvas."
    });
  };

  const handleUpdatePassword = () => {
    toast({ 
      title: "Senha atualizada com sucesso!",
      description: "Sua senha foi alterada com segurança."
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-muted-foreground">Gerencie suas preferências e dados da empresa</p>
      </div>

      <div className="grid gap-6">
        {/* User Profile */}
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
                <Input id="name" defaultValue="João da Silva" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" defaultValue={user?.email || "joao@obraspro.com"} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" defaultValue="(11) 98765-4321" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>
                <Input id="cargo" defaultValue="Engenheiro Civil" />
              </div>
            </div>
            <Button onClick={handleSaveProfile} className="gradient-primary">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Company */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>Informações da construtora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input id="company" defaultValue="Construtora Silva & Cia" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" defaultValue="12.345.678/0001-90" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" defaultValue="Rua das Construções, 123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" defaultValue="São Paulo - SP" />
              </div>
            </div>
            <Button onClick={handleSaveCompany} className="gradient-primary">Salvar Alterações</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>Gerencie suas preferências de notificação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">E-mail de obras</p>
                <p className="text-sm text-muted-foreground">Receber atualizações sobre obras</p>
              </div>
              <Switch 
                checked={notificacoes.emailObras}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, emailObras: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de orçamento</p>
                <p className="text-sm text-muted-foreground">Notificações quando custos excedem limites</p>
              </div>
              <Switch 
                checked={notificacoes.alertasOrcamento}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, alertasOrcamento: checked})}
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
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, relatoriosSemanais: checked})}
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
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, push: checked})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Personalização */}
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
            <Separator />
            <div className="space-y-2">
              <Label>Cor de Destaque</Label>
              <Select value={accentColor} onValueChange={(v: any) => changeAccent(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="orange">🟠 Laranja Construtivo</SelectItem>
                  <SelectItem value="blue">🔵 Azul Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Integrações */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Integrações
            </CardTitle>
            <CardDescription>Conecte com serviços externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">📱</span> Integrar WhatsApp Business
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">📊</span> Conectar Google Sheets
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">☁️</span> Sincronizar Google Drive
            </Button>
          </CardContent>
        </Card>

        {/* Security */}
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
            <Button onClick={handleUpdatePassword} className="gradient-primary">Atualizar Senha</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
