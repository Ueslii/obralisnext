"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";

const DashboardLayout = dynamic(() => import("@/components/layout/DashboardLayout"), { ssr: false });

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, loading, router]);

  return <DashboardLayout>{children}</DashboardLayout>;
}
