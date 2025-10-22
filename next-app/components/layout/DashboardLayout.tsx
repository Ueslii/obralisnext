"use client";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";
import { useTheme } from "@/hooks/useTheme";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    // Ensure user theme preferences (mode/accent) are applied globally
    useTheme();
    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-full">
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <AppHeader />
                    <main className="flex-1 p-6 animate-fade-in">{children}</main>
                </div>
            </div>
        </SidebarProvider>
    );
}
export default DashboardLayout;
