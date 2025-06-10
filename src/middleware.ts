import type { NextRequest } from "next/server";
import type { NextRequestWithAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { i18nConfig } from "@/config/i18n";
import { withAuth } from "next-auth/middleware";

// Types
type Locale = (typeof i18nConfig.locales)[number];
type RoutePattern = readonly string[];

// Constants
const PUBLIC_DOMAIN =
  process.env.NODE_ENV === "production" ? "homio.pro" : "localhost:3000";
const ADMIN_DOMAIN =
  process.env.NODE_ENV === "production" ? "x.homio.pro" : "localhost:3000";

const ROUTES = {
  public: [
    "/[locale]",
    "/[locale]/blog",
    "/[locale]/blog/*",
    "/[locale]/events",
    "/[locale]/events/*",
    "/[locale]/areas",
    "/[locale]/areas/*",
    "/[locale]/collections",
    "/[locale]/collections/*",
    "/[locale]/lifestyle",
    "/[locale]/lifestyle/*",
    "/[locale]/search",
    "/[locale]/search/*",
    "/[locale]/p/*",
    "/api/public/*",
    "/api/auth",
    "/api/auth/*",
    "/api/ai/*",
    "/images/*"
  ] as const,

  protected: {
    admin: [
      "/[locale]/management",
      "/[locale]/management/*",
      "/[locale]/test/avatar/*",
      "/api/heygen/streaming/*"
    ] as const,

    developer: [
      "/[locale]/projects/new",
      "/[locale]/projects/[id]/edit",
      "/[locale]/developers",
      "/[locale]/developers/*"
    ] as const,

    projects: [
      "/[locale]/projects",
      "/[locale]/projects/[id]",
      "/[locale]/projects/[id]/*"
    ] as const,

    courses: ["/[locale]/courses", "/[locale]/courses/*"] as const,

    common: [
      "/[locale]/settings",
      "/[locale]/settings/*",
      "/[locale]/profile",
      "/[locale]/profile/*",
      "/[locale]/amenities",
      "/[locale]/amenities/*"
    ] as const
  } as const
} as const;

// Helper functions
const i18nMiddleware = createMiddleware({
  locales: i18nConfig.locales,
  defaultLocale: i18nConfig.defaultLocale,
  localePrefix: "always"
});

const convertPatternToRegex = (pattern: string): RegExp => {
  return new RegExp(
    "^" +
      pattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\[locale\\\]/g, "[^/]+")
        .replace(/\\\[.*?\\\]/g, "[^/]+")
        .replace(/\\\*/g, ".*?") +
      "$"
  );
};

const matchesPattern = (path: string, patterns: RoutePattern): boolean => {
  return patterns.some(pattern => {
    if (!pattern) return false;
    const regexPattern = convertPatternToRegex(pattern);
    return regexPattern.test(path);
  });
};

const getPathnameWithoutLocale = (pathname: string): string => {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (i18nConfig.locales.includes(maybeLocale as Locale)) {
    segments[1] = "[locale]";
  }
  return segments.join("/");
};

const isPublicRoute = (pathname: string): boolean => {
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);
  const isPublic = matchesPattern(pathnameWithoutLocale, ROUTES.public);
  return isPublic;
};

const isStaticAsset = (pathname: string): boolean => {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/fonts/") ||
    pathname.includes("favicon") ||
    pathname.includes("manifest") ||
    pathname.includes("robots.txt") ||
    pathname.includes("sitemap")
  );
};

const setCacheHeaders = (
  response: NextResponse,
  isPublic: boolean = false
): NextResponse => {
  if (isPublic) {
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=3600, stale-while-revalidate=59"
    );
  } else {
    response.headers.set("Cache-Control", "no-store, must-revalidate");
  }
  return response;
};

// Access control logic
const hasAccess = (pathname: string, token: any): boolean => {
  try {
    const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

    if (isPublicRoute(pathnameWithoutLocale)) {
      return true;
    }

    if (!token) {
      return false;
    }

    if (token.role === "ADMIN") {
      return true;
    }

    if (matchesPattern(pathnameWithoutLocale, ROUTES.protected.common)) {
      return true;
    }

    if (matchesPattern(pathnameWithoutLocale, ROUTES.protected.developer)) {
      return token.role === "DEVELOPER";
    }

    if (matchesPattern(pathnameWithoutLocale, ROUTES.protected.projects)) {
      return ["DEVELOPER", "AGENT"].includes(token.role);
    }

    if (matchesPattern(pathnameWithoutLocale, ROUTES.protected.courses)) {
      return ["ADMIN", "DEVELOPER", "AGENT"].includes(token.role);
    }

    return false;
  } catch (error) {
    console.error("Access check failed:", error);
    return false;
  }
};

// Main middleware function
export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    try {
      const { pathname, host } = request.nextUrl;
      const token = request.nextauth.token;
      const locale =
        request.nextUrl.pathname.split("/")[1] || i18nConfig.defaultLocale;
      const isDevelopment = process.env.NODE_ENV === "development";
      const isLocalhost = host.includes('localhost');

      if (isStaticAsset(pathname)) {
        return NextResponse.next();
      }

      if (pathname === "/" || pathname === "") {
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }

      if (!i18nConfig.locales.includes(pathname.split("/")[1] as Locale)) {
        const segments = pathname.split("/").filter(Boolean);
        segments.unshift(locale);
        return NextResponse.redirect(
          new URL("/" + segments.join("/"), request.url)
        );
      }

      // // В режиме разработки или продакшена с localhost пропускаем проверки доменов
      // if (!isDevelopment) {
      //   const isAdminPanel =
      //     host === ADMIN_DOMAIN ||
      //     host.startsWith("eu.") ||
      //     host.startsWith("q.") ||
      //     host.startsWith("x.");
      //   const isPublicSite = host === PUBLIC_DOMAIN;

      //   if (!isAdminPanel && !isPublicRoute(pathname)) {
      //     return NextResponse.redirect(
      //       new URL(request.nextUrl.href.replace(host, ADMIN_DOMAIN))
      //     );
      //   }

      //   if (isAdminPanel && isPublicRoute(pathname)) {
      //     return NextResponse.redirect(
      //       new URL(request.nextUrl.href.replace(host, PUBLIC_DOMAIN))
      //     );
      //   }
      // }

      if (isPublicRoute(pathname)) {
        const response = await i18nMiddleware(request);
        return setCacheHeaders(response, true);
      }

      if (!token) {
        const loginUrl = new URL(`/${locale}/login`, request.url);
        loginUrl.searchParams.set("callbackUrl", request.url);
        return NextResponse.redirect(loginUrl);
      }

      if (!hasAccess(pathname, token)) {
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }

      const response = await i18nMiddleware(request);
      return setCacheHeaders(response, false);
    } catch (error) {
      console.error("Middleware error:", error);
      const locale =
        request.nextUrl.pathname.split("/")[1] || i18nConfig.defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/error`, request.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        return (
          isPublicRoute(pathname) || (!!token && hasAccess(pathname, token))
        );
      }
    },
    pages: {
      signIn: "/ru/login",
      error: "/ru/error"
    }
  }
);

// Matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ]
};
