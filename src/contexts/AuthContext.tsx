import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

// Interface para o nosso usuário customizado na aplicação
interface User {
  id: string;
  nome: string;
  email: string;
  roles: string[];
}

// Tipagem para o contexto de autenticação
interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    nome: string
  ) => Promise<{ error: any }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: any; session: Session | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean; // Estado para controlar o carregamento inicial da autenticação
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Começa como true para verificar a sessão

  // Função para carregar o perfil e as roles do usuário do banco de dados
  const loadUserProfile = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", supabaseUser.id)
        .single();

      if (profileError) throw profileError;

      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", supabaseUser.id);

      if (rolesError) throw rolesError;

      setUser({
        id: supabaseUser.id,
        nome: profile?.nome || supabaseUser.email?.split("@")[0] || "Usuário",
        email: supabaseUser.email || "",
        roles: userRoles?.map((r) => r.role) || ["usuario"],
      });
    } catch (error) {
      console.error("Erro ao carregar perfil do usuário:", error);
      setUser(null);
      // Opcional: Deslogar o usuário se o perfil não puder ser carregado para evitar estado inconsistente
      await supabase.auth.signOut();
    }
  }, []);

  // Efeito para gerenciar o estado de autenticação em toda a aplicação
  useEffect(() => {
    // A melhor prática é usar apenas o onAuthStateChange.
    // Ele dispara um evento 'INITIAL_SESSION' no carregamento da página.
    // Isso evita a necessidade de chamar getSession() e o listener separadamente.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        // Se não há sessão, o usuário é nulo.
        setUser(null);
      }
      // O loading é finalizado após a primeira verificação (seja ela com ou sem sessão)
      setLoading(false);
    });

    // Limpa a inscrição ao desmontar o componente
    return () => subscription.unsubscribe();
  }, [loadUserProfile]); // A dependência garante que a função mais recente seja usada

  // Função de cadastro
  const signUp = async (email: string, password: string, nome: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { nome },
      },
    });
    return { error };
  };

  // Função de login
  const signIn = async (email: string, password: string) => {
    // Não precisamos mais gerenciar o 'loading' aqui, o onAuthStateChange fará isso.
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    // O `onAuthStateChange` será acionado automaticamente em caso de sucesso,
    // atualizando o estado do usuário e da sessão.
    return { error, session: data.session };
  };

  // Função de logout
  const signOut = async () => {
    await supabase.auth.signOut();
    // O `onAuthStateChange` também vai tratar o evento de SIGNED_OUT,
    // limpando o estado do usuário e da sessão.
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        signUp,
        signIn,
        signOut,
        // A autenticação é válida apenas se a sessão e o perfil do usuário foram carregados
        isAuthenticated: !!session && !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para acessar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
