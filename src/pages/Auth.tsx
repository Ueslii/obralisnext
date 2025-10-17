import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext"; // Importar o hook useAuth
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
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth(); // Usar as funções do AuthContext
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let error;
    if (isLogin) {
      // Usar a função signIn do AuthContext
      const { error: signInError } = await signIn(email, password);
      error = signInError;
    } else {
      // Idealmente, a lógica de nome deveria ser adicionada aqui também.
      // Por simplicidade, vamos assumir que o nome é coletado em outro lugar ou não é obrigatório no signup inicial.
      // Para um signup completo, seria: await signUp(email, password, nome);
      const { error: signUpError } = await signUp(
        email,
        password,
        email.split("@")[0]
      );
      error = signUpError;
    }

    if (error) {
      toast.error(
        error.message || `Erro ao tentar ${isLogin ? "entrar" : "cadastrar"}.`
      );
    } else {
      toast.success(`${isLogin ? "Login" : "Cadastro"} realizado com sucesso!`);
      navigate("/");
    }
    setLoading(false);
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">
              {isLogin ? "Login" : "Criar Conta"}
            </h1>
            <p className="text-balance text-muted-foreground">
              {isLogin
                ? "Insira seu email para acessar sua conta"
                : "Crie uma conta para começar a usar"}
            </p>
          </div>
          <form onSubmit={handleAuth} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Obralis@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Senha min.6 caracteres "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Carregando..." : isLogin ? "Entrar" : "Criar Conta"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="underline"
            >
              {isLogin ? "Cadastre-se" : "Faça login"}
            </Button>
          </div>
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative ">
        <img
          src={authBackground}
          alt="Imagem de uma construção"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 flex flex-col  items-center justify-center p-12">
          <img
            src={logoBranco}
            alt="Logo Obralis"
            className="w-[500px]  mb-4"
          />
          <p className="text-white text-2xl font-semibold mt-4">
            A plataforma completa para gestão de obras.
          </p>
          <p className="text-white/80 mt-2">
            Controle, eficiência e resultados em um só lugar.
          </p>
        </div>
      </div>
    </div>
  );
}
