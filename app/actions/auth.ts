"use server";

import * as z from "zod";
import { RegisterSchema, LoginSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";

export const register = async (values: z.infer<typeof RegisterSchema>) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Kolom tidak valid!" };
    }

    const { email, password, name } = validatedFields.data;

    // Cek jika user sudah ada
    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (existingUser) {
        return { error: "Email sudah digunakan!" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat user
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    return { success: "Akun berhasil dibuat! Silakan login." };
};

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Kolom tidak valid!" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl || "/workspaces",
        });
    } catch (error) {
        if (isRedirectError(error)) {
            throw error; 
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Email atau password salah!" };
                default:
                    return { error: "Terjadi kesalahan sistem." };
            }
        }

        throw error;
    }
};

export const setPassword = async (password: string) => {
    const session = await auth();

    if (!session?.user?.id) {
        return { error: "Tidak diizinkan!" };
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        return { error: "Pengguna tidak ditemukan!" };
    }

    if (user.password) {
        return { error: "Password sudah dibuat!" };
    }

    if (password.length < 6) {
        return { error: "Password minimal 6 karakter!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            password: hashedPassword,
        },
    });

    return { success: "Password berhasil dibuat!" };
};
