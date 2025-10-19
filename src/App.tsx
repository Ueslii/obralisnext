import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";

import DashboardLayout from "@/components/layout/DashboardLayout";
const AuthPage = lazy(() => import("@/pages/Auth"));
const LandingPage = lazy(() => import("@/pages/Landing"));
const NotFoundPage = lazy(() => import("@/pages/NotFound"));
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const ObrasPage = lazy(() => import("@/pages/Obras"));
const ObraDetalhesPage = lazy(() => import("@/pages/ObraDetalhes"));
const FinanceiroPage = lazy(() => import("@/pages/Financeiro"));
const EquipesPage = lazy(() => import("@/pages/Equipes"));
const FornecedoresPage = lazy(() => import("@/pages/Fornecedores"));
const FornecedorDetalhesPage = lazy(
  () => import("@/pages/FornecedorDetalhes")
);
const OrcamentosPage = lazy(() => import("@/pages/Orcamentos"));
const RelatoriosPage = lazy(() => import("@/pages/Relatorios"));
const AlertasPage = lazy(() => import("@/pages/Alertas"));
const ConfiguracoesPage = lazy(() => import("@/pages/Configuracoes"));

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
  return isAuthenticated ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LandingPage />
  );
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
    <Suspense fallback={<SplashScreen />}>
      <Routes>
        {/* A rota raiz agora usa o AppEntry para decidir o destino */}
        <Route path="/" element={<AppEntry />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Agrupa todas as rotas protegidas sob o `ProtectedRoute` */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/obras" element={<ObrasPage />} />
          <Route path="/obras/:id" element={<ObraDetalhesPage />} />
          <Route path="/financeiro" element={<FinanceiroPage />} />
          <Route path="/equipes" element={<EquipesPage />} />
          <Route path="/fornecedores" element={<FornecedoresPage />} />
          <Route
            path="/fornecedores/:id"
            element={<FornecedorDetalhesPage />}
          />
          <Route path="/orcamentos" element={<OrcamentosPage />} />
          <Route path="/relatorios" element={<RelatoriosPage />} />
          <Route path="/alertas" element={<AlertasPage />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage />} />
        </Route>

        {/* Rota para páginas não encontradas */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default App;
