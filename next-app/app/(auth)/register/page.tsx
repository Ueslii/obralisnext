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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
// Imagens serão carregadas via URL pública
import Link from "next/link";

type SignUpFormState = {
    nome: string;
    email: string;
    telefone: string;
    password: string;
    confirmPassword: string;
    acceptTerms: boolean;
    companyName: string;
    companyIdentifier: string;
    segment: string;
    role: string;
    companySize: string;
};

const initialSignUpForm: SignUpFormState = {
    nome: "",
    email: "",
    telefone: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    companyName: "",
    companyIdentifier: "",
    segment: "",
    role: "",
    companySize: "",
};

const SEGMENT_OPTIONS = [
    { value: "residencial", label: "Residencial" },
    { value: "comercial", label: "Comercial" },
    { value: "industrial", label: "Industrial" },
    { value: "infraestrutura", label: "Infraestrutura" },
    { value: "incorporadora", label: "Incorporadora" },
    { value: "outros", label: "Outros" },
];

const ROLE_OPTIONS = [
    { value: "admin", label: "Administrador(a)" },
    { value: "engenheiro", label: "Engenheiro(a)" },
    { value: "gestor", label: "Gestor(a)" },
    { value: "financeiro", label: "Financeiro" },
    { value: "planejamento", label: "Planejamento" },
    { value: "compras", label: "Compras" },
    { value: "outro", label: "Outro" },
];

const COMPANY_SIZE_OPTIONS = [
    { value: "ate-5", label: "Até 5 obras em andamento" },
    { value: "6-15", label: "Entre 6 e 15 obras" },
    { value: "16-30", label: "Entre 16 e 30 obras" },
    { value: "31-60", label: "Entre 31 e 60 obras" },
    { value: "acima-60", label: "Mais de 60 obras" },
    { value: "nao-informa", label: "Prefiro não informar" },
];

export default function RegisterPage() {
    const [formStep, setFormStep] = useState<1 | 2>(1);
    const [form, setForm] = useState<SignUpFormState>(initialSignUpForm);
    const [pending, setPending] = useState(false);
    const { signUp, isAuthenticated, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace("/dashboard");
        }
    }, [authLoading, isAuthenticated, router]);

    const resetForm = () => {
        setForm(initialSignUpForm);
        setFormStep(1);
        setPending(false);
    };

    const updateForm = <Key extends keyof SignUpFormState>(
        field: Key,
        value: SignUpFormState[Key]
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const validateStepOne = () => {
        if (!form.nome.trim()) {
            return "Informe o nome completo.";
        }
        if (!form.email.trim()) {
            return "Informe o e-mail corporativo.";
        }
        if (!form.email.includes("@")) {
            return "Informe um e-mail válido.";
        }
        if (!form.password) {
            return "Defina uma senha.";
        }
        if (form.password.length < 6) {
            return "A senha deve ter pelo menos 6 caracteres.";
        }
        if (form.password !== form.confirmPassword) {
            return "As senhas não coincidem.";
        }
        if (!form.acceptTerms) {
            return "Você precisa aceitar os termos para continuar.";
        }
        return null;
    };

    const validateStepTwo = () => {
        if (!form.companyName.trim()) {
            return "Informe o nome da construtora.";
        }
        if (!form.segment) {
            return "Selecione o segmento de atuação.";
        }
        if (!form.role) {
            return "Selecione o cargo.";
        }
        return null;
    };

    const handleSignUp = async (event: React.FormEvent) => {
        event.preventDefault();

        if (formStep === 1) {
            const stepOneError = validateStepOne();
            if (stepOneError) {
                toast.error(stepOneError);
                return;
            }
            setFormStep(2);
            return;
        }

        const stepTwoError = validateStepTwo();
        if (stepTwoError) {
            toast.error(stepTwoError);
            return;
        }

        setPending(true);

        try {
            const trimmedIdentifier = form.companyIdentifier.trim();
            const isExistingCompanyFlow = trimmedIdentifier.length > 0;

            const { error } = await signUp({
                email: form.email.trim(),
                password: form.password,
                nome: form.nome.trim(),
                telefone: form.telefone.trim() || undefined,
                cargo: form.role,
                segmento: form.segment,
                empresaNome: form.companyName.trim(),
                empresaIdentificador: trimmedIdentifier || undefined,
                empresaPorte: form.companySize || undefined,
            });

            if (error) {
                throw error;
            }

            toast.success(
                isExistingCompanyFlow
                    ? "Solicitação enviada! Assim que um administrador aprovar, você receberá um aviso por e-mail."
                    : "Cadastro realizado! Verifique seu e-mail para confirmar a conta."
            );
            resetForm();
            router.push("/login");
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

    const handleBackToStepOne = () => {
        setFormStep(1);
    };

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">Criar conta</h1>
                        <p className="text-balance text-muted-foreground">
                            {formStep === 1
                                ? "Preencha seus dados pessoais para começar."
                                : "Agora conte um pouco sobre a empresa."}
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cadastro</CardTitle>
                            <CardDescription>
                                Informe seus dados para criar uma nova conta.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignUp} className="grid gap-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span
                                        className={
                                            formStep === 1
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        1. Informações pessoais
                                    </span>
                                    <span
                                        className={
                                            formStep === 2
                                                ? "text-primary"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        2. Empresa
                                    </span>
                                </div>

                                {formStep === 1 && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="nome">Nome completo</Label>
                                            <Input
                                                id="nome"
                                                type="text"
                                                placeholder="Como você gostaria de ser chamado"
                                                value={form.nome}
                                                onChange={(event) =>
                                                    updateForm("nome", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="email">E-mail corporativo</Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="você@empresa.com"
                                                value={form.email}
                                                onChange={(event) =>
                                                    updateForm("email", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="telefone">Telefone (opcional)</Label>
                                            <Input
                                                id="telefone"
                                                type="tel"
                                                placeholder="(00) 00000-0000"
                                                value={form.telefone}
                                                onChange={(event) =>
                                                    updateForm("telefone", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="password">Senha</Label>
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="Mínimo de 6 caracteres"
                                                value={form.password}
                                                onChange={(event) =>
                                                    updateForm("password", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="confirmPassword">Confirmar senha</Label>
                                            <Input
                                                id="confirmPassword"
                                                type="password"
                                                placeholder="Repita a senha"
                                                value={form.confirmPassword}
                                                onChange={(event) =>
                                                    updateForm("confirmPassword", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="flex items-start gap-2 rounded-md border border-muted p-3">
                                            <Checkbox
                                                id="acceptTerms"
                                                checked={form.acceptTerms}
                                                onCheckedChange={(checked) =>
                                                    updateForm("acceptTerms", checked === true)
                                                }
                                                disabled={pending}
                                            />
                                            <Label
                                                htmlFor="acceptTerms"
                                                className="text-left text-sm font-normal text-muted-foreground"
                                            >
                                                Li e aceito os Termos de Uso e a Política de Privacidade
                                                da plataforma.
                                            </Label>
                                        </div>
                                    </>
                                )}

                                {formStep === 2 && (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="companyName">Nome da construtora</Label>
                                            <Input
                                                id="companyName"
                                                type="text"
                                                placeholder="Informe o nome oficial da empresa"
                                                value={form.companyName}
                                                onChange={(event) =>
                                                    updateForm("companyName", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="companyIdentifier">
                                                CNPJ ou código da empresa (opcional)
                                            </Label>
                                            <Input
                                                id="companyIdentifier"
                                                type="text"
                                                placeholder="00.000.000/0000-00"
                                                value={form.companyIdentifier}
                                                onChange={(event) =>
                                                    updateForm("companyIdentifier", event.target.value)
                                                }
                                                disabled={pending}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Se sua construtora já possui conta, informe o CNPJ ou código para solicitar acesso ao administrador.
                                            </p>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Segmento de atuação</Label>
                                            <Select
                                                value={form.segment || undefined}
                                                onValueChange={(value) => updateForm("segment", value)}
                                                disabled={pending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o segmento" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {SEGMENT_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>Cargo ou função</Label>
                                            <Select
                                                value={form.role || undefined}
                                                onValueChange={(value) => updateForm("role", value)}
                                                disabled={pending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione seu cargo" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {ROLE_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid gap-2">
                                            <Label>
                                                Número de obras em andamento ou porte (opcional)
                                            </Label>
                                            <Select
                                                value={form.companySize || undefined}
                                                onValueChange={(value) =>
                                                    updateForm("companySize", value)
                                                }
                                                disabled={pending}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione uma opção" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {COMPANY_SIZE_OPTIONS.map((option) => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </>
                                )}

                                {formStep === 1 && (
                                    <Button type="submit" className="w-full">
                                        Continuar
                                    </Button>
                                )}

                                {formStep === 2 && (
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={handleBackToStepOne}
                                            disabled={pending}
                                        >
                                            Voltar
                                        </Button>
                                        <Button type="submit" className="flex-1" disabled={pending}>
                                            {pending ? "Processando..." : "Criar conta"}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm">
                        Já possui uma conta?
                        <Button variant="link" asChild className="ml-1 underline">
                            <Link href="/login">Faça login</Link>
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
