import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lupa Password - Dwitku",
    description: "Atur ulang password akun Dwitku Anda",
};

export default function ForgotPasswordPage() {
    return <ForgotPasswordForm />;
}
