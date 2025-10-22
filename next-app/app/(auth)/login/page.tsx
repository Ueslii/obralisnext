"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
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
// Imagens serão carregadas via URL pública
import Link from "next/link";

type LoginFormState = {
    email: string;
    password: string;
};

const initialLoginForm: LoginFormState = {
    email: "",
    password: "",
};

export default function LoginPage() {
    const [form, setForm] = useState<LoginFormState>(initialLoginForm);
    const [pending, setPending] = useState(false);
    const { signIn, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    const updateForm = <Key extends keyof LoginFormState>(
        field: Key,
        value: LoginFormState[Key]
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleLogin = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!form.email.trim()) {
            toast.error("Informe o e-mail corporativo.");
            return;
        }
        if (!form.email.includes("@")) {
            toast.error("Informe um e-mail válido.");
            return;
        }
        if (!form.password) {
            toast.error("Defina uma senha.");
            return;
        }

        setPending(true);

        try {
            const { error } = await signIn(form.email, form.password);
            if (error) {
                throw error;
            }

            toast.success("Login realizado com sucesso!");
            router.push("/dashboard");
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
                        <h1 className="text-3xl font-bold">Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Insira seu e-mail para acessar sua conta.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Acesso</CardTitle>
                            <CardDescription>
                                Use suas credenciais cadastradas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="login-email">E-mail corporativo</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="você@empresa.com"
                                        value={form.email}
                                        onChange={(event) =>
                                            updateForm("email", event.target.value)
                                        }
                                        disabled={pending}
                                        required
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="login-password">Senha</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="Sua senha"
                                        value={form.password}
                                        onChange={(event) =>
                                            updateForm("password", event.target.value)
                                        }
                                        disabled={pending}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={pending}>
                                    {pending ? "Processando..." : "Entrar"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm">
                        Não possui uma conta?
                        <Button variant="link" asChild className="ml-1 underline">
                            <Link href="/register">Cadastre-se</Link>
                        </Button>
                    </div>

                    <div className="text-center text-sm">
                        <Button variant="link" asChild className="text-muted-foreground">
                            <Link href="/reset-password">Esqueceu sua senha?</Link>
                        </Button>
                    </div>
                </div>
            </div>

            <div className="relative hidden bg-muted lg:block">
                <img
                    src="/auth-background.jpg"
                    alt="Imagem de uma construção"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-12 text-center">
                    <img src="/logo-branco.svg" alt="Logo Obralis" className="mb-6 w-[260px]" />
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
