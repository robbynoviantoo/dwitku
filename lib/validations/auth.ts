import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email({
        message: "Email tidak valid",
    }),
    password: z.string().min(1, {
        message: "Password wajib diisi",
    }),
});

export const RegisterSchema = z.object({
    name: z.string().min(1, {
        message: "Nama wajib diisi",
    }),
    email: z.string().email({
        message: "Email tidak valid",
    }),
    password: z.string().min(6, {
        message: "Password minimal 6 karakter",
    }),
});
