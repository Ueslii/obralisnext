import { NextResponse, type NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas protegidas - redirecionar para auth se não autenticado
  const isProtected = pathname.startsWith("/(protected)");

  if (isProtected) {
    // A verificação de autenticação será feita no client-side
    // O middleware apenas redireciona para auth se necessário
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(protected)/:path*"]
};
