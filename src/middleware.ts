import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/settings',
  '/onboarding', // L'onboarding peut nécessiter une auth selon le contexte
];

// Routes publiques (pas d'authentification requise)
const publicRoutes = [
  '/',
  '/auth',
  '/api/auth', // Routes d'API pour l'authentification
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route API
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Vérifier si c'est une route publique
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Pour les routes protégées, laisser le composant ProtectedRoute gérer l'authentification
  // Le middleware Next.js ne peut pas accéder au context React directement
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};