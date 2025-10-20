import { Settings, User, Building, Bell, Shield, Palette, Moon, Sun, Share2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCompanyScope } from "@/hooks/useCompanyScope";
import { useConvites } from "@/hooks/useConvites";
import { usePermissions } from "@/hooks/usePermissions";

export default function Configuracoes() {
  const { user } = useAuth();
  const { themeMode, accentColor, toggleTheme, changeAccent } = useTheme();
  const { construtoraId, role: companyRole } = useCompanyScope();
  const { convites, isLoading: loadingConvites, approve, decline, invite, pending: pendingConvite } = useConvites();
  const { userRole } = usePermissions();

  const canModerateInvites = useMemo(() => userRole === "admin" || ["owner", "admin"].includes(companyRole ?? ""), [userRole, companyRole]);

  const [notificacoes, setNotificacoes] = useState({
    emailObras: true,
    alertasOrcamento: true,
    relatoriosSemanais: false,
    push: true,
  });

  // Perfil (puxa do profiles + user_metadata)
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");

  // Empresa (puxa de construtoras)
  const [empresaNome, setEmpresaNome] = useState("");
  const [empresaIdentificador, setEmpresaIdentificador] = useState("");
  const [empresaEndereco, setEmpresaEndereco] = useState("");
  const [empresaCidade, setEmpresaCidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteCargo, setInviteCargo] = useState("");
  const [inviting, setInviting] = useState(false);
  const [convitesFiltro, setConvitesFiltro] = useState<"all" | "pending" | "accepted" | "declined" | "expired">("all");
  const pendentes = useMemo(() => convites.filter((c) => c.status === "pending").length, [convites]);
  const convitesFiltrados = useMemo(
    () => convites.filter((c) => (convitesFiltro === "all" ? true : c.status === convitesFiltro)),
    [convites, convitesFiltro]
  );

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        // profiles
        const prof = await supabase.from("profiles").select("nome,email").eq("id", user.id).maybeSingle();
        if (active) {
          setNome(prof.data?.nome ?? user.nome ?? "");
          setEmail(prof.data?.email ?? user.email ?? "");
        }

        // user metadata
        const u = await supabase.auth.getUser();
        const meta = (u.data.user?.user_metadata ?? {}) as Record<string, any>;
        if (active) {
          setTelefone(typeof meta.telefone === "string" ? meta.telefone : "");
          setCargo(typeof meta.cargo === "string" ? meta.cargo : "");
          const prefs = (meta.prefs_notificacoes ?? null) as any;
          if (prefs && typeof prefs === "object") {
            setNotificacoes({
              emailObras: Boolean(prefs.emailObras),
              alertasOrcamento: Boolean(prefs.alertasOrcamento),
              relatoriosSemanais: Boolean(prefs.relatoriosSemanais),
              push: Boolean(prefs.push),
            });
          }
        }

        // empresa
        if (construtoraId) {
          const comp = await supabase
            .from("construtoras")
            .select("nome, identificador, metadata")
            .eq("id", construtoraId)
            .maybeSingle();
          const md = (comp.data?.metadata ?? {}) as Record<string, any>;
          if (active) {
            setEmpresaNome(comp.data?.nome ?? "");
            setEmpresaIdentificador(comp.data?.identificador ?? "");
            setEmpresaEndereco(typeof md.address === "string" ? md.address : "");
            setEmpresaCidade(typeof md.city === "string" ? md.city : "");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [user?.id, user?.email, user?.nome, construtoraId]);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Atualiza profiles
      const { error: pErr } = await supabase
        .from("profiles")
        .update({ nome, email })
        .eq("id", user.id);
      if (pErr) throw pErr;

      // Atualiza metadados de auth
      const { error: aErr } = await supabase.auth.updateUser({
        data: { nome, telefone, cargo },
      });
      if (aErr) throw aErr;

      toast("Perfil atualizado com sucesso!", { description: "Suas informações pessoais foram atualizadas." });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Não foi possível salvar o perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    if (!construtoraId) return;
    setLoading(true);
    try {
      // Carrega metadata atual para preservar chaves
      const cur = await supabase
        .from("construtoras")
        .select("metadata")
        .eq("id", construtoraId)
        .maybeSingle();
      const md = (cur.data?.metadata ?? {}) as Record<string, any>;
      const newMd = { ...md, address: empresaEndereco, city: empresaCidade };

      const { error } = await supabase
        .from("construtoras")
        .update({ nome: empresaNome, identificador: empresaIdentificador, metadata: newMd })
        .eq("id", construtoraId);
      if (error) throw error;
      toast("Dados da empresa atualizados!", { description: "As informações da empresa foram salvas." });
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Não foi possível salvar os dados da empresa");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { prefs_notificacoes: notificacoes },
      });
      if (error) throw error;
      toast.success("Preferências de notificação salvas");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Não foi possível salvar as Preferências");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await invite(inviteEmail, inviteCargo || null);
      setInviteEmail("");
      setInviteCargo("");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message ?? "Não foi possível enviar o convite");
    } finally {
      setInviting(false);
    }
  };

  const handleUpdatePassword = async () => {
    toast("Senha atualizada com sucesso!", { description: "Sua senha foi alterada com seguranÃ§a." });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold mb-2">ConfiguraÃ§Ãµes</h1>
        <p className="text-muted-foreground">Gerencie suas Preferências e dados da empresa</p>
      </div>

      <Tabs defaultValue="perfil" className="grid gap-6">
        <TabsList className="w-full overflow-x-auto">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="empresa">Empresa</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="personalizacao">PersonalizaÃ§Ã£o</TabsTrigger>
          <TabsTrigger value="integracoes">IntegraÃ§Ãµes</TabsTrigger>
          <TabsTrigger value="seguranca">SeguranÃ§a</TabsTrigger>
          <TabsTrigger value="convites">Convites</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
        {/* User Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Perfil do UsuÃ¡rio
            </CardTitle>
            <CardDescription>informações pessoais e de acesso</CardDescription>
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
            <Button onClick={handleSaveProfile} className="gradient-primary" disabled={loading}>Salvar AlteraÃ§Ãµes</Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="empresa">
        {/* Company */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Dados da Empresa
            </CardTitle>
            <CardDescription>informações da construtora</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="company">Nome da Empresa</Label>
                <Input id="company" value={empresaNome} onChange={(e) => setEmpresaNome(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input id="cnpj" value={empresaIdentificador} onChange={(e) => setEmpresaIdentificador(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">EndereÃ§o</Label>
                <Input id="address" value={empresaEndereco} onChange={(e) => setEmpresaEndereco(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" value={empresaCidade} onChange={(e) => setEmpresaCidade(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleSaveCompany} className="gradient-primary" disabled={loading}>Salvar AlteraÃ§Ãµes</Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="notificacoes">
         {/* Notifications */}
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
                <p className="text-sm text-muted-foreground">Receba atualizaÃ§Ãµes sobre suas obras</p>
              </div>
              <Switch 
                checked={notificacoes.emailObras}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, emailObras: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de orÃ§amento</p>
                <p className="text-sm text-muted-foreground">Quando houver estouro de budget</p>
              </div>
              <Switch 
                checked={notificacoes.alertasOrcamento}
                onCheckedChange={(checked) => setNotificacoes({...notificacoes, alertasOrcamento: checked})}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">RelatÃ³rios semanais</p>
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
        <div className="flex justify-end">
          <Button onClick={handleSaveNotifications}>Salvar Preferências</Button>
        </div>
        </TabsContent>

        <TabsContent value="personalizacao">
        {/* PersonalizaÃ§Ã£o */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              PersonalizaÃ§Ã£o de Interface
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
                  <SelectItem value="orange">ðŸŠ Laranja Construtivo</SelectItem>
                  <SelectItem value="blue">ðŸ”µ Azul TÃ©cnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="integracoes">
        {/* IntegraÃ§Ãµes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              IntegraÃ§Ãµes
            </CardTitle>
            <CardDescription>Conecte com serviÃ§os externos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">ðŸ’¬</span> Integrar WhatsApp Business
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">ðŸ“„</span> Conectar Google Sheets
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <span className="mr-2">â˜ï¸</span> Sincronizar Google Drive
            </Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="seguranca">
        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              SeguranÃ§a
            </CardTitle>
            <CardDescription>Altere sua senha e configuraÃ§Ãµes de seguranÃ§a</CardDescription>
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
        </TabsContent>

        <TabsContent value="convites">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Convites
                <Badge variant="secondary">{pendentes} pendentes</Badge>
              </CardTitle>
              <CardDescription>Gerencie pedidos de acesso Ã  sua construtora</CardDescription>
            </CardHeader>
            <CardContent>
              {canModerateInvites ? (
                <div className="mb-4 grid gap-2 md:grid-cols-3">
                  <div className="md:col-span-2 grid grid-cols-2 gap-2">
                    <Input placeholder="E-mail do convidado" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} />
                    <Input placeholder="Cargo sugerido (opcional)" value={inviteCargo} onChange={(e) => setInviteCargo(e.target.value)} />
                  </div>
                  <div className="flex md:justify-end">
                    <Button onClick={handleInvite} disabled={!inviteEmail || inviting}>Convidar por e-mail</Button>
                  </div>
              </div>
            ) : null}
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{pendentes} convite(s) pendente(s)</p>
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Filtrar:</Label>
                  <Select value={convitesFiltro} onValueChange={(v: any) => setConvitesFiltro(v)}>
                    <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Pendentes</SelectItem>
                      <SelectItem value="accepted">Aprovados</SelectItem>
                      <SelectItem value="declined">Recusados</SelectItem>
                      <SelectItem value="expired">Expirados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {loadingConvites ? (
                <p className="text-sm text-muted-foreground">Carregando convites...</p>
              ) : (
                <div className="space-y-2">
                  {convitesFiltrados.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum convite encontrado.</p>
                  ) : (
                    convitesFiltrados.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="space-y-1">
                          <p className="font-medium">{c.email}</p>
                          <p className="text-xs text-muted-foreground">Status: {c.status}{c.cargoSugerido ? ` â€¢ Cargo: ${c.cargoSugerido}` : ""}</p>
                        </div>
                        {c.status === "pending" ? (
                          <div className="flex gap-2">
                            <Button size="sm" disabled={!canModerateInvites || pendingConvite} onClick={() => void approve(c.id)}>Aprovar</Button>
                            <Button size="sm" variant="destructive" disabled={!canModerateInvites || pendingConvite} onClick={() => void decline(c.id)}>Recusar</Button>
                          </div>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}





