import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type User = {
  id: string;
  nome: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  signUp: (
    email: string,
    password: string,
    nome: string
  ) => Promise<{ error: any }>;
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
    "Usuário";
  return {
    id: authUser.id,
    nome,
    email: authUser.email ?? "",
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
        console.error("Erro ao recuperar sessão:", error);
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

  const signUp = async (email: string, password: string, nome: string) => {
    const redirectTo = `${window.location.origin}/`;
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome },
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
