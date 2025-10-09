import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Obras from "./pages/Obras";
import Orcamentos from "./pages/Orcamentos";
import Equipes from "./pages/Equipes";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/obras" element={<DashboardLayout><Obras /></DashboardLayout>} />
          <Route path="/orcamentos" element={<DashboardLayout><Orcamentos /></DashboardLayout>} />
          <Route path="/equipes" element={<DashboardLayout><Equipes /></DashboardLayout>} />
          <Route path="/relatorios" element={<DashboardLayout><Relatorios /></DashboardLayout>} />
          <Route path="/configuracoes" element={<DashboardLayout><Configuracoes /></DashboardLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
