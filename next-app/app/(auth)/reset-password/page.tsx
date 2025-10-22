"use client";

import { useState } from "react";
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
import { supabase } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
    const [email, setEmail] = useState("");
    const [pending, setPending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleResetPassword = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!email.trim()) {
            toast.error("Informe o e-mail corporativo.");
            return;
        }
        if (!email.includes("@")) {
            toast.error("Informe um e-mail válido.");
            return;
        }

        setPending(true);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            });

            if (error) {
                throw error;
            }

            setEmailSent(true);
            toast.success("E-mail de recuperação enviado!");
        } catch (err) {
            const message =
                typeof err === "object" && err !== null && "message" in err
                    ? String((err as { message: string }).message)
                    : "Não foi possível enviar o e-mail de recuperação.";
            toast.error(message);
        } finally {
            setPending(false);
        }
    };

    if (emailSent) {
        return (
            <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
                <div className="flex items-center justify-center py-12">
                    <div className="mx-auto grid w-[350px] gap-6">
                        <div className="grid gap-2 text-center">
                            <h1 className="text-3xl font-bold">E-mail enviado!</h1>
                            <p className="text-balance text-muted-foreground">
                                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                            </p>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Se você não receber o e-mail em alguns minutos, verifique sua pasta de spam.
                                    </p>
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/login">Voltar ao login</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
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

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Recuperar senha</h1>
                        <p className="text-balance text-muted-foreground">
                            Digite seu e-mail para receber instruções de recuperação.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Redefinir senha</CardTitle>
                            <CardDescription>
                                Enviaremos um link para redefinir sua senha.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleResetPassword} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="email">E-mail corporativo</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="você@empresa.com"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        disabled={pending}
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={pending}>
                                    {pending ? "Enviando..." : "Enviar e-mail"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm">
                        Lembrou da senha?
                        <Button variant="link" asChild className="ml-1 underline">
                            <Link href="/login">Voltar ao login</Link>
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
