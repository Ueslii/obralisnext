import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Session,
  type PostgrestError,
  type User as SupabaseAuthUser,
} from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import type { Json, TablesInsert } from "@/integrations/supabase/types";

const INVITE_EXPIRATION_DAYS = 7;

type SignUpPayload = {
  email: string;
  password: string;
  nome: string;
  telefone?: string;
  cargo?: string;
  segmento?: string;
  empresaNome?: string;
  empresaIdentificador?: string;
  empresaPorte?: string;
};

type SignUpMetadata = {
  nome?: string;
  telefone?: string | null;
  cargo?: string | null;
  segmento?: string | null;
  empresa_nome?: string | null;
  empresa_identificador?: string | null;
  empresa_porte?: string | null;
  empresa_signup_mode?: "new" | "existing";
  empresa_bootstrap_completed?: boolean;
};

type User = {
  id: string;
  nome: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signUp: (payload: SignUpPayload) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mapUser = (session: Session | null): User | null => {
  if (!session?.user) return null;
  const authUser = session.user;
  const nome =
    (typeof authUser.user_metadata?.nome === "string" &&
      authUser.user_metadata.nome) ||
    authUser.email?.split("@")[0] ||
    "Usuario";
  return {
    id: authUser.id,
    nome,
    email: authUser.email ?? "",
  };
};

const isUniqueViolation = (error: PostgrestError | null | undefined) =>
  error?.code === "23505";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const bootstrapInProgress = useRef(false);

  const syncSession = useCallback((incoming: Session | null) => {
    setSession(incoming);
    setUser(mapUser(incoming));
  }, []);

  useEffect(() => {
    let active = true;

    const bootstrap = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!active) return;
      if (error) {
        console.error("Erro ao recuperar sessao:", error);
        syncSession(null);
      } else {
        syncSession(data.session);
      }
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      syncSession(newSession);
    });

    void bootstrap();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const markBootstrapComplete = useCallback(async () => {
    const { error } = await supabase.auth.updateUser({
      data: { empresa_bootstrap_completed: true },
    });
    if (error) {
      throw error;
    }
  }, []);

  const createInviteForExisting = useCallback(
    async (
      authUser: SupabaseAuthUser,
      metadata: SignUpMetadata,
      identifier: string
    ) => {
      if (!authUser.email) {
        console.warn("Usuario sem e-mail nao pode solicitar convite.");
        await markBootstrapComplete();
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from("construtoras_public")
        .select("id, nome")
        .eq("identificador", identifier)
        .maybeSingle();

      if (empresaError) {
        throw empresaError;
      }

      if (!empresa) {
        console.warn("Construtora nao encontrada para o identificador informado.");
        await markBootstrapComplete();
        return;
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRATION_DAYS);

      const invitePayload: TablesInsert<"construtora_convites"> = {
        construtora_id: empresa.id,
        email: authUser.email,
        cargo_sugerido: metadata.cargo ?? null,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        created_by: authUser.id,
        invited_by: null,
      };

      const { error: inviteError } = await supabase
        .from("construtora_convites")
        .insert([invitePayload]);

      if (inviteError && !isUniqueViolation(inviteError)) {
        throw inviteError;
      }

      await markBootstrapComplete();
    },
    [markBootstrapComplete]
  );

  const handleEmpresaBootstrap = useCallback(
    async (authUser: SupabaseAuthUser) => {
      const metadata = (authUser.user_metadata ?? {}) as SignUpMetadata;
      if (metadata.empresa_bootstrap_completed) {
        return;
      }

      const hasCompanyInfo =
        !!metadata.empresa_nome || !!metadata.empresa_identificador;
      if (!hasCompanyInfo) {
        await markBootstrapComplete();
        return;
      }

      const { data: existingMembership, error: membershipError } = await supabase
        .from("construtora_membros")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (membershipError) {
        throw membershipError;
      }

      if (existingMembership) {
        await markBootstrapComplete();
        return;
      }

      const signupMode =
        metadata.empresa_signup_mode ??
        (metadata.empresa_identificador ? "existing" : "new");

      if (
        signupMode === "existing" &&
        metadata.empresa_identificador &&
        metadata.empresa_identificador.trim().length > 0
      ) {
        await createInviteForExisting(
          authUser,
          metadata,
          metadata.empresa_identificador.trim()
        );
        return;
      }

      const metadataPayload: Json | null = metadata.telefone
        ? { telefone_contato: metadata.telefone }
        : null;

      const construtoraPayload: TablesInsert<"construtoras"> = {
        nome:
          metadata.empresa_nome?.trim() ||
          authUser.user_metadata?.empresa_nome?.toString() ||
          "Nova Construtora",
        identificador: metadata.empresa_identificador?.trim() || null,
        segmento: metadata.segmento ?? null,
        porte: metadata.empresa_porte ?? null,
        metadata: metadataPayload,
        owner_id: authUser.id,
        created_by: authUser.id,
      };

      const { data: construtora, error: construtoraError } = await supabase
        .from("construtoras")
        .insert([construtoraPayload])
        .select("id")
        .single();

      if (construtoraError) {
        if (
          metadata.empresa_identificador &&
          metadata.empresa_identificador.trim().length > 0 &&
          isUniqueViolation(construtoraError)
        ) {
          await createInviteForExisting(
            authUser,
            metadata,
            metadata.empresa_identificador.trim()
          );
          return;
        }
        throw construtoraError;
      }

      const construtoraId = construtora.id;

      const membroPayload: TablesInsert<"construtora_membros"> = {
        construtora_id: construtoraId,
        user_id: authUser.id,
        role: "owner",
        cargo: metadata.cargo ?? null,
        invited_by: authUser.id,
        accepted_at: new Date().toISOString(),
        created_by: authUser.id,
      };

      const { error: membroError } = await supabase
        .from("construtora_membros")
        .insert([membroPayload]);

      if (membroError && !isUniqueViolation(membroError)) {
        throw membroError;
      }

      await markBootstrapComplete();
    },
    [createInviteForExisting, markBootstrapComplete]
  );

  useEffect(() => {
    const authUser = session?.user;
    if (!authUser) return;
    if (bootstrapInProgress.current) return;

    const metadata = authUser.user_metadata as SignUpMetadata | undefined;
    if (
      metadata?.empresa_bootstrap_completed ||
      (!metadata?.empresa_nome && !metadata?.empresa_identificador)
    ) {
      return;
    }

    bootstrapInProgress.current = true;
    const run = async () => {
      try {
        await handleEmpresaBootstrap(authUser);
      } catch (error) {
        console.error("Erro ao sincronizar dados da construtora:", error);
      } finally {
        bootstrapInProgress.current = false;
      }
    };

    void run();
  }, [handleEmpresaBootstrap, session?.user]);

  const signUp = async (payload: SignUpPayload) => {
    const redirectTo = `${window.location.origin}/`;
    const trimmedIdentifier = payload.empresaIdentificador?.trim();
    const signupMode =
      trimmedIdentifier && trimmedIdentifier.length > 0 ? "existing" : "new";

    const result = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          nome: payload.nome,
          telefone: payload.telefone ?? null,
          cargo: payload.cargo ?? null,
          segmento: payload.segmento ?? null,
          empresa_nome: payload.empresaNome ?? null,
          empresa_identificador: trimmedIdentifier ?? null,
          empresa_porte: payload.empresaPorte ?? null,
          empresa_signup_mode: signupMode,
          empresa_bootstrap_completed: false,
        } satisfies SignUpMetadata,
        emailRedirectTo: redirectTo,
      },
    });
    return { error: result.error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    syncSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        isAuthenticated: !!session,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
};
