"use client";
import React from "react";
import NextLink from "next/link";
import { useRouter, useParams as useNextParams, usePathname } from "next/navigation";

type ClassNameFn = (args: { isActive: boolean }) => string;
type LinkProps = React.PropsWithChildren<{
  to?: string;
  href?: string;
  className?: string;
}> & Record<string, any>;

type NavLinkProps = React.PropsWithChildren<{
  to?: string;
  className?: string | ClassNameFn;
}> & Record<string, any>;

export function Link({ to, href, children, ...rest }: LinkProps) {
  const h = href ?? to ?? "#";
  return (
    <NextLink href={h} {...rest}>
      {children}
    </NextLink>
  );
}

export function NavLink({ to, children, className, ...rest }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === (to ?? "");
  const cls = typeof className === "function" ? className({ isActive }) : className;
  return (
    <Link to={to} className={cls} {...rest}>
      {children}
    </Link>
  );
}

export function useNavigate() {
  const router = useRouter();
  return (to: any) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    if (!to) return;
    if (typeof to === "string") return router.push(to);
    if (typeof to === "object" && to.pathname) return router.push(to.pathname as string);
  };
}

export function useParams<T extends Record<string, string> = any>(): T {
  return (useNextParams() as unknown as T) ?? ({} as T);
}

export function useLocation() {
  const pathname = usePathname();
  return { pathname, search: "", hash: "", key: "next" } as any;
}

export function BrowserRouter({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export function MemoryRouter({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}
