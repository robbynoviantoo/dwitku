import { RegisterForm } from "@/components/auth/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Daftar - Dwitku",
    description: "Buat akun Dwitku baru",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
