import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Vérifier l'authentification pour les routes admin
  // Exclure les pages de setup et configuration
  const isSetupPage = 
    req.nextUrl.pathname.startsWith("/admin/login") ||
    req.nextUrl.pathname.startsWith("/admin/setup") ||
    req.nextUrl.pathname.startsWith("/admin/set-password") ||
    req.nextUrl.pathname.startsWith("/admin/add-admin") ||
    req.nextUrl.pathname.startsWith("/admin/check-status") ||
    req.nextUrl.pathname.startsWith("/admin/test-email") ||
    req.nextUrl.pathname.startsWith("/admin/test-set-password");
  
  // La page /admin/manage nécessite une authentification (c'est dans le dashboard)

  if (req.nextUrl.pathname.startsWith("/admin") && !isSetupPage) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};

