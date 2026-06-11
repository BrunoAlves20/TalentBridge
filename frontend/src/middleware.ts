import { type NextRequest, NextResponse } from "next/server";

// Rotas que exigem usuário logado.
// Atenção: o middleware roda no servidor (Edge). Como o JWT atual é gravado
// pelo frontend em localStorage (não acessível aqui), também gravamos uma cópia
// em cookie no momento do login (em services/auth.ts e nos fluxos OTP/social).
// O middleware verifica APENAS a presença do cookie — a validação real do JWT
// continua sendo do backend, em cada request autenticada.
const PROTECTED_PREFIXES = [
  "/recruiter",
  "/candidate",
  "/simulator",
];

const AUTH_COOKIE = "tb_token";
const ROLE_COOKIE = "tb_role";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    // Sem cookie → manda para login com redirect_to.
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validação grosseira de role: candidatos não acessam /recruiter, e
  // recrutadores não acessam /candidate. O cookie de role é setado no login.
  const role = request.cookies.get(ROLE_COOKIE)?.value;
  if (role === "CANDIDATO" && pathname.startsWith("/recruiter")) {
    return NextResponse.redirect(new URL("/candidate/dashboard", request.url));
  }
  if (role === "RECRUTADOR" && pathname.startsWith("/candidate")) {
    return NextResponse.redirect(new URL("/recruiter/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (rotas de login/registro)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|auth).*)",
  ],
};
