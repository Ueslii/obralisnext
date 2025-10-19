import {
  Building2,
  LayoutDashboard,
  Calculator,
  Users,
  FileBarChart,
  Settings,
  HardHat,
  DollarSign,
  AlertTriangle,
  Truck,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import MIniLogo from "@/assets/MIniLOgo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Obras", url: "/obras", icon: Building2 },
  { title: "Financeiro", url: "/financeiro", icon: DollarSign },
  { title: "Orçamentos", url: "/orcamentos", icon: Calculator },
  { title: "Equipes", url: "/equipes", icon: Users },
  { title: "Fornecedores", url: "/fornecedores", icon: Truck },
  { title: "Alertas", url: "/alertas", icon: AlertTriangle },
  { title: "Relatórios", url: "/relatorios", icon: FileBarChart },
  { title: "Configurações", url: "/configuracoes", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <img
                src={MIniLogo}
                alt="Obralis"
                className="h-15 w-22 object-contain"
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-foreground">Obralis</h1>
                <p className="text-xs text-muted-foreground">
                  Gestão Inteligente
                </p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
