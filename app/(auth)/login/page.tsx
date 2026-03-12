import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - Dwitku",
    description: "Masuk ke akun Dwitku anda",
};

export default function LoginPage() {
    return <LoginForm />;
}
