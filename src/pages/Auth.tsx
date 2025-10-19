import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import authBackground from "@/assets/auth-background.jpg";
import logoBranco from "@/assets/logo-branco.svg";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [pending, setPending] = useState(false);
  const { signIn, signUp, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setNome("");
  };

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setPending(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          throw error;
        }

        toast.success("Login realizado com sucesso!");
        navigate("/dashboard");
        return;
      }

      const displayName = nome.trim() || email.split("@")[0];
      const { error } = await signUp(email, password, displayName);
      if (error) {
        throw error;
      }

      toast.success(
        "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
      );
      resetForm();
      setIsLogin(true);
    } catch (err) {
      const message =
        typeof err === "object" && err !== null && "message" in err
          ? String((err as { message: string }).message)
          : "Não foi possível concluir a ação.";
      toast.error(message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isLogin ? "Login" : "Criar conta"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isLogin
                ? "Insira seu e-mail para acessar sua conta."
                : "Crie sua conta para começar a usar a plataforma."}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{isLogin ? "Acesso" : "Cadastro"}</CardTitle>
              <CardDescription>
                {isLogin
                  ? "Use suas credenciais cadastradas."
                  : "Informe seus dados para criar uma nova conta."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAuth} className="grid gap-4">
                {!isLogin && (
                  <div className="grid gap-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input
                      id="nome"
                      type="text"
                      placeholder="Como gostaria de ser chamado"
                      value={nome}
                      onChange={(event) => setNome(event.target.value)}
                      disabled={pending}
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="voce@exemplo.com"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={pending}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo de 6 caracteres"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={pending}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={pending}>
                  {pending
                    ? "Processando..."
                    : isLogin
                    ? "Entrar"
                    : "Criar conta"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm">
            {isLogin ? "Não possui uma conta?" : "Já possui uma conta?"}
            <Button
              variant="link"
              onClick={() => {
                setIsLogin((previous) => !previous);
                resetForm();
              }}
              className="ml-1 underline"
              disabled={pending}
            >
              {isLogin ? "Cadastre-se" : "Faça login"}
            </Button>
          </div>
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <img
          src={authBackground}
          alt="Imagem de uma construção"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-12 text-center">
          <img src={logoBranco} alt="Logo Obralis" className="mb-6 w-[260px]" />
          <p className="text-2xl font-semibold text-white">
            A plataforma completa para gestão de obras.
          </p>
          <p className="mt-2 max-w-md text-white/80">
            Controle, eficiência e resultados em um só lugar. Economize tempo e
            mantenha cada projeto sob controle.
          </p>
        </div>
      </div>
    </div>
  );
}
