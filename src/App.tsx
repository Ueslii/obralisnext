import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import DashboardLayout from "@/components/layout/DashboardLayout";
import Auth from "@/pages/Auth";
import Landing from "@/pages/Landing";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Obras from "@/pages/Obras";
import ObraDetalhes from "@/pages/ObraDetalhes";
import Financeiro from "@/pages/Financeiro";
import Equipes from "@/pages/Equipes";
import Fornecedores from "@/pages/Fornecedores";
import FornecedorDetalhes from "@/pages/FornecedorDetalhes";
import Orcamentos from "@/pages/Orcamentos";
import Relatorios from "@/pages/Relatorios";
import Alertas from "@/pages/Alertas";
import Configuracoes from "@/pages/Configuracoes";

/**
 * Componente de tela de carregamento global para evitar repetição.
 */
function SplashScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
}

/**
 * Componente que gerencia o redirecionamento inicial.
 * Verifica o estado de autenticação após o carregamento e redireciona o usuário.
 */
function AppEntry() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  // Se não está carregando, decide para onde ir.
  // Se estiver autenticado, vai para o dashboard, senão, para a landing page.
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />;
}

/**
 * Componente para proteger rotas que exigem autenticação.
 */
function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    // Se o carregamento terminou e não está autenticado, redireciona para a tela de login.
    return <Navigate to="/auth" replace />;
  }

  // Se estiver autenticado, renderiza o layout do dashboard com o conteúdo da rota filha.
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}

function App() {
  return (
    <Routes>
      {/* A rota raiz agora usa o AppEntry para decidir o destino */}
      <Route path="/" element={<AppEntry />} />
      <Route path="/auth" element={<Auth />} />

      {/* Agrupa todas as rotas protegidas sob o `ProtectedRoute` */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/obras" element={<Obras />} />
        <Route path="/obras/:id" element={<ObraDetalhes />} />
        <Route path="/financeiro" element={<Financeiro />} />
        <Route path="/equipes" element={<Equipes />} />
        <Route path="/fornecedores" element={<Fornecedores />} />
        <Route path="/fornecedores/:id" element={<FornecedorDetalhes />} />
        <Route path="/orcamentos" element={<Orcamentos />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>

      {/* Rota para páginas não encontradas */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
