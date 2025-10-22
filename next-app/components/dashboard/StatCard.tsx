"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    description: string;
    isLoading?: boolean;
    valueClassName?: string;
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    isLoading,
    valueClassName,
}: StatCardProps) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {/* Lógica para mostrar Skeleton enquanto os dados carregam */}
                {isLoading ? (
                    <>
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-full mt-1" />
                    </>
                ) : (
                    <>
                        <div className={cn("text-2xl font-bold", valueClassName)}>
                            {value}
                        </div>
                        <p className="text-xs text-muted-foreground">{description}</p>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default StatCard;
