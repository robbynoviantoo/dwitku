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
                nextUrl.pathname.startsWith("/onboarding") ||
                nextUrl.pathname.startsWith("/workspaces");

            if (isPublicRoute) return true;

            if (isAuthRoute) {
                if (isLoggedIn) return Response.redirect(new URL("/workspaces", nextUrl));
                return true;
            }

            if (isProtected) {
                if (!isLoggedIn) return Response.redirect(new URL("/login", nextUrl));
                
                // Cek jika user belum punya password (untuk login Google)
                // Gunakan hasPassword === false secara eksplisit untuk menghindari loop jika undefined
                if (isLoggedIn && auth.user && auth.user.hasPassword === false && nextUrl.pathname !== "/set-password") {
                    return Response.redirect(new URL("/set-password", nextUrl));
                }
                
                return true;
            }

            // Root ("/") redirect to workspaces if logged in
            if (nextUrl.pathname === "/" && isLoggedIn) {
                if (auth.user && auth.user.hasPassword === false) {
                    return Response.redirect(new URL("/set-password", nextUrl));
                }
                return Response.redirect(new URL("/workspaces", nextUrl));
            }

            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
            }
            if (trigger === "update" && session?.hasPassword !== undefined) {
                token.hasPassword = session.hasPassword;
            }
            // Pastikan hasPassword tetap ada meskipun tidak ada trigger update
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.hasPassword !== undefined) {
                session.user.hasPassword = token.hasPassword as boolean;
            }
            return session;
        },
    },
} satisfies NextAuthConfig;

