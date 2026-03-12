import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    providers: [],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isAuthRoute = nextUrl.pathname.startsWith("/login") || nextUrl.pathname.startsWith("/register");

            // Rute publik yang tidak butuh auth
            const isPublicRoute = nextUrl.pathname.startsWith("/invite");

            const isProtected =
                nextUrl.pathname.startsWith("/dashboard") ||
                nextUrl.pathname.startsWith("/settings") ||
                nextUrl.pathname.startsWith("/transactions") ||
                nextUrl.pathname.startsWith("/categories") ||
                nextUrl.pathname.startsWith("/onboarding");

            if (isPublicRoute) return true;

            if (isAuthRoute) {
                if (isLoggedIn) return Response.redirect(new URL("/dashboard", nextUrl));
                return true;
            }

            if (isProtected) {
                if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
                return true;
            }

            // Root ("/") redirect to dashboard if logged in
            if (nextUrl.pathname === "/" && isLoggedIn) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }

            return true;
        },
    },
} satisfies NextAuthConfig;

