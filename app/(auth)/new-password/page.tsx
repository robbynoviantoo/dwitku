import { NewPasswordForm } from "@/components/auth/new-password-form";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Reset Password - Dwitku",
    description: "Masukkan password baru akun Dwitku Anda",
};

export default function NewPasswordPage() {
    return (
        <Suspense fallback={null}>
            <NewPasswordForm />
        </Suspense>
    );
}
