import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig } from "./auth.config";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { LoginSchema } from "./lib/validations/auth";
import { prisma } from "./lib/prisma";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma as any),
    session: { strategy: "jwt" },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            allowDangerousEmailAccountLinking: true,
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);

                if (!validatedFields.success) return null;

                const { email, password } = validatedFields.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) return null; // Jika null berati login Google via Credentials

                const passwordsMatch = await bcrypt.compare(password, user.password);

                if (passwordsMatch) return user;

                return null;
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            // Jika login menggunakan OAuth (Google), pastikan email direkam sebagai terverifikasi
            if (account?.provider === "google" && user.email) {
                try {
                    await prisma.user.update({
                        where: { email: user.email },
                        data: { emailVerified: new Date() },
                    });
                } catch (error) {
                    console.error("Gagal update emailVerified via Google sign in:", error);
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.sub = user.id;
            }
            
            // Re-fetch user to check for password (or use trigger to update)
            if (trigger === "update" && session?.hasPassword !== undefined) {
                token.hasPassword = session.hasPassword;
            } else if (!token.hasPassword && token.sub) {
                const dbUser = await prisma.user.findUnique({
                    where: { id: token.sub },
                    select: { password: true }
                });
                token.hasPassword = !!dbUser?.password;
            }
            
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
});
