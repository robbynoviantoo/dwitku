"use server";

import * as z from "zod";
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, NewPasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { signIn, auth } from "@/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { prisma } from "@/lib/prisma";

import { generateVerificationToken, generatePasswordResetToken } from "@/lib/tokens";
import { resend } from "@/lib/resend";
import { buildVerificationEmail, buildResetPasswordEmail } from "@/lib/email-templates";

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
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
    });

    // Generate token verifikasi
    const verificationToken = await generateVerificationToken(email);

    // Kirim email verifikasi via Resend
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationLink = `${baseUrl}/new-verification?token=${verificationToken.token}`;

    try {
        await resend.emails.send({
            from: "Dwitku <onboarding@resend.dev>", // Ganti dengan domain produksi saat siap
            to: email,
            subject: "Verifikasi Email Dwitku",
            html: buildVerificationEmail({
                userName: name,
                verificationLink,
            }),
        });
    } catch (error) {
        console.error("Gagal mengirim email verifikasi:", error);
        return { 
            success: "Akun berhasil dibuat, namun gagal mengirim email verifikasi. Silakan hubungi admin.",
        };
    }

    return { success: "Email verifikasi telah dikirim! Silakan cek inbox Anda." };
};

export const newVerification = async (token: string) => {
    const existingToken = await prisma.verificationToken.findUnique({
        where: { token }
    });

    if (!existingToken) {
        return { error: "Token tidak ditemukan!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token telah kadaluarsa!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.identifier }
    });

    if (!existingUser) {
        return { error: "Email tidak ditemukan!" };
    }

    await prisma.user.update({
        where: { id: existingUser.id },
        data: {
            emailVerified: new Date(),
            email: existingToken.identifier, // Opsional jika ingin mendukung ganti email
        }
    });

    await prisma.verificationToken.delete({
        where: {
            identifier_token: {
                identifier: existingToken.identifier,
                token: existingToken.token,
            }
        }
    });

    return { success: "Email berhasil diverifikasi!" };
};

export const requestPasswordReset = async (values: z.infer<typeof ForgotPasswordSchema>) => {
    const validatedFields = ForgotPasswordSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Email tidak valid!" };
    }

    const { email } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser) {
        // Demi keamanan, kembalikan success meskipun email tidak terdaftar
        return { success: "Jika email terdaftar, instruksi reset password telah dikirim." };
    }

    const resetToken = await generatePasswordResetToken(email);

    // Kirim email reset password via Resend
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetLink = `${baseUrl}/new-password?token=${resetToken.token}`;

    try {
        await resend.emails.send({
            from: "Dwitku <onboarding@resend.dev>",
            to: email,
            subject: "Atur Ulang Password Dwitku",
            html: buildResetPasswordEmail({
                userName: existingUser.name || "Pengguna Dwitku",
                resetLink,
            }),
        });
    } catch (error) {
        console.error("Gagal mengirim email reset password:", error);
        return { error: "Gagal mengirim email. Silakan coba lagi nanti." };
    }

    return { success: "Instruksi reset password telah dikirim ke email Anda." };
};

export const resetPassword = async (values: z.infer<typeof NewPasswordSchema>, token: string | null) => {
    if (!token) {
        return { error: "Token tidak ditemukan!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return { error: "Password tidak valid!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await prisma.passwordResetToken.findUnique({
        where: { token }
    });

    if (!existingToken) {
        return { error: "Token tidak valid!" };
    }

    const hasExpired = new Date(existingToken.expires) < new Date();
    if (hasExpired) {
        return { error: "Token telah kadaluarsa!" };
    }

    const existingUser = await prisma.user.findUnique({
        where: { email: existingToken.email }
    });

    if (!existingUser) {
        return { error: "Pengguna tidak ditemukan!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
        where: { id: existingUser.id },
        data: { password: hashedPassword },
    });

    await prisma.passwordResetToken.delete({
        where: { id: existingToken.id }
    });

    return { success: "Password berhasil diperbarui!" };
};

export const login = async (values: z.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Kolom tidak valid!" };
    }

    const { email, password, rememberMe } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
        where: { email },
    });

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email atau password salah!" };
    }

    // Blokir login jika belum verifikasi email (Kecuali user Google)
    if (!existingUser.emailVerified) {
        // Cek jika ini user Google (punya account record)
        const googleAccount = await prisma.account.findFirst({
            where: { userId: existingUser.id, provider: "google" }
        });

        if (!googleAccount) {
            // Belum verifikasi email dan bukan user Google
            const verificationToken = await generateVerificationToken(existingUser.email);
            
            const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
            const verificationLink = `${baseUrl}/new-verification?token=${verificationToken.token}`;

            try {
                await resend.emails.send({
                    from: "Dwitku <onboarding@resend.dev>",
                    to: existingUser.email,
                    subject: "Verifikasi Email Dwitku",
                    html: buildVerificationEmail({
                        userName: existingUser.name || "Pengguna Dwitku",
                        verificationLink,
                    }),
                });
            } catch (error) {
                console.error("Gagal kirim ulang verifikasi:", error);
            }

            return { error: "Email belum diverifikasi. Email verifikasi baru telah dikirim." };
        }
    }

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
